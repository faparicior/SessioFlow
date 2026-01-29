# Slice Out a Development Strategy - Inception Data Sources

This document provides a reference mapping to help fill out the `5-slice-out-a-development-strategy.md` template using the data generated during the Lean Inception workshop.

## ⚠️ Strategy Note

Unlike the Release Strategy (Step 4) which uses Inception "Waves" to define *what* drives value, this step uses Inception "Technical & Risk" data to define *how* to build it safely.

**Key Heuristic:** High Technical Risk (Low "Tech Comfort") + High Business Value = **Opening Game**.

| Template Section | Inception Source Document | Sections to Reference |
| :--- | :--- | :--- |
| **1. Risk Assessment** | `docs/inception/8-mvp-canvas-definition.md` (PRIMARY)<br>`docs/inception/1-product-vision-and-boundaries.md` | **Risks & Mitigation** (Explicit risks listed)<br>**Risky Assumptions** (Found in Vision checks) |
| **2. The Chess Strategy**<br>*(Opening / Mid / End)* | `docs/inception/7-features-and-sequencing.md`<br>`docs/inception/6-user-journey-mapping.md` | **Tech Comfort Column:** Items marked "T" (Red/Low Comfort) usually go in **Opening Game** to fail fast.<br>**MVP Wave:** This entire development strategy applies *only* to the Wave 1 feature set.<br>**Journeys:** The **Walking Skeleton** must complete a full path through the Journey. |
| **3. The Learning Plan**<br>*(Experiments/Spikes)* | `docs/inception/8-mvp-canvas-definition.md`<br>`docs/inception/7-features-and-sequencing.md` | **Hypothesis:** What are we trying to prove?<br>**Effort/Comfort:** Spikes are needed for items with "???" or low confidence estimates. |
| **4. Team Capacity Check** | `docs/inception/8-mvp-canvas-definition.md` | **Cost & Schedule:** Reference the estimated "Sprints" and "Developer Count" constraints defined here. |
