# 🚀 线上部署指南

本指南将帮助你将实验平台部署到公网，让导师可以通过URL直接访问。

## 📋 部署方案

**推荐方案（免费 + 国内访问友好）：**
- **前端**: Vercel（全球CDN，国内访问速度快）
- **后端**: Zeabur（国内团队开发，支持中文，免费额度充足）

**预计时间**: 20-30分钟

---

## 🎯 部署前准备

### 1. 注册账号

**Vercel账号（前端）：**
1. 访问 https://vercel.com
2. 点击右上角 "Sign Up"
3. 选择 "Continue with GitHub"（推荐）或邮箱注册
4. 完成GitHub授权

**Zeabur账号（后端）：**
1. 访问 https://zeabur.com
2. 点击 "开始使用" 或 "Sign Up"
3. 选择 "Continue with GitHub"（推荐）
4. 完成授权

### 2. 安装Git（如果还没有）

**Windows:**
- 下载 https://git-scm.com/download/win
- 安装后打开 Git Bash

**检查是否安装成功：**
```bash
git --version
```

### 3. 创建GitHub仓库

1. 访问 https://github.com/new
2. 仓库名称：`agent-experiment-platform`（或任意名称）
3. 选择 **Public**（公开仓库，免费部署）
4. 不要勾选任何初始化选项
5. 点击 "Create repository"

---

## 📦 第一步：上传代码到GitHub

打开项目根目录，在Git Bash或CMD中执行：

```bash
# 进入项目目录
cd D:\桌面\Agent-Experiment-Platform

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Agentic Workflow Experiment Platform"

# 关联远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/agent-experiment-platform.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

**如果推送失败，可能需要配置GitHub认证：**
```bash
# 配置用户名和邮箱
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"

# 使用GitHub Personal Access Token
# 1. 访问 https://github.com/settings/tokens
# 2. 点击 "Generate new token (classic)"
# 3. 勾选 "repo" 权限
# 4. 生成后复制token
# 5. 推送时使用token作为密码
```

---

## 🔧 第二步：部署后端到Zeabur

### 2.1 创建项目

1. 登录 https://zeabur.com
2. 点击 "创建项目" 或 "New Project"
3. 项目名称：`agent-experiment-backend`
4. 选择区域：**Hong Kong**（香港，国内访问最快）
5. 点击 "创建"

### 2.2 部署服务

1. 在项目页面点击 "添加服务" 或 "Add Service"
2. 选择 "Git"
3. 点击 "配置GitHub" 授权访问你的仓库
4. 选择 `agent-experiment-platform` 仓库
5. **重要**：在 "Root Directory" 填写 `backend`（指定后端目录）
6. 点击 "部署"

### 2.3 配置环境变量

1. 等待部署完成（约2-3分钟）
2. 点击服务卡片进入详情
3. 点击 "环境变量" 或 "Environment Variables"
4. 添加以下变量：

```
ALLOWED_ORIGINS=*
PORT=8000
```

5. 点击 "保存" 并重启服务

### 2.4 获取后端URL

1. 在服务详情页找到 "域名" 或 "Domains"
2. 复制自动生成的域名，例如：
   ```
   https://agent-experiment-backend-xxx.zeabur.app
   ```
3. **保存这个URL，后面配置前端时需要用到！**

### 2.5 测试后端

在浏览器访问：
```
https://你的后端域名.zeabur.app/docs
```

应该能看到FastAPI的Swagger文档页面。

---

## 🎨 第三步：部署前端到Vercel

### 3.1 配置环境变量（本地）

1. 打开 `frontend/.env.production` 文件
2. 修改 `VITE_API_URL` 为你的后端URL：
   ```
   VITE_API_URL=https://你的后端域名.zeabur.app
   ```
3. 保存文件

### 3.2 提交更改到GitHub

```bash
# 在项目根目录执行
git add frontend/.env.production
git commit -m "Update backend URL for production"
git push
```

### 3.3 在Vercel部署

1. 登录 https://vercel.com
2. 点击 "Add New..." → "Project"
3. 找到 `agent-experiment-platform` 仓库，点击 "Import"
4. **重要配置**：
   - **Framework Preset**: Vite
   - **Root Directory**: 点击 "Edit"，选择 `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 点击 "Environment Variables" 添加环境变量：
   ```
   Name: VITE_API_URL
   Value: https://你的后端域名.zeabur.app
   ```
6. 点击 "Deploy" 开始部署

### 3.4 等待部署完成

- 部署时间约2-3分钟
- 完成后会显示 "Congratulations!"
- 点击 "Visit" 或复制域名访问

### 3.5 获取前端URL

Vercel会自动生成域名，例如：
```
https://agent-experiment-platform.vercel.app
```

---

## ✅ 第四步：测试完整流程

