# SIH 2026 — Problem Understanding: SIH26120
## Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field

---

### Executive Summary & Domain Map
| Parameter / Domain | Baghewala Field Specification | Global Benchmark / Typical Comparison |
| :--- | :--- | :--- |
| **Operator / Field** | Oil India Limited (OIL), Baghewala Field, Bikaner-Nagaur Basin, Rajasthan | Continental heavy oil province |
| **Reservoir Formation** | Jodhpur Sandstone (Ediacaran / Early Cambrian) | Shallow, low thermal energy formation |
| **Crude Oil Gravity** | 17° – 19° API (Extra-heavy / Heavy Crude) | Light crude is > 31.1° API |
| **Reservoir Temperature** | ~46°C – 48°C (Extremely cold for heavy oil) | Typical thermal recovery reservoirs: 60°C – 100°C |
| **Crude Viscosity** | > 1,500 – 10,000+ cP at reservoir temperature | Water = 1 cP; Honey = ~10,000 cP |
| **Asphaltene Content** | High (> 15–22 wt%) | Induces severe flocculation & deposition |
| **Thermal EOR Method** | Cyclic Steam Stimulation (CSS / "Huff and Puff") | High energy consumption; thermal decay |
| **Artificial Lift Method** | Sucker Rod Pump (SRP / Beam Pump) | Mechanically stressed by cold high-viscous column |
| **Core Operational Dilemma** | Steam heats reservoir → Viscosity drops → Production surges → Cold reservoir cools oil → Viscosity spikes → Rod float & impact loading → Pump failure | Fractured operational cycle between thermal injection and mechanical lift |

---

## 1. Problem Statement
**SIH26120**: *AI-Enabled Well-to-Surface Digital Twin for CSS + SRP Optimization for Heavy Oil Wells of Baghewala Field (Oil India Limited)*.

The objective is to architect and develop an industrial-grade, physics-informed, machine-learning-enhanced **Digital Twin** that bridges the thermodynamic reservoir processes of Cyclic Steam Stimulation (CSS) with the mechanical lift dynamics of Sucker Rod Pumping (SRP) systems. The platform delivers continuous predictive state estimation, failure intelligence, multi-objective Pareto optimization, and tool-augmented agentic decision support for production engineers and field operators.

---

## 2. Business Problem
Oil India Limited's heavy oil exploitation in the Thar Desert (Rajasthan) encounters severe economic and operational hurdles:
1. **High Steam-to-Oil Ratio (SOR):** Generating industrial high-pressure steam in an arid desert environment demands massive natural gas and treated water expenditure. When steam is injected without predictive optimization, energy is wasted into non-productive zones, causing excessive operating expense (OPEX).
2. **Premature Equipment Failure & Workover Costs:** Premature rod parted failures, tubing splits, and pump unseating trigger costly rig-assisted workover interventions (costing millions of INR per event) alongside production deferment.
3. **Reactive vs. Proactive Field Management:** Currently, field engineers adjust SRP stroke lengths, Strokes Per Minute (SPM), and steam soaking intervals reactively—only after a well has sanded up, rods have severed, or production has precipitously dropped.
4. **Carbon Footprint & ESG Pressure:** Steam generation is a major carbon-emitting operational unit. Minimizing the kilowatt-hours and million British thermal units (MMBtu) required per barrel produced is vital for corporate decarbonization targets.

---

## 3. Petroleum Engineering Problem
Heavy oil production at Baghewala suffers from an acute physical incompatibility:
* **The reservoir is too cold** (~46°C) for the oil to flow naturally under Darcy's law.
* **The oil is highly viscous** (thousands of centipoise at native conditions), rendering natural primary recovery negligible (primary recovery factor < 2–5%).
* **Thermal stimulation (CSS)** artificially reduces viscosity by injecting heat, but this heat continuously dissipates into the caprock and surrounding formation through conduction and fluid withdrawal.
* **Mechanical lift (SRP)** is designed for steady-state fluids; however, in a CSS well, the fluid properties change dynamically by orders of magnitude over 90–180 days (from low-viscosity hot emulsion to cold, sticky tar).
* When cold crude enters the wellbore during late production cycles, the rod string cannot fall freely under gravity during the downstroke—a destructive phenomenon known as **rod floating**.

---

## 4. CSS (Cyclic Steam Stimulation) Explained
**Cyclic Steam Stimulation (CSS)**, commonly termed the *"Huff and Puff"* method, is a single-well thermal Enhanced Oil Recovery (EOR) process carried out in three distinct sequential phases:

