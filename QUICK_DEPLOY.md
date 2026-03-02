# 🚀 部署快速开始（5分钟速览）

## 📋 你需要什么

- GitHub账号
- Vercel账号（用GitHub登录）
- Zeabur账号（用GitHub登录）
- 10-30分钟时间

## 🎯 三步部署

### 第一步：上传到GitHub（5分钟）

```bash
# 1. 进入项目目录
cd D:\桌面\Agent-Experiment-Platform

# 2. 初始化Git
git init
git add .
git commit -m "Initial commit"

# 3. 创建GitHub仓库
# 访问 https://github.com/new
# 仓库名：agent-experiment-platform
# 类型：Public

# 4. 推送代码（替换YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/agent-experiment-platform.git
git branch -M main
git push -u origin main
```

### 第二步：部署后端到Zeabur（10分钟）

1. 访问 https://zeabur.com
2. 用GitHub登录
3. 创建项目 → 选择Hong Kong区域
4. 添加服务 → Git → 选择你的仓库
5. **重要**：Root Directory 填 `backend`
6. 环境变量添加：
   ```
   ALLOWED_ORIGINS=*
   PORT=8000
   ```
7. 等待部署完成
8. **复制后端URL**（例如：https://xxx.zeabur.app）

### 第三步：部署前端到Vercel（10分钟）

1. 修改 `frontend/.env.production`：
   ```
   VITE_API_URL=https://你的后端URL.zeabur.app
   ```

2. 提交更改：
   ```bash
   git add frontend/.env.production
   git commit -m "Update backend URL"
   git push
   ```

3. 访问 https://vercel.com
4. 用GitHub登录
5. Import Project → 选择你的仓库
6. **重要配置**：
   - Root Directory: `frontend`
   - Framework: Vite
   - 环境变量：
     ```
     VITE_API_URL=https://你的后端URL.zeabur.app
     ```
7. Deploy
8. 等待完成，复制前端URL

## ✅ 测试

访问你的前端URL：
```
https://你的项目名.vercel.app
```

1. 填写欢迎页信息
2. 开始实验
3. 完成一个任务
4. 按 `Ctrl+Shift+A` 打开管理面板（密码：admin）

## 📧 分享给导师

```
实验平台地址：https://你的项目名.vercel.app
管理面板：Ctrl+Shift+A（密码：admin）
```

## 🆘 遇到问题？

查看详细教程：**[DEPLOY.md](./DEPLOY.md)**

---

**就这么简单！🎉**