### 4.1 访问前端

在浏览器打开你的Vercel域名：
```
https://你的项目名.vercel.app
```

### 4.2 测试功能

1. **欢迎页**: 应该能正常显示
2. **开始实验**: 填写信息并点击"开始实验"
3. **任务界面**: 应该能加载任务
4. **提交任务**: 测试提交功能
5. **管理面板**: 按 `Ctrl+Shift+A`，密码 `admin`

### 4.3 检查跨域问题

打开浏览器开发者工具（F12）：
- 如果看到 "CORS error" 或 "跨域错误"
- 返回Zeabur后端，确认 `ALLOWED_ORIGINS=*`
- 或者设置为具体的前端域名：
  ```
  ALLOWED_ORIGINS=https://你的项目名.vercel.app
  ```

---

## 🎓 第五步：分享给导师

### 生成分享链接

**前端访问地址（给导师）：**
```
https://你的项目名.vercel.app
```

**管理面板访问方式：**
1. 访问前端URL
2. 按 `Ctrl+Shift+A`
3. 输入密码：`admin`
4. 可以查看参与者数据和导出数据

### 示例邮件模板

```
尊敬的导师：

我已将实验平台部署到线上，您可以通过以下链接访问：

🔗 实验平台地址：https://你的项目名.vercel.app

📊 管理面板访问方式：
1. 访问上述链接
2. 按键盘 Ctrl+Shift+A
3. 输入密码：admin
4. 即可查看参与者数据和导出实验数据

如有任何问题，请随时联系我。

祝好！
```

---

## 🔧 常见问题排查

### 问题1：前端显示"网络错误"或"Failed to fetch"

**原因**: 后端URL配置错误或CORS问题

**解决**:
1. 检查 `frontend/.env.production` 中的 `VITE_API_URL` 是否正确
2. 确认后端已成功部署并可访问
3. 在Zeabur后端设置 `ALLOWED_ORIGINS=*`
4. 重新部署前端（Vercel会自动检测GitHub更新）

### 问题2：后端部署失败

**原因**: 依赖安装失败或配置错误

**解决**:
1. 检查 Zeabur 部署日志
2. 确认 Root Directory 设置为 `backend`
3. 确认 `requirements.txt` 文件存在
4. 尝试重新部署

### 问题3：数据库文件丢失

**原因**: Zeabur免费版重启后会清空临时文件

**解决**:
- 免费版适合演示，数据会在重启后丢失
- 如需持久化，可以：
  1. 升级Zeabur付费版（支持持久化存储）
  2. 或使用外部数据库（PostgreSQL）

### 问题4：Vercel部署后页面空白

**原因**: 路由配置问题

**解决**:
1. 确认 `vercel.json` 文件存在
2. 确认 Root Directory 设置为 `frontend`
3. 检查浏览器控制台是否有错误

### 问题5：GitHub推送失败

**原因**: 认证问题

**解决**:
```bash
# 使用Personal Access Token
# 1. 生成token: https://github.com/settings/tokens
# 2. 推送时使用token作为密码

# 或使用SSH
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 将 ~/.ssh/id_rsa.pub 内容添加到 GitHub SSH keys
```

---

## 🎯 进阶配置（可选）

### 自定义域名

**Vercel（前端）：**
1. 在项目设置中点击 "Domains"
2. 添加你的域名（需要先购买域名）
3. 按照提示配置DNS记录

**Zeabur（后端）：**
1. 在服务详情中点击 "域名"
2. 添加自定义域名
3. 配置DNS CNAME记录

### 环境隔离

创建多个环境：
- **开发环境**: 本地运行
- **预览环境**: Vercel自动为每个PR创建预览
- **生产环境**: 主分支自动部署

### 监控和日志

**Vercel:**
- 在项目页面查看 "Analytics" 和 "Logs"

**Zeabur:**
- 在服务详情查看 "日志" 和 "监控"

---

## 📞 获取帮助

### 官方文档

- **Vercel文档**: https://vercel.com/docs
- **Zeabur文档**: https://zeabur.com/docs
- **FastAPI文档**: https://fastapi.tiangolo.com
- **Vite文档**: https://vitejs.dev

### 社区支持

- **Vercel Discord**: https://vercel.com/discord
- **Zeabur Discord**: https://discord.gg/zeabur

---

## 🎉 部署完成！

恭喜！你的实验平台已经成功部署到公网。

**最终检查清单：**
- ✅ 后端部署成功（Zeabur）
- ✅ 前端部署成功（Vercel）
- ✅ 跨域配置正确
- ✅ 完整流程测试通过
- ✅ 管理面板可访问
- ✅ 分享链接已发送给导师

**下一步：**
- 定期检查服务状态
- 导出实验数据备份
- 根据需要调整实验参数

祝实验顺利！🚀
