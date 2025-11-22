# Fragmentation characterisation in highly elliptical orbits - Literature review

Objectives:

- Fragmentation event
- Fragment cloud orbital dynamics

Legend:

- First letter = category
- *= Proposal article
- **= Recommended article

[toc]

## A. General

*, **A1**. [Colombo C, Alessi EM, Landgraf M. End-of life disposal of spacecraft in Highly Elliptical Orbits by means of luni-solar perturbations and Moon resonances. Earth. 2013;3(2):2-.](literature/proposal papers/End-of life disposal of spacecraft in Highly Elliptical Orbits by means of luni-solar perturbations and Moon resonances.pdf)

- **HEO orbits are important for communications, spending most of the time at high altitudes above the radiation belts for stable observation and communications. They have a considerable risk of severe collisions and fragmentation events.**
- **Disposal strategies for HEO, a controlled reentry or parking in Lunar Weak Capture Orbits (WCO) both can be aided by the third body perturbations and small adjustments in the orbit.**
- **3rd body perturbation takes a central role in long-term HEOt evolution**

**A2**. [Gleghorn G, Asay J, Atkinson D, Flury W, Johnson N, Kessler D, Knowles S, Rex D, Toda S, Veniaminov S. Orbital debris: A technical assessment. 1995 Jan 1.](https://nap.nationalacademies.org/catalog/4765/orbital-debris-a-technical-assessment)

- Definition of High Earth Orbit as any orbit with a mean altitude greater than 2000 km, and Highly Elliptical Orbit as any orbit with an eccentricity greater than 0.5. 

From the definition of eccentricity and semi-major axis we can compute a minimum apogee height considering a minimum perigee height at the Von Karman line (100 km):
$$
\begin{array}{c}
e = \frac{r_a-r_p}{2a}\,;\,a = \frac{1}{2}(r_a+r_p) \rightarrow r_a = \frac{1+e}{1-e}r_p \\[6pt]
h_a(e=0.5,h_p=100\,km) \approx \text{6600 km}
\end{array}
$$
**In this document HEOs are defined as elliptical orbits with eccentricity higher than 0.5 and apogees over 6600 km.**

- **HEOs may cross highly congested regions, making the risk of collision uncertain even though the time of residence is low.**
- **HEOs object velocities vary very strongly, resulting in wide distributions of fragment size and energy in the case of a collision.**

## B. Break-up model

** **B1**. [Escobar V, Carlos J. Continuum approach for the modelling of debris population and launch traffic in Low Earth Orbit.](literature/starting papers/Velerda J, 2022, Continuum approach for the modelling of debris population and launch traffic in Low Earth Orbit.pdf)

- Thesis on developing a continuum model for debris in LEO. 
- COMMENTS: For now the intent is to start with individual fragments but in case a continuum solution is explored this is a strong reference. The appendix also contains the implementation of NASA's break-up model.

** **B2**. [Johnson NL, Krisko PH, Liou JC, Anz-Meador PD. NASA's new breakup model of EVOLVE 4.0. Advances in Space Research. 2001 Jan 1;28(9):1377-84.](literature/starting papers/Johnson2001_NASABreakupModel.pdf)

- NASA's new break-up model article. Comparison with the old model.
- COMMENTS: Good read for literature review and understanding of break-up events. For implementation use **B3** as support.

** **B3**. [NASA. Orbital Debris Quarterly News. Volume 15, Issue 4.](literature/starting papers/ProperImplNASABM.pdf)

- On page 4-5 there is a clarification on the implementation of NASA's break-up model.

- COMMENTS: Use this one for implementation with **B2**.

## C. Perturbation modelling

**C1**. [Montenbruck O, Gill E, Lutze FH. Satellite orbits: models, methods, and applications. Appl. Mech. Rev.. 2002 Mar 1;55(2):B27-8.](literature/books/Satellite Orbits_ Models, Methods and Applications.pdf)

- Perturbations, Earth's geopotential, 3^rd^ body, drag, SRP... and precision modelling ones like tides, Earth radiation pressure and relativistic effects.
- COMMENTS: Good back-up read for perturbations. Also short comment comparing efficiency across different types of propagators, talking about how **including the computation cost of perturbations shifts the optimal solver towards higher order schemes**.

**C2**. [Vallado, David. Fundamentals of Astrodynamics and Applications, 2010 ESA seminar](https://trajectory.estec.esa.int/Astro/4rth-astro-workshop-presentations/ICATT-2010-Tutorial-ASTRODYNAMICS.pdf)

- **Perturbation forces sensitivity analysis (2BP, EGM, drag, SRP, 3rd body, solid tides, ocean tides) including HEO**
- [Article on mathworks based on Vallado's work](https://it.mathworks.com/help/aeroblks/high-precision-orbit-propagation-of-the-international-space-station.html#HighPrecisionOrbitPropagationISSExample-13)

**C3**. [Pak, Dennis C, "Linearized Equations for J2 Perturbed Motion Relative to an Elliptical Orbit" (2005).  Master's Thesis, San Jose State University.](https://scholarworks.sjsu.edu/cgi/viewcontent.cgi?article=3727&context=etd_theses)

- **Cartesian form of J2**.

## D. Solver

**D1**. [Atallah AM, Woollands RM, Elgohary TA, Junkins JL. Accuracy and efficiency comparison of six numerical integrators for propagating perturbed orbits. The Journal of the Astronautical Sciences. 2020 Jun;67(2):511-38.](https://mae.ucf.edu/TAE/wp-content/uploads/2019/05/Atallah2019_Article_AccuracyAndEfficiencyCompariso.pdf)

- Benchmark of different numerical integrators, including for the HEO case, though only aimed at short term comparisons.
- COMMENTS: Adaptive **Picard-Chebyshev outperforms** algorithms included in the comparison.

**D2**. [Runge-Kutta method](https://math.okstate.edu/people/yqwang/teaching/math4513_fall11/Notes/rungekutta.pdf)

- **Implementation of RK4**

**D3**. [ode45, ode23, ode113, ode15s, ode23s, ode23t, ode23tb](https://www3.diism.unisi.it/~paoletti/teaching/ModGestSistAmb/download/ODE_Manual)

- Comparison of different solvers and their preferred case with respect to problem stiffness. **The algorithms ode45 and ode113 are good for our non-stiff problem. ode45 is one step, ode113 is multistep, better for long propagations with expensive evaluation functions.**

**D4**. [Parallel Störmer–Cowell methods for high-precision orbit computations]()

- **Many orbital mechanics problems are non-stiff, initial value problems.**

## E. GPU-Parallelisation of the orbit propagator

**E1.** [Masat A, Colombo C, Boutonnet A. GPU-based high-precision orbital propagation of large sets of initial conditions through Picard–Chebyshev augmentation. Acta Astronautica. 2023 Mar 1;204:239-52.]()

- TO-READ

 **E2**. [Möckel M, Bennett J, Stoll E, Zhang K. High performance orbital propagation using a generic software architecture. InProceedings of the Advanced Maui Optical and Space Surveillance Technologies Conference, Maui, HI, USA 2016 Sep 20 (pp. 20-23).](https://amostech.com/TechnicalPapers/2016/SSA-Algorithms/Moeckel.pdf)

- Short summary on the problem specifically for the orbital debris case with thousands of fragments
- COMMENTS: Nice to read overall, includes tips on the general implementation on GPUs.

## G. Validation

*,** **G1**. [Colombo C. Planetary orbital dynamics (PlanODyn) suite for long term propagation in perturbed environment. In6th International Conference on Astrodynamics Tools and Techniques (ICATT) 2016 Mar 14 (pp. 14-17).](literature/proposal papers/Planetary orbital dynamics (PlanODyn) suite for long term propagation in perturbed environment.pdf)

- PlanODyn

**G2**. [Conway DJ, Hughes SP. The general mission analysis tool (GMAT): Current features and adding custom functionality. InInternational Conference on Astrodynamics Tools and Techniques (ICATT) 2010 May 3 (No. LEGNEW-OLDGSFC-GSFC-LN-1107).](https://ntrs.nasa.gov/citations/20180000083)

- GMAT

**Validation of propagation models**

- Identify objects in [CelesTrak](https://celestrak.org/)
- Get TLEs for a non propulsive range in [Space-Track](https://www.space-track.org/), spanning a long time
- Propagate between the TLEs to match the required sampling frequency, using in-house tools or [NASA Horizons](https://ssd.jpl.nasa.gov/horizons/app.html#/)
- ~~Assume the observational error and propagation between TLEs to be negligible with respect to unavoidable errors from uncertain sources such as Sun flux for SRP and atmospheric density for the drag~~
- Compare models with the ~~**ground truth**~~, **a 2BP baseline**, **good semi-analytical suite like PlanODyn**, **GMAT**

Chosen objects

- TESS, identified with [NORAD43435](https://celestrak.org/satcat/table-satcat.php?NAME=tess&PAYLOAD=1&MAX=500), known area-to-mass ratio, in HEO
- LightSail2, identified with [NORAD44420](https://celestrak.org/satcat/table-satcat.php?NAME=lightsail&PAYLOAD=1&MAX=500), with a well known and very high area-to-mass ratio to stress the SRP and drag models

**Uncertainty problem. There probably are better ways to find historic data from which we can validate our model.**

---



## 0. Uncategorised

*, **2**. [Colombo C, Alessi EM, van der Weg W, Soldini S, Letizia F, Vetrisano M, Vasile M, Rossi A, Landgraf M. End-of-life disposal concepts for Libration Point Orbit and Highly Elliptical Orbit missions. Acta Astronautica. 2015 May 1;110:298-312.](literature/proposal papers/End-of-life disposal concepts for Libration Point Orbit and Highly Elliptical Orbit missions.pdf)

- Focused on the analysis of possible disposal strategies for HEO but also Libration Point Orbits (LPO). Disposal strategies are not in the scope of the thesis.

*, **3**. [Colombo C. Long-term evolution of highly-elliptical orbits: luni-solar perturbation effects for stability and re-entry. Frontiers in Astronomy and Space Sciences. 2019 Jul 2;6:34.](literature/proposal papers/Long-term evolution of highly-elliptical orbits luni-solar perturbation effects for stability and re-entry.pdf)

- Same but focused on HEO.

*, **4**. [Frey S, Colombo C, Lemmens S. Evolution of fragmentation cloud in highly eccentric earth orbits through continuum modelling. INTERNATIONAL ASTRONAUTICAL CONGRESS: IAC PROCEEDINGS 2018 (pp. 1-8).](literature/proposal papers/Evolution of fragmentation cloud in highly eccentric earth orbits through continuum modelling.pdf)

- Uses the NASA breakup model and propagates the fragment cloud as a continuum in HEO. Propagation is done semi-analytically.
- COMMENTS: Aside from using a continuum, it's pretty close to what's needed.

*, **6**. [Alessi EM, Rossi A. Orbital evolution of a Molniya fragmentation. InInternational Astronautical Congress 2024.](literature/proposal papers/Orbital evolution of a Molniya fragmentation.pdf)

- Long term evolution of fragmentation in a Molniya orbit. NASA break-up model, propagation of individual fragments (500-1000), analysis of dispersion mechanism. Computationally expensive to do more fragments. Another semi-analytical propagator for long-term.

*, **7**. [Giudici L, Colombo C. Keplerian map theory for high-fidelity prediction of the third-body perturbative effect. InINTERNATIONAL ASTRONAUTICAL CONGRESS: IAC PROCEEDINGS 2021 (pp. 1-10).](literature/proposal papers/Keplerian map theory for high-fidelity prediction of the third-body perturbative effect.pdf)

- Keplerian map theory, computationally more efficient technique than classical N-body simulation, here it was applied to an interplanetary trajectory though.

** **8**. [Moschetta M. Semi-analytical propagator for analysis of fragmentation events in the geosynchronous orbital region with analytically expanded perturbations.](literature/starting papers/2024_12_Moschetta_Thesis_01.pdf)

- Thesis on debris propagation from geosynchronous orbits with a semi-analytical propagator, representing the SRP as anti-gravity to better see its effect, using GMAT as validation 
- Very complete, thesis from the department so obviously tailored to the style wanted already. Useful to look at.

** **9**. [Ashenberg J. Formulas for the phase characteristics in the problem of low-earth-orbital debris. Journal of Spacecraft and Rockets. 1994 Nov;31(6):1044-9.](literature/starting papers/Ashenberg.pdf)

- First approximation of the time order for debris orbital, apsidal and nodal closures after a fragmentation event in LEO, considering J2 and drag.
- COMMENTS: This is the sort of stuff expected from an analysis in HEO, getting the time order for the different phases for development of the final form of the debris cloud.

** **10**. [Colombo C. Long-term evolution of highly-elliptical orbits: luni-solar perturbation effects for stability and re-entry. Frontiers in Astronomy and Space Sciences. 2019 Jul 2;6:34.](literature/starting papers/Colombo2019HEO.pdf)

- HEO secular and long term dynamics explored through the single and double averaging of the disturbing potential, considering luni-solar and earth oblateness effects.
- COMMENTS: Good as reference source for validating debris trajectories in HEO.

** **11**. [ESA Space Debris Office. Environmental report. 2024](literature/starting papers/ESA_environmental_report_2024.pdf)

- Update on current debris population characteristics, break-up events, mitigation strategies. Also specific risk assessment for HEO.
- COMMENTS: Useful for contextual motivation and comparison of simulated debris cloud evolution against actual environment models.

** **12**. [Giudici L, Trisolini M, Colombo C. Phase space description of the debris’ cloud dynamics through a continuum approach. InINTERNATIONAL ASTRONAUTICAL CONGRESS: IAC PROCEEDINGS 2022 (pp. 1-12).](literature/starting papers/Giudici_2022_PhaseSpace_continuum.pdf)

- Phase-space evolution of debris cloud, with propagation of the density functions themselves.
- COMMENTS: Again relevant for cloud approaches.

** **13**. [Giudici L, Colombo C. Keplerian map theory for high-fidelity prediction of the third-body perturbative effect. InINTERNATIONAL ASTRONAUTICAL CONGRESS: IAC PROCEEDINGS 2021 (pp. 1-10).](literature/starting papers/Giudici_tesiMSc.pdf)

- Thesis on the approximation of third body effects over long periods of time, focusing on computational efficiency while conserving long term accuracy. Lagrange eqs.
- COMMENTS: Possibly useful as reference when justifying semi-analytical integration.

** **14**. [Anz-Meador P, Opiela J, Liou JC. History of on-orbit satellite fragmentations. 2023 Jan 3.](literature/starting papers/History_Fragmentations_2022_NASA.pdf)

- NASA’s updated historical review of all recorded fragmentation events. Includes statistical characterisation of breakup causes, fragment size distributions, and energy release estimates.

- COMMENTS: Good read for literature review and understanding.

** **15**. [Letizia F. *Space debris cloud evolution in Low Earth Orbit* (Doctoral dissertation, University of Southampton).](literature/starting papers/Letizia_2013_debris evolution LEO.pdf)

- Continuum model and semi-analytical evolution of fragment cloud, for faster results.
- COMMENTS: Strong reference for analytical and continuum based solutions but probably not what we are looking for.

** **16**. [Letizia F, Colombo C, Lewis HG. Analytical model for the propagation of small-debris-object clouds after fragmentations. Journal of Guidance, Control, and Dynamics. 2015 Aug;38(8):1478-91.](literature/starting papers/Letizia_2014_AnalyticalModelSmall.pdf)

- Analytical modelling of the fragment cloud spread
- COMMENTS: Similar, if not continuation of the work in **A15**.