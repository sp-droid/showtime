struct ComputeInput {
    @builtin(global_invocation_id) cell: vec3u
}

// Constants
const WORKGROUP_SIZE: u32 = $WORKGROUP_SIZE$;
const COARSE_FACTOR: u32 = $COARSE_FACTOR$;

// Global memory
@group(0) @binding(0) var<uniform> gridGlobal: vec2u;
@group(0) @binding(1) var<storage, read_write> cellColorGlobal: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellStateGlobal: array<u32>;
@group(0) @binding(3) var<storage> colorPoolGlobal: array<u32>;
@group(0) @binding(4) var<uniform> argminCounter: u32;
@group(0) @binding(5) var<storage, read_write> distancesGlobal: array<f32>;
@group(0) @binding(6) var<storage, read_write> iterationGlobal: u32;
@group(0) @binding(7) var<storage, read_write> targetColorGlobal: u32;
@group(0) @binding(8) var<storage, read_write> argminOutputGlobal: array<u32>;
// Painted neighbors stats per cell, in 0-255 integer units: xyz = sum of RGB, w = (sum of |rgb|^2 << 4) | count
@group(0) @binding(9) var<storage, read_write> neighborStatsGlobal: array<vec4u>;

// Shared memory
struct indexValueStruct {
    index: u32,
    value: f32,
};
var<workgroup> sdataWithIndex: array<indexValueStruct, WORKGROUP_SIZE>;

fn cellIndex(x: u32, y: u32, gridX: u32) -> u32 {
    return y * gridX + x;
}

fn l2normSquared(v1: vec3f, v2: vec3f) -> f32 {
    let a = v1.x-v2.x;
    let b = v1.y-v2.y;
    let c = v1.z-v2.z;
    return a*a+b*b+c*c;
}

fn unpackRGB(packedColor: u32) -> vec3f {
    let r: f32 = f32((packedColor >> 24) & 0xFF)/255.0;
    let g: f32 = f32((packedColor >> 16) & 0xFF)/255.0;
    let b: f32 = f32((packedColor >> 8) & 0xFF)/255.0;

    return vec3(r, g, b);
}

fn unpackRGBu(packedColor: u32) -> vec3u {
    return vec3u((packedColor >> 24) & 0xFF, (packedColor >> 16) & 0xFF, (packedColor >> 8) & 0xFF);
}

fn neighborDistanceOnly(x: u32, y: u32, targetColor: vec3f, gridX: u32) -> f32 {
    var distance = 10.0;
    let index1Dneighbor = cellIndex(x, y, gridX);
    if (cellStateGlobal[index1Dneighbor] == 2) {
        let color = unpackRGB(cellColorGlobal[index1Dneighbor]);
        distance = l2normSquared(targetColor, color);
    }
    return distance;
}

