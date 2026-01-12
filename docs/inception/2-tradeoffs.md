# ⚖️ Trade-off Board (Project Constraints)

The **Trade-off Board**, often referred to as **"Understanding the Trade-offs"** or **"Sliders"**, is a strategic activity in the execution phase of a Lean Inception. Its purpose is to build a common understanding regarding the "solution of compromise"—an agreement where certain product aspects are deprioritised to favour others that are deemed more vital.

According to the sources, this activity is essential because products are often built on conflicting premises, such as **Security vs Usability** or **Performance vs Flexibility**. By forcing a collaborative conversation, the team reaches a consensus that prevents future misunderstandings and accelerates decision-making.

---

# Trade-off Board: SessioFlow

**Instructions:**
1.  **Identify Categories:** List all relevant product qualities (e.g., Security, Usability, Cost).
2.  **Rank Importance:** Columns are numbered **1 to N**, where **1 is the most important**.
3.  **The Golden Rule:** Each column can only contain **one** consensus mark. You cannot have two categories at the same priority level.

| Priority Rank | 1 (Most) | 2 | 3 | 4 | 5 | 6 | 7 (Least) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cost** | 🔴 | | | | | | |
| **Simplicity** | | 🔴 | | | | | |
| **Usability** | | | 🔴 | | | | |
| **Security** | | | | 🔴 | | | |
| **Performance** | | | | | 🔴 | | |
| **Flexibility** | | | | | | 🔴 | |
| **Scalability** | | | | | | | 🔴 |

---

### Consensus Reasoning

The following reasoning explains the strategic ranking above, derived from the core **Product Vision** and **Is/Is Not** constraints:

1.  **Cost (#1 - The "Golden" Constraint):**
    *   **Why:** The Product Vision explicitly targets "Non profit organizations" and sets a hard goal to "Enable 80% of users to run on free-tier infrastructure ($0/month)". This is the primary differentiator against competitors like Sessionize.
    *   **Trade-off:** We will reject any feature, no matter how "cool" or "performant," if it forces the user to buy expensive infrastructure (e.g., managed databases, complex cloud services).

2.  **Simplicity (#2):**
    *   **Why:** To achieve the #1 goal of Low Cost and the vision of being "Simple to self-host," the technical architecture must remain minimal (e.g., Monolith, SQLite, minimal dependencies).
    *   **Trade-off:** We prioritise a boring, simple stack over complex "Enterprise" architectures. "Is Not: A technical complex application."

3.  **Usability (#3):**
    *   **Why:** The Vision claims the product is "easy to use" and aims for a "4/5 average rating". The target audience (event organizers) are often volunteers with limited time.
    *   **Trade-off:** Once the Cost and Architecture constraints are met, we obsess over UX. However, we won't break the "Free Tier" constraint to slightly improve UX (e.g., using a paid heavy AI service for auto-complete).

4.  **Security (#4):**
    *   **Why:** We must handle user logins and public data securely (Hygiene factor).
    *   **Trade-off:** Since the product **"DOES NOT Handle payments"** or sensitive PII (like passports), we treat Security as important but not the *primary* driver vs Cost/Simplicity. We rely on standard framework defenses rather than building a Fort Knox.

5.  **Performance (#5):**
    *   **Why:** The Vision states "Lightweight and efficient".
    *   **Trade-off:** We want it to be fast, but not at the expense of Simplicity. We accept standard server-rendered page loads rather than complex Single Page App optimizations if they complicate the "Easy to hosting" promise.

6.  **Flexibility (#6):**
    *   **Why:** The Vision is specific: "Manages session organization". It **IS NOT** a generic CMS.
    *   **Trade-off:** We provide *one* opinionated, optimized workflow. We do not support every possible conference variation or complex plugin systems.

7.  **Scalability (#7):**
    *   **Why:** The focus is on individual events/conferences (intermittent load), not a multi-tenant global SaaS platform serving millions simultaneously.
    *   **Trade-off:** We explicitly sacrifice horizontal scaling (K8s/Microservices) to protect **Cost (#1)** and **Simplicity (#2)**. The system just needs to survive the "Call for Papers" rush for a single event.

---

### Strategic Insight
The source emphasizes that this activity is not just about a final list but about the **"open and collaborative conversation"** it triggers. The stark contrast between **Cost (#1)** and **Scalability (#7)** defines the architectural strategy: **Vertical Efficiency over Horizontal Scale**.
