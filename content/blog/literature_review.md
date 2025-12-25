Objectives:

- Fragmentation event
- Fragment cloud orbital dynamics

Legend:

- First letter = category
- *= Proposal article
- **= Recommended article

[toc]



# Propagator

## Formulation

Ely, Todd. “Mean Element Propagations Using Numerical Averaging.” *Journal of the Astronautical Sciences* 61 (September 2014): 275–304. https://doi.org/10.1007/s40295-014-0020-2.

- Similar to semi-analytical techniques but using numerical averaging, for long term.

## Solver

Van Der Houwen, P.J., E. Messina, and J.J.B. De Swart. “Parallel Störmer–Cowell Methods for High-Precision Orbit Computations.” *Applied Numerical Mathematics* 31, no. 3 (1999): 353–74. https://doi.org/10.1016/S0168-9274(98)00135-4.

- **Many orbital mechanics problems are non-stiff, initial value problems.**

“Rungekutta.Pdf.” n.d. Accessed December 25, 2025. https://math.okstate.edu/people/yqwang/teaching/math4513_fall11/Notes/rungekutta.pdf.

- Runge-Kutta method

### Benchmarks

Atallah, Ahmed M., Robyn M. Woollands, Tarek A. Elgohary, and John L. Junkins. “Accuracy and Efficiency Comparison of Six Numerical Integrators for Propagating Perturbed Orbits.” *The Journal of the Astronautical Sciences* 67, no. 2 (2020): 511–38. https://doi.org/10.1007/s40295-019-00167-2.

- Benchmark of different numerical integrators, though only aimed at short term comparisons. Adaptive **Picard-Chebyshev outperforms** algorithms included in the comparison.

“RefBookV2.Book.” n.d. Accessed December 25, 2025. https://www3.diism.unisi.it/~paoletti/teaching/ModGestSistAmb/download/ODE_Manual.

- Comparison of different solvers and their preferred case with respect to problem stiffness. **The algorithms ode45 and ode113 are good for our non-stiff problem. ode45 is one step, ode113 is multistep, better for long propagations with expensive evaluation functions.**

### Picard-Chebyshev

Picard-Chebyshev is great for extracting computing power properly out of GPUs, due to its parallel nature, in comparison to most solvers for orbit propagation that are sequential. **However**, if the goal is still multi-object (in the hundreds, thousands), it stops being crucial because we can simply run each thread independently on simple sequential solvers, for each object. It's worse for collision detection too. Unless the goal changes or becomes in the future to propagate a single orbit very accurately very fast, it's not the best solution.

Koblick, Darin, Mark Poole, and Praveen Shankar. “Parallel High-Precision Orbit Propagation Using the Modified Picard-Chebyshev Method.” *Volume 1: Advances in Aerospace Technology*, American Society of Mechanical Engineers, November 9, 2012, 587–605. https://doi.org/10.1115/IMECE2012-87878.

- Thesis on the use of the modified parallel PC method on a CPU. **Explanation and implementations of both the vectorised, and the parallel modified PC method, Gauss-Jackson 8th order fixed step solver and the Dormand & Prince 8(7) DOPRI87 solver. Mentions to Adams-Bashford-Moulton multi-step solver found in MATLAB as ode113, and DOPRI45 available as ode45. Limited convergence for the PC method** 

Rubio, Carlos, Adrián Delgado, Adrián García-Gutiérrez, and Alberto Escapa. “Waveform Relaxation Method for Parallel Orbital Propagation.” *Acta Astronautica* 229 (April 2025): 672–83. https://doi.org/10.1016/j.actaastro.2025.01.057.

- Method to increase the convergence interval in PC



## GPU specific

Masat, Alessandro, Camilla Colombo, and Arnaud Boutonnet. “GPU-Based High-Precision Orbital Propagation of Large Sets of Initial Conditions through Picard-Chebyshev Augmentation.” *Acta Astronautica* 204 (March 2023): 239–52. https://doi.org/10.1016/j.actaastro.2022.12.037.

- Highly parallel Picard–Chebyshev orbital propagator that augments the integrator to propagate *many initial conditions at once* with high accuracy, significantly improving throughput versus multi-core CPU approaches.

Moeckel, Marek. “High-Performance Propagation of Large Object Populations in Earth Orbits.” 2015.

- Thesis: Long term analytical (averaged elements) propagator for GPU. Extensive guidelines for extracting performance from the GPU for these kind of problems.
- His short conference paper adjoined to the thesis later: Short summary on the problem specifically for the orbital debris case with thousands of fragments, includes tips on the general implementation on GPUs.



# Other

## Break-up model

Johnson, N. L., P. H. Krisko, J. -C. Liou, and P. D. Anz-Meador. “NASA’s New Breakup Model of Evolve 4.0.” *Advances in Space Research* 28, no. 9 (2001): 1377–84. https://doi.org/10.1016/S0273-1177(01)00423-9.

- NASA's new break-up model article. Comparison with the old model.

Velerda Escobar, Juan Carlos. *Continuum Approach for the Modelling of Debris Population and Launch Traffic in Low Earth Orbit*. April 28, 2022. https://www.politesi.polimi.it/handle/10589/187251.

- His implementation of the model has 1 change on the reference mass for non-catastrophic collisions and a fixed value in the distributions at the appendix.

Schuhmacher, Jonas. *Efficient Implementation and Evaluation of the NASA Breakup Model in Modern C++*. September 15, 2021.

- Compares freely available C++, Fortran and Python implementations of NASA's break-up model, and eventually offers a validated version without errors. I used their C++ implementation for ESA for the bridge function and to double check everything.



## Perturbation modelling

