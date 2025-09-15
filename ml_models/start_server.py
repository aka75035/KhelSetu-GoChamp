#!/usr/bin/env python3
"""
Startup script for the ML API server
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import tensorflow
        import cv2
        import mediapipe
        import flask
        import numpy
        import pandas
        import sklearn
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        return False

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the ML API server"""
    print("Starting ML API server...")
    try:
        # Change to the python directory
        os.chdir(Path(__file__).parent / "python")
        
        # Start the server
        subprocess.run([sys.executable, "api_server.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def test_server():
    """Test if the server is running"""
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and healthy")
            return True
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ Server is not responding")
        return False

def main():
    """Main function"""
    print("🚀 Starting ML API Server Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found. Please run this script from the ml_models directory.")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        print("Installing missing dependencies...")
        if not install_dependencies():
            print("❌ Failed to install dependencies. Please install manually.")
            sys.exit(1)
    
    # Start server
    print("\n🌐 Starting ML API server on http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    start_server()

if __name__ == "__main__":
    main()

