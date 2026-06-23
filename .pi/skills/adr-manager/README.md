# ADR Manager Pi Skill

This directory contains the `adr-manager` Pi Skill, which standardizes and automates the lifecycle of Architecture Decision Records (ADRs) and Amendments in any repository.

---

## Workflows & Lifecycles

### ADR Generation Workflow

When starting a project, new ADRs or Amendments are validated and indexed through this sequence:

```mermaid
flowchart TD
    Challenge["Challenge to existing ADR\n(Change/Feedback)"] --> CMD7["7. Generate Amendment\n(7-generate-adr-amendment.md)"]
    CMD7 --> CreateAmend["Create Amendment ADR\n(docs/adr/0XX-*-amendment.md)"]
    
    Inception["Lean Inception Artifacts\n(docs/inception/)"] --> CMD1["1. Generate ADRs\n(1-generate-adrs-from-inception.md)"]
    CMD1 --> CreateADR["Create / Modify ADRs\n(docs/adr/0XX-*.md)"]
    
    CreateADR --> CMD2["2. Validate ADRs\n(2-ADR-validator.md)"]
    CreateAmend --> CMD2
    
    CMD2 --> CheckQuality{"Quality >= Medium?"}
    CheckQuality -->|No| CreateADR
    CheckQuality -->|No - Amendment| CreateAmend
    
    CheckQuality -->|Yes| ApprovedADR["Validated ADRs / Amendments"]
    
    ApprovedADR --> CMD6["6. Index ADR\n(6-update-adr-readme.md)"]
    ApprovedADR --> CMD3["3. Summarize\n(3-generate-adr-summary.md)"]
    ApprovedADR --> CMD4["4. Traceability\n(4-generate-traceability-matrix.md)"]
    
    CMD6 --> README["Update\ndocs/adr/README.md"]
    CMD3 --> Summary["Create\n_reports/ADR_GENERATION_SUMMARY.md"]
    CMD4 --> Trace["Create\n_reports/TRACEABILITY_MATRIX.md"]

    style Inception fill:#f9f,stroke:#333,stroke-width:2px
    style Challenge fill:#f9f,stroke:#333,stroke-width:2px
    style ApprovedADR fill:#bbf,stroke:#333,stroke-width:2px
    style README fill:#bfb,stroke:#333,stroke-width:1px
    style Summary fill:#bfb,stroke:#333,stroke-width:1px
    style Trace fill:#bfb,stroke:#333,stroke-width:1px

    linkStyle 0 stroke:#ff9f43,stroke-width:2px,stroke-dasharray: 5 5;
    linkStyle 1 stroke:#ff9f43,stroke-width:2px,stroke-dasharray: 5 5;
    linkStyle 3 stroke:#ff9f43,stroke-width:2px,stroke-dasharray: 5 5;
    linkStyle 6 stroke:#ff9f43,stroke-width:2px,stroke-dasharray: 5 5;
```

---

### ADR Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Proposed : Created by author
    Proposed --> Accepted : Approved in technical review
    Proposed --> Rejected : Decided against in review
    Accepted --> Superseded : Replaced by a new decision (new ADR)
    Accepted --> Deprecated : Obsolete (no direct replacement)
    
    Rejected --> [*]
    Superseded --> [*]
    Deprecated --> [*]

    style Proposed fill:#ffe,stroke:#eed,stroke-width:2px
    style Accepted fill:#efe,stroke:#ded,stroke-width:2px
    style Rejected fill:#fee,stroke:#edd,stroke-width:2px
    style Superseded fill:#eef,stroke:#dde,stroke-width:2px
    style Deprecated fill:#eee,stroke:#ccc,stroke-width:2px
```

---

### Alternatives Analysis Workflow

```mermaid
flowchart TD
    Trigger["Trigger\n(Wave change / 6-12 months / Milestone)"] --> CMD5["5. Analyze Alternatives\n(5-analyze-adr-alternatives.md)"]
    CMD5 --> Research["Research current stack\nvs. State of the Art (2025-2026)"]
    Research --> Evaluate["Evaluate each ADR against\nnew alternatives"]
    
    Evaluate --> Reps["Generate Deliverables:\n- _reports/ADR_ALTERNATIVES_ANALYSIS.md\n- _reports/EXECUTIVE_SUMMARY.md"]
    
    Reps --> Decision{"Is a decision change\nrequired?"}
    
    Decision -->|Yes: Full Replacement| Replace["1. Create new ADR (Proposed)\n2. Mark current ADR as Superseded\n3. Update docs/adr/README.md"]
    Decision -->|Yes: Refinement/Delta| Amend["1. Run 7-generate-adr-amendment.md\n2. Link headers (Amends/Amended By)\n3. Update docs/adr/README.md"]
    Decision -->|No| Keep["Document retention rationale\nin the report"]

    style Trigger fill:#f9f,stroke:#333,stroke-width:2px
    style Reps fill:#bfb,stroke:#333,stroke-width:1px

    linkStyle 6 stroke:#ff9f43,stroke-width:2px,stroke-dasharray: 5 5;
```

---

## Directory Structure & Assets

This skill bundles all references and templates as assets, keeping them separate from the project files:

```
.pi/skills/adr-manager/
├── SKILL.md                 # Core prompt & instructions for the AI agent
├── README.md                # This usage guide
├── templates/               # Standardized markdown templates
│   ├── TEMPLATE.md
│   ├── TEMPLATE-ADR_VALIDATOR.md
│   ├── TEMPLATE-ADR_GENERATION_SUMMARY.md
│   ├── TEMPLATE-TRACEABILITY_MATRIX.md
│   ├── TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md
│   ├── TEMPLATE-EXECUTIVE_SUMMARY.md
│   └── TEMPLATE-AMENDMENT.md
└── references/              # Step-by-step command guides
    ├── 0-ADR-WORKFLOW.md
    ├── 1-generate-adrs-from-inception.md
    ├── 2-ADR-validator.md
    ├── 3-generate-adr-summary.md
    ├── 4-generate-traceability-matrix.md
    ├── 5-analyze-adr-alternatives.md
    ├── 6-update-adr-readme.md
    └── 7-generate-adr-amendment.md
```

---

## How to Run

### 1. Conversational Activation
Simply ask the AI agent in the chat:
*   *"Create an ADR for [technology choice] using the adr-manager skill"*
*   *"Validate ADR-003"*
*   *"Draft an amendment for ADR-002 to add a repository interface"*
*   *"Run the alternatives analysis for Q3"*

### 2. Command Line Interface (CLI)
Execute specific modes using the Pi CLI tool:
```bash
# Generate a new ADR
pi skill adr-manager --mode generate

# Validate an ADR
pi skill adr-manager --mode validate --file docs/adr/003-use-docker-compose-for-deployment.md

# Propose an amendment
pi skill adr-manager --mode amend --file docs/adr/002-use-supabase-for-backend-and-database.md
```
