# Pi-Subagents Reference Guide

## 1. Architecture Overview

Pi-Subagents lets Pi delegate work to focused child agents. The hierarchy:

- **Parent session** — the main Pi session you're in, acts as the orchestrator
- **Subagent** — a focused child Pi session with its own job (single agent, parallel tasks, or chain steps)
- **Chain** — a sequence of agents where output from one feeds into the next
- **Parallel** — multiple agents running concurrently on the same task
- **Background run** — detached execution that continues after control returns to you

Key files:
- `/home/fernando/.pi/agent/extensions/subagent/` — extension runtime
- `~/.pi/agent/npm/node_modules/pi-subagents/` — installed package (v0.28.0)

---

## 2. Built-in Agents

Agents are markdown files with YAML frontmatter. Builtin agents load from `~/.pi/agent/extensions/subagent/agents/` at the lowest priority — user or project agents with the same name override them.

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `scout` | Fast codebase recon: relevant files, entry points, data flow, risks | Before you understand the code |
| `researcher` | Web/docs research with sources: official docs, specs, benchmarks | Before you trust external facts |
| `planner` | Concrete implementation plan from existing context. Reads & plans, doesn't edit | Before a bigger change |
| `worker` | Implementation work, edits files, validates, escalates unapproved decisions | To implement approved plans |
| `reviewer` | Code review and small fixes. Checks implementation against task/plan, tests, edge cases | To check implementation |
| `context-builder` | Gathers code context, writes handoff material (`context.md`, `meta-prompt.md`) | Before planning for complex work |
| `oracle` | Second opinion. Challenges assumptions, catches drift, recommends safest move without editing | When the decision itself feels risky |
| `delegate` | Lightweight general delegate. Behaves close to the parent session | When you want a child agent that mirrors the parent |

### Recommended Orchestration Loop

```
clarify → planner → worker → fresh reviewers → worker
```

- `planner`, `worker`, and `oracle` default to **forked context** when a launch omits `context`
- Use `context: "fresh"` when you intentionally want a fresh child run
- Child agents do not receive the `pi-subagents` skill; their context is filtered to strip parent-only orchestration instructions
- Only agents with `tools: subagent` in frontmatter can delegate further (bounded by `maxSubagentDepth`)

---

## 3. Creating Your Own Agents

### Location

| Scope | Path |
|-------|------|
| User | `~/.pi/agent/agents/**/*.md` |
| Project | `.pi/agents/**/*.md` |

Project agents override builtins with the same name.

### Format

Markdown with YAML frontmatter and system prompt body:

```yaml
---
name: my-specialist
package: code-analysis        # optional: registers as "code-analysis.my-specialist"
description: What this agent does
tools: read, grep, find, ls, bash
model: claude-sonnet-4-5
fallbackModels: openai/gpt-5-mini
thinking: high
systemPromptMode: replace      # "replace" (default) or "append"
inheritProjectContext: false
inheritSkills: false
skills: safe-bash, chrome-devtools
output: reports/analysis.md
defaultReads: shared-context.md
defaultProgress: true
completionGuard: false
maxSubagentDepth: 1
---
You are a specialist in X. Your job is to...
```

### Frontmatter Fields

| Field | Notes |
|-------|-------|
| `package` | Optional package identifier. Registers as `{package}.{name}` |
| `tools` | Builtin tool allowlist. Omitted = all builtins. Comma-separated. Use `mcp:server:tool` for MCP tools |
| `extensions` | Omitted = all normal extensions. Empty = no extensions. Comma-separated paths for allowlist |
| `model` | Default model. Bare ids prefer current provider |
| `fallbackModels` | Ordered backups for provider/model failures |
| `thinking` | Thinking level: off, minimal, low, medium, high, xhigh |
| `systemPromptMode` | `replace` (default) or `append` — append keeps Pi's base prompt |
| `inheritProjectContext` | Keep AGENTS.md/CLAUDE.md project instructions |
| `inheritSkills` | Let the child see Pi's discovered skills catalog |
| `defaultContext` | `fresh` or `fork` — default launch context for this agent |
| `skills` | Inject specific skills regardless of `inheritSkills` |
| `output` | Default single-agent output file |
| `defaultReads` | Files to read before running |
| `defaultProgress` | Maintain `progress.md` |
| `completionGuard` | Set `false` for non-implementation agents with mutation-capable tools |
| `maxSubagentDepth` | Tighten nested delegation for this agent's children |

### Overriding Builtin Agents

Don't copy the whole file — override specific fields in settings:

```json
// ~/.pi/agent/settings.json or .pi/settings.json
{
  "subagents": {
    "agentOverrides": {
      "reviewer": {
        "model": "anthropic/claude-sonnet-4",
        "thinking": "high",
        "fallbackModels": ["openai/gpt-5-mini"],
        "inheritProjectContext": false,
        "disabled": false
      }
    }
  }
}
```

