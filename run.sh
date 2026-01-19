#!/bin/bash

# VINV Tax Estimator - Quick Start Script
# This script starts a local web server to run the tax calculator

echo "=========================================="
echo "VINV Tax Estimator - Starting Server"
echo "=========================================="
echo ""
echo "Starting web server on http://localhost:8000"
echo ""
echo "To access the app:"
echo "  1. Open your web browser"
echo "  2. Navigate to: http://localhost:8000"
echo ""
echo "To stop the server: Press Ctrl+C"
echo ""
echo "=========================================="
echo ""

# Start Python HTTP server
python3 -m http.server 8000
