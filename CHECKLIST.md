# 启动检查清单

## 首次运行前检查

### 1. 环境检查

```bash
# 检查Python版本（需要3.8+）
python --version

# 检查Node.js版本（需要16+）
node --version

# 检查npm版本
npm --version
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 验证安装
python -c "import fastapi; import sqlalchemy; print('Backend dependencies OK')"
```

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 验证安装
npm list react react-dom
```

## 启动步骤

### 终端1：启动后端

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**预期输出**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**验证**: 访问 http://localhost:8000 应该看到 `{"message": "Agentic Workflow Experiment Platform API"}`

### 终端2：启动前端

```bash
cd frontend
npm run dev
```

**预期输出**:
```
  VITE v6.0.3  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**验证**: 访问 http://localhost:5173 应该看到欢迎页面

## 功能测试清单

### 基础流程测试

- [ ] 访问 http://localhost:5173 看到欢迎页
- [ ] 填写基本信息（可选）
- [ ] 勾选同意并点击"开始实验"
- [ ] 进入任务界面，看到任务内容
- [ ] 完成一个任务并提交
- [ ] 看到微问卷页面
- [ ] 完成问卷后继续下一轮
- [ ] 完成8轮后看到完成页面

### 实验条件测试

#### Bundle模式测试
- [ ] 刷新页面重新开始
- [ ] 如果分配到Bundle模式，左侧应显示3个任务卡片
- [ ] 点击不同任务卡片可以切换
- [ ] 完成所有3个任务后进入下一轮

#### Shuffle功能测试
- [ ] 如果分配到Shuffle权限，应看到"换一题"按钮
- [ ] 点击"换一题"应该加载新任务
- [ ] 使用后按钮应该禁用

#### Radar面板测试
- [ ] 如果启用Radar，右侧应显示"System Status"面板
- [ ] 点击展开/折叠应该正常工作
- [ ] 显示当前模式和进度信息

### 管理面板测试

- [ ] 按 `Ctrl+Shift+A` 打开管理面板
- [ ] 输入密码 `admin` 登录
- [ ] 看到参与者列表和统计信息
- [ ] 点击"导出 Wide CSV"下载文件
- [ ] 点击"导出 EventLog CSV"下载文件
- [ ] 点击"导出 JSON"下载文件
- [ ] 点击"刷新"更新数据
- [ ] 点击"清空数据库"（测试环境）

### 数据验证

```bash
# 检查数据库文件是否创建
ls backend/experiment.db

# 使用SQLite查看数据
cd backend
sqlite3 experiment.db

# 在SQLite中执行：
.tables
SELECT COUNT(*) FROM participants;
SELECT COUNT(*) FROM trials_wide;
SELECT COUNT(*) FROM eventlog;
.quit
```

## 常见问题排查

### 问题1: 后端启动失败 "Address already in use"

**原因**: 端口8000被占用

**解决**:
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### 问题2: 前端启动失败 "EADDRINUSE"

**原因**: 端口5173被占用

**解决**:
```bash
# 修改 vite.config.ts 中的端口
server: {
  port: 5174,  // 改为其他端口
  ...
}
```

### 问题3: API连接失败 "Network Error"

**原因**: 后端未启动或CORS配置问题

**解决**:
1. 确认后端已启动并运行在8000端口
2. 检查浏览器控制台是否有CORS错误
3. 确认 vite.config.ts 中的proxy配置正确

### 问题4: 数据库错误 "no such table"

**原因**: 数据库未初始化

**解决**:
```bash
# 删除旧数据库
rm backend/experiment.db

# 重启后端，会自动创建新数据库
```

### 问题5: 前端白屏

**原因**: JavaScript错误

**解决**:
1. 打开浏览器控制台（F12）查看错误
2. 检查是否所有依赖都已安装
3. 尝试清除缓存并重新加载

### 问题6: 任务不显示

**原因**: 任务生成失败或API调用失败

**解决**:
1. 检查后端终端是否有错误输出
2. 检查 tasks_seed.json 文件是否存在
3. 检查浏览器Network标签查看API响应

## 性能检查

### 后端性能

```bash
# 检查API响应时间
curl -w "@-" -o /dev/null -s http://localhost:8000/ <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

### 前端性能

- 打开浏览器开发者工具 -> Performance
- 录制页面加载和交互
- 检查是否有性能瓶颈

## 生产环境检查清单

- [ ] 修改管理面板密码（不使用硬编码）
- [ ] 配置CORS允许的来源（不使用通配符）
- [ ] 使用环境变量管理配置
- [ ] 启用HTTPS
- [ ] 配置日志记录
- [ ] 设置数据库备份
- [ ] 配置错误监控（如Sentry）
- [ ] 进行负载测试
- [ ] 准备回滚方案

## 数据备份

```bash
# 备份数据库
cp backend/experiment.db backend/experiment_backup_$(date +%Y%m%d_%H%M%S).db

# 导出所有数据
curl http://localhost:8000/export/all.json > backup_$(date +%Y%m%d_%H%M%S).json
```

## 联系支持

如果遇到无法解决的问题：

1. 检查浏览器控制台（F12）的错误信息
2. 检查后端终端的错误输出
3. 查看 PROJECT_STRUCTURE.md 了解系统架构
4. 查看 DATA_ANALYSIS.md 了解数据结构
5. 提供完整的错误信息和复现步骤

## 成功标志

当你看到以下情况时，说明系统运行正常：

✅ 后端终端显示 "Application startup complete"
✅ 前端终端显示 "ready in XXX ms"
✅ 浏览器可以访问 http://localhost:5173
✅ 可以完成完整的实验流程
✅ 管理面板可以导出数据
✅ 导出的CSV文件包含正确的数据
✅ 数据库文件 experiment.db 正常创建

祝实验顺利！🎉