Supported override fields: `model`, `fallbackModels`, `thinking`, `systemPromptMode`, `inheritProjectContext`, `inheritSkills`, `defaultContext`, `disabled`, `skills`, `tools`, `systemPrompt`.

---

## 4. Creating Your Own Chains

Chains are reusable workflows stored as `.chain.md` or `.chain.json`.

### Location

| Scope | Path |
|-------|------|
| User | `~/.pi/agent/chains/**/*.chain.md` or `.chain.json` |
| Project | `.pi/chains/**/*.chain.md` or `.chain.json` |

### .chain.md Format

```yaml
---
name: my-review-pipeline
description: Scout then review
---

## scout
phase: Discovery
label: Map the codebase
as: context
output: context.md

Scan the codebase for {task}

## planner
phase: Planning
label: Implementation plan
reads: context.md
model: anthropic/claude-sonnet-4-5:high

Create an implementation plan based on {outputs.context}

## worker
phase: Implementation
label: Build it

Implement based on {previous}

## reviewer
phase: Review
label: Quality check

Review the changes from the worker step
```

### .chain.json Format (with dynamic fanout)

```json
{
  "name": "dynamic-review",
  "description": "Find review targets, fan out reviewers, then synthesize.",
  "chain": [
    {
      "agent": "scout",
      "task": "Return review targets as structured_output with items array.",
      "as": "targets",
      "outputSchema": { "type": "object" }
    },
    {
      "expand": {
        "from": { "output": "targets", "path": "/items" },
        "item": "target",
        "key": "/path",
        "maxItems": 12
      },
      "parallel": {
        "agent": "reviewer",
        "label": "Review {target.path}",
        "task": "Review {target.path}. Reason: {target.reason}",
        "outputSchema": { "type": "object" }
      },
      "collect": { "as": "reviews" },
      "concurrency": 4
    },
    {
      "agent": "worker",
      "task": "Synthesize fixes from {outputs.reviews}"
    }
  ]
}
```

### Running Chains

```bash
# From prompt
/run-chain my-review-pipeline -- your task here

# Or slash command
/chain scout "scan code" -> planner "plan it" -> worker "implement"
```

---

## 5. Creating Your Own Orchestrator

An orchestrator is any agent that delegates to other agents. To create one:

### Step 1: Create the orchestrator agent

```yaml
# .pi/agents/orchestrator.md
---
name: orchestrator
tools: read, bash, mcp:chrome-devtools, subagent
extensions:
systemPromptMode: append
inheritProjectContext: true
maxSubagentDepth: 2
---
You are an orchestrator. When given a task:
1. Break it into logical sub-tasks
2. Use the `subagent` tool to delegate each sub-task to the right agent
3. Wait for results and synthesize
4. Report back to the user

Use these agents:
- scout: for codebase understanding
- planner: for design/implementation plans
- worker: for implementation
- reviewer: for code review

Delegation pattern:
- Use `{ agent: "name", task: "description" }` for single agents
- Use `{ tasks: [...] }` for parallel execution
- Use `{ chain: [...] }` for sequential pipelines

Safety rules:
- Only delegate sub-tasks that fit within each agent's scope
- Do not propose further subagent delegation unless explicitly assigned
- Escalate unapproved decisions back to the parent
```

### Step 2: Use it

```bash
# Natural language
"Use orchestrator to handle this: refactor the authentication system"

# Or via slash command
/chain orchestrator "refactor auth"
```

---

## 6. Programmatic Subagent Delegation

The LLM orchestrator uses the `subagent` tool call with these patterns:

### Single Agent

```ts
{ agent: "worker", task: "refactor auth" }
{ agent: "scout", task: "find todos", maxOutput: { lines: 1000 } }
{ agent: "scout", task: "write report", output: "reports/scout.md", outputMode: "file-only" }
```

### Forked Context

```ts
{ agent: "worker", task: "continue this thread", context: "fork" }
```

### Parallel Execution

```ts
{ tasks: [{ agent: "scout", task: "a" }, { agent: "reviewer", task: "b" }] }
{ tasks: [{ agent: "scout", task: "audit auth", count: 3 }] }
{ tasks: [...], context: "fork", worktree: true }
```

### Sequential Chain

```ts
{ chain: [
  { agent: "scout", task: "Gather context for auth refactor" },
  { agent: "planner" },
  { agent: "worker" },
  { agent: "reviewer" }
]}
```

### Chain with Parallel Fan-out

```ts
{ chain: [
  { agent: "scout", task: "Gather context", as: "context" },
  { parallel: [
    { agent: "worker", task: "Implement feature A from {outputs.context}" },
    { agent: "worker", task: "Implement feature B from {outputs.context}" }
  ], concurrency: 2 },
  { agent: "reviewer", task: "Review {outputs.featureA} and {outputs.featureB}" }
]}
```

### Background Execution

```ts
{ agent: "scout", task: "audit codebase", async: true }
{ chain: [...], async: true }
```

### Acceptance Gates

