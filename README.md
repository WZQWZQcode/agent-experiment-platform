# Agentic Workflow 节奏治理实验平台

一个用于组织行为学/信息系统实验的Web原型平台，支持多种实验条件操纵和高频行为日志记录。

**🌐 支持线上部署** | **📱 导师可直接访问** | **☁️ 免费云端运行**

## 功能特性

- **多种实验条件**：抽卡模式、打包模式、洗牌权、雷达图、指标绑定
- **任务类型**：结构化选择题、短文本生成、信息抽取
- **数据记录**：高频事件日志、任务响应、微问卷
- **数据导出**：CSV/JSON格式，支持wide和eventlog两种格式
- **研究者面板**：查看参与者、条件分布、导出数据
- **🚀 一键部署**：支持部署到Vercel + Zeabur，无需服务器

## 技术栈

- **前端**：React + Vite + TypeScript + Tailwind CSS
- **后端**：Python FastAPI + SQLite
- **通信**：REST API
- **部署**：Vercel (前端) + Zeabur (后端)

## 🚀 两种使用方式

### 方式一：本地运行（开发/测试）

适合本地开发和测试。

### 1. 启动后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端将运行在 http://localhost:8000

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 http://localhost:5173

### 方式二：线上部署（生产环境）

**🎯 适合让导师直接访问，无需本地运行！**

详细部署教程请查看：**[📖 DEPLOY.md](./DEPLOY.md)**

**快速概览：**
1. 上传代码到 GitHub
2. 后端部署到 Zeabur（免费，国内访问快）
3. 前端部署到 Vercel（免费，全球CDN）
4. 分享URL给导师

**预计时间：20-30分钟**

---

## 📱 访问应用

- **参与者入口**：http://localhost:5173
- **研究者面板**：按 `Ctrl+Shift+A`，密码：`admin`
- **API文档**：http://localhost:8000/docs

## 实验条件说明

系统支持以下实验条件的组合：

- **bundle_mode**：打包模式（一次给3个任务）vs 单步模式
- **shuffle_enabled**：是否允许"换一题"
- **radar_enabled**：是否显示任务池雷达图
- **metric_enabled**：是否显示倒计时和速度提示
- **draw_mode**：是否使用抽卡模式

默认采用 2x2 设计（bundle x shuffle），其他条件可选。

## 数据导出

### API端点

- `GET /export/wide.csv` - 导出任务级数据（宽表）
- `GET /export/eventlog.csv` - 导出事件日志（长表）
- `GET /export/all.json` - 导出所有数据（JSON格式）

### 数据结构

**wide表**：每行一个任务试次
- participant_id, round_index, task_id, task_type, correct, score
- start_ts, end_ts, duration_ms, first_input_latency_ms
- condition字段（bundle_mode, shuffle_enabled等）

**eventlog表**：每行一个事件
- participant_id, ts, event_type, payload_json
- 事件类型：PAGE_FOCUS, TASK_VIEW, FIRST_INPUT, SUBMIT, SHUFFLE_CLICK, RADAR_OPEN等

## 分析示例

```python
import pandas as pd

# 读取数据
wide = pd.read_csv('wide.csv')
events = pd.read_csv('eventlog.csv')

# 计算切换次数
switch_count = events[events['event_type'] == 'BUNDLE_SWITCH'].groupby('participant_id').size()

# 计算首次输入延迟
initiation_latency = wide.groupby('participant_id')['first_input_latency_ms'].mean()

# 计算分心时间（page blur）
blur_events = events[events['event_type'] == 'PAGE_BLUR']
focus_events = events[events['event_type'] == 'PAGE_FOCUS']
# 合并计算distraction_time...
```

## 管理面板

- **快捷键**：`Ctrl+Shift+A`
- **密码**：`admin`
- **功能**：
  - 查看参与者列表和条件分布
  - 导出数据（CSV/JSON）
  - 清空数据库（需二次确认）
  - 切换开发/正式模式

## 项目结构

```
backend/          # FastAPI后端
  main.py         # 主应用和API端点
  database.py     # 数据库模型
  tasks_generator.py  # 任务生成逻辑
  tasks_seed.json # 任务模板

frontend/         # React前端
  src/
    pages/        # 页面组件
    components/   # 可复用组件
    api.ts        # API调用
    types.ts      # 类型定义
```

## 开发说明

- 前端开发服务器支持热重载
- 后端使用 `--reload` 参数自动重启
- SQLite数据库文件：`backend/experiment.db`
- 清空数据：删除 `experiment.db` 文件或使用管理面板

## 许可证

MIT License
