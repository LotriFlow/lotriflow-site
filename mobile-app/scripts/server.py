#!/usr/bin/env python3
"""
Simple HTTP server for testing PWA locally
Run with: python server.py
Then open: http://localhost:8080
"""

import http.server
import socketserver
import os

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers required for PWA
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

    def do_GET(self):
        # Redirect root to index.html
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    print(f"To test PWA installation:")
    print(f"   1. Open Chrome/Edge at http://localhost:{PORT}")
    print(f"   2. Open DevTools (F12) -> Application tab -> Manifest")
    print(f"   3. Check for 'Install' button in address bar")
    print(f"\nPress Ctrl+C to stop")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped")
