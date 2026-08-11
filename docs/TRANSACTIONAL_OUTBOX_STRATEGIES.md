# 📦 Transactional Outbox Triggering Strategies & Execution Guide

This document details the triggering strategies for SessioFlow's **Transactional Outbox Pattern**, explaining how pending domain events in `outbox_messages` are relayed to event publishers and subscribers.

---

## 🎯 Selected Strategy: Immediate Post-Commit Approach

SessioFlow currently uses the **Immediate Post-Commit Approach** as its primary triggering mechanism.

```
+-----------------------------------------------------------------------------------------------+
|                                    USE CASE / COMMAND HANDLER                                 |
+-------+-------------------------------+-------------------------------+-----------------------+
        |                               |                               |
  1. Call domain action            2. Save aggregate & outbox       3. Non-blocking trigger
  conference.publishCfp()          repository.save(conf)            setImmediate(() => {
                                   outboxRepo.saveAll(events)         OutboxProcessor.process()
                                                                    })
                                                                        |
                                                                        v
                                                            +-----------------------+
                                                            |   OutboxProcessor     |
                                                            |  (Background Thread)  |
                                                            +-----------+-----------+
                                                                        |
                                                                        v
                                                            +-----------------------+
                                                            |    EventPublisher     |
                                                            |   Dispatches Events   |
                                                            +-----------------------+
```

### How It Works
1. The **Use Case Handler** explicitly executes aggregate business logic (`conference.publishCfp()`).
2. The handler persists aggregate state via `ConferenceRepository` and writes pending events to `outbox_messages` via `OutboxRepository`.
3. Immediately after outbox persistence completes, the handler schedules a non-blocking `setImmediate()` execution of `OutboxProcessor.processPending(publisher)`.
4. The HTTP response completes immediately without waiting for downstream event handlers or network messaging.

### Implementation Pattern in Handlers
```typescript
// Inside Application Command Handler (e.g. CreateConferenceHandler)
conference.publishCfp();
await this.repository.save(conference);

const events = conference.pullDomainEvents();
if (events.length > 0 && this.outboxRepository) {
  await this.outboxRepository.saveAll(events, 'Conference', conference.id.value);

  // Immediate non-blocking execution
  if (this.eventPublisher) {
    setImmediate(() => {
      OutboxProcessor.processPending(this.eventPublisher!).catch((err) => {
        logger.error('Immediate outbox processing error', err);
      });
    });
  }
}
```

---

## 📑 Overview of All 3 Outbox Trigger Strategies

| Strategy | Delivery Latency | CPU / Database Overhead | Complexity | Active in SessioFlow? |
| :--- | :--- | :--- | :--- | :--- |
| **1. Immediate Post-Commit (`setImmediate`)** | **Ultra-Low (< 10ms)** | Extremely low (triggered only when events exist) | Simple | **YES (Primary)** |
| **2. Scheduled Worker (Polling / Cron)** | Low to Medium (1–5 seconds) | Periodic query overhead (`SELECT ... PENDING`) | Low | *Planned Safety Net* |
| **3. Change Data Capture (Postgres LISTEN/NOTIFY or Debezium)** | Near Real-time (< 50ms) | Low DB overhead; requires listener infrastructure | Medium to High | *Future Multi-Node* |

---

### Strategy 1: Immediate Post-Commit Approach
- **Mechanism**: In-process non-blocking task queue (`setImmediate`, `process.nextTick`, or background Promise).
- **Pros**:
  - Sub-millisecond event dispatch latency.
  - Zero database polling queries when idle.
- **Cons**:
  - If the Node.js process crashes between DB commit and `setImmediate` execution, outbox rows remain in `PENDING` status until recovered.

---

### Strategy 2: Scheduled Background Worker (Polling Safety Net)
- **Mechanism**: A background timer (`setInterval`) or cron worker regularly queries `SELECT * FROM outbox_messages WHERE status = 'PENDING' LIMIT 50`.
- **Pros**:
  - Guaranteed recovery of orphaned `PENDING` messages caused by process crashes or restarts.
- **Cons**:
  - Introduces latency up to the polling interval (e.g. 5 seconds).

> 💡 *Note*: Can be scheduled in development/ops using periodic jobs or the `/schedule` slash command!

---

### Strategy 3: Change Data Capture (CDC / Postgres LISTEN-NOTIFY)
- **Mechanism**: Uses PostgreSQL `LISTEN / NOTIFY` or external CDC tools (Debezium, Kafka Connect) monitoring Postgres write-ahead logs (WAL).
- **Pros**:
  - Completely decouples application code from event processing.
  - Scales across multi-region server clusters.
- **Cons**:
  - Requires additional infrastructure setup (CDC connectors, PostgreSQL replication slots).

---

## 🎯 Architecture Summary

SessioFlow adopts **Strategy #1 (Immediate Post-Commit)** as the active default for real-time responsiveness, with **Strategy #2 (Background Polling)** planned as a fail-safe recovery mechanism for orphaned outbox records.
