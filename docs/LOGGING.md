# Logging Configuration

SessioFlow uses structured logging with configurable destinations and formats.

## 📝 Configuration Approach

**Single File Strategy:** We use **only `.env.local`** for all environment configuration.

- ✅ No `.env.development` or `.env.production` needed
- ✅ `.env.local` overrides all other env files
- ✅ Keep your configuration in one place

**Why `.env.local` only?**
- Next.js loads `.env.local` with highest priority
- No confusion about which file takes precedence
- Simpler project structure
- Your local overrides stay private (gitignored)

## 🎯 Quick Start

### Development (Console Output)

```bash
# .env.local
LOG_LEVEL=debug
LOG_FORMAT=pretty
LOG_DESTINATION=console
```

**Output:**
```
[INFO] 2026-07-04 20:53:02 - Application started
```

### Production (File + Console)

```bash
# .env.local
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=both
LOG_PATH=./logs/app.log
```

**Output:**
- Console: Pretty formatted logs
- File: JSON formatted logs

---

## 📋 Configuration Options

### Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `LOG_LEVEL` | `trace`, `debug`, `info`, `warn`, `error` | `info` | Minimum log level |
| `LOG_FORMAT` | `json`, `pretty` | `pretty` | Log output format |
| `LOG_DESTINATION` | `console`, `file`, `both` | `console` | Where to write logs |
| `LOG_PATH` | File path | `./logs/app.log` | Log file location |
| `LOG_ENABLED` | `true`, `false` | `true` | Enable/disable logging |

---

## 🎛️ Destination Options

### 1. Console Only

```bash
LOG_DESTINATION=console
LOG_FORMAT=pretty
```

**Use case:** Development, debugging, containerized apps

**Output:** Logs appear in terminal/stdout

---

### 2. File Only

```bash
LOG_DESTINATION=file
LOG_FORMAT=json
LOG_PATH=./logs/app.log
```

**Use case:** Local logging, compliance requirements

**Output:** Logs written to specified file path

**File structure:**
```
logs/
├── app.log
└── error.log (optional)
```

---

### 3. Both Console and File

```bash
LOG_DESTINATION=both
LOG_FORMAT=json
LOG_PATH=./logs/app.log
```

**Use case:** Production, development with persistent logs

**Output:**
- Console: Pretty formatted for readability
- File: JSON formatted for analysis

---

## 📊 Log Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| `trace` | Very detailed debugging | Performance profiling, detailed traces |
| `debug` | Debug information | Development debugging |
| `info` | General information | Normal operation messages |
| `warn` | Warning conditions | Non-critical issues |
| `error` | Error conditions | Failures, exceptions |

---

## 💡 Examples

### Development Configuration

```bash
# .env.local
LOG_LEVEL=debug
LOG_FORMAT=pretty
LOG_DESTINATION=console
```

**Sample output:**
```
[INFO] 2026-07-04 20:53:02 - Starting conference creation
[DEBUG] 2026-07-04 20:53:02 - Generated slug: tech-conference-2026
[INFO] 2026-07-04 20:53:02 - Conference saved successfully
```

---

### Production Configuration

```bash
# .env.local
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=both
LOG_PATH=./logs/app.log
```

**Console output:**
```
[INFO] 2026-07-04 20:53:02 - Starting conference creation
```

**File output (JSON):**
```json
{"level":"INFO","time":"2026-07-04T20:53:02.529Z","correlationId":"req-abc-123","conferenceId":"conf-456","msg":"Starting conference creation"}
```

---

### Error Logging

```bash
# .env.local
LOG_LEVEL=error
LOG_FORMAT=json
LOG_DESTINATION=file
LOG_PATH=./logs/error.log
```

**Captures only errors:**
```json
{"level":"ERROR","time":"2026-07-04T20:53:02.529Z","error":"Database connection failed","stack":"Error: ...","msg":"Failed to connect"}
```

---

## 🔍 Viewing Logs

### Console Logs
```bash
# Development server
npm run dev

# Logs appear directly in terminal
```

### File Logs
```bash
# View latest logs
tail -f ./logs/app.log

# View error logs only
grep ERROR ./logs/app.log

# Search for specific correlation ID
grep "req-abc-123" ./logs/app.log
```

### Docker Logs
```bash
# View container logs
docker logs sessioflow

# Follow logs
docker logs -f sessioflow

# View last 100 lines
docker logs --tail 100 sessioflow
```

---

## 🎯 Best Practices

### Development
```bash
LOG_LEVEL=debug
LOG_FORMAT=pretty
LOG_DESTINATION=console
```
- ✅ Easy to read and debug
- ✅ Shows all log levels
- ✅ No file management needed

### Staging
```bash
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=both
LOG_PATH=./logs/app.log
```
- ✅ Persistent logs for debugging
- ✅ JSON format for log aggregation
- ✅ Console for immediate feedback

### Production
```bash
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=both
LOG_PATH=./logs/app.log
```
- ✅ Structured JSON for log analysis
- ✅ Both console (for monitoring) and file (for persistence)
- ✅ Info level to reduce noise

---

## 🔄 Log Rotation

When using file logging, consider implementing log rotation:

### Option 1: Use a log rotation tool
```bash
# Install logrotate
sudo apt install logrotate

# Configure /etc/logrotate.d/sessioflow
./logs/app.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
```

### Option 2: Use a logging library with rotation
```typescript
// Future: Use pino-roll or similar
const transport = pino.transport({
  target: 'pino-roll',
  options: {
    file: './logs/app.log',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 7, // Keep 7 days
  },
});
```

---

## 🐛 Troubleshooting

### Logs Not Appearing

**Check:**
1. `LOG_ENABLED=true` in `.env.local`
2. Restart the development server after changing env vars
3. Check file permissions for `LOG_PATH`

### Logs Too Verbose

**Solution:**
```bash
LOG_LEVEL=info  # or 'warn', 'error'
```

### Logs Too Sparse

**Solution:**
```bash
LOG_LEVEL=debug
```

---

## 📚 Related Documentation

- [ADR-018: Implement Observability](./adr/018-implement-observability-for-debugging.md)
- [Pino Documentation](https://getpino.io/)
- [OpenTelemetry Documentation](https://opentelemetry.io/)

---

**Last Updated:** 2026-07-04