```ts
{
  agent: "worker",
  task: "Implement the fix",
  acceptance: {
    level: "verified",
    criteria: ["Patch without widening scope"],
    evidence: ["changed-files", "tests-added", "commands-run"],
    verify: [{ id: "focused", command: "npm test", timeoutMs: 120000 }]
  }
}
```

### Management Actions

```ts
{ action: "list" }                        // List all agents/chains
{ action: "get", agent: "scout" }         // Get agent details
{ action: "create", config: {...} }       // Create new agent or chain
{ action: "update", agent: "name", config: {...} }  // Update
{ action: "delete", agent: "name" }       // Delete
{ action: "status" }                      // Check async runs
{ action: "status", id: "<run-id>" }      // Check specific run
{ action: "interrupt", id: "<run-id>" }   // Soft-interrupt
{ action: "resume", id: "<run-id>", message: "..." } // Follow up
{ action: "doctor" }                      // Setup diagnostics
```

---

## 7. Chain Template Variables

Task templates support these variables:

| Variable | Description |
|----------|-------------|
| `{task}` | Original task from the first step |
| `{previous}` | Output from the prior step (or aggregated parallel output) |
| `{chain_dir}` | Path to the chain artifact directory |
| `{outputs.name}` | Text value from a prior step with `as: "name"` |

Parallel outputs are aggregated with separators:
```
=== Parallel Task 1 (worker) ===
...
=== Parallel Task 2 (reviewer) ===
...
```

---

## 8. Inline Step Configuration

Override defaults per step in slash commands:

```bash
/chain scout[output=context.md] "scan code" -> planner[reads=context.md] "analyze auth"
/parallel reviewer[skills=code-review+security] "review backend" -> reviewer[model=openai/gpt-5-mini] "review frontend"
```

| Key | Example | Description |
|-----|---------|-------------|
| `output` | `output=context.md` | Write results to a file |
| `outputMode` | `outputMode=file-only` | Return file reference instead of full content |
| `reads` | `reads=a.md+b.md` | Read files before executing |
| `model` | `model=anthropic/claude-sonnet-4` | Override model for this step |
| `skills` | `skills=planning+review` | Override injected skills |
| `progress` | `progress` | Enable progress tracking |
| `output=false`, `reads=false`, `skills=false` | Disable that behavior |

---

## 9. Background & Forked Runs

```bash
/run scout "audit codebase" --bg
/chain scout "analyze auth" -> planner "plan it" --bg
/run reviewer "review diff" --fork
/chain scout "scan frontend" -> reviewer "scan backend" --fork
/run reviewer "review diff" --bg --fork
```

- `--bg`: Background execution, detached. Check with `subagent({ action: "status" })`
- `--fork`: Each child starts from a real branched session. Never silently downgrades to `fresh`

---

## 10. Configuration

Config file: `~/.pi/agent/extensions/subagent/config.json`

```json
{
  "asyncByDefault": false,
  "forceTopLevelAsync": false,
  "parallel": {
    "maxTasks": 12,
    "concurrency": 6
  },
  "defaultSessionDir": "~/.pi/agent/sessions/subagent/",
  "maxSubagentDepth": 2,
  "intercomBridge": {
    "mode": "always",
    "instructionFile": "./intercom-bridge.md"
  },
  "worktreeSetupHook": "./scripts/setup-worktree.mjs",
  "worktreeSetupHookTimeoutMs": 45000
}
```

Or globally disable builtins:
```json
{ "subagents": { "disableBuiltins": true } }
```

---

## 11. Agent Scopes & Priority

| Scope | Path |
|-------|------|
| Builtin | `~/.pi/agent/extensions/subagent/agents/` |
| User | `~/.pi/agent/agents/**/*.md` |
| Project | `.pi/agents/**/*.md` |

Project agents override user agents which override builtins. Use `agentScope: "user" | "project" | "both"` in frontmatter to control discovery.

---

## 12. Key Paths Reference

| Resource | User Path | Project Path |
|----------|-----------|-------------|
| Agents | `~/.pi/agent/agents/**/*.md` | `.pi/agents/**/*.md` |
| Chains | `~/.pi/agent/chains/**/*.chain.md` | `.pi/chains/**/*.chain.md` |
| Skills | `~/.pi/agent/skills/{name}/SKILL.md` | `.pi/skills/{name}/SKILL.md` |
| Extensions | `~/.pi/agent/extensions/` | `.pi/extensions/` |
| Settings | `~/.pi/agent/settings.json` | `.pi/settings.json` |
| Agent config | `~/.pi/agent/extensions/subagent/config.json` | (via settings.json) |
| Prompt templates | `~/.pi/agent/prompts/` | `.pi/prompts/` |

---

## 13. Common Commands

| Command | Description |
|---------|-------------|
| `/run <agent> [task]` | Run one agent |
| `/chain agent1 "task1" -> agent2 "task2"` | Run agents in sequence |
| `/parallel agent1 "task1" -> agent2 "task2"` | Run agents in parallel |
| `/run-chain <chainName> -- <task>` | Launch a saved chain |
| `/subagents-doctor` | Setup diagnostics |
