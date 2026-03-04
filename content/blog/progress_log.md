Short notes:

- try GMAT
- verlet integration symplectic

Comments professor meeting

litterature of GPU propagation

focus on ephenerides kernel

sharecube algorithm method for collision

[toc]

# Progress

## Q4 2025

### December

- Literature review
- Types of OM problems, types of solvers
- NASA Standard Break-up Model implementation and validation
- Documented, improved and collected several functions into a library
- My original idea was to use a vendor-agnostic platform so I thought of WebGPU and wgpu-py, but these don't work with multiple GPUs so I'll proceed with CUDA. I contemplated OpenCL but it has problems with n > 8. I have an NVIDIA GPU so let's make things easier for myself.
- Optimised kep2car, car2kep, rotX, rotY, rotZ, kepler2BP with Numba JIT. Substituted fsolve with a jitted solve_keplerEq. Considerable speed ups. Visualisation of object break-up and 2BP propagation.

### November

- Reorganised thesis documents into 3 (log, literature and technical)
- Fixed mathematical equations syntax errors for rendering online

- RK4 with Richardson extrapolation
- Adaptive step-sizing

- Utility functions car2kep, kep2car, analytical propagator for elliptical orbits

- RK4 with a J2 perturbation

- RK4 with Numba JIT, +115x speed up (native python is very slow)

- Runge-Kutta 4 in python for the 2BP
- Literature review

### October

- Literature review

### September

- Completed test with webgpu-py. I'm pretty happy that the API looks so similar in python as in JS, much easier even. No additional packages needed when working with the environment built for using fastplotlib.
- Literature review

- Completed test with fastplotlib. Satisfactory. It is much faster than any alternative at doing scatter plots on many points, especially on animations, looks flexible, environment needed is simple...
- Created log document

- Received some suggested articles, instruction document, presentation template
- Further organised the folder

Some talk of using GPU. I have experience in them through both (NVIDIA GPUs only) the python numba-cuda framework and the (platform agnostic) [WebGPU](https://pabloarbelo.com/pages/blog/webgpu.html) API with JS bindings. However JS is a terrible language for the topic, but if I want for whatever I make to work with any computer (Apple - Metal, AMD - Rocm, NVIDIA - CUDA, Intel) I'd love to use WebGPU under the hood, in a somewhat high level way because I'm only interested in the compute shaders -> Bindings in Python, through [webgpu-py](https://github.com/pygfx/wgpu-py) ? 

Some plots are likely to contain many elements, and a couple of animations would possibly make sense down the line. Python's matplotlib is rather slow and when looking up webgpu-py I discovered [fastplotlib](https://fastplotlib.org/_gallery/line_collection/line_stack_3d.html), which would allow for fast 3D visualisations of the fragment cloud even for millions of points.

- Received access to the shared OneDrive folder and a teams chat

- Organised the folder slightly according to what we had to do

- Added suggested literature in the proposal slide

  

# Meetings



> #### 📝 Meeting notes 23/12
>
> **Title:** PM
> **Attendees:** Prof. Camilla, Francesca and Elisa
> **Duration:** 45'
>
> - Mind map of work planned, literature analysis, implemented NSBM
> - My literature analysis wasn't thorough enough. The professor proposed to narrow the focus of the thesis towards an efficient many-object GPU working propagator, away from the initial conditions of long term analysis of fragment clouds in HEO. GPU was for me an off-shoot of the work I could focus on once everything else was in place but it seems better to make it a central part.
> - She also asked me to really plan-out the GPU propagator ahead of time. Also mentioned multi-GPU problems. This discards using WebGPU to make it vendor-agnostic. Probably sticking to CUDA then.
> - Will receive access to the GitLab in the coming days
>

> #### 📝 Meeting notes 18/12
>
> **Title:** PM
> **Attendees:** Francesca and Elisa
> **Duration:** 15'
>
> - Work done, summary of presentation
> - Tips on meeting with prof. Colombo
> 

> #### 📝 Meeting notes 21/11
>
> **Title:** PM
> **Attendees:** Francesca and Elisa
> **Duration:** 40'
>
> - Questions on validation idea, what is "long term" for propagation in our case
> - Tips on meeting with prof. Colombo
> 

> #### 📝 Meeting notes 31/10
>
> **Title:** PM
> **Attendees:** Francesca and Elisa
> **Duration:** 15'
>
> - Literature review progress
>

> #### 📝 Meeting notes 17/10
>
> **Title:** PM
> **Attendees:** Francesca and Elisa
> **Duration:** 25'
>
> - Literature review progress
> - Questions on semi-analytical vs full-numerical propagators
> - Mind map for the literature review conclusion. Aided by block diagram. Motivation, past work advantages+disadvantages...
>

> #### 📝 Meeting notes 23/09
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

> #### 📝 Meeting notes 19/09
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