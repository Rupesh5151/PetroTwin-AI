"""
PETRO-TWIN AI: Unified Test Runner
Runs physics invariant tests, ML feature tests, and agent supervisor tests.
"""

import unittest
import sys
import os

# Set root
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, root_dir)

loader = unittest.TestLoader()
suite = unittest.TestSuite()

suite.addTests(loader.discover(os.path.join(root_dir, "tests"), pattern="test_*.py"))

runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

if result.wasSuccessful():
    print("\n" + "="*70)
    print(" ALL PETRO-TWIN AI TESTS PASSED SUCCESSFULLY! (ZERO ERRORS)")
    print("="*70)
    sys.exit(0)
else:
    print("\n" + "="*70)
    print(" TESTS FAILED!")
    print("="*70)
    sys.exit(1)
