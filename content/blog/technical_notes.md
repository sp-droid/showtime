[toc]

# Fragmentation

## NASA Standard Break-up Model

It assumes isotropic break-up orientation and spherical fragments.

Steps:

- Gather the inputs:
  - Explosion or collision (1 or 2 objects)
  - Target is a rocket body or a satellite
  - Relevant masses and (in the case of collisions) relative velocity
  - Minimum and maximum characteristic lengths
- Classify the event as an explosion (1 object) or a collision (2 objects), catastrophic or non-catastrophic
- Calculate number of fragments, sample all characteristic lengths
- Sample all latitudes and longitudes
- For each fragment:
  - Calculate the area
  - Sample its area-to-mass ratio
  - Calculate the mass
  - Sample its velocity delta magnitude and project along the random orientation

### General implementation

##### Type of collision

A collision is catastrophic if the ratio between the kinetic energy of the lighter object (projectile) and the mass of the larger one (target) is larger than 40 J/g:
$$
\text{Catastrophic if}: \frac{M_{proj}}{2M_{target}}v_{rel}^2 > 40\,J/g
$$
The effective mass then changes:
$$
M_{ref,catastrophic} = M_{target} + M_{proj} \,;\, M_{ref,non\,catastrophic} = 10^{-6}M_{proj}\left(\frac{v_{rel}}{1\,km/s}\right)^2
$$

##### Number of fragments

In its 2001 paper, NASA found a power law relationship as the cumulative count of fragments above a certain characteristic length:
$$
N_{EXP} = 6SL_{c,min}^{-1.6}\,;\,N_{COLL} = 0.1M_{ref}^{0.75}L_{c,min}^{-1.71}
$$

Where S is a parameter between 0.1 and 1. 

##### Sampling characteristic lengths

The number of fragments is then computed using $L_{c,min}$. To sample characteristic lengths a formulation for the probability distribution is needed. First, the survival function S:
$$
for\,N=aL_c^{-n}\,:\,P(L_c>l_c) = N_{L_c>l_c}(l_c) / N_{total}(L_{c,min}) = \left(\frac{l_c}{L_{c,min}}\right)^{-n} = S(l_c) \in [0,1]
$$
$S(L_{c,min})=1$ and $S(\infty) = 0$. I however since there is a maximum value of characteristic length, S is truncated:
$$
S_T(l_c) = \frac{S(l_c)-S(L_{c,max})}{S(L_{c,min})-S(L_{c,max})} = \frac{l_c^{-n}-L_{c,max}^{-n}}{L_{c,min}^{-n}-L_{c,max}^{-n}}
$$
$S_T(L_{c,max}) = 0$, so by equalling the truncated function to a uniform distribution, characteristic lengths are sampled:
$$
l_c = \left(\mathcal{U}(0,1)\cdot(L_{c,min}^{-n}-L_{c,max}^{-n})+L_{c,max}^{-n}\right)^{-\frac{1}{n}}
$$
From now on the logarithm of $l_c$ is commonly used, $\lambda_c=\log_{10}l_c$.

##### Fragment area and mass

The area is a piece-wise function of the length:
$$
A = 
\begin{cases}
	0.540424L_c^2 & L_c < 0.00167\,m \\
	0.556945L_c^{2.0047077} & L_c \geq 0.00167\,m
\end{cases}
$$
For the mass, the area-to-mass ratio is needed:
$$
M = \frac{A}{A/M}
$$

##### Area-to-mass ratio

The following equations represent the piece-wise distribution functions for $\chi=\log_{10}A/M$:
$$
D(\chi) = 
\begin{cases}
	\mathcal{N}(\mu_3,\sigma_3) & l_c \le 8\,cm \\
		\text{bridge function} & 8 < l_c < 11\,cm  \\
	\alpha\mathcal{N}(\mu_1,\sigma_1)+(1-\alpha)\mathcal{N}(\mu_2,\sigma_2) & l_c \geq 11\,cm
\end{cases}
$$
In the intermediate case, a bridge function uses the recovered $A/M$ values for the big and small cases:
$$
A/M_{intermediate} = A/M_{<8} + \frac{l_c-0.08}{0.03}(A/M_{>11}-A/M_{<8})
$$
The coefficients sometimes depend on whether it's a fragmenting rocket body $R/B$ or a spacecraft $s/c$:
$$
\begin{array}{c}
\alpha^{R/B} =
\begin{cases}
	1 & \lambda_c \le -1.4 \\
	1-0.3571(\lambda_c+1.4) & -1.4 < \lambda_c < 0 \\
	0.5 & \lambda_c \geq 0
