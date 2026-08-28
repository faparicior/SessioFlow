# Domain Service: [ServiceName]

## 📋 Definition
* **Description:** [What this service does and why it exists as a domain service rather than inside an aggregate]
* **Type:** Domain Service (stateless)
* **Source file:** `[path/to/ServiceName.ext]`
* **Owner Team:** [Team name]

---

## 🤝 Collaborators

| Collaborator | Role |
|--------------|------|
| `[RepositoryOrService]` | [What it provides to this service] |

---

## 🎯 Methods

### `[methodName(args)]: ReturnType`
[One-line description of what this method does.]

| Aspect | Detail |
|--------|--------|
| **Guards** | [Preconditions that must hold] |
| **Steps** | [Ordered list of what the method does] |
| **Side Effects** | [Domain events published, records persisted, etc.] |
| **Returns** | [What it returns and what the value means] |

---

## 🗺️ Sequence Diagram

```mermaid
sequenceDiagram
    participant Caller
    participant SVC as [ServiceName]
    participant C1 as [Collaborator1]
    participant C2 as [Collaborator2]

    rect rgb(232, 245, 233)
        note right of Caller: [methodName()] — [short description]
        Caller->>SVC: methodName(args)
        SVC->>C1: query(...)
        C1-->>SVC: result
        SVC->>C2: persist(...)
        SVC-->>Caller: return
    end
```

---

## 🔄 Flow Diagram — `[methodName()]()`

```mermaid
flowchart TB
    A([input]) --> B[Step 1]
    B --> C{Decision?}
    C -->|No| D([Return 0 / null])
    C -->|Yes| E[Step 2]
    E --> F([Return result])

    style D fill:#ffcdd2
    style F fill:#c8e6c9
```

*Repeat one flow diagram block per method.*

---

## 🔒 Invariants

* [INV-[XXX]](../invariants/INV-[XXX]-[invariant-name].md): [Short invariant title]

---

## 🔗 Linked User Stories & Flows

| Flow | Usage |
|------|-------|
| [FlowName](../flows/flow-XX-name.md) | [Which method is called and at which step] |
