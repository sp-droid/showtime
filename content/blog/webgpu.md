*[API]: Application Programming Interface
*[FMA]: Fused multiply-add
*[PRN]: Pseudorandom number

I'm writing this article to serve me as a repository for information on WebGPU as I'm learning it. It covers useful links, architecture description and some non-flashy -but still very important- algorithms implemented on it.

[toc]

# The standard

WebGPU is a graphics API standard being developed over the last few years, built as a performant method to bridge graphics programming between different platforms:

- **Metal**, an API for Apple products. I'm mentioning it first because apparently it's the one WebGPU is most similar to.
- **Vulkan**, open source and very low level.
- **DirectX**, for Microsoft products.
- **OpenGL**, open source no compute API, it has been showing its age for some time.
- **WebGL**, a port of an OpenGL version for the web. However, it didn't really stick and soon suffered from the same issue.
- **CUDA**, compute API for NVIDIA GPUs
- **ROCm**, compute API for AMD GPUs
- **OpenCL**, open source compute API

As you can see, there were a myriad of solutions, each with its own syntax and shader language, for each operating system, GPU or even for each period of time. What if there was a single top level API that chose which one to use but always exposed the same behavior to the user? And so WebGPU was born from the joint effort between the partners behind those APIs.

WebGPU's shader language is called WGSL. The syntax is quite similar to Rust, in fact, even though for now highlight.js doesn't officially support WGSL I could reproduce a similar highlight by setting the language to Rust. 

#### Implementations as of 2025

There are 3 different ways of tapping into the standard:

- For the web* in JS, through the **WebGPU JS** API
- For native apps in C/C++, through **Dawn**, developed by Google.
- For native apps in Rust, through **WGPU**, developed by Mozilla.

*: It's also available for native apps through some of the JS runtime environments like Node.js

If you are a beginner in strongly typed languages, I recommend to build a few small projects through the JS API first, so you don't need to worry about garbage collection. I find it quite easy to get into it in this way. This [tutorial](https://codelabs.developers.google.com/your-first-webgpu-app) was especially good.

So, WebGPU is the GPU API with the biggest backing in history, not so low level, with access to compute shaders, performant and allows its use both for web and native apps, multiplatform in terms of OS but also in terms of the GPU vendor itself... for me it's quite hard to pass on it.

## Useful documentation

