# PETRO-TWIN AI: 5-Minute SIH Jury Demo Script
## Seamless Presentation Walkthrough for Hackathon Evaluation

---

### Minute 1: The Heavy Oil Dilemma & Domain Challenge
* **Presenter:** "Respected judges, Baghewala Field in Rajasthan produces heavy oil (18° API). At reservoir conditions (47°C), the oil is thick like tar—over 4,000 centipoise. To make it flow, Oil India injects high-pressure steam in Cyclic Steam Stimulation (CSS). But here is the critical operational challenge: as the reservoir cools over 100 days, the oil thickens again. The Sucker Rod Pump (SRP) struggles to sink through the thick oil, causing **rod floating**, impact pounding, and snapped rod strings."
* **Action:** Show the **Overview Dashboard** (`/dashboard`). Point to the live indicators: `Crude Viscosity: 4,120 cP`, `Reservoir Temp: 58.2°C`, `Rod Float Risk: Warning (58%)`. Point out the scientific honesty badge: `DATA MODE: SIMULATION (LITERATURE-CALIBRATED)`.

---

### Minute 2: Real-Time Telemetry & Dynamometer Card
* **Presenter:** "Notice our live WebSocket telemetry. The system streams correlated sensor data: bottomhole temperature, pressure, polished rod load, and high-frequency dynamometer card coordinates."
* **Action:** Click into **Live Operations & Dynamometer Analyzer**. Show the live load-displacement loop. Point out the characteristic distorted shape at the bottom of the stroke indicating downstroke rod lag and traveling valve throttling.

---

### Minute 3: Digital Twin & 180-Day Time Machine
* **Presenter:** "This is not just a UI; it is a true Cyber-Physical Digital Twin with discretized 1D wellbore thermal hydraulics and Marx-Langenheim heat balance."
* **Action:** Open the **Digital Twin** tab (`/digital-twin`). Scrub the **Time Machine** slider from `Day 10` to `Day 110`. 
* **Key Visual:** As the slider moves, the reservoir temperature graph drops from 195°C to 54°C, viscosity exponentially climbs from 18 cP to 3,400 cP, and the rod floating risk badge switches from `SAFE` to `CRITICAL ALERT`.

---

### Minute 4: What-If Scenario Lab & Pareto Optimization
* **Presenter:** "Traditionally, reservoir engineers schedule steam cycles in one office, while artificial lift engineers set pump speed in another. PETRO-TWIN AI optimizes them jointly."
* **Action:** Open the **Scenario Lab & Optimizer** (`/optimizer`). 
* Move the SPM slider from 8.5 down to 5.2 and click **Run Multi-Objective Optimization**.
* Show the interactive **Pareto Frontier (Production vs SOR vs Risk)**.
* Show the AI recommendation card: `Recommended: SPM 5.4, Stroke 2.8m, Next Steam Volume 2,400 tons`. 
* Highlight the trade-off analysis: `+18.4% Net Oil, -22% SOR, Zero Rod Floating Risk`.

---

### Minute 5: Deterministic Agentic Copilot & Jury Takeaway
* **Presenter:** "Finally, our Agentic AI Copilot is not a chatbot hallucinating numbers. It orchestrates 14 deterministic backend tools with strict physical guardrails."
* **Action:** Open the **AI Copilot** side-drawer. Click the quick prompt: *"Why did failure risk increase and what do you recommend for Well BW-DEMO-001?"*
* **Response:** The Copilot identifies the well, invokes `get_well_state()`, calls `predict_failure()`, queries `optimize_operations()`, and outputs a structured engineering briefing with exact parameters, confidence intervals, and constraint compliance status.
* **Closing:** "PETRO-TWIN AI transforms heavy oil operations from reactive crisis management into proactive, physics-informed, profit-maximizing intelligence. Thank you."
