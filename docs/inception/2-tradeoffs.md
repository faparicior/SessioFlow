# ⚖️ Trade-off Board (Project Constraints)

The **Trade-off Board**, often referred to as **"Understanding the Trade-offs"** or **"Sliders"**, is a strategic activity in the execution phase of a Lean Inception. Its purpose is to build a common understanding regarding the "solution of compromise"—an agreement where certain product aspects are deprioritised to favour others that are deemed more vital.

According to the sources, this activity is essential because products are often built on conflicting premises, such as **Security vs Usability** or **Performance vs Flexibility**. By forcing a collaborative conversation, the team reaches a consensus that prevents future misunderstandings and accelerates decision-making.

### Trade-off Board (Sliders)

***

# Trade-off Board: SessioFlow

**Instructions:**
1.  **Identify Categories:** List all relevant product qualities (e.g., Security, Usability, Cost).
2.  **Rank Importance:** Columns are numbered **1 to N**, where **1 is the most important**.
3.  **The Golden Rule:** Each column can only contain **one** consensus mark. You cannot have two categories at the same priority level.

| Priority Rank | 1 (Most) | 2 | 3 | 4 | 5 | 6 | 7 (Least) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cost** | 🔴 | | | | | | |
| **Usability** | | 🔴 | | | | | |
| **Simplicity** | | | 🔴 | | | | |
| **Security** | | | | 🔴 | | | |
| **Flexibility** | | | | | 🔴 | | |
| **Performance** | | | | | | 🔴 | |
| **Scalability** | | | | | | | 🔴 |

---

### Consensus Reasoning

*   **1. Cost:** The Vision explicitly states "$0/month infrastructure". If the architecture requires an expensive DB or heavy server, the product fails its primary market (Non-profits/Volunteers).
*   **2. Usability:** Fernando (Persona) is a volunteer with limited time. If he needs to read a manual to find the "Reject" button, he will go back to Excel.
*   **3. Simplicity:** To achieve "#1 Cost", the code must be simple enough to run on **basic hosting (e.g., Vercel + Supabase Free Tier)**. Complex microservices architectures are banned.
*   **4. Security:** We handle personal data (Names/Emails) so GDPR compliance is mandatory, but we are *not* handling payments (Out of Scope), which lowers the threat model compared to a Fintech app.
*   **5. Flexibility:** We are building *a* way to manage events, not *every* way. Custom workflows are out of scope for MVP.
*   **6. Performance:** It is an admin tool. 200ms vs 500ms latency does not change the value proposition.
*   **7. Scalability:** The MVP is for single-conference use. We do not need to architect for 1 million concurrent users right now. YAGNI (You Aren't Gonna Need It).

***

### Strategic Insight
The team agrees that **User Experience (Cost + Usability)** trumps **Engineering Ego (Scalability + Perforamnce)**. This is a "Boring Tech" project designed to be accessible, not a technical showcase of high-throughput systems.