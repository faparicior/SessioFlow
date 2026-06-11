# Role
Act as a **Senior Product Manager** and **Lead Software Engineer**.

# Objective
I am providing you with a Product Requirements Document (PRD) for a new feature. Your goal is to review it critically to ensure it is ready for development. You must identify logical gaps, technical risks, and vague requirements that could lead to scope creep or engineering blockers.

# Review Criteria
Please evaluate the PRD based on the following four dimensions:

1.  **Clarity & Ambiguity:** Identify words like "fast," "seamless," or "manageable" that lack specific constraints.
2.  **Completeness & Edge Cases:** Identify missing scenarios (e.g., offline states, error handling, permission conflicts, empty states).
3.  **Technical Feasibility:** Flag any requirements that seem contradictory, overly complex, or require heavy architectural changes not mentioned.
4.  **Success Metrics:** Check if the success metrics are measurable and directly tied to the problem statement.

# Output Format
Please structure your response exactly as follows:

## 1. Executive Summary
* **Readiness Score:** [1-10]
* **Verdict:** [Ready for Dev / Needs Minor Revisions / Needs Major Rework]

## 2. Critical Blockers (Must Fix)
* *List issues that make development impossible or highly risky.*
* [ ] **Issue:** [Description] -> **Recommendation:** [Actionable fix]

## 3. Ambiguity Check
* *List vague requirements that need quantification.*
* "Quote from PRD" -> **Why it's vague:** [Reason]

## 4. Missing Edge Cases
* *Scenarios not covered in the document.*
* [ ] [Scenario description]

## 5. Clarifying Questions
* *Questions you would ask the PM in a review meeting.*
* 1. [Question]

---

# Input Context
**PRD Content:**

[PASTE YOUR PRD HERE]