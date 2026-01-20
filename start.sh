#!/bin/bash

# VINV Tax Estimator - Diagnostic and Launch Script
# This script checks everything and then starts the server

echo "=========================================="
echo "VINV Tax Estimator - Diagnostic Check"
echo "=========================================="
echo ""

# Check current directory
echo "1. Current Directory:"
pwd
echo ""

# List files
echo "2. Files in directory:"
ls -lh index.html styles.css index.js 2>/dev/null || echo "   ERROR: Some files are missing!"
echo ""

# Check file permissions
echo "3. File Permissions:"
if [ -r "index.html" ] && [ -r "styles.css" ] && [ -r "index.js" ]; then
    echo "   ✓ All files are readable"
else
    echo "   ✗ Some files have permission issues"
fi
echo ""

# Get absolute path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "4. Absolute path to files:"
echo "   $SCRIPT_DIR"
echo ""

echo "=========================================="
echo "Starting Server"
echo "=========================================="
echo ""
echo "Server URL: http://localhost:8000"
echo "           or http://127.0.0.1:8000"
echo ""
echo "IMPORTANT INSTRUCTIONS:"
echo "  1. Open your web browser"
echo "  2. Type this EXACT URL: http://localhost:8000"
echo "  3. Press Enter"
echo "  4. You should see the VINV Tax Estimator"
echo ""
echo "If you see a directory listing instead:"
echo "  - Click on 'index.html'"
echo ""
echo "To stop the server: Press Ctrl+C"
echo ""
echo "=========================================="
echo ""

# Change to script directory to ensure we're serving from the right place
cd "$SCRIPT_DIR"

# Start Python HTTP server
python3 -m http.server 8000