\end{cases}\\
\mu_1^{R/B} =
\begin{cases}
	-0.45 & \lambda_c \le -0.5 \\
	-0.45-0.9(\lambda_c+0.5) & -0.5 < \lambda_c < 0 \\
	-0.9 & \lambda_c \geq 0
\end{cases} \\
\sigma_1^{R/B} = 0.55 \\
\mu_2^{R/B} = -0.9 \\
\sigma_2^{R/B} =
\begin{cases}
	0.28 & \lambda_c \le -1 \\
	0.28-0.1636(\lambda_c+1) & -1 < \lambda_c < 0.1 \\
	0.1 & \lambda_c \geq 0.1
\end{cases} \\[6pt]
\hline

\alpha^{s/c} =
\begin{cases}
	0 & \lambda_c \le -1.95 \\
	0.3+0.4(\lambda_c+1.2) & -1.95 < \lambda_c < 0.55 \\
	1 & \lambda_c \geq 0.55
\end{cases}\\
\mu_1^{s/c} =
\begin{cases}
	-0.6 & \lambda_c \le -1.1 \\
	-0.6-0.318(\lambda_c+1.1) & -1.1 < \lambda_c < 0 \\
	-0.95 & \lambda_c \geq 0
\end{cases} \\
\sigma_1^{s/c} =
\begin{cases}
	0.1 & \lambda_c \le -1.3 \\
	0.1+0.2(\lambda_c+1.3) & -1.3 < \lambda_c < -0.3 \\
	0.3 & \lambda_c \geq -0.3
\end{cases} \\
\mu_2^{s/c} =
\begin{cases}
	-1.2 & \lambda_c \le -0.7 \\
	-1.2-1.333(\lambda_c+0.7) & -0.7 < \lambda_c < -0.1 \\
	-2 & \lambda_c \geq -0.1
\end{cases} \\
\sigma_2^{s/c} =
\begin{cases}
	0.5 & \lambda_c \le -0.5 \\
	0.5-(\lambda_c+0.5) & -0.5 < \lambda_c < -0.3 \\
	0.3 & \lambda_c \geq -0.3
\end{cases} \\[6pt]
\hline

\mu_3 =
\begin{cases}
	-0.3 & \lambda_c \le -1.75 \\
	-0.3-1.4(\lambda_c+1.75) & -1.75 < \lambda_c < -1.25 \\
	-1 & \lambda_c \geq -1.25
\end{cases} \\
\sigma_3 =
\begin{cases}
	0.2 & \lambda_c \le -3.5 \\
	0.2+0.1333(\lambda_c+3.5) & \lambda_c \geq -3.5
\end{cases} \\
\end{array}
$$

##### Ejection velocity

For the magnitude there are piece-wise distribution functions for $\nu = \log_{10}\Delta v$:
$$
D(\nu) = 
\begin{cases}
	\mathcal{N}(\mu=0.2\chi+1.85,\sigma=0.4) & \text{for explosions} \\
	\mathcal{N}(\mu=0.9\chi+2.9,\sigma=0.4) & \text{for collisions}
\end{cases}
$$
The model assumes an isotropic distribution orientation, which can be modelled by an uniform spherical distribution:
$$
\begin{array}{c}
\text{Colatitude cosine }u=\mathcal{U}(-1,1) \\
\text{Longitude }\lambda=\mathcal{U}(-\pi, \pi) \\[6pt]
\Delta v_x = \Delta v\sqrt{1-u^2}\cos\lambda \\
\Delta v_y = \Delta v\sqrt{1-u^2}\sin\lambda \\
\Delta v_z = \Delta v\cdot u
\end{array}
$$

##### Mass conservation correction

As a final check, remove the minimum number of last fragments such that the total fragment mass is equal or smaller than the original mass. It's reasonable if it's smaller given that the characteristic lengths are bounded.

# Propagator
## Types of problems
The problem of propagating an orbit into the future can be formulated in different ways. General classes are:
- **Kepler 2 body problem**. Analytically solvable, Keplerian motion
- **Perturbed 2BP**. Relevant inside the sphere of influence of a celestial object, with small perturbing forces
- **Restricted 3BP**. Some solutions are available, like Lagrangian points
- **Restricted n-body problem**. Small mass object moving through space
- **N-body problem**. General celestial systems

This writing will be limited to the restricted 2BP, with weak perturbations. According to the integration space :

- **Cartesian coordinates**. Position and velocity
- **Orbital elements**. The orbit is directly defined in the coordinates
- **Mean orbital elements**. The osculating elements are averaged over certain periods. Applicable for long term behaviour.

According to the formulation of the problem:

