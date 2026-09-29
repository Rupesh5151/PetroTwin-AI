# PETRO-TWIN AI: Deployment, Containerization & Offline Mode
## Docker Compose Orchestration, Port Map, and Local Standalone Execution

---

### 1. Docker Compose Services & Topology
The entire platform is defined in a production-ready `docker-compose.yml`:

| Service | Port | Technology | Purpose |
| :--- | :--- | :--- | :--- |
| **frontend** | `3000` | React / Vite / Nginx | Control Room Dashboard & Digital Twin UI |
| **springboot** / **backend** | `8080` | Spring Boot 3 / Java 21 | Business Services, REST & WebSocket Broker |
| **ml-service** | `8000` | Python 3 / FastAPI / Uvicorn | Physics, ML, and Optimization Microservice |
| **postgres** | `5432` | PostgreSQL 16 + TimescaleDB | Relational schemas, hypertables, and audit |
| **streamer** | `1883` | Mosquitto MQTT / Sim Runner | Real-time correlated telemetry simulator |
| **prometheus** | `9090` | Prometheus | Microservice telemetry & latency metrics |
| **grafana** | `3001` | Grafana | System observability and JVM/ML dashboards |

---

### 2. One-Command Startup
To start the entire platform via Docker:
```bash
git clone https://github.com/petro-twin-ai/petro-twin-ai.git
cd petro-twin-ai
docker compose up --build
```

---

### 3. Native Standalone / Hackathon Offline Execution
For hackathon demo environments where Docker may not be installed or internet access is restricted, PETRO-TWIN AI includes a 100% native runner script:
```powershell
# Windows PowerShell Native Launch
.\scripts\run_all_local.ps1
```
This script launches the Python ML & physics service, the backend server, and the Vite frontend on localhost without requiring external internet or third-party cloud APIs.
