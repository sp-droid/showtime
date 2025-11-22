# Fragmentation characterisation in highly elliptical orbits - Progress log

[toc]



## Literature review phase

### 22/11

- Reorganised thesis documents into 3 (log, literature and technical)
- Fixed mathematical equations syntax errors for rendering online

### 21/11

> #### 📝 Meeting 21/11
>
> **Title:** PM
> **Attendees:** Francesca and Elisa
> **Duration:** 40'
>
> - Questions on validation idea, what is "long term" for propagation in our case
> - Tips on meeting with prof. Colombo

### 19/11

- RK4 with Richardson extrapolation
- Adaptive step-sizing

### 16/11

- Utility functions car2kep, kep2car, analytical propagator for elliptical orbits

### 15/11

- RK4 with a J2 perturbation

### 14/11

- RK4 with Numba JIT, +115x speed up (native python is very slow)

### 13/11

- Runge-Kutta 4 in python for the 2BP

### 31/10

> #### 📝 Meeting notes 31/10
>
> **Title:** PM
> **Attendees:** Francesca and Elisa
> **Duration:** 15'
>
> - Literature review progress

### 17/10

- Literature review

> #### 📝 Meeting 17/10
>
> **Title:** PM
> **Attendees:** Francesca and Elisa
> **Duration:** 25'
>
> - Literature review progress
> - Questions on semi-analytical vs full-numerical propagators
> - Mind map for the literature review conclusion. Aided by block diagram. Motivation, past work advantages+disadvantages...
>

### 28/09

- **Completed** test with webgpu-py. I'm pretty happy that the API looks so similar in python as in JS, much easier even. No additional packages needed when working with the environment built for using fastplotlib.
- Literature review

### 25/09 

- Added "Satellite Orbits Models, Methods and Applications" to literature, it's the same book prof. Colombo recommended to me back in OM. May be useful to model many perturbations near Earth.
- **Completed** test with fastplotlib. Satisfactory. It is much faster than any alternative at doing scatter plots on many points, especially on animations, looks flexible, environment needed is simple...
- Created log document

## KOMs

### 23/09

> #### 📝 Meeting 23/09
>
> **Title:** Technical KOM
> **Attendees:** Francesca and Elisa
> **Duration:** 45'
>
> Introduction to the proposed topic, expected outcome, suggested paths to take, modus operandi, ideas.
>
> - Literature review
> - Implement discrete fragmentation model (simple one from NASA)
> - HEO propagator
> - Other
>
> LEO fragmentation cloud evolution already characterized in a formula (empirical? forgot to ask), what about HEO?
>
> New files to be uploaded:
>
> - Presentation template
> - General thesis instructions
> - Initial articles for review
>

- **Meeting set** for Monday 13th October, ahead of the post-literature review bigger one
- **Received** some suggested articles, instruction document, presentation template
- Further organised the folder

Some talk of using GPU. I have experience in them through both (NVIDIA GPUs only) the python numba-cuda framework and the (platform agnostic) [WebGPU](https://pabloarbelo.com/pages/blog/webgpu.html) API with JS bindings. However JS is a terrible language for the topic, but if I want for whatever I make to work with any computer (Apple - Metal, AMD - Rocm, NVIDIA - CUDA, Intel) I'd love to use WebGPU under the hood, in a somewhat high level way because I'm only interested in the compute shaders -> Bindings in Python, through [webgpu-py](https://github.com/pygfx/wgpu-py) ? -> **schedule** test on webgpu-py, using a compute shader to calculate something in parallel

Some plots are likely to contain many elements, and a couple of animations would possibly make sense down the line. Python's matplotlib is rather slow and when looking up webgpu-py I discovered [fastplotlib](https://fastplotlib.org/_gallery/line_collection/line_stack_3d.html), which would allow for fast 3D visualisations of the fragment cloud even for millions of points.  ->  **schedule** test on fastplotlib, speed, environment needed, difficulty to install, difficulty to use, 3D controls...

### 19/09

> #### 📝 Meeting 19/09
> **Title:** KOM
> **Attendees:** Other students, some COMPASS team members 
> **Duration:** 15'
>
> Relatore - Camilla Colombo
> Correlatore - Francesca Ottoboni
> Short meeting every 1 or 2 weeks with correlatore, as progress update
> Periodic longer one including relatore, as structured detailed progress update
>
> First month for literature review, summary of who has done what/pros/cons/my aim/my contribution at the end
>
> Common folders in the given OneDrive: codes, personal codes, meetings, bibliography
>
> Deliver 3, preferably 4 weeks before graduation date (I assume it's not the actual graduation celebration but the final exam)
>
> Document functions with headers -> Can probably use GitHub Copilot for speeding this up, given a template
>
> Images with source, employ British English. -> Switch Typora to UK spellcheck
>
> Mentioned MATLAB but I'd rather work with Python, depends on previous work.

- **Meeting set** for next Tuesday, technical KOM
- **Received** access to the shared OneDrive folder and a teams chat
- Organised the folder slightly according to what we had to do
- Added suggested literature in the proposal slide