```text
       Phase 1: INJECTION ("Huff")            Phase 2: SOAKING                   Phase 3: PRODUCTION ("Puff")
   High-Pressure Steam Injected (Days)     Well Shut-In for Heat Transfer      SRP Pump Installed & Operated (Months)
             ┌───────────┐                         ┌───────────┐                         ┌───────────┐
  Surface    │  Boiler   │                         │  Shut-In  │                         │ SRP Pump  │▲ Crude Out
             └─────┬─────┘                         └─────┬─────┘                         └─────┬─────┘│
  Wellbore         │ Steam Flow (250-320°C)              │ Heat Conduction                     │ Cold/Warm Emulsion
                   ▼                                     ▼                                     ▼
             ░░░░░░░░░░░░░                         ▒▒▒▒▒▒▒▒▒▒▒▒▒                         █████████████
  Reservoir  ░ Thermal Plume Formed ░              ▒ Viscosity Collapses ▒               █ Fluid Drawn to Pump █
             ░░░░░░░░░░░░░                         ▒▒▒▒▒▒▒▒▒▒▒▒▒                         █████████████
```

1. **Injection Phase ("Huff"):** High-quality, saturated steam (typically 70–80% dryness fraction at 250°C–310°C) is injected down the casing/tubing into the heavy oil formation over a span of 10 to 25 days.
2. **Soak Phase ("Soak"):** The well is closed at the surface for 3 to 10 days. During this period, the latent and sensible heat of the steam diffuses into the cold reservoir rock matrix and viscous petroleum, melting wax and liquefying asphaltene matrices.
3. **Production Phase ("Puff"):** The wellhead is opened, and artificial lift (SRP) is engaged. The fluid is produced at elevated rates until reservoir thermal decay lowers temperatures back towards native levels, requiring a subsequent cycle.

---

## 5. SRP (Sucker Rod Pump) Explained
The **Sucker Rod Pump (SRP)** (also known as a beam pump or "nodding donkey") is the dominant artificial lift machine globally. It converts surface rotary motion from an electric motor or gas engine into reciprocating linear motion:

* **Surface Unit:** A walking beam pivoted on a samson post, rocking up and down via a crank and pitman arm.
* **Rod String:** A long, flexible steel or fiberglass rod assembly (often 800 to 1,500 meters deep) extending from the surface polished rod down to the bottomhole pump.
* **Subsurface Pump:** A precision barrel containing:
  * **Standing Valve (SV):** Located at the bottom of the stationary pump barrel.
  * **Traveling Valve (TV):** Located inside the reciprocating pump plunger attached to the rod string.

### The Pumping Cycle:
* **Upstroke:** The rod string pulls the plunger upward. The Traveling Valve closes under the weight of the fluid column above it, lifting oil to the surface. Simultaneously, pressure drops inside the barrel below the plunger, sucking new reservoir fluid through the open Standing Valve.
* **Downstroke:** The rod string is driven downward purely by **gravity** and rod weight. The Standing Valve closes to prevent fluid backflow into the formation. The Traveling Valve opens, allowing the plunger to slice down through the fluid trapped in the barrel in preparation for the next upstroke.

---

## 6. Heavy Oil Explained
Heavy crude oil is defined by the American Petroleum Institute (API) as liquid petroleum having an API gravity below 20° (and extra-heavy crude below 10°). 
* Heavy oil contains massive high-molecular-weight polycyclic aromatic compounds, asphaltenes, resins, and heteroatoms (sulfur, nitrogen, heavy metals like nickel and vanadium).
* In native reservoir conditions, heavy oil behaves almost like an amorphous solid or bitumen, resisting shear stress and remaining locked within the pore throats of sandstone rocks.

---

## 7. Viscosity: The Silent Flow Killer
**Dynamic Viscosity ($\mu$)** measures a fluid's internal resistance to deformation and shear flow (expressed in centipoise, $\text{cP}$, or $\text{Pa}\cdot\text{s}$; water is $1.0\text{ cP}$ at 20°C).
* At native Baghewala temperatures (~46°C), the crude viscosity ranges from **1,500 to well over 10,000 cP**.
* Viscosity exhibits an **exponential, non-linear inverse dependence on temperature**:
$$\ln \ln(\mu + 0.7) = A - B \cdot \ln(T_K)$$
*(Walther / ASTM D341 equation)*
* Heating the oil from 46°C to 180°C slashes viscosity by up to **99.5%** (down to 10–30 cP), transforming a semi-solid sludge into free-flowing liquid. As the well cools during production, viscosity exponentially rebounds.

