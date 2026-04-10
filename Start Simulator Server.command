#!/bin/bash
cd "$(dirname "$0")"
echo "DRYSUITS Simulator Server を起動中..."
echo "アクセスURL: http://localhost:8000/simulator/index.html"
echo ""
echo "サーバーを停止するには、このウィンドウを閉じてください。"
/usr/bin/python3 -m http.server 8000
