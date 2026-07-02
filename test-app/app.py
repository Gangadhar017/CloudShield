import os
import random
import time
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_client import (
    Counter, Gauge, Histogram, generate_latest, CONTENT_TYPE_LATEST
)

app = FastAPI(
    title="CloudShield Monitored Test Application",
    version="1.0.0",
    description="Instrumented microservice simulating cloud workloads, failures, and Prometheus metrics"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics
HEALTH_GAUGE = Gauge("app_health_status", "Health status of test application (1 = healthy, 0 = unhealthy)")
CPU_GAUGE = Gauge("app_cpu_usage_percent", "Simulated CPU utilization percentage")
MEM_GAUGE = Gauge("app_memory_usage_percent", "Simulated Memory utilization percentage")
REQUESTS_COUNTER = Counter("http_requests_total", "Total HTTP requests served", ["endpoint", "status"])
ERRORS_COUNTER = Counter("http_errors_total", "Total simulated HTTP error responses")
LATENCY_GAUGE = Gauge("app_request_latency_ms", "Observed request latency in milliseconds")

# State Management
current_mode = "healthy"  # 'healthy', 'unhealthy', 'high_cpu', 'high_memory', 'high_error_rate', 'high_latency'
failure_start_time = None

class ModeRequest(BaseModel):
    mode: str

@app.get("/")
def read_root():
    REQUESTS_COUNTER.labels(endpoint="/", status="200").inc()
    return {
        "service": "CloudShield-Monitored-Test-App",
        "status": "running",
        "current_mode": current_mode,
        "endpoints": ["/health", "/metrics", "/simulate/status", "/simulate/failure", "/simulate/recover"]
    }

@app.get("/health")
def health_check(response: Response):
    global current_mode
    if current_mode == "unhealthy":
        ERRORS_COUNTER.inc()
        REQUESTS_COUNTER.labels(endpoint="/health", status="500").inc()
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "status": "unhealthy",
            "service": "CloudShield-Monitored-Test-App",
            "error": "Critical: Application health probe failure (Simulated Outage)",
            "mode": current_mode
        }
    
    REQUESTS_COUNTER.labels(endpoint="/health", status="200").inc()
    return {
        "status": "healthy",
        "service": "CloudShield-Monitored-Test-App",
        "mode": current_mode
    }

@app.get("/metrics")
def get_metrics():
    global current_mode
    # Dynamically update metric values according to simulation mode
    if current_mode == "unhealthy":
        HEALTH_GAUGE.set(0)
        CPU_GAUGE.set(round(random.uniform(15.0, 30.0), 1))
        MEM_GAUGE.set(round(random.uniform(40.0, 50.0), 1))
        LATENCY_GAUGE.set(round(random.uniform(500.0, 1200.0), 1))
    elif current_mode == "high_cpu":
        HEALTH_GAUGE.set(1)
        CPU_GAUGE.set(round(random.uniform(88.0, 96.5), 1))  # > 80% threshold
        MEM_GAUGE.set(round(random.uniform(45.0, 55.0), 1))
        LATENCY_GAUGE.set(round(random.uniform(80.0, 150.0), 1))
    elif current_mode == "high_memory":
        HEALTH_GAUGE.set(1)
        CPU_GAUGE.set(round(random.uniform(30.0, 45.0), 1))
        MEM_GAUGE.set(round(random.uniform(89.0, 95.0), 1))  # > 85% threshold
        LATENCY_GAUGE.set(round(random.uniform(100.0, 200.0), 1))
    elif current_mode == "high_error_rate":
        HEALTH_GAUGE.set(1)
        CPU_GAUGE.set(round(random.uniform(40.0, 60.0), 1))
        MEM_GAUGE.set(round(random.uniform(50.0, 60.0), 1))
        ERRORS_COUNTER.inc(10)
        LATENCY_GAUGE.set(round(random.uniform(120.0, 250.0), 1))
    elif current_mode == "high_latency":
        HEALTH_GAUGE.set(1)
        CPU_GAUGE.set(round(random.uniform(40.0, 55.0), 1))
        MEM_GAUGE.set(round(random.uniform(45.0, 60.0), 1))
        LATENCY_GAUGE.set(round(random.uniform(1200.0, 2500.0), 1))  # High latency > 1000ms
    else:  # healthy default
        HEALTH_GAUGE.set(1)
        CPU_GAUGE.set(round(random.uniform(18.0, 32.0), 1))
        MEM_GAUGE.set(round(random.uniform(42.0, 48.0), 1))
        LATENCY_GAUGE.set(round(random.uniform(25.0, 55.0), 1))

    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/simulate/status")
def simulate_status():
    return {
        "status": "success",
        "current_mode": current_mode,
        "is_healthy": current_mode not in ["unhealthy"],
        "failure_start_time": failure_start_time
    }

@app.post("/simulate/failure")
def simulate_failure(payload: ModeRequest):
    global current_mode, failure_start_time
    valid_modes = ["healthy", "unhealthy", "high_cpu", "high_memory", "high_error_rate", "high_latency"]
    if payload.mode not in valid_modes:
        return {"status": "error", "message": f"Invalid mode. Choose from {valid_modes}"}
    
    current_mode = payload.mode
    failure_start_time = time.time() if current_mode != "healthy" else None
    return {
        "status": "success",
        "current_mode": current_mode,
        "message": f"Simulation mode switched to: {current_mode}"
    }

@app.post("/simulate/recover")
def simulate_recover():
    global current_mode, failure_start_time
    current_mode = "healthy"
    failure_start_time = None
    HEALTH_GAUGE.set(1)
    return {
        "status": "success",
        "current_mode": "healthy",
        "message": "Service successfully recovered to healthy state"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8001)))
