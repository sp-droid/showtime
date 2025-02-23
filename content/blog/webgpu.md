This article will cover several concepts in relation to WebGPU, and some algorithms implemented on it as I'm learning.

[toc]

# The standard

[Official documentation](https://www.w3.org/TR/WGSL/)

[definition]

## History

[]

### Implementations as of 2025

[]

## Architecture

[]

### Equivalent nomenclature

| Concept                             | WebGPU (& Vulkan) | NVIDIA | AMD            | Intel            | Apple       |
| ----------------------------------- | ----------------- | ------ | -------------- | ---------------- | ----------- |
| **Execution unit**                  | Invocation        | Thread | Wavefront lane | EU thread        | Thread      |
| **Group of threads (SIMD capable)** | Subgroup          | Warp   | Wavefront      | Subgroup         | SIMD group  |
| **Shared memory group**             | Workgroup         | Block  | Workgroup      | Workgroup        | Threadgroup |
| **Task group**                      | Dispatch of (..)  | Grid   | NDRange        | Dispatch of (..) | Grid        |

I personally like using thread, warp, workgroup and dispatch.

### Built-ins

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

# Algorithms

## Parallel reduction

### Min (& max) variants

### Argmin (& argmax) variant
