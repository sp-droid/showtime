// Constants
const COARSE_FACTOR = 32;
let WORKGROUP_SIZE = 1024;
const WORKGROUP_SIZE2D = 8;

// UI
const canvas = document.querySelector("canvas");
const dpr = window.devicePixelRatio || 1;
const cssWidth = canvas.parentElement.clientWidth;
const cssHeight = canvas.parentElement.clientHeight;

let horizontalResolutionPrompt = parseInt(prompt("Horizontal resolution:", "512"));
if (!Number.isFinite(horizontalResolutionPrompt) || horizontalResolutionPrompt < 3) { horizontalResolutionPrompt = 512; }
const algorithmPrompt = prompt("Type 1 to use the AVERAGE or anything else to use the MINIMUM Rainbow Smoke algorithm variant:", "1");
const colorOrderPrompt = prompt("Type 1 to use RANDOM or anything else for HUE ORDERED colors:", "1");

let hueOffset; let hueDirection;
if (colorOrderPrompt != 1) {
    let huePrompt = parseFloat(prompt("Type any number from -1 to 1 to control hue order", "0.0"));
    if (!Number.isFinite(huePrompt)) { huePrompt = 0; }
    huePrompt = Math.max(-1, Math.min(1, huePrompt));
    hueOffset = Math.abs(huePrompt);
    hueDirection = huePrompt > -0.01 ? 1 : -1;
}

let algorithm;
if (algorithmPrompt == 1) {
    algorithm = "Average";
} else {
    algorithm = "Minimum";
}

let GRID_SIZEx = horizontalResolutionPrompt;
let squareSizeX = cssWidth / GRID_SIZEx;
let GRID_SIZEy = Math.max(3, Math.floor(cssHeight / squareSizeX));

// Size the canvas to the grid so cells stay square, at device pixel resolution
canvas.style.width = `${cssWidth}px`;
canvas.style.height = `${GRID_SIZEy * squareSizeX}px`;
canvas.width = Math.round(cssWidth * dpr);
canvas.height = Math.round(GRID_SIZEy * squareSizeX * dpr);

const nColors = GRID_SIZEx * GRID_SIZEy;

//#region WebGPU initialization
// Constants
let workgroupCountX;
let workgroupCountY;

// Checking WebGPU browser support
if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
} else { console.log("WebGPU supported.") }

// Requesting GPU adapter
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) { throw new Error("No appropriate GPUAdapter found.") }

// Handling adapter limits
if (adapter.limits.maxComputeWorkgroupSizeX < WORKGROUP_SIZE ||
    adapter.limits.maxComputeInvocationsPerWorkgroup < WORKGROUP_SIZE) {
    WORKGROUP_SIZE = 256;
}
const dispatches = Math.ceil(nColors/WORKGROUP_SIZE/COARSE_FACTOR);
if (adapter.limits.maxStorageBufferBindingSize < nColors*4) {
    throw new Error("Storage buffer size not supported.");
}
if (adapter.limits.maxBufferSize < nColors*4) {
    throw new Error("Storage buffer size not supported.");
}

// Requesting GPU device
const device = await adapter.requestDevice({
    requiredLimits: {
        maxComputeWorkgroupSizeX: WORKGROUP_SIZE,
        maxComputeInvocationsPerWorkgroup: WORKGROUP_SIZE,
        maxStorageBufferBindingSize: nColors*4,
        maxBufferSize: nColors*4
    }
});

// Requesting GPU canvas context
const context = canvas.getContext('webgpu');
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
    device: device,
    format: canvasFormat
});

