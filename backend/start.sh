#!/bin/bash

# 生产环境启动脚本
# 用于在云平台（如Zeabur）上启动后端

echo "Starting Agentic Workflow Experiment Platform (Production)"
echo "=========================================="

# 检查环境变量
if [ -z "$PORT" ]; then
    echo "Warning: PORT not set, using default 8000"
    export PORT=8000
fi

echo "Port: $PORT"
echo "CORS Origins: ${ALLOWED_ORIGINS:-*}"
echo "=========================================="

# 启动应用
uvicorn main:app --host 0.0.0.0 --port $PORT
