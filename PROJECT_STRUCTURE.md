# 项目结构总览

```
Agent-Experiment-Platform/
│
├── README.md                    # 项目主文档
├── QUICKSTART.md                # 快速启动指南
├── DATA_ANALYSIS.md             # 数据分析指南
│
├── backend/                     # 后端（Python FastAPI）
│   ├── main.py                  # FastAPI主应用（API端点）
│   ├── database.py              # SQLAlchemy数据库模型
│   ├── tasks_generator.py       # 任务生成器（可复现随机）
│   ├── tasks_seed.json          # 任务模板种子文件
│   ├── requirements.txt         # Python依赖
│   └── experiment.db            # SQLite数据库（运行时生成）
│
└── frontend/                    # 前端（React + TypeScript + Tailwind）
    ├── index.html               # HTML入口
    ├── package.json             # npm配置和依赖
    ├── tsconfig.json            # TypeScript配置
    ├── tsconfig.node.json       # TypeScript Node配置
    ├── vite.config.ts           # Vite配置（开发服务器）
    ├── tailwind.config.js       # Tailwind CSS配置
    ├── postcss.config.js        # PostCSS配置
    │
    └── src/
        ├── main.tsx             # React入口文件
        ├── App.tsx              # 主应用组件（状态管理）
        ├── index.css            # 全局样式
        ├── types.ts             # TypeScript类型定义
        ├── api.ts               # API调用封装
        │
        ├── components/          # 可复用组件
        │   ├── ProgressBar.tsx  # 进度条
        │   ├── RadarPanel.tsx   # 雷达图/系统状态面板
        │   └── TaskCard.tsx     # 任务卡片（Bundle模式）
        │
        └── pages/               # 页面组件
            ├── Welcome.tsx      # 欢迎/知情同意页
            ├── TaskArena.tsx    # 任务主界面（核心）
            ├── Survey.tsx       # 微问卷页
            ├── Finish.tsx       # 完成页
            └── Admin.tsx        # 管理面板
```

## 文件说明

### 后端核心文件

**main.py** (约350行)
- FastAPI应用初始化和CORS配置
- 所有API端点实现：
  - POST /participants - 创建参与者
  - POST /assign_condition - 分配实验条件
  - GET /tasks/next - 获取下一个任务/任务包
  - POST /tasks/advance - 推进任务索引
  - POST /events - 记录事件日志
  - POST /responses - 提交任务响应
  - POST /survey - 提交微问卷
  - POST /complete - 标记实验完成
  - GET /admin/* - 管理面板API
  - GET /export/* - 数据导出API
- 内存缓存管理（participant_tasks）

**database.py** (约100行)
- SQLAlchemy ORM模型定义
- 4张表：Participant, TrialWide, EventLog, Survey
- 数据库连接和会话管理

**tasks_generator.py** (约120行)
- 基于种子的可复现任务生成
- 任务池生成（每参与者24个任务）
- 任务包生成（Bundle模式）
- 响应评估逻辑（选择题、文本生成、信息抽取）

**tasks_seed.json** (约150行)
- 3种任务类型的模板
- 每种类型3-5个模板
- 包含题目、答案、关键词、难度等

### 前端核心文件

**App.tsx** (约100行)
- 应用状态管理（welcome/task/survey/finish）
- 页面路由逻辑
- 管理面板快捷键监听（Ctrl+Shift+A）

**pages/Welcome.tsx** (约150行)
- 知情同意界面
- 人口统计信息收集
- 参与者创建

**pages/TaskArena.tsx** (约400行，最复杂）
- 任务主界面核心逻辑
- Bundle/单步模式切换
- 任务加载和提交
- 事件日志记录（高频）
- 页面焦点监听
- 首次输入延迟计算
- 洗牌功能
- 3种任务类型的渲染和交互

**pages/Survey.tsx** (约120行)
- 微问卷界面
- 4个Likert量表问题
- 问卷提交

**pages/Admin.tsx** (约200行)
- 管理面板
- 密码验证
- 参与者列表展示
- 统计信息展示
- 数据导出按钮
- 清空数据库功能

**components/TaskCard.tsx** (约60行)
- Bundle模式下的任务卡片
- 任务类型标签
- 完成状态显示

**components/RadarPanel.tsx** (约80行)
- 系统状态面板
- 任务池分布可视化
- 打开/关闭事件记录

**components/ProgressBar.tsx** (约30行)
- 进度条组件
- 百分比计算和动画

## 数据流

1. **参与者创建**
   ```
   Welcome -> POST /participants -> 生成UUID -> 随机分配条件
   ```

2. **任务流程**
   ```
   TaskArena -> GET /tasks/next -> 任务生成器 -> 返回任务/任务包
   -> 用户交互 -> POST /responses -> 评估 -> 保存到TrialWide
   -> POST /tasks/advance -> 更新索引
   ```

3. **事件记录**
   ```
   前端交互 -> POST /events -> 保存到EventLog
   （高频：PAGE_FOCUS, FIRST_INPUT, SHUFFLE_CLICK等）
   ```

4. **数据导出**
   ```
   Admin -> GET /export/wide.csv -> 查询TrialWide -> 生成CSV
   Admin -> GET /export/eventlog.csv -> 查询EventLog -> 生成CSV
   Admin -> GET /export/all.json -> 查询所有表 -> 生成JSON
   ```

## 关键设计决策

1. **可复现随机**: 使用participant_id作为随机种子，确保每个参与者的任务序列可复现

2. **内存缓存**: 任务池存储在内存中（participant_tasks），避免重复生成

3. **条件冗余**: 实验条件在TrialWide表中冗余存储，便于分析时直接使用

4. **高频日志**: 所有关键交互都记录到EventLog，支持细粒度行为分析

5. **前后端分离**: 完全独立的前后端，便于部署和扩展

6. **科研风UI**: 黑白灰配色，极简设计，类似agent控制台

7. **2x2设计**: 默认采用Bundle x Shuffle的2x2设计，其他条件可选

## 扩展建议

1. **添加新任务类型**: 在tasks_seed.json添加模板，在tasks_generator.py添加评估逻辑

2. **修改实验条件**: 在main.py的create_participant中修改条件分配逻辑

3. **添加新事件类型**: 在前端调用api.logEvent，在DATA_ANALYSIS.md添加分析逻辑

4. **自定义问卷**: 修改Survey.tsx的问题和量表

5. **修改轮次数**: 在TaskArena.tsx和tasks_generator.py中修改total_rounds参数

6. **添加认证**: 在后端添加JWT认证中间件

7. **部署到云端**: 使用Docker容器化，部署到AWS/Azure/GCP

## 性能考虑

- 前端：React虚拟DOM优化，避免不必要的重渲染
- 后端：SQLite适合中小规模实验（<1000参与者），大规模需切换到PostgreSQL
- 事件日志：高频写入，考虑批量提交或异步队列
- 数据导出：大数据量时考虑分页或流式导出

## 安全考虑

- 管理面板密码硬编码（生产环境应使用环境变量）
- 无用户认证（适合匿名实验，如需认证需添加JWT）
- CORS开放所有来源（生产环境应限制）
- SQL注入防护（使用ORM参数化查询）
- XSS防护（React自动转义）