- [Official documentation](https://www.w3.org/TR/WGSL/)
- [Adapter/device limits & features](https://webgpufundamentals.org/webgpu/lessons/webgpu-limits-and-features.html)

#### Equivalent nomenclature

| Concept                             | WebGPU (& Vulkan)    | NVIDIA     | AMD            | Intel            | Apple       |
| ----------------------------------- | -------------------- | ---------- | -------------- | ---------------- | ----------- |
| **Execution unit**                  | Invocation           | **Thread** | Wavefront lane | EU thread        | Thread      |
| **Group of threads (SIMD capable)** | Subgroup             | **Warp**   | Wavefront      | Subgroup         | SIMD group  |
| **Shared memory group**             | **Workgroup**        | Block      | Workgroup      | Workgroup        | Threadgroup |
| **Task group**                      | **Dispatch** of (..) | Grid       | NDRange        | Dispatch of (..) | Grid        |

I personally like using thread, warp, workgroup and dispatch.

### Built-in inputs

| **Builtin Name**         | **Stage** | Direction | Type  | Description                                                  |
| ------------------------ | --------- | --------- | ----- | ------------------------------------------------------------ |
| *vertex_index*           | vertex    | input     | u32   | Index of the current vertex within the current API-level draw command, independent of draw instancing.<br />For a non-indexed draw, the first vertex has an index equal to the `firstVertex` argument of the draw, whether provided directly or indirectly. The index is incremented by one for each additional vertex in the draw instance. For an indexed draw, the index is equal to the index buffer entry for the vertex, plus the `baseVertex` argument of the draw, whether provided directly or indirectly. |
| *instance_index*         | vertex    | input     | u32   | Instance index of the current vertex within the current API-level draw command.<br />The first instance has an index equal to the `firstInstance` argument of the draw, whether provided directly or indirectly. The index is incremented by one for each additional instance in the draw. |
| *clip_distances*         | vertex    | output     | array<f32,N>(N<=8)   | [Extension needed](https://www.w3.org/TR/WGSL/#extension-clip_distances) |
| #rowspan=2 *position*    | vertex    | output    | vec4f | Output position of the current vertex, using homogeneous coordinates. After homogeneous normalization (where each of the *x*, *y*, and *z* components are divided by the *w* component), the position is in the WebGPU normalized device coordinate space. See [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems). |
| #remove                  | fragment  | input     | vec4f | Framebuffer position of the current fragment in [framebuffer](https://gpuweb.github.io/gpuweb/#framebuffer) space. (The *x*, *y*, and *z* components have already been scaled such that *w* is now 1.) See [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems). |
| *front_facing*           | fragment  | input     | bool  | True when the current fragment is on a [front-facing](https://gpuweb.github.io/gpuweb/#front-facing) primitive. False otherwise. |
| *frag_depth*             | fragment  | output    | f32   | Updated depth of the fragment, in the viewport depth range. See [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems). |
| *local_invocation_id*    | compute   | input     | vec3u | The current invocation’s [local invocation ID](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#local-invocation-id), i.e. its position in the [workgroup grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#workgroup-grid). |
| *local_invocation_index* | compute   | input     | u32   | The current invocation’s [local invocation index](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#local-invocation-index), a linearized index of the invocation’s position within the [workgroup grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#workgroup-grid). |
| *global_invocation_id*   | compute   | input     | vec3u | The current invocation’s [global invocation ID](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#global-invocation-id), i.e. its position in the [compute shader grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#compute-shader-grid). |
| *workgroup_id*           | compute   | input     | vec3u | The current invocation’s [workgroup ID](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#workgroup-id), i.e. the position of the workgroup in the [compute shader grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#compute-shader-grid). |
| *num_workgroups*         | compute   | input     | vec3u | The [dispatch size](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#dispatch-size), `vec<u32>(group_count_x, group_count_y, group_count_z)`, of the compute shader [dispatched](https://www.w3.org/TR/webgpu/#compute-pass-encoder-dispatch) by the API. |
| *subgroup_invocation_id*         | comp + frag   | input     | u32 | [Extension needed](https://www.w3.org/TR/WGSL/#extension-subgroups) |
| *subgroup_size*         | comp + frag   | input     | u32 | [Extension needed](https://www.w3.org/TR/WGSL/#extension-subgroups) |
| *sample_index*           | fragment  | input     | u32   | Sample index for the current fragment. The value is least 0 and at most `sampleCount`-1, where `sampleCount` is the MSAA sample `count` specified for the GPU render pipeline.<br/>See [WebGPU § 10.3 GPURenderPipeline](https://www.w3.org/TR/webgpu/#gpurenderpipeline). |
| #rowspan=2 *sample_mask* | fragment  | input     | u32   | Sample coverage mask for the current fragment. It contains a bitmask indicating which samples in this fragment are covered by the primitive being rendered.<br/>See [WebGPU § 23.3.11 Sample Masking](https://www.w3.org/TR/webgpu/#sample-masking). |
| #remove                  | fragment  | output    | u32   | Sample coverage mask control for the current fragment. The last value written to this variable becomes the [shader-output mask](https://gpuweb.github.io/gpuweb/#shader-output-mask). Zero bits in the written value will cause corresponding samples in the color attachments to be discarded.<br/>See [WebGPU § 23.3.11 Sample Masking](https://www.w3.org/TR/webgpu/#sample-masking). |

### Copying data back to the CPU

We need:

- A source, a GPU buffer defined with the flag `GPUBufferUsage.COPY_SRC`
- An intermediate or staging buffer

```js
const stagingBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
});
```

- Define copy and synchronize devices, just before submitting the instructions

```js
encoder.copyBufferToBuffer(sourceBuffer, 0, stagingBuffer, 0, 4);
device.queue.submit([encoder.finish()]);

// Wait for GPU work to finish and map the buffer for CPU access
await stagingBuffer.mapAsync(GPUMapMode.READ);
const data = new Uint32Array(buffer.getMappedRange());
// console.log(data[0]);
stagingBuffer.unmap();
```

This is also a (bad) way to benchmark the time it takes for the instructions to be sent and the kernel to be launched. It's not optimal because it depends on CPU/GPU schedules, making it only somewhat reliable when the program is running constantly under a heavy load. 

### Benchmarking GPU functions

This is taken from this [website](https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html) I mentioned earlier, and it's a method to benchmark kernel executing time only, so although it may vary it doesn't depend on the CPU schedule and ability to synchronize. I modified the helper class to remove the asserts and convert the output to microseconds. The class:

<details><summary>TimingHelper class</summary>


```js
class TimingHelper {
    #canTimestamp;
    #device;
    #querySet;
    #resolveBuffer;
    #resultBuffer;
    #resultBuffers = [];
    // state can be 'free', 'need resolve', 'wait for result'
    #state = 'free';

    constructor(device) {
    this.#device = device;
    this.#canTimestamp = device.features.has('timestamp-query');
    if (this.#canTimestamp) {
        this.#querySet = device.createQuerySet({
        type: 'timestamp',
        count: 2,
        });
        this.#resolveBuffer = device.createBuffer({
        size: this.#querySet.count * 8,
        usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
        });
    }
    }
    
    #beginTimestampPass(encoder, fnName, descriptor) {
    if (this.#canTimestamp) {
        this.#state = 'need resolve';
    
        const pass = encoder[fnName]({
        ...descriptor,
        ...{
            timestampWrites: {
            querySet: this.#querySet,
            beginningOfPassWriteIndex: 0,
            endOfPassWriteIndex: 1,
            },
        },
        });
    
        const resolve = () => this.#resolveTiming(encoder);
        pass.end = (function(origFn) {
        return function() {
            origFn.call(this);
            resolve();
        };
        })(pass.end);
    
        return pass;
    } else {
        return encoder[fnName](descriptor);
    }
    }
    
    beginRenderPass(encoder, descriptor = {}) {
    return this.#beginTimestampPass(encoder, 'beginRenderPass', descriptor);
    }
    
    beginComputePass(encoder, descriptor = {}) {
    return this.#beginTimestampPass(encoder, 'beginComputePass', descriptor);
    }
    
    #resolveTiming(encoder) {
    if (!this.#canTimestamp) {
        return;
    }
    this.#state = 'wait for result';
    
    this.#resultBuffer = this.#resultBuffers.pop() || this.#device.createBuffer({
        size: this.#resolveBuffer.size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    
    encoder.resolveQuerySet(this.#querySet, 0, this.#querySet.count, this.#resolveBuffer, 0);
    encoder.copyBufferToBuffer(this.#resolveBuffer, 0, this.#resultBuffer, 0, this.#resultBuffer.size);
    }
    
    async getResult() { // Returns result in microseconds
    if (!this.#canTimestamp) {
        return 0;
    }
    this.#state = 'free';
    
    const resultBuffer = this.#resultBuffer;
    await resultBuffer.mapAsync(GPUMapMode.READ);
    const times = new BigInt64Array(resultBuffer.getMappedRange());
    const duration = Number((times[1] - times[0])/1000n);
    resultBuffer.unmap();
    this.#resultBuffers.push(resultBuffer);
    return duration;
    }
}
```

</details>

Get an instance and use it in place of the encoder:
```js
const timingHelper = new TimingHelper(device);
...
const encoder = device.createCommandEncoder();
...
const computePass = timingHelper.beginComputePass(encoder);
...
computePass.end();
...
device.queue.submit([encoder.finish()]);
const gpuTime = timingHelper.getResult(); // Microseconds
```




### Common problems

- **Memory race conditions**. Happens when memory is accessed at the same time by multiple threads. For example, if a thread needs to add a plus 1 to a position in global or shared memory this could raise a race condition:

```vhdl
  globalarray[i] += 1;
```

  Under the hood, the thread will create a local copy of the value, add plus one and then deposit it. It's not instantaneous so you can understand how problematic it can be when multiple threads are tasked to do the same thing. In shared memory there is a function to synchronize threads and we can use it to deal with it. For global memory there are atomic operations.

- **Unsigned integer underflows**. When one has to look in the previous position in an array, checking with unsigned integers can cause problems if handled incorrectly:

```rust
  if (cellX - 1 >= 0) // Wrong. If cellX == 0u, cellX - 1 will underflow into the max UINT32, which is > 0
  if (cellX > 0) // Correct way.
```

- **Shared bank memory conflicts.** Available shared memory is divided into 32 bit banks. A conflict arises when two threads in the same warp attempt to access the same bank simultaneously, for which access is then serialized, slowing things down the more threads get in queue. An exception is when all threads in a warp attempt to do so; there is no conflict because data is broadcasted.

### Optimization techniques

GPU scheduling:

- **Minimize GPU-CPU memory transfers.** Unless it's some small value at every frame or some 1-time transfer, it's too expensive.
- **Use bind groups smartly.** They affect the way things are cached in GPU memory, therefore you want to group similar purpose buffers with each other. I.e. buffers that are copied frequently into the CPU (each frame) vs. buffers that are uploaded just once.
- **Batch dispatches.** Multiple compute shaders in the same pass and batching render and compute passes together before submitting to the queue once.
- **Consider warp size.** It's recommended to choose workgroup sizes that are multiple of the warp size, which in the case of NVIDIA GPUs it's 32.

GPU instructions:

- **Optimize memory transfers.** Data transfers in a GPU are often more expensive than the computation done in each thread, it's therefore fundamental to manage it adequately. According to CUDA (not saying WebGPU exposes all of these) there are a number of different types of memory: 
  - **Global memory**. The largest, but also the slowest, can be accessed by all threads. Optimized for linear access.
  - **Shared memory**. Small, fast, accessed by threads within a workgroup. Subject to bank memory conflicts, without them it can be just as fast as registers. Try these do not happen.
  - **Registers**. Small, fastest, access is restricted per thread. When registers are not enough, the thread will pull from ***local memory***, which resides cached in global memory and can be up to 150x slower.
  - **Constant memory**. Cached read-only living in global memory. Can be faster than global memory if the access pattern is predictable and roughly one address per workgroup or warp. It's small, listed at 64 kB for some architectures.
  - **Texture memory**. Cached read-only living in global memory. Optimized for small 2D data clusters, with special texture samplers that provide free bilinear filtering and other features.

- **Encourage memory coalescing.** The more randomly accessed memory is, the worst. Encourage patterns where access is somewhat spatially continuous.
- **Avoid branching inside workgroups.** Conditionals may introduce branching, that is, stopping a thread's operation while the rest of the workgroup is active. It's often unavoidable, but it reduces GPU's occupancy and efficiency. 
- **Bit-packing.** This can save on memory transfers in return for some computational cost, especially since GPUs only work with 32 bit numbers. Easy to explain with colors i.e. an RGBA quad of uint8s into an uint32, but this can be done with other variables.
- **Use FMA (a,b,c) in place of floating point a*b+c.** More precise and takes 1 instruction instead of two.
- **Precompute divisors.** Since divisions are more expensive than multiplication, precompute as divisors as constants like `INV_255: f32 = 1./255.`

I think these become second-hand as you learn WebGPU and deal with its challenges.

## Algorithms

### Parallel reduction

This is loosely based on NVIDIA's [webinar](https://developer.download.nvidia.com/assets/cuda/files/reduction.pdf) on parallel reduction. As a note, GPUs have changed quite a bit since then, and apparently there are slightly better methods now, but I'll stick to the basics. The task is to sum the integers in an array. I've also included these single-threaded CPU & GPU versions for comparison:

```js
// CPU ST
const sum = numberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
```

For the rest of the functions I measured the time using the method mentioned earlier in the benchmarking subsection (so I'm not counting kernel launch delay and data transfers):

```rust
// Number of workgroups = 1
// GPU ST
@compute @workgroup_size(1)
fn sumST() {
    let nNumbers = size;

    var sum = 0u;
    for (var i = 0u; i < nNumbers; i++) {
        sum += inputGlobal[i];
    }
    outputGlobal[0] = sum;
}
```

Now let's do a parallel reduction. The method basically consists in treating the workgroup as a tree where data is summed up from the leaves (all threads) to the root (thread 0) in parallel. In the first few methods described here, each thread 0 of every workgroup deposits its sum on a smaller auxiliary array, which means multiple kernel launches are necessary if `data.length < WORKGROUP_SIZE`. 

![Parallel reduction scheme (V0). @Source@NVIDIA](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*Y1wOMUBsnJt9dV9iHUYhyQ.png)

Parallel reduction relies on shared memory by first having each thread copying in parallel from global memory, which greatly speeds up things afterwards as access to shared memory are very fast. To ensure race-conditions don't happen, we also have to raise workgroup-level synchronization barriers.

```rust
// Number of workgroups = ceil(data.length / WORKGROUP_SIZE)
// V0 - interleaved addressing
var<workgroup> sdata: array<u32, WORKGROUP_SIZE>;
@compute @workgroup_size(WORKGROUP_SIZE)
fn sumReduce0(
    @builtin(global_invocation_id) global_invocation_id: vec3u,
    @builtin(local_invocation_id) local_invocation_id: vec3u,
    @builtin(workgroup_id) workgroup_id: vec3u
) {
    let globalID = global_invocation_id.x;
    let localID = local_invocation_id.x;
    let workgroupID = workgroup_id.x;

    sdata[localID] = inputGlobal[globalID];
    workgroupBarrier();

    for (var s = 1u; s < WORKGROUP_SIZE; s *= 2) {
        if (localID % (2 * s) == 0) {
            sdata[localID] += sdata[localID + s];
        }
        workgroupBarrier();
    }
    if (localID == 0) {
        outputGlobal[workgroupID] = sdata[0];
    }
}
```

Once copied into shared memory, each thread loops in powers of two and checks if its own ID is a multiple of twice of that. So in the first iteration s=1 and only evenly numbered threads work, in the 2^nd^ one s=2 and only threads 0, 4, 8 work, then 0, 8, 16, then 0, 16, 32... and so on. Each thread copies the value in memory i+1, i+2, i+4, etc. The process continues until the sum is collected at 0. This is much faster the single-threaded alternatives for any decently sized array. But it has problems:

- Each workgroup processes **1 data point per thread**, so the first kernel will launch `ceil(data.length/WORKGROUP_SIZE)`. There is a max number of dispatches per kernel, so after a certain size you will have to change that option if possible, increase workgroup size... Apart from this, if the computation is light, the optimal number of points each thread should be handling is > 1. Half of the threads also do not nothing after retrieving the data from global memory.
- The modulo **operator % is expensive**.
- Highly **divergent warps**. On first iteration, the threads that work are 0, 2, 4... Threads come bunched up in groups called warps, and we should aim for them to have the most similar execution paths. If warps were of size 4 and our workgroup is size 8, it's considerably better if the threads that work are 0-1-2-3 instead of 0-2-4-6
- **Sparse memory accesses**. The average distance between memory accesses in each iteration is roughly the same, we are not taking advantage of locality.

Let's change the inner loop in V2:

![V1. Source@NVIDIA](https://raw.githubusercontent.com/mateuszbuda/GPUExample/master/reduce2.png)

```rust
// V1 - Interleaved addressing with strided index
...
		let index = 2*s*localID;
		if (index < WORKGROUP_SIZE) {
         	sdata[index] += sdata[index + s];
 		}
...
```

Now we built the index directly, removing the costly % operator and indexing (in the first iteration) with the first half of threads, so removing the divergence. This however introduced new issues:

- **Shared memory bank conflicts**. As explained in the common problems subsection, these conflicts arise when multiple threads of the same warp access the same memory bank, forcing serialization and slowing things down. Let's imagine a case such as the one in the images shown, 16 data points, 8 threads per warp and 8 memory banks. In the first iteration:
  - V0: Threads of two warps (0, 2, 4, 6 and 8, 10, 12, 14) access the 8 memory banks, no conflict.
  - V1: Threads of a single warp (0, 1, 2, 3, 4, 5, 6, 7) access the same banks, but for example now bank 0 and 1 are accessed by threads 0 and 4, which belong to the same warp and produces serialization.

- **Cache issues**. In V0, threads always summed up the same location in memory plus a different one. This facilitated caching, but now only thread 0 does it.

Version 3, sequential addressing:

![V2. Source@NVIDIA](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*Slpu0FWHir7RIMMcAqN1xg.png)

```rust
// V2 - Sequential addressing
...
for (var s = WORKGROUP_SIZE/2; s > 0; s >>= 1) {
    if (localID < s) {
        sdata[localID] += sdata[localID + s];
    }
    workgroupBarrier();
}
...
```

Notice how both issues are fixed. With respect to the cache, thread i is always summing up whatever is on bank i plus something else. Regarding the memory conflicts, in the first iteration bank i is accessed twice by the same thread, and from there on there are no further problems.

This also fixed the sparse access pattern by utilizing a coalesced access approach, so there's left only one issue left, doing more work per thread. V3 deals with this to some extent, loading *two* values instead. Consequently, the number of workgroups need to be halved.

``` rust
// Number of workgroups = ceil(data.length / WORKGROUP_SIZE / 2)
// V3 - First add during load
...
let globalID = workgroupID * WORKGROUP_SIZE*2 + localID;
sdata[localID] = inputGlobal[globalID] + inputGlobal[globalID + WORKGROUP_SIZE];
...
```

Workgroup sizes should be chosen (to help with performance) on multiples of 32 and equal or larger than 64 threads, due to the size of warps. This means we can unroll our loop, saving on instructions. As opposed to the original webinar where Mark doesn't add if checks for thread IDs < 32 because of SIMD operations, we are going to have to keep them because WebGPU as far as I'm aware doesn't expose volatile variables yet. It's a reserved keyword and may be implemented in the future but I imagine it's an issue if the feature isn't present across every GPU architecture. V4 only unrolled < 32 so let's skip it:

```rust
// V4/5 - Completely unrolled loop
...
if (WORKGROUP_SIZE >= 2048) { if (localID < 1024) { sdata[localID] += sdata[localID + 1024]; } workgroupBarrier();}
if (WORKGROUP_SIZE >= 1024) { if (localID < 512) { sdata[localID] += sdata[localID + 512]; } workgroupBarrier();}
if (WORKGROUP_SIZE >= 512) { if (localID < 256) { sdata[localID] += sdata[localID + 256]; } workgroupBarrier();}
if (WORKGROUP_SIZE >= 256) { if (localID < 128) { sdata[localID] += sdata[localID + 128]; } workgroupBarrier();}
if (WORKGROUP_SIZE >= 128) { if (localID < 64) { sdata[localID] += sdata[localID + 64]; } workgroupBarrier();}
if (localID < 32) { sdata[localID] += sdata[localID + 32]; } workgroupBarrier();
if (localID < 16) { sdata[localID] += sdata[localID + 16]; } workgroupBarrier();
if (localID < 8) { sdata[localID] += sdata[localID + 8]; } workgroupBarrier();
if (localID < 4) { sdata[localID] += sdata[localID + 4]; } workgroupBarrier();
if (localID < 2) { sdata[localID] += sdata[localID + 2]; } workgroupBarrier();
if (localID < 1) { sdata[localID] += sdata[localID + 1]; } workgroupBarrier();
...
```

Mark then analyzes algorithm complexity and cites Brent's theorem that says each thread should sum o(logN) elements, due to the intrinsic cost of combining parallel and sequential processing. He goes even further, explaining there are other motives to increase elements per thread:

- Less kernel launch overhead because of fewer less levels needed.
- Gains due to latency hiding because of heavier work per thread.

I've also thought of a few:

- Less writes into auxiliary global memory arrays in between kernels, and these are smaller too.
- If using somewhat expensive atomic operations to achieve the result in one kernel, the more work a thread does, the fewer atomic operations are needed.

Let's briefly explain the concept of *latency-hiding*. Memory load and instruction latency are the most common latencies, and for GPUs they usually are in that order of importance too. Threads typically stall while waiting for these, and the GPU microprocessor switches between them to achieve much higher throughputs. This is the reason many threads should be ran so those latencies play a smaller role. However, the reason why higher work per thread improves this still escapes my understanding.

```rust
// Number of workgroups = ceil(data.length / WORKGROUP_SIZE / COARSE_FACTOR)
// V6.1 - Multiple elements per thread
...
let globalID = workgroupID * WORKGROUP_SIZE*2 + localID;
sdata[localID] = inputGlobal[globalID] + inputGlobal[globalID + WORKGROUP_SIZE];
var globalID = workgroupID * WORKGROUP_SIZE * COARSE_FACTOR + localID;

var sum = 0u;
for (var tile = 0u; tile < COARSE_FACTOR; tile++) {
    if (globalID < size) {
        sum +=  inputGlobal[globalID];
    }
    globalID += WORKGROUP_SIZE;
}
sdata[localID] = sum;
...
```

V6 is different than what Mark wrote because at first I did not understand its kernel launch and accessing pattern. I decided to leave it in because it's easier to understand, albeit I'm sure not as efficient. **Work in progress after this**

```rust
// Number of workgroups = 
// V6.2 - Multiple elements per thread
```

#### Min, max, argmin and argmax variants

I'm leaving also some other useful computations using parallel reduction (only the parts that change):

```rust
// Minimum
...
var minValue = MAX_UINT32;
...
	if (globalID < size) {
    	let value = inputGlobal[globalID];
        if (value < minValue) {
            minValue = value;
        }
	}
...
// The operation done in each part of the unrolled loop, with id1 and id2 the first and second elements

```





### PseudoRandom Number generator

PCG hash PRN generator:
```rust
fn randomU32(seed: u32) -> u32 { // PCG hash random int generator
    let state = seed * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

fn randomF32(seed: u32) -> f32 { // PCG hash random float generator
    let MAX_UINT32 = 4294967295u;
    return f32(randomU32(seed))/f32(MAX_UINT32);
}
```

