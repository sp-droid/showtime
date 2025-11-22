# Fragmentation characterisation in highly elliptical orbits - Technical notes

Short notes:

- fix fastplotlib on laptop, for some reason it doesn't work there
- Implement NASA's break-up model
- No need to implement but for sure seems interesting. A simple case of mean element propagation [here](https://github.com/rodrigo-moliveira/orbidet/tree/master) and [here](https://www.researchgate.net/publication/269574489_Mean_Element_Propagations_Using_Numerical_Averaging)
- I don't think it necessary to implement a semi-analytical model. I will want to use PlanODyn to compare the validation cases
- **Adaptive Picard-Chebyshev. This I do want to do implement.**
- No need to add all the perturbations, something simple works for now.
- try GMAT

[toc]

## Numerical solvers

If I want to implement the solver on a GPU I need to understand well, and be able to implement it on a CPU.

### Cowell's formulation

Kepler's 2 body problem with additional small perturbations. Generally non-stiff (time-scale continuity), except in extreme elliptical orbits with low perigee heights where drag becomes important in a small fraction of the orbit. But still acceptably non-stiff.

$$
\begin{array}{c}
y = [r\,;v] \\[6pt]

\dot{y} = [v\,;a] \\[6pt]

a = -\mu\frac{r}{|r|^3} + a_{pert} \\[6pt]

f\left( t, y\right) = \dot{y}
\end{array}
$$

Cowell's formulation is simply Kepler's equation with an additional smaller term from perturbing forces.

### 1. Runge-Kutta 4

$$
\begin{array}{c}
y_{t+1} = y_t + kh \\[6pt]

k = \frac{1}{6}k_1+\frac{1}{3}k_2+\frac{1}{3}k_3+\frac{1}{6}k_4 \\[6pt]

k_1 = f\left(t, y\right) \\[3pt]
k_2 = f\left(t+0.5h, y+0.5hk_1\right) \\[3pt]
k_3 = f\left(t+0.5h, y+0.5hk_2\right) \\[3pt]
k_4 = f\left(t+h, y+hk_3\right)
\end{array}
$$



### 2. RK4 in Numba JIT

Considerable speed up, around x10^2^. The code is compiled on first iteration through Numba's JIT compiler, speeding things up significantly. To make it work fast, vectorised operations, function calls and others were exchanged for simpler operations compatible with the framework.



### 3. Including a perturbation (J2)
J2 term equation in cartesian coordinates.
$$
\bar{a}_{J2} = 1.5J_2\mu\frac{R_\oplus^2}{|r|^5}\left[(5\frac{r_z^2}{|r|^2}-1)(r_x\hat{i}+r_y\hat{j})+5\frac{r_z^2}{|r|^2}-3)r_z\hat{k}\right]
$$



### 4. Adaptive RK4 through Richardson extrapolation and step doubling

For the purpose of increasing the order of a solution and calculating the error, there is one technique called **Richardson extrapolation** which involves calculating two approximations to the same time with different step sizes (if using **step doubling** one single step with h and a double step using h/2).
$$
\begin{array}{c}
y_{single} = f(t, y, h) +o(h^5) \\[6pt]

y_{double} = f(t+0.5h, f(t, y, 0.5h), 0.5h) +o(h^5) \\[6pt]

y_{extrapolated} = y_{double}+\frac{y_{double}-y_{single}}{2^m-1}+o(h^6)
\end{array}
$$

With m being the local truncation error order (RK4 solution has global order 4=m, local 5), and the extrapolation increases the order by 1.

The full and small steps are used for calculating an error metric that adaptive step-sizing needs. However it only makes sense to do Richardson extrapolation when the underlying function is not expensive to evaluate, but with RK methods they are. Instead **embedded errors** are the preferred option. Not every Runge Kutta method can do it, they need to be embedded methods that produce two solutions of different orders. RK4 is an explicit method that can't do this.
$$
\begin{array}{c}
error_i = \frac{|{y_{extrapolated}}_i - {y_{single}}_i|}{scale_i} \\[6pt]

scale_i = tol_{abs} + tol_{rel}\max\left(|y_i|,|{y_{extrapolated}}_i|\right) \\[6pt]

if\,max(\epsilon, error_i|_{max}) > 1.0: reject\,step \\[6pt]

else: y_{next} = y_{extrapolated} \\[9pt]

h_{new} = hS \left(\frac{1}{error}\right)^{\frac{1}{q+1}} \\[6pt]

S = \text{overshooting safety factor}
\end{array}
$$





## Miscellanea

### Test with WGPU

It's a python library for WebGPU bindings, allowing me to tap into GPU capabilities without being vendor specific with a modern API. Successful in both computers, similar nomenclature as in WebGPU's JS bindings.

### Test with fastplotlib

It's a python library for plotting (like matplotlib) that uses WGPU for rendering plots faster. It's nice to have because we are going to need WGPU anyway, and makes 3D scatter plots with many points a breeze. Successful in my main computer, but still solving an issue on the laptop.