// Defining a square as two triangles
const pos = 1.00;
const vertices = new Float32Array([
    -pos, -pos,
     pos, -pos,
     pos,  pos,

    -pos, -pos,
     pos,  pos,
    -pos,  pos
]);
// Allocating GPU memory for the vertices using a vertex buffer
const vertexBuffer = device.createBuffer({
    label: "Cell vertices", // Buffer label
    size: vertices.byteLength, // Buffer byte size
    // (32bit = 4 bytes) 6 2D-vertices = 12 float32 = 12 * 4 bytes = 48 bytes
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST // two flags, one to declare
    // it's going to be used for vertex data and the other to be able to copy data into it
});
// Writing GPU memory
device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);
// Defining the structure of the GPU memory object.
const vertexBufferLayout = {
    arrayStride: 8, // Vertex byte size. float32 * 2 = 8 bytes
    attributes: [{
        format: "float32x2", // Vertex byte structure
        offset: 0, // After how many bytes does the attribute starts
        shaderLocation: 0 // Unique int between 0 and 15
    }]
};

// Shaders
const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: await loadTextFile("default.wgsl")
});

let fileComputeShader = await loadTextFile("compute.wgsl");
fileComputeShader = fileComputeShader
    .replace("$WORKGROUP_SIZE$", WORKGROUP_SIZE)
    .replace("$COARSE_FACTOR$", COARSE_FACTOR);
const simulationShaderModule = device.createShaderModule({
    label: "Rainbow Smoke shader",
    code: fileComputeShader
});

//#endregion


//#region Data initialization
// Grid uniform |Painting sizes
let gridUniform = new Uint32Array([GRID_SIZEx, GRID_SIZEy]);

// Color pool parameter |colors to be painted
let colorPoolStorage = new Uint32Array(nColors);

// Initially i assumed that, on a large painting, the sampling pattern wouldn't matter, but I was very wrong. Doing it randomly vs evenly sampling colors and then
// randomizing is the proper way
// Build the full RGB cube, shuffle it (Fisher-Yates) and keep the first nColors, so the dropped colors are spread evenly
let nColors1D = Math.ceil(nColors**(1/3));
console.log("Missing colors: ", nColors1D**3-nColors, " out of ",nColors1D**3/1000,"K")
const cube = new Uint32Array(nColors1D**3);
for (let r=0, i=0; r<nColors1D; r++) {
    for (let g=0; g<nColors1D; g++) {
        for (let b=0; b<nColors1D; b++, i++) {
            const [r2, g2, b2] = [Math.round(255*r/(nColors1D-1)), Math.round(255*g/(nColors1D-1)), Math.round(255*b/(nColors1D-1))];
            cube[i] = ((r2 << 24) | (g2 << 16) | (b2 << 8) | 255) >>> 0;
        }
    }
}
for (let i = cube.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cube[i], cube[j]] = [cube[j], cube[i]];
}
colorPoolStorage.set(cube.subarray(0, nColors));

if (colorOrderPrompt != 1) { // Ordered by hue
    const shiftedHue = (c) => (rgbToHue(c >>> 24, (c >>> 16) & 0xFF, (c >>> 8) & 0xFF) - hueOffset + 1) % 1;
    const colors = Array.from(colorPoolStorage, (c) => ({ c, hue: shiftedHue(c) }));
    colors.sort((a, b) => hueDirection*(a.hue - b.hue));
    colors.forEach((entry, i) => { colorPoolStorage[i] = entry.c; });
}

// Cell state storage |states: 0=inactive, 1=active, 2=painted
let cellStateStorage = new Uint32Array(nColors);

// Cell color storage |painted colors
let cellColorStorage = new Uint32Array(nColors);

// Seed
let x = Math.floor(GRID_SIZEx/2); // Middle option
let y = Math.floor(GRID_SIZEy/2); // Middle option
let seedCoord = from2Dto1Dindex(x, y, GRID_SIZEx);
cellStateStorage[seedCoord] = 2;
cellColorStorage[seedCoord] = colorPoolStorage[0];

