Here I show the flashy bits of some of the assignments I did during the masters, acknowledging that most of the actual work doesn't make it into a nice graph or animation.

[toc]

# Assignments with animations

## Orbital Mechanics [OM]

Earth **Molniya orbit design** given some basic orbit parameters, with the objective of comparing to a real life object found through publicly available data and **modelling** the most important **perturbations**, in **MATLAB**. This was one of the most interesting projects I did, and motivated me to read a chapter of a book about perturbations, and implementing the **EGM96** model, relativistic effects, etc.

I went ahead and did these two animations using the same software. That was probably a mistake, it was hell on Earth to make, and motivated me to learn **Blender** for the same purpose later.

<iframe width="640" height="360" src="https://www.youtube.com/embed/nJ_P-hUO-3g" allowfullscreen></iframe>

<iframe width="640" height="360" src="https://www.youtube.com/embed/ByNQOdoczXE" allowfullscreen></iframe>

Some figures:

<img src="assets/uni-projects-OM1.png" alt="Undulation from perfect geoid according to EGM96, used in the perturbations model."  />

<img src="assets/uni-projects-OM2.png" alt="Long term perturbed orbit evolution." style="zoom: 80%;" />

<img src="assets/uni-projects-OM3.png" alt="Perturbation models (blue, orange) accuracy vs. real (black) historic data." style="zoom: 80%;" />

The project had a second part about an **interplanetary transfer**.



## Spacecraft Attitude Dynamics [SAD]

Control and simulation of satellite attitude dynamics using **MATLAB Simulink**. Orbit trajectory computed using **MATLAB** and drawn with **Blender**.

<iframe width="640" height="360" src="https://www.youtube.com/embed/B0lHIo_tt7I" allowfullscreen></iframe>



## Launch Systems [LS]

Concept design of a 3-stage partially recoverable (parachute) **missile system** to deliver a non-military payload with a range of ~250km. Missile trajectory computed with **MATLAB** and drawn with **Blender**.

<iframe width="640" height="360" src="https://www.youtube.com/embed/rTtfvdIVifg" allowfullscreen></iframe>



# Other assignments

Some were omitted.

## Space Systems Engineering and Operations [SSEO]

Preliminary design of the **New Horizons** mission to Pluto and the **Juno** mission to Jupiter through reverse engineering. The different major subsystems were designed with the depth one would expect from a systems engineering standpoint at a Pre-A stage, including: mission definition (goals, drivers, phases...), mission analysis (mainly trajectory), propulsion, telecommand & telecommunications, attitude control, thermal control, electrical power, on-board data handling and configuration. Some figures from the Juno assignment:

<img src="assets/uni-projects-sseoTMTC1.png" alt="TMTC high gain antenna downlink losses." style="zoom: 33%;" />

<img src="assets/uni-projects-sseoAOCS1.png" alt="Voxelization of the model to calculate accurate inertia moments for AOCS." style="zoom: 50%;" />

<img src="assets/uni-projects-sseoTCS1.png" alt="TCS usage during the mission's span." style="zoom: 67%;" />

## Space Propulsion [SP]

One-week long workshop for the design of a **pressure-fed liquid propellant rocket motor**. The team and task was considerable, and the time available was very short, but it ended up being one of the most unique projects I've ever done. I used **MATLAB** for the parts I worked on: **thermal analysis**, **basic injector design** and **cooling solutions** (ablative, heat sink, regenerative, liquid film). The design was to be performed for two propellant pairs (one more eco-friendly than the other) and three thrust targets (nominal, half and double thrust). Here are some images for the nominal thrust with the (more) toxic propellant pair of MMH (monomethyl hydrazine) and NTO (nitrogen tetroxide):

<img src="assets/uni-projects-SP1.png" alt="Cross-section of combustion chamber and nozzle parts." style="zoom: 67%;" />

<img src="assets/uni-projects-SP2.png" alt="Estimated cross-sectional heat flux." style="zoom: 67%;" />

<img src="assets/uni-projects-SP3.png" alt="Stress-derived minimum wall thickness." style="zoom: 67%;" />

A much smaller assignment consisted in the internal ballistic analysis of solid rocket motors. From Ballistic Test and Evaluation System (BATES) results at the lab (pressure traces), Vielle's law parameters were statistically derived to get the expected performance.

<img src="assets/uni-projects-SPFlipped1.png" alt="Fitted model from experimental data." style="zoom: 33%;" />

<img src="assets/uni-projects-SPFlipped2.png" alt="70 bar pressure traces against fitted Vielle's model." style="zoom: 33%;" />

## Payload Design [PD]

Preliminary **design of an instrument** with the same goals as KaRIn in the SWOT mission. Using **MATLAB** as well, I worked in the **environmental** analysis (specifically **tides**, **atmospheric attenuation** and orbit **perturbations**) , **orbit design** (accounting for **tidal aliasing** and **tidal separability** requirements) and Interferometric Synthetic Aperture Radar (**InSAR**) setup: radar equation and interferometric baseline preliminary design. Very lengthy, well researched and interesting for me.

<img src="assets/uni-projects-PD1.png" alt="Estimated perturbations for preliminary orbit." style="zoom: 50%;" />

<img src="assets/uni-projects-PD2.png" alt="ITUR-676 1-way zenith signal attenuation." style="zoom: 33%;" />

<img src="assets/uni-projects-PD3.png" alt="Slice of the candidate orbit pool."  />

![Retrograde and high inclination orbits are filtered due to high aliasing periods.](assets/uni-projects-PD4.png)

![Only candidates with certain days per cycle remain.](assets/uni-projects-PD5.png)

![Selection is narrowed down using tidal separability criteria.](assets/uni-projects-PD6.png)

![Final two clusters and their subcycle characteristics.](assets/uni-projects-PD7.png)

![Earth coverage and ground track.](assets/uni-projects-PD8.png)