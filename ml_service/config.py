"""
PETRO-TWIN AI: ML Service Configuration
"""

import os
from pydantic import BaseModel


class ServiceConfig(BaseModel):
    service_name: str = "petro-twin-ml-service"
    version: str = "1.4.0"
    host: str = "0.0.0.0"
    port: int = int(os.environ.get("PORT", 8000))
    debug: bool = True
    models_dir: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    data_sources_path: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sources", "dataset_sources.yaml"))
    physics_config_path: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config", "physics.yaml"))


config = ServiceConfig()