cellStateStorage[from2Dto1Dindex(x+1, y, GRID_SIZEx)] = 1;
cellStateStorage[from2Dto1Dindex(x-1, y, GRID_SIZEx)] = 1;
cellStateStorage[from2Dto1Dindex(x, y+1, GRID_SIZEx)] = 1;
cellStateStorage[from2Dto1Dindex(x, y-1, GRID_SIZEx)] = 1;
cellStateStorage[from2Dto1Dindex(x+1, y+1, GRID_SIZEx)] = 1;
cellStateStorage[from2Dto1Dindex(x+1, y-1, GRID_SIZEx)] = 1;
cellStateStorage[from2Dto1Dindex(x-1, y+1, GRID_SIZEx)] = 1;
cellStateStorage[from2Dto1Dindex(x-1, y-1, GRID_SIZEx)] = 1;

function from2Dto1Dindex(x, y, gridX) {
    return y * gridX + x;
}

// Iteration
let iterationStorage = new Float32Array(1);
let iteration = 0;

// Distances
let minIndexStorage = new Uint32Array(1);
let distancesStorage = new Float32Array(GRID_SIZEx * GRID_SIZEy);

//#endregion

//#region Buffers initialization & binding
// Defining buffers
let commonBuffers = [
    device.createBuffer({
        label: "X, Y grid size dimensions",
        size: gridUniform.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }),
    device.createBuffer({
        label: "Cell color RGB",
        size: cellColorStorage.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })
]
let computeBuffers = [
    device.createBuffer({
        label: "Cell State", // 0 = free and isolated, 1 = free but near color, 2 = colored
        size: cellStateStorage.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }),
    device.createBuffer({
        label: "Color pool",
        size: colorPoolStorage.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }),
    device.createBuffer({
        label: "Argmin dispatches count",
        size: minIndexStorage.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }),
    device.createBuffer({
        label: "Distances",
        size: distancesStorage.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }),
    device.createBuffer({
        label: "Iteration",
        size: iterationStorage.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }),
    device.createBuffer({
        label: "Target color",
        size: 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }),
    device.createBuffer({
        label: "Argmin result",
        size: dispatches*4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })
];

// Writing buffers
device.queue.writeBuffer(commonBuffers[0], 0, gridUniform);
device.queue.writeBuffer(commonBuffers[1], 0, cellColorStorage);

device.queue.writeBuffer(computeBuffers[0], 0, cellStateStorage);
device.queue.writeBuffer(computeBuffers[1], 0, colorPoolStorage);
device.queue.writeBuffer(computeBuffers[2], 0, new Uint32Array([dispatches]));
device.queue.writeBuffer(computeBuffers[5], 0, colorPoolStorage, 1, 1); // First target color (pool[0] is the seed)

// Bind layouts
let bindGroupLayouts = [
    device.createBindGroupLayout({
        label: "Render layout",
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {} // Grid dimensions
        }, {
            binding: 1,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: "read-only-storage" } // Cell color
        }]
    }),
    device.createBindGroupLayout({
        label: "Compute layout",
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {} // Grid dimensions
        }, {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" } // Cell color
        }, {
            binding: 2,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" } // Cell state
        }, {
            binding: 3,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" } // Color pool
        }, {
            binding: 4,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" } // Argmin dispatches count
        }, {
            binding: 5,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" } // Distances
        }, {
            binding: 6,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" } // Iteration
        }, {
            binding: 7,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" } // Target color
        }, {
            binding: 8,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" } // Argmin result
        }]
    })
];

// Create a bind group
let bindGroups = [
    device.createBindGroup({
        label: "Render bind group",
        layout: bindGroupLayouts[0],
        entries: [{
            binding: 0,
            resource: { buffer: commonBuffers[0] }
        },
        {
            binding: 1,
            resource: { buffer: commonBuffers[1] }
        }]
    }),
    device.createBindGroup({
        label: "Compute bind group",
        layout: bindGroupLayouts[1],
        entries: [{
            binding: 0,
            resource: { buffer: commonBuffers[0] }
        },
        {
            binding: 1,
            resource: { buffer: commonBuffers[1] }
        },
        {
            binding: 2,
            resource: { buffer: computeBuffers[0] }
        },
        {
            binding: 3,
            resource: { buffer: computeBuffers[1] }
        },
        {
            binding: 4,
            resource: { buffer: computeBuffers[2] }
        },
        {
            binding: 5,
            resource: { buffer: computeBuffers[3] }
        },
        {
            binding: 6,
            resource: { buffer: computeBuffers[4] }
        },
        {
            binding: 7,
            resource: { buffer: computeBuffers[5] }
        },
        {
            binding: 8,
            resource: { buffer: computeBuffers[6] }
        }]
    })
]
//#endregion

