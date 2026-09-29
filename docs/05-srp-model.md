# PETRO-TWIN AI: Sucker Rod Pump (SRP) Dynamics Model
## Kinematics, Polished Rod Loads, Viscous Couette Drag, and Rod Floating Criteria

---

### 1. Kinematics of the Beam Pumping Unit
For a conventional beam unit with crank radius $r = S/2$ and angular velocity $\omega = \frac{2\pi \cdot \text{SPM}}{60}$ [rad/s]:
* **Polished Rod Position:** $x(t) = \frac{S}{2} (1 - \cos(\omega t))$
* **Polished Rod Velocity:** $v(t) = \frac{S \cdot \omega}{2} \sin(\omega t)$
* **Peak Velocity:** $v_{\text{max}} = \frac{S \cdot \omega}{2} = \frac{\pi \cdot S \cdot \text{SPM}}{60} \text{ [m/s]}$
* **Peak Acceleration:** $a_{\text{max}} = \frac{S \cdot \omega^2}{2} = \frac{\pi^2 \cdot S \cdot \text{SPM}^2}{1800} \text{ [m/s}^2\text{]}$

---

### 2. Static and Dynamic Rod Loads (API RP 11L)
* **Rod String Weight in Air:** $W_r = \sum \rho_{\text{steel}} \cdot A_{\text{rod},i} \cdot L_i \cdot g$
* **Buoyant Weight in Crude:** $W_{rf} = W_r \left( 1 - \frac{\rho_{\text{fluid}}}{\rho_{\text{steel}}} \right)$
* **Fluid Column Weight on Plunger:** $W_f = A_{\text{plunger}} \cdot H_{\text{pump}} \cdot \rho_{\text{fluid}} \cdot g$
* **Inertial Dynamic Force:** $F_{\text{inertial}} = \frac{W_r}{g} \cdot a_{\text{max}}$

---

### 3. Annular Viscous Shear Drag (Couette Flow Formulation)
Fluid trapped between the reciprocating rod string ($r_{\text{rod}}$) and the inner wall of the tubing string ($r_{\text{tubing}}$) undergoes steady laminar shear:
$$\tau = \mu \frac{\partial v}{\partial r}$$
Integrating the shear stress along the 900m wellbore depth:
$$F_{\text{drag}} = \frac{2 \pi \mu_{\text{avg}} v_{\text{avg}} H_{\text{pump}}}{\ln(r_{\text{tubing}} / r_{\text{rod}})}$$

Additionally, during downstroke, heavy oil squeezing through the traveling valve orifice creates hydraulic throttling backpressure:
$$\Delta P_{\text{valve}} = \frac{8 \mu L_{\text{plunger}} v_{\text{avg}}}{r_{\text{orifice}}^2}$$
$$F_{\text{thrust}} = \Delta P_{\text{valve}} \cdot A_{\text{plunger}}$$

---

### 4. Mathematical Criterion for Rod Floating & Impact Loading
On the downstroke, the horsehead moves downward under electric motor drive. The sucker rod string must sink under gravity alone.
* Sucker rods are slender steel bars that **cannot sustain compressive loads without buckling**.
* Gravitational sinking is provided by the bottom sinker bar assembly ($W_{\text{sinker}} \approx 0.30 \cdot W_{rf}$).
* The terminal free-fall settling velocity of the rod string is:
$$v_{\text{terminal}} = \frac{W_{\text{sinker}}}{C_{\text{drag}}}$$

**The Rod-Floating Condition:**
$$\text{If } v_{\text{max, horsehead}} \ge v_{\text{terminal}} \quad \text{or} \quad F_{\text{net, down}} \le F_{\text{critical}}$$
* The carrier bar outruns the rod string; the polished rod clamp lifts off the bridle bar.
* Slack develops in the cable.
* At the bottom of the stroke, the surface unit reverses upward with peak acceleration, striking the delayed falling rod string.
* **Impact Loading Tensile Stress Wave:**
$$\sigma_{\text{impact}} = \sigma_{\text{static}} \cdot \left( 1 + \sqrt{1 + \frac{2 h_{\text{drop}} E}{L \sigma_{\text{static}}}} \right)$$
This stress multiplication easily exceeds the API Grade D sucker rod allowable fatigue limit ($32,000 \text{ psi}$), leading to parted rod breakage within 10–25 days of unchecked operation.
