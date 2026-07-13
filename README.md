# 去山里，过夏天

产研负责人团队团建邀请 H5。项目是纯静态页面，最终产物只有 HTML、CSS、JavaScript、图片和音乐，不需要后端、数据库或常驻 Node 服务。

## 本地预览

Node.js 仅用于开发和打包：

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run build
```

构建后的静态文件位于 `dist/`，可以放到 GitHub Pages、腾讯云 COS、对象存储或任意静态网站托管平台。

## 发布到 GitHub Pages

仓库已包含 `.github/workflows/deploy-pages.yml`。推送到 GitHub 的 `main` 分支后，GitHub Actions 会自动测试、构建并发布 `dist/`。

1. 在 GitHub 创建一个仓库，并把本项目推送到 `main` 分支。
2. 打开仓库 `Settings -> Pages`。
3. 在 `Build and deployment` 中把 `Source` 设为 `GitHub Actions`。
4. 打开 `Actions`，等待 `Deploy H5 to GitHub Pages` 完成。
5. 页面地址通常是 `https://你的用户名.github.io/仓库名/`。

页面资源使用相对路径，支持 GitHub Pages 的仓库子目录地址。部署时工作流也会自动写入正式页面地址，供二维码和 Open Graph 分享信息使用。

## 验证

```bash
npm test
npm run build
npm run test:e2e
```

页面按手机 H5 设计；桌面打开时只展示手机访问提示和二维码。