//#region Pipelines
let pipelineLayouts = [
    device.createPipelineLayout({
        label: "Render pipeline layout",
        bindGroupLayouts: [ bindGroupLayouts[0] ]
    }),
    device.createPipelineLayout({
        label: "Compute pipeline layout",
        bindGroupLayouts: [ bindGroupLayouts[1] ]
    })
]

// Render pipelines
let renderCellsPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: pipelineLayouts[0],
    vertex: {
        module: cellShaderModule,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout]
    },
    fragment: {
        module: cellShaderModule,
        entryPoint: "fragmentMain",
        targets: [{
            format: canvasFormat
        }]
    }
});

// Compute pipelines
let computePipelines = [
    device.createComputePipeline({
        label: "Compute distances pipeline",
        layout: pipelineLayouts[1],
        compute: {
            module: simulationShaderModule,
            entryPoint: `distances${algorithm}MethodMain`
        }
    }),
    device.createComputePipeline({
        label: "Argmin parallel reduction",
        layout: pipelineLayouts[1],
        compute: {
            module: simulationShaderModule,
            entryPoint: "reductionArgminMain"
        }
    }),
    device.createComputePipeline({
        label: "Argmin 2nd step, place pixel and advance iteration",
        layout: pipelineLayouts[1],
        compute: {
            module: simulationShaderModule,
            entryPoint: "reduceAndPlaceMain"
        }
    })
]
//#endregion

console.log("Dispatches: ", dispatches);
console.log("Number of colors: ", nColors);
workgroupCountX = Math.ceil(GRID_SIZEx / WORKGROUP_SIZE2D);
workgroupCountY = Math.ceil(GRID_SIZEy / WORKGROUP_SIZE2D);

function gameLoop() {
    // Iteration
    if (iteration === nColors) { return; }

    const encoder = device.createCommandEncoder();
    updateCompute(500, encoder);
    updateRender(encoder);
    device.queue.submit([encoder.finish()]);

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// WebGPU functions
function updateCompute(nTimes, encoder) {
    const computePass = encoder.beginComputePass();
    computePass.setBindGroup(0, bindGroups[1]);
    for (let i=0; i<nTimes; i++) {
        iteration++;
        if (iteration === nColors) { break; }

        /////////////////////////////////////////////////////////////////////////////////////////////
        // COMPUTE distances
        computePass.setPipeline(computePipelines[0]);
        computePass.dispatchWorkgroups(workgroupCountX, workgroupCountY);

        /////////////////////////////////////////////////////////////////////////////////////////////
        // COMPUTE minimum distance, then place pixel, activate neighbors and advance iteration
        computePass.setPipeline(computePipelines[1]);
        computePass.dispatchWorkgroups(dispatches);
        computePass.setPipeline(computePipelines[2]);
        computePass.dispatchWorkgroups(1);
    }
    computePass.end();
}

function updateRender(encoder) {
    /////////////////////////////////////////////////////////////////////////////////////////////
    // RENDER cells
    const renderPass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: [0,0,0.4,1],
            storeOp: "store"
        }]
    });

    renderPass.setPipeline(renderCellsPipeline);
    renderPass.setBindGroup(0, bindGroups[0]);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(vertices.length / 2, GRID_SIZEx*GRID_SIZEy); // 6 vertices
    renderPass.end();
}

// Functions
async function loadTextFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) { throw new Error('Network response was not ok') }
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('There was a problem fetching the file:', error);
    }
}

function rgbToHue(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h;
    
    if (max === min) {
        h = 0; // achromatic
    } else {
        let d = max - min;
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return h; // hue is in range [0, 1]
}