# PETRO-TWIN AI: CSS Thermodynamic Model Documentation
## Mathematical Formulation, Equations, and Validation

---

### 1. Injected Energy Balance
The enthalpy injected into the Jodhpur formation during the CSS injection cycle is:
$$Q_{\text{inj}} = M_{\text{steam}} \cdot \left[ C_w \cdot (T_{\text{steam}} - T_{\text{native}}) + x_{\text{steam}} \cdot L_v \right]$$
Where:
* $M_{\text{steam}}$: Mass of injected steam in Cold Water Equivalent (tons / kg).
* $C_w$: Specific heat capacity of liquid water ($4.184 \text{ kJ/kg}\cdot\text{K}$).
* $T_{\text{steam}}$: Saturated steam temperature at injection pressure (~295°C at 80 bar).
* $T_{\text{native}}$: Native reservoir temperature (47°C).
* $x_{\text{steam}}$: Steam dryness quality fraction (0.75 – 0.80).
* $L_v$: Latent heat of vaporization ($1,420 \text{ kJ/kg}$ at 80 bar).

---

### 2. Heated Zone Radius & Initial Temperature Post-Soak
Based on the volumetric heat capacity of the fluid-saturated sandstone matrix:
$$(\rho C_p)_{\text{bulk}} = (1 - \phi) \rho_{\text{rock}} C_{p,\text{rock}} + \phi \rho_{\text{fluid}} C_{p,\text{fluid}} \approx 2,500 \text{ kJ/m}^3\cdot\text{K}$$

Accounting for conductive overburden heat retention during the soak interval ($t_{\text{soak}}$):
$$Q_{\text{retained}} = Q_{\text{inj}} \cdot \eta_{\text{thermal}} \cdot \exp(-\alpha_{\text{soak}} \cdot t_{\text{soak}})$$
$$\Delta T_{\text{initial}} = \frac{Q_{\text{retained}}}{\pi R_{\text{heated}}^2 h (\rho C_p)_{\text{bulk}}}$$
$$T_{\text{peak}} = \min(T_{\text{steam}} - 15^\circ\text{C}, T_{\text{native}} + \Delta T_{\text{initial}})$$

---

### 3. Production Phase Thermal Decay
During the production phase ("Puff"), heat dissipates through two coupled mechanisms:
1. **Vertical Conduction:** Heat conducted away to the impermeable overlying and underlying shale seals.
2. **Convective Advection:** Sensible enthalpy carried out of the reservoir by the produced oil and water fluids.

$$T_{\text{res}}(t) = T_{\text{native}} + (T_{\text{peak}} - T_{\text{native}}) \cdot \exp\left( -\left[\lambda_{\text{cond}} + \lambda_{\text{conv}} \cdot q_L(t)\right] \cdot t \right)$$
Where:
* $\lambda_{\text{cond}} \approx 0.0135 \text{ day}^{-1}$ (calibrated against SPE Rajasthan literature).
* $\lambda_{\text{conv}} \approx 0.00008 \text{ day}^{-1}\cdot\text{bbl}^{-1}$.
* $q_L(t)$: Daily total liquid production rate.

---

### 4. Steam-to-Oil Ratio (SOR) Objective
Cumulative Steam-Oil Ratio is monitored continuously:
$$\text{SOR}_{\text{cum}} = \frac{M_{\text{steam}} \text{ (CWE bbls)}}{\sum_{t=0}^{t_{\text{cutoff}}} q_o(t)}$$
When instantaneous daily incremental SOR exceeds the economic threshold (typically SOR > 6.5–8.0), the CSS optimizer triggers the cycle cut-off recommendation.