fn randomU32(seed: u32) -> u32 { // PCG hash random int generator
    let state = seed * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

fn randomF32(seed: u32) -> f32 { // PCG hash random float generator
    let MAX_UINT32 = 4294967295u;
    return f32(randomU32(seed))/f32(MAX_UINT32);
}

// Calculate distance from active cells (in color) to target RGB
@compute @workgroup_size(8, 8)
fn distancesAverageMethodMain(input: ComputeInput) {
    let grid = gridGlobal;

    let cellX = input.cell.x;
    let cellY = input.cell.y;
    if (cellX >= grid.x || cellY >= grid.y) { return; }
    let index1D = cellIndex(cellX, cellY, grid.x);

    let targetColor = vec3f(unpackRGBu(targetColorGlobal));

    // Return if the cell is not active
    if (cellStateGlobal[index1D] != 1) { 
        distancesGlobal[index1D] = 10.0;
        return;
    }

    // Average of squared distances to the painted neighbors, from their running sums:
    // (1/n)·Σ|t-c|² = |t-μ|² + (1/n)·Σ|c|² - |μ|²
    let stats = neighborStatsGlobal[index1D];
    let n = f32(stats.w & 0xF);
    let mean = vec3f(stats.xyz) / n;
    let variance = max(f32(stats.w >> 4) / n - dot(mean, mean), 0.0);
    let distance = (l2normSquared(targetColor, mean) + variance) / 65025.0;
    distancesGlobal[index1D] = distance + randomF32(index1D+iterationGlobal)*1e-6;
}

@compute @workgroup_size(8, 8)
fn distancesMinimumMethodMain(input: ComputeInput) {
    let grid = gridGlobal;

    let cellX = input.cell.x;
    let cellY = input.cell.y;
    if (cellX >= grid.x || cellY >= grid.y) { return; }
    let index1D = cellIndex(cellX, cellY, grid.x);

    let targetColor = unpackRGB(targetColorGlobal);

    // Return if the cell is not active
    if (cellStateGlobal[index1D] != 1) { 
        distancesGlobal[index1D] = 10.0;
        return;
    }

    // Iterate over painted neighbors, picking the smallest one (minimum method)
    var result = 10.0;
    if (cellX > 0) {
        if (cellY > 0) { result = min(result, neighborDistanceOnly(cellX - 1, cellY - 1, targetColor, grid.x)); }
        result = min(result, neighborDistanceOnly(cellX - 1, cellY, targetColor, grid.x));
        if (cellY + 1 < grid.y) { result = min(result, neighborDistanceOnly(cellX - 1, cellY + 1, targetColor, grid.x)); }
    }
    if (cellY + 1 < grid.y) { result = min(result, neighborDistanceOnly(cellX, cellY + 1, targetColor, grid.x)); }
    if (cellY > 0) { result = min(result, neighborDistanceOnly(cellX, cellY - 1, targetColor, grid.x)); }
    if (cellX + 1 < grid.x) {
        if (cellY > 0) { result = min(result, neighborDistanceOnly(cellX + 1, cellY - 1, targetColor, grid.x)); }
        result = min(result, neighborDistanceOnly(cellX + 1, cellY, targetColor, grid.x));
        if (cellY + 1 < grid.y) { result = min(result, neighborDistanceOnly(cellX + 1, cellY + 1, targetColor, grid.x)); }
    }
    distancesGlobal[index1D] = result + randomF32(index1D+iterationGlobal)*1e-6;

}

fn neighborActivation(x: u32, y: u32, gridX: u32, colorStats: vec4u) {
    let index1Dneighbor = cellIndex(x, y, gridX);
    let state = cellStateGlobal[index1Dneighbor];
    if (state == 2) { return; }
    if (state == 0) { cellStateGlobal[index1Dneighbor] = 1; }
    neighborStatsGlobal[index1Dneighbor] += colorStats;
}

// Place color on picked cell, activate it's neighbors
fn placeColor(bestIndex1D: u32) {
    let grid = gridGlobal;

    let y = bestIndex1D / grid.x;
    let x = bestIndex1D - y * grid.x;

    // Paint cell
    cellColorGlobal[bestIndex1D] = targetColorGlobal;

    // Mark cell as painted
    cellStateGlobal[bestIndex1D] = 2;

    // Contribution of this color to its neighbors stats
    let c = unpackRGBu(targetColorGlobal);
    let colorStats = vec4u(c, (dot(c, c) << 4) | 1);

    // Iterate over neighbors activating them
    if (x > 0) {
        if (y > 0) { neighborActivation(x - 1, y - 1, grid.x, colorStats); }
        neighborActivation(x - 1, y, grid.x, colorStats);
        if (y + 1 < grid.y) { neighborActivation(x - 1, y + 1, grid.x, colorStats); }
    }
    if (y + 1 < grid.y) { neighborActivation(x, y + 1, grid.x, colorStats); }
    if (y > 0) { neighborActivation(x, y - 1, grid.x, colorStats); }
    if (x + 1 < grid.x) { 
        if (y > 0) { neighborActivation(x + 1, y - 1, grid.x, colorStats); }
        neighborActivation(x + 1, y, grid.x, colorStats);
        if (y + 1 < grid.y) { neighborActivation(x + 1, y + 1, grid.x, colorStats); }
    }
}

// Next iteration: load the color to be placed on the following step
fn advanceIteration() {
    let i = iterationGlobal + 1;
    iterationGlobal = i;

    if (i + 1 < arrayLength(&colorPoolGlobal)) {
        targetColorGlobal = colorPoolGlobal[i + 1];
    }
}

fn minSharedWithIndex(id1: u32, id2: u32) {
    let value = sdataWithIndex[id2].value;
    if (value < sdataWithIndex[id1].value) {
        sdataWithIndex[id1].index = sdataWithIndex[id2].index;
        sdataWithIndex[id1].value = value;
    }
}
@compute @workgroup_size(WORKGROUP_SIZE)
fn reductionArgminMain(
    @builtin(local_invocation_id) local_invocation_id: vec3u,
    @builtin(workgroup_id) workgroup_id: vec3u
) {
    let localID = local_invocation_id.x;
    let workgroupID = workgroup_id.x;
    var globalID = workgroupID * WORKGROUP_SIZE * COARSE_FACTOR + localID;
    let size = gridGlobal.x*gridGlobal.y;

    var index = 0u;
    var minValue = 10.0;
    if (globalID < size) {
        index = globalID;
        minValue = distancesGlobal[globalID];
    }
    for (var tile = 1u; tile < COARSE_FACTOR; tile++) {
        globalID += WORKGROUP_SIZE;
        if (globalID < size) {
            let value = distancesGlobal[globalID];
            if (value < minValue) {
                index = globalID;
                minValue = value;
            }
        }
    }
    sdataWithIndex[localID].index = index;
    sdataWithIndex[localID].value = minValue;
    workgroupBarrier();

    if (WORKGROUP_SIZE >= 2048) { if (localID < 1024) { minSharedWithIndex(localID, localID + 1024); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 1024) { if (localID < 512) { minSharedWithIndex(localID, localID + 512); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 512) { if (localID < 256) { minSharedWithIndex(localID, localID + 256); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 256) { if (localID < 128) { minSharedWithIndex(localID, localID + 128); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 128) { if (localID < 64) { minSharedWithIndex(localID, localID + 64); } workgroupBarrier();}
    if (localID < 32) { minSharedWithIndex(localID, localID + 32); } workgroupBarrier();
    if (localID < 16) { minSharedWithIndex(localID, localID + 16); } workgroupBarrier();
    if (localID < 8) { minSharedWithIndex(localID, localID + 8); } workgroupBarrier();
    if (localID < 4) { minSharedWithIndex(localID, localID + 4); } workgroupBarrier();
    if (localID < 2) { minSharedWithIndex(localID, localID + 2); } workgroupBarrier();

    if (localID == 0) {
        minSharedWithIndex(0, 1);
        argminOutputGlobal[workgroupID] = sdataWithIndex[0].index;
    }
}

@compute @workgroup_size(WORKGROUP_SIZE)
fn reduceAndPlaceMain(
    @builtin(local_invocation_id) local_invocation_id: vec3u
) {
    let localID = local_invocation_id.x;
    var globalID = localID;
    let size = argminCounter;

    var index = 0u;
    var minValue = 10.0;
    if (globalID < size) {
        index = argminOutputGlobal[globalID];
        minValue = distancesGlobal[index];
    }
    globalID += WORKGROUP_SIZE;
    while (globalID < size) {
        let index2 = argminOutputGlobal[globalID];
        let value = distancesGlobal[index2];
        if (value < minValue) {
            index = index2;
            minValue = value;
        }
        globalID += WORKGROUP_SIZE;
    }
    sdataWithIndex[localID].index = index;
    sdataWithIndex[localID].value = minValue;
    workgroupBarrier();

    if (WORKGROUP_SIZE >= 2048) { if (localID < 1024) { minSharedWithIndex(localID, localID + 1024); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 1024) { if (localID < 512) { minSharedWithIndex(localID, localID + 512); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 512) { if (localID < 256) { minSharedWithIndex(localID, localID + 256); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 256) { if (localID < 128) { minSharedWithIndex(localID, localID + 128); } workgroupBarrier();}
    if (WORKGROUP_SIZE >= 128) { if (localID < 64) { minSharedWithIndex(localID, localID + 64); } workgroupBarrier();}
    if (localID < 32) { minSharedWithIndex(localID, localID + 32); } workgroupBarrier();
    if (localID < 16) { minSharedWithIndex(localID, localID + 16); } workgroupBarrier();
    if (localID < 8) { minSharedWithIndex(localID, localID + 8); } workgroupBarrier();
    if (localID < 4) { minSharedWithIndex(localID, localID + 4); } workgroupBarrier();
    if (localID < 2) { minSharedWithIndex(localID, localID + 2); } workgroupBarrier();

    // Final argmin, then place the color and advance in the same dispatch
    if (localID == 0) {
        minSharedWithIndex(0, 1);
        placeColor(sdataWithIndex[0].index);
        advanceIteration();
    }
}