Montenbruck, O, E Gill, and Fh Lutze. “*Satellite Orbits: Models, Methods, and Applications*.” *Applied Mechanics Reviews* 55, no. 2 (2002): B27–28. https://doi.org/10.1115/1.1451162.

- Perturbations, Earth's geopotential, 3^rd^ body, drag, SRP... and precision modelling ones like tides, Earth radiation pressure and relativistic effects.
- Short comment comparing efficiency across different types of propagators, talking about how including **the computation cost of perturbations shifts the optimal solver towards higher order schemes**.

Vallado, David A. *Fundamentals of Astrodynamics and Applications*. In *Fundamentals of Astrodynamics and Applications/ by David A. Vallado with Technical Contributions by Wayne D. McClain. 2nd Ed. El Segundo*. 2001. https://ui.adsabs.harvard.edu/abs/2001fada.book.....V.

- **Perturbation forces sensitivity analysis (2BP, EGM, drag, SRP, 3rd body, solid tides, ocean tides) including HEO**

Pak, Dennis C. “Linearized Equations for J2 Perturbed Motion Relative to an Elliptical Orbit.” Master of Science, San Jose State University, 2005. https://doi.org/10.31979/etd.67m8-bsmg.

- **Cartesian form of J2**.

Curtis, Howard D. *Orbital Mechanics for Engineering Students*. 1. ed., Reprinted. Elsevier Aerospace Engineering Series. Elsevier Butterworth Heinemann, 2008.



## Validation

Colombo, Camilla. *PLANETARY ORBITAL DYNAMICS (PLANODYN) SUITE FOR LONG TERM PROPAGATION IN PERTURBED ENVIRONMENT*. January 1, 2016.

- **PlanODyn**

Conway, Darrel J., and Steven P. Hughes. “The General Mission Analysis Tool (GMAT): Current Features And Adding Custom Functionality.” Paper presented at European Space Agency, Cologne, Germany. May 3, 2010. https://ntrs.nasa.gov/citations/20180000083.

- **GMAT**

Vallado, David A. *Fundamentals of Astrodynamics and Applications*. In *Fundamentals of Astrodynamics and Applications/ by David A. Vallado with Technical Contributions by Wayne D. McClain. 2nd Ed. El Segundo*. 2001. https://ui.adsabs.harvard.edu/abs/2001fada.book.....V.

- **Precision Orbit Ephemerides (POE)**. POE’s are available for a few satellites such as TOPEX, LAGEOS, ETALON 1 and 2, GPS, TDRSS, and a few others. You should contact the appropriate organization to determine their availability. For instance, the Center for Space Research at the University of Texas at Austin produces POE’s for TOPEX. See Appendix D for additional information



---



# Recommended but unused

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

## HEO

*, **A1**. [Colombo C, Alessi EM, Landgraf M. End-of life disposal of spacecraft in Highly Elliptical Orbits by means of luni-solar perturbations and Moon resonances. Earth. 2013;3(2):2-.](literature/proposal papers/End-of life disposal of spacecraft in Highly Elliptical Orbits by means of luni-solar perturbations and Moon resonances.pdf)

- **HEO orbits are important for communications, spending most of the time at high altitudes above the radiation belts for stable observation and communications. They have a considerable risk of severe collisions and fragmentation events.**
- **Disposal strategies for HEO, a controlled reentry or parking in Lunar Weak Capture Orbits (WCO) both can be aided by the third body perturbations and small adjustments in the orbit.**
- **3rd body perturbation takes a central role in long-term HEO evolution**

**A2**. [Gleghorn G, Asay J, Atkinson D, Flury W, Johnson N, Kessler D, Knowles S, Rex D, Toda S, Veniaminov S. Orbital debris: A technical assessment. 1995 Jan 1.](https://nap.nationalacademies.org/catalog/4765/orbital-debris-a-technical-assessment)

- Definition of High Earth Orbit as any orbit with a mean altitude greater than 2000 km, and Highly Elliptical Orbit as any orbit with an eccentricity greater than 0.5. 

From the definition of eccentricity and semi-major axis we can compute a minimum apogee height considering a minimum perigee height at the Von Karman line (100 km):
$$
\begin{array}{c}
e = \frac{r_a-r_p}{2a}\,;\,a = \frac{1}{2}(r_a+r_p) \rightarrow r_a = \frac{1+e}{1-e}r_p \\[6pt]
h_a(e=0.5,h_p=100\,km) \approx \text{13000 km}
\end{array}
$$
**In this document HEOs are defined as elliptical orbits with eccentricity higher than 0.5 and apogee heights of  over 13000 km.**

- **HEOs may cross highly congested regions, making the risk of collision uncertain even though the time of residence is low.**
- **HEOs object velocities vary very strongly, resulting in wide distributions of fragment size and energy in the case of a collision.**

** **A3**. [Moschetta M. Semi-analytical propagator for analysis of fragmentation events in the geosynchronous orbital region with analytically expanded perturbations.](literature/starting papers/2024_12_Moschetta_Thesis_01.pdf)

- Thesis on debris propagation from geosynchronous orbits with a semi-analytical propagator, representing the SRP as anti-gravity to better see its effect, using GMAT as validation 
- Very complete, thesis from the department so obviously tailored to the style wanted already. Useful to look at.

** **A4**. [Letizia F, Colombo C, Lewis HG. Analytical model for the propagation of small-debris-object clouds after fragmentations. Journal of Guidance, Control, and Dynamics. 2015 Aug;38(8):1478-91.](literature/starting papers/Letizia_2014_AnalyticalModelSmall.pdf)

- Analytical modelling of the fragment cloud evolution. Good reference for this different approach
