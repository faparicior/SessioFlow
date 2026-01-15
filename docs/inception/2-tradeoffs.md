# ⚖️ Trade-off Board (Project Constraints)

The **Trade-off Board**, often referred to as **"Understanding the Trade-offs"** or **"Sliders"**, is a strategic activity in the execution phase of a Lean Inception. Its purpose is to build a common understanding regarding the "solution of compromise"—an agreement where certain product aspects are deprioritised to favour others that are deemed more vital.

According to the sources, this activity is essential because products are often built on conflicting premises, such as **Security vs Usability** or **Performance vs Flexibility**. By forcing a collaborative conversation, the team reaches a consensus that prevents future misunderstandings and accelerates decision-making.

***

# Trade-off Board: SessionFlow

## 1. Individual Perspectives
*Capture the initial "Must Haves" from different stakeholders before compromise.*

| Role | Initial Priority #1 | Reasoning |
| :--- | :--- | :--- |
| **Product Owner** | **Cost** | The Vision explicitly targets non-profits with a goal of running on **free-tier infrastructure ($0/month)**. If the solution is expensive to host, it fails the primary business constraint. |
| **UX Advocate** | **Usability** | The Elevator Pitch defines the product as "Simple" and "Easy to use". It competes against manual tools (Excel/Email), so if it isn't significantly more usable (Goal: 4/5 rating), users won't switch. |
| **Tech Lead** | **Simplicity** | To satisfy the "Is Not requiring specialized infrastructure" constraint, the architecture must remain boring and standard. Complexity is the enemy of self-hosting. |

## 2. Final Consensus Trade-off Board

| Priority Rank | 1 (Most) | 2 | 3 | 4 | 5 | 6 | 7 (Least) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Usability** | **X** | | | | | | |
| **Cost** | | **X** | | | | | |
| **Simplicity** | | | **X** | | | | |
| **Performance** | | | | **X** | | | |
| **Security** | | | | | **X** | | |
| **Flexibility** | | | | | | **X** | |
| **Scalability** | | | | | | | **X** |

## 3. Consensus Reasoning
*Explain why the final trade-offs were made, specifically addressing any conflicts identified in section 1.*

*   **Why was Usability ranked #1?**: The primary "Product Goal" is to "Reduce session organization time by 50%". We agreed that even if the app is free (Cost), it adds no value if it isn't easier than the current manual process. Usability is the core differentiator against tools like Excel.
*   **Why was Cost ranked #2?**: This is the hardest constraint ("The Product Is Not Expensive to host"). It sits just below Usability because while a free app is useless if unusable, a usable app is inaccessible to our target audience (non-profits) if it costs too much.
*   **Why is Simplicity #3?**: Simplicity (technical and functional) is our strategy to achieve low Cost and high Usability. We sacrifice feature depth to keep the "Lightweight" promise.
*   **Why was Security ranked #5?**: While important, the product **Does Not** handle payments or highly sensitive health/legal data. We rely on standard framework security features. It is a hygiene factor, not a differentiator.
*   **Why was Scalability sacrified (ranked #7)?**: The Vision states the product "Is Not a technical complex application". It is designed for single-conference self-hosting, not for serving millions of concurrent users. We explicitly deprioritized complex architecture (e.g., k8s, microservices) to protect Cost and Simplicity.

---

### Strategic Insight
The source emphasises that this activity is not just about a final list but about the **"open and collaborative conversation"** it triggers. If the team discovers that their individual votes are widely scattered (e.g., some see Security as a '1' and others as a '7'), the facilitator must guide them to resolve these conflicting visions before the MVP construction begins.

**Analogy**
Think of the Trade-off Board as a **limited budget for a holiday**. You might want a five-star hotel, a first-class flight, and a three-week duration, but your budget (the product scope) won't allow all three at the top level. You must "slide" the hotel quality down to a '3' if you insist on keeping the flight at a '1'. You are deciding what the "must-haves" are and what can be sacrificed to stay "Lean".
