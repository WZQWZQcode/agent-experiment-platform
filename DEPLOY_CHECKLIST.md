# 🚀 部署快速检查清单

## 部署前检查

- [ ] 已注册 GitHub 账号
- [ ] 已注册 Vercel 账号
- [ ] 已注册 Zeabur 账号
- [ ] 已安装 Git

## 代码准备

- [ ] 前端 `api.ts` 已改为环境变量读取
- [ ] 前端 `.env.production` 已创建
- [ ] 后端 `main.py` 已支持环境变量 PORT
- [ ] 后端 CORS 已配置为允许跨域
- [ ] `.gitignore` 已创建

## GitHub 上传

- [ ] 创建 GitHub 仓库（Public）
- [ ] 初始化本地 Git 仓库
- [ ] 提交所有代码
- [ ] 推送到 GitHub

## 后端部署（Zeabur）

- [ ] 创建 Zeabur 项目
- [ ] 选择 Hong Kong 区域
- [ ] 从 GitHub 导入仓库
- [ ] 设置 Root Directory 为 `backend`
- [ ] 配置环境变量：
  - [ ] ALLOWED_ORIGINS=*
  - [ ] PORT=8000
- [ ] 等待部署完成
- [ ] 复制后端域名（保存！）
- [ ] 测试访问 `/docs` 端点

## 前端部署（Vercel）

- [ ] 修改 `frontend/.env.production` 填入后端URL
- [ ] 提交并推送到 GitHub
- [ ] 在 Vercel 导入 GitHub 仓库
- [ ] 设置 Root Directory 为 `frontend`
- [ ] 设置 Framework 为 Vite
- [ ] 配置环境变量：
  - [ ] VITE_API_URL=你的后端URL
- [ ] 点击 Deploy
- [ ] 等待部署完成
- [ ] 复制前端域名

## 功能测试

- [ ] 访问前端URL，页面正常显示
- [ ] 填写欢迎页信息，点击"开始实验"
- [ ] 任务界面正常加载
- [ ] 提交任务成功
- [ ] 按 Ctrl+Shift+A 打开管理面板
- [ ] 输入密码 `admin` 登录成功
- [ ] 查看参与者列表
- [ ] 导出数据成功
- [ ] 浏览器控制台无 CORS 错误

## 分享给导师

- [ ] 准备前端访问链接
- [ ] 准备管理面板访问说明
- [ ] 发送邮件或消息给导师

## 备份

- [ ] 定期导出实验数据
- [ ] 保存后端和前端URL
- [ ] 记录环境变量配置

---

## 快速命令参考

### 上传到 GitHub
```bash
cd D:\桌面\Agent-Experiment-Platform
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/agent-experiment-platform.git
git branch -M main
git push -u origin main
```

### 更新前端配置后推送
```bash
git add frontend/.env.production
git commit -m "Update backend URL"
git push
```

### 查看部署状态
- Zeabur: https://zeabur.com/dashboard
- Vercel: https://vercel.com/dashboard

---

## 常用链接

- **GitHub**: https://github.com
- **Vercel**: https://vercel.com
- **Zeabur**: https://zeabur.com
- **生成 GitHub Token**: https://github.com/settings/tokens

---

## 紧急联系

如果部署遇到问题：
1. 查看 DEPLOY.md 的"常见问题排查"章节
2. 检查 Zeabur/Vercel 的部署日志
3. 查看浏览器控制台（F12）的错误信息