---

## 8. Reservoir Temperature ($T_{\text{res}}$)
Native reservoir temperature represents the geothermal equilibrium state of the formation prior to artificial interference.
* Baghewala's shallow depth (~900m – 1,100m) results in an unusually cold reservoir temperature of **46°C – 48°C**.
* Normal thermal recovery reservoirs in Canada (Athabasca) or Venezuela (Orinoco) frequently possess higher native ambient temperatures or deeper formations. At 46°C, Baghewala's natural thermal kinetic energy is insufficient to keep complex asphaltenes in suspension without continuous thermal assistance.

---

## 9. Reservoir Pressure ($P_{\text{res}}$)
Reservoir pressure represents the hydrostatic and lithostatic pore pressure that drives hydrocarbons into the wellbore.
* Baghewala's formation is characterized by **depleted / low reservoir pressure** (frequently < 40–70 bar).
* Low pressure means the well has virtually **no natural drive energy** (inadequate solution gas drive, no active water drive). The reservoir cannot push heavy oil up the wellbore; fluid must be drawn in under gentle drawdown and lifted artificially.

---

## 10. Oil Mobility Explained
**Mobility ($M_o$)** is the fundamental Darcy flow metric describing how readily petroleum traverses porous rock:
$$M_o = \frac{k \cdot k_{ro}}{\mu_o}$$
Where:
* $k$ = absolute permeability of the Jodhpur Sandstone
* $k_{ro}$ = relative permeability to oil
* $\mu_o$ = oil dynamic viscosity

Because $\mu_o$ in the denominator is gigantic (thousands of cP), native oil mobility is close to zero. The entire physical objective of CSS is to manipulate the denominator ($\mu_o$) downward by two to three orders of magnitude, temporarily unlocking high reservoir mobility.

---

## 11. Steam-Oil Ratio (SOR)
The **Steam-Oil Ratio (SOR)** is the universal benchmark of thermal EOR efficiency:
$$\text{SOR} = \frac{\text{Cubic meters (or barrels) of Cold Water Equivalent (CWE) steam injected}}{\text{Cubic meters (or barrels) of clean oil recovered}}$$
* **Target SOR:** A healthy thermal operation achieves an SOR of 2.0 to 4.0.
* **Uncontrolled Field SOR:** Late-cycle or poorly scheduled wells frequently experience SORs exceeding 8.0 to 12.0. At such levels, the cost of the fuel burnt to boil the water exceeds the commercial value of the crude extracted, turning the well into a net financial and carbon loss.

---

## 12. Rod Floating
**Rod Floating** is a catastrophic failure mode unique to reciprocating pumps operating in high-viscosity or cold heavy oil environments:
* During the **downstroke**, the polished rod and subsurface sucker rods must fall downward under gravity alone.
* If the fluid in the tubing has cooled and re-thickened, or if the pump plunger is forced through viscous, tar-like oil at high speed (high SPM), the **fluid viscous drag force acting upward exceeds the gravitational weight of the rods**.
* The rod string literally **floats** or stalls mid-stroke while the heavy steel surface walking beam continues moving downward at full motor speed.

---

## 13. Impact Loading
The direct consequence of rod floating is **Impact Loading (Pounding / Shock Stress)**:
* When the rods float on the downstroke, slack develops in the polished rod hanger and bridle cables.
* As the surface unit reaches the bottom of its stroke and violently reverses upward, it catches the delayed, floating rod string with hammer-like force.
* This generates an instantaneous peak tensile shock wave that propagates down the steel rod string at the speed of sound in steel (~5,000 m/s), multiplying cyclical fatigue stresses far beyond the API allowable stress rating.

---

## 14. Rod Failure (Parted Rods)
Under relentless impact loading and cyclical tensile fatigue, microscopic stress cracks develop at sucker rod couplings and pin threads.
* Within days to weeks of persistent rod floating, the rod string snaps—known as a **parted rod**.
* When a rod parts, production drops instantly to zero, the motor runs unloaded, and an expensive emergency pulling unit (workover rig) must be brought to the remote desert location to fish out the dropped rods.

---

