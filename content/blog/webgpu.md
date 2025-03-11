*[API]: Application Programming Interface
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

| **Builtin Name**         | **Stage** | ID     | Type  | Description                                                  |
| ------------------------ | --------- | ------ | ----- | ------------------------------------------------------------ |
| *vertex_index*           | vertex    | input  | u32   | Index of the current vertex within the current API-level draw command, independent of draw instancing.<br />For a non-indexed draw, the first vertex has an index equal to the `firstVertex` argument of the draw, whether provided directly or indirectly. The index is incremented by one for each additional vertex in the draw instance. For an indexed draw, the index is equal to the index buffer entry for the vertex, plus the `baseVertex` argument of the draw, whether provided directly or indirectly. |
| *instance_index*         | vertex    | input  | u32   | Instance index of the current vertex within the current API-level draw command.<br />The first instance has an index equal to the `firstInstance` argument of the draw, whether provided directly or indirectly. The index is incremented by one for each additional instance in the draw. |
| #rowspan=2 *position*    | vertex    | output | vec4f | Output position of the current vertex, using homogeneous coordinates. After homogeneous normalization (where each of the *x*, *y*, and *z* components are divided by the *w* component), the position is in the WebGPU normalized device coordinate space. See [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems). |
| #remove                  | fragment  | input  | vec4f | Framebuffer position of the current fragment in [framebuffer](https://gpuweb.github.io/gpuweb/#framebuffer) space. (The *x*, *y*, and *z* components have already been scaled such that *w* is now 1.) See [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems). |
| *front_facing*           | fragment  | input  | bool  | True when the current fragment is on a [front-facing](https://gpuweb.github.io/gpuweb/#front-facing) primitive. False otherwise. |
| *frag_depth*             | fragment  | output | f32   | Updated depth of the fragment, in the viewport depth range. See [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems). |
| *local_invocation_id*    | compute   | input  | vec3u | The current invocation’s [local invocation ID](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#local-invocation-id), i.e. its position in the [workgroup grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#workgroup-grid). |
| *local_invocation_index* | compute   | input  | u32   | The current invocation’s [local invocation index](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#local-invocation-index), a linearized index of the invocation’s position within the [workgroup grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#workgroup-grid). |
| *global_invocation_id*   | compute   | input  | vec3u | The current invocation’s [global invocation ID](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#global-invocation-id), i.e. its position in the [compute shader grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#compute-shader-grid). |
| *workgroup_id*           | compute   | input  | vec3u | The current invocation’s [workgroup ID](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#workgroup-id), i.e. the position of the workgroup in the [compute shader grid](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#compute-shader-grid). |
| *num_workgroups*         | compute   | input  | vec3u | The [dispatch size](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html#dispatch-size), `vec<u32>(group_count_x, group_count_y, group_count_z)`, of the compute shader [dispatched](https://www.w3.org/TR/webgpu/#compute-pass-encoder-dispatch) by the API. |
| *sample_index*           | fragment  | input  | u32   | Sample index for the current fragment. The value is least 0 and at most `sampleCount`-1, where `sampleCount` is the MSAA sample `count` specified for the GPU render pipeline.<br/>See [WebGPU § 10.3 GPURenderPipeline](https://www.w3.org/TR/webgpu/#gpurenderpipeline). |
| #rowspan=2 *sample_mask* | fragment  | input  | u32   | Sample coverage mask for the current fragment. It contains a bitmask indicating which samples in this fragment are covered by the primitive being rendered.<br/>See [WebGPU § 23.3.11 Sample Masking](https://www.w3.org/TR/webgpu/#sample-masking). |
| #remove                  | fragment  | output | u32   | Sample coverage mask control for the current fragment. The last value written to this variable becomes the [shader-output mask](https://gpuweb.github.io/gpuweb/#shader-output-mask). Zero bits in the written value will cause corresponding samples in the color attachments to be discarded.<br/>See [WebGPU § 23.3.11 Sample Masking](https://www.w3.org/TR/webgpu/#sample-masking). |

### Benchmarking GPU dispatches

2 types:

- Benchmarking the time it takes for the instructions to be dispatched and compute from the perspective of the CPU. 



- Benchmarking the time it takes for the kernel to execute. 

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

  

### Optimization techniques

- **Minimize GPU-CPU memory transfers.** Unless it's some small value at every frame or some 1-time transfer, it's too expensive.
- **Minimize global memory transfers.** There are 3 types of memory: global memory, shared memory available inside each workgroup and registers or local memory, for each thread. Memory access in shared memory is faster and in registers it's the fastest.
- **Encourage memory coalescing.** The more randomly accessed memory is, the worst. Encourage patterns where access is somewhat spatially continuous.
- **Avoid branching inside workgroups.** Conditionals may introduce branching, that is, stopping a thread's operation while the rest of the workgroup is active. It's often unavoidable, but it reduces GPU's occupancy and efficiency. 
- **Bit-packing.** This can save on memory transfers in return for some computational cost, especially since GPUs only work with 32 bit numbers. Easy to explain with colors i.e. an RGBA quad of uint8s into an uint32, but this can be done with other variables.

## Algorithms

### Parallel reduction

This is loosely based on NVIDIA's [webinar](https://developer.download.nvidia.com/assets/cuda/files/reduction.pdf) on parallel reduction. As a note, GPUs have changed quite a bit since then, and apparently using atomics on a part of the parallel reduction has become more performant. But I'm gonna omit that for now.

#### Min (& max) variants

#### Argmin (& argmax) variant



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