- **Cowell's method**. Most commonly used nowadays, due to its simplicity and the increasing compute capacity available.

$$
\begin{array}{c}
y = [r\,;v] \\[6pt]

f\left( t, y\right) = \dot{y} = [v\,;a] \\[6pt]

a = -\mu\frac{r}{|r|^3} + a_{pert} \\[6pt]
\end{array}
$$

- **Encke's method**. It integrates the deviation from the 2BP motion, instead of the motion itself. The reference is re-initialised when the difference grows over a tolerance. It offers better numerical conditioning when the motion is nearly Keplerian.
- **Variation Of Parameters**. The perturbations effect on the rate of change for each orbital element is symbolically derived once, then numerically integrated in time. Elements vary smoothly and the integration is more efficient than in Cowell's method, with longer time-steps, but it loses appeal for complex perturbations like accurate gravity models with many terms.
- **Semi-analytical averaging**. Similar to VOP, but the rate of change for each element is averaged over each relevant period, keeping only secular and long-period terms. While short term variations are removed, long term behaviour is mostly preserved, with the added advantage of even longer time-steps. For example, drag requires small time-steps near the perigee due to its high variation there, but once the effect over an entire orbit is averaged, it does not.

According to the type of solver (numerical):

- **Single-step**. Sequential. Some popular examples are RK4, RK45 and DOPRI45.
- **Multi-step**. Uses previous steps information; it can be highly efficient. For example, Adams-Bashforth-Moulton and Gauss-Jackson.

| Method        | Step               | Order    | Notes          |
| ------------- | ------------------ | -------- | -------------- |
| RK4           | Single, fixed      | Fixed    |                |
| RK45          | Single, adaptive   | Fixed    |                |
| DOPRI45       | Single, adaptive   | Fixed    | MATLAB: ode45  |
| ABM           | Multiple, adaptive | Variable | MATLAB: ode113 |
| Gauss-Jackson | Multiple, fixed    | Fixed    |                |

- **Spectral**. Like Picard-Chebyshev, which integrates arcs of the solution at once, possibly achieving higher accuracy than sequential methods.
- **Symplectic**. Only used for long-term problems with little dissipation (drag).

## Numerical solvers

Generally non-stiff (time-scale continuity), except in extreme elliptical orbits with low perigee heights where drag becomes important in a small fraction of the orbit. But still acceptably non-stiff.

If I want to implement the solver on a GPU I need to understand well, and be able to implement it on a CPU first.

### Runge-Kutta methods

##### 1. Runge-Kutta 4

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



##### 2. RK4 in Numba JIT

Considerable speed up, around x10^2^. The code is compiled on first iteration through Numba's JIT compiler, speeding things up significantly. To make it work fast, vectorised operations, function calls and others were exchanged for simpler operations compatible with the framework.



##### 3. Including a perturbation (J2)
J2 term equation in cartesian coordinates.
$$
\bar{a}_{J2} = 1.5J_2\mu\frac{R_\oplus^2}{|r|^5}\left[(5\frac{r_z^2}{|r|^2}-1)(r_x\hat{i}+r_y\hat{j})+5\frac{r_z^2}{|r|^2}-3)r_z\hat{k}\right]
$$



##### 4. Adaptive RK4 through Richardson extrapolation and step doubling

For the purpose of increasing the order of a solution and calculating the error, there is one technique called **Richardson extrapolation** which involves calculating two approximations to the same time with different step sizes (if using **step doubling** one single step with h and a double step using h/2).
$$
\begin{array}{c}
y_{single} = f(t, y, h) +o(h^5) \\[6pt]

y_{double} = f(t+0.5h, f(t, y, 0.5h), 0.5h) +o(h^5) \\[6pt]

y_{extrapolated} = y_{double}+\frac{y_{double}-y_{single}}{2^m-1}+o(h^6)
\end{array}
$$

With m being the local truncation error order (RK4 solution has global order 4=m, local 5), and the extrapolation increases the order by 1.

The full and small steps are used for calculating an error metric that adaptive step-sizing needs. However it only makes sense to do Richardson extrapolation when the underlying function is not expensive to evaluate. Other RK methods include an embedded estimate of the error as well, removing the need for this.
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





## Miscellanous

### Test with WGPU

It's a python library for WebGPU bindings, allowing me to tap into GPU capabilities without being vendor specific with a modern API. Successful in both computers, similar nomenclature as in WebGPU's JS bindings.

### Test with fastplotlib

It's a python library for plotting (like matplotlib) that uses WGPU for rendering plots faster. It's nice to have because we are going to need WGPU anyway, and makes 3D scatter plots with many points a breeze. Successful in my main computer, but still solving an issue on the laptop.