## 15. Pump Unsetting
Bottomhole SRP pumps are held anchored in the tubing or casing by mechanical seating nipples or friction hold-down seals.
* During severe rod floating, fluid friction and wax/asphaltene stickiness create intense upward frictional shear on the pump barrel during the upstroke, and violent hydraulic suction surges.
* This upward thrust unseats the pump from its bottomhole mechanical seating cup—termed **pump unsetting**.
* An unset pump cannot create vacuum seal; fluid slips freely past the exterior, and production ceases completely.

---

## 16. Production Optimization
Production optimization is the mathematical and operational discipline of maximizing the net present value (NPV) or cumulative oil output of the well over its entire economic lifecycle, subject to physical, thermodynamic, equipment, and environmental constraints. It balances peak flush production against equipment longevity and energy consumption.

---

## 17. What is a True Digital Twin?
A **Digital Twin** is NOT a static 3D rendering or a web dashboard displaying historical charts. 
A true Digital Twin is a **bi-directional, dynamic, cyber-physical replica** of an operational asset that:
1. Ingests real-time or simulated sensor telemetry.
2. Continuously reconciles physics conservation laws (mass, momentum, energy).
3. Maintains an internal state representation (temperatures, pressures, stress profiles, fluid properties along depth).
4. Executes forward-looking predictive simulations and what-if counterfactuals.
5. Employs numerical optimization algorithms to prescribe optimal setpoints.
6. Feeds actionable setpoints back into operational decision workflows with quantified confidence intervals.

---

## 18. Why CSS and SRP Must Be Optimized Jointly
Traditionally in upstream oil companies, the **Thermal / Reservoir Engineering Team** designs the CSS steam recipe (how many tons of steam to inject and how long to soak), while the **Production / Artificial Lift Team** sets the SRP mechanical parameters (stroke length, strokes per minute, VFD frequency).

**This operational silo causes systemic failure:**
* If reservoir engineers decide to shorten the soak time to bring the well online faster, the fluid near the wellbore may still be boiling hot, causing gas/steam breakout and **gas locking** in the SRP pump.
* Conversely, as the reservoir cools over 120 days, the artificial lift engineer often leaves the SRP operating at a fixed 8 SPM. As viscosity climbs from 40 cP to 3,000 cP, the 8 SPM rate triggers immediate rod floating, parted rods, and pump unseating.
* **The Solution:** The reservoir thermodynamic state (cooling curve, mobility decay) must **directly drive** the automated down-regulation of SRP pumping speed (VFD frequency and SPM), and conversely, fluid withdrawal rates must feed into the predictive scheduling of the next CSS thermal cycle before rod-parting conditions occur.

---

## 19. What the Official Problem Expects
According to the Smart India Hackathon SIH26120 problem definition from Oil India Limited:
1. Real-time monitoring and holistic predictive intelligence for CSS and SRP.
2. Prediction of reservoir heating and thermal cooling dissipation curves.
3. Accurate multi-step forecasting of heavy oil production rates.
4. Continuous automated optimization of SRP pump parameters to eliminate rod floating and impact loading.
5. Dynamic steam volume and soaking period optimization to reduce SOR and energy consumption.
6. Predictive failure alerts for equipment integrity (rod fatigue, pump unsetting).
7. Decision-support interface suitable for field engineers and asset managers.

---

## 20. What PETRO-TWIN AI Actually Solves
Our platform, **PETRO-TWIN AI**, is built as a complete, scientifically honest, and industrially validated cyber-physical platform:
* **Hybrid Physics-ML Digital Twin:** Combines energy balance heat decay formulations and API RP 11L SRP mechanical models with residual gradient-boosted ML corrections.
* **Closed-Loop Joint Optimizer:** Uses constrained Pareto multi-objective optimization to dynamically match SRP kinematics (SPM, stroke, VFD) to the instantaneous fluid viscosity curve while prescribing the optimal CSS cycle cut-off date.
* **Rod-Floating & Failure Intelligence Engine:** A dedicated physics-rule + Isolation Forest anomaly pipeline that detects rod deceleration and slack-load anomalies before fatigue causes rod breakage.
* **Interactive Scenario & Time-Machine Lab:** Allows operators to fast-forward 30, 90, or 180 days into the future under alternative steaming and pumping strategies.
* **Agentic AI Copilot:** A tool-using petroleum engineering intelligence assistant equipped with deterministic domain calculators, document grounding, and full audit trail accountability.
* **Scientific Data Honesty Architecture:** Transparent separation into Tier A (verified public petroleum datasets), Tier B (literature-calibrated Baghewala synthetic simulator), and Tier C (pluggable Oil India telemetry adapter).
