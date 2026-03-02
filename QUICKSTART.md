# 快速启动指南

## 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

## 启动步骤

### 1. 启动后端

打开第一个终端：

```bash
cd backend

# 创建虚拟环境（首次运行）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖（首次运行）
pip install -r requirements.txt

# 启动后端服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端将运行在 http://localhost:8000

### 2. 启动前端

打开第二个终端：

```bash
cd frontend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173

### 3. 访问应用

- **参与者入口**: http://localhost:5173
- **API文档**: http://localhost:8000/docs
- **管理面板**: 在应用中按 `Ctrl+Shift+A`，密码 `admin`

## 常见问题

### 后端启动失败

1. 确保Python版本 >= 3.8
2. 检查端口8000是否被占用
3. 尝试删除 `experiment.db` 文件重新启动

### 前端启动失败

1. 确保Node.js版本 >= 16
2. 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`
3. 检查端口5173是否被占用

### API连接失败

1. 确保后端已启动
2. 检查浏览器控制台是否有CORS错误
3. 确认后端地址为 http://localhost:8000

## 数据导出

在管理面板中点击导出按钮，或直接访问：

- Wide CSV: http://localhost:8000/export/wide.csv
- EventLog CSV: http://localhost:8000/export/eventlog.csv
- All JSON: http://localhost:8000/export/all.json

## 清空数据

在管理面板中点击"清空数据库"按钮，或删除 `backend/experiment.db` 文件。

## 开发模式

- 前端支持热重载，修改代码后自动刷新
- 后端使用 `--reload` 参数，修改代码后自动重启
- 所有事件日志都会实时记录到数据库

## 生产部署

### 后端

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 前端

```bash
npm run build
# 将 dist/ 目录部署到静态服务器
```

## 技术支持

如有问题，请检查：
1. 浏览器控制台（F12）
2. 后端终端输出
3. `backend/experiment.db` 是否正常创建
