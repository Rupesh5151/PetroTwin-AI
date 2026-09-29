"""
PETRO-TWIN AI: Model Training Launcher
Delegates to ml_service.train_models to execute the end-to-end training pipeline.
"""

import os
import sys

# Set repository root
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from ml_service.train_models import train_and_evaluate_all

if __name__ == "__main__":
    train_and_evaluate_all()
