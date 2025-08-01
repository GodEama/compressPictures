# 部署指南

## 📦 发布到 GitHub

### 1. 创建 GitHub 仓库
✅ **已完成** - 您的仓库地址：https://github.com/GodEama/compressPictures

### 2. 推送代码到 GitHub
✅ **已完成** - 代码已成功推送

### 3. 启用 GitHub Pages（重要！）

**方法一：通过仓库设置页面**
1. 访问您的仓库：https://github.com/GodEama/compressPictures
2. 点击仓库顶部的 **"Settings"** 选项卡
3. 在左侧菜单中找到 **"Pages"** 选项
4. 在 **"Source"** 部分：
   - 选择 **"Deploy from a branch"**
   - Branch 选择：**"main"**
   - Folder 选择：**"/ (root)"**
5. 点击 **"Save"** 按钮
6. 等待 2-5 分钟，页面会显示绿色的成功消息
7. 您的网站将在 `https://GodEama.github.io/compressPictures` 可用

**方法二：直接访问Pages设置**
- 直接访问：https://github.com/GodEama/compressPictures/settings/pages
- 按照上述步骤 4-7 操作

### 4. 验证部署状态
- 在 Pages 设置页面查看部署状态
- 绿色勾号 ✅ 表示部署成功
- 黄色圆圈 🟡 表示正在部署
- 红色叉号 ❌ 表示部署失败

### 5. 故障排除

**如果演示地址打不开，请检查：**

1. **Pages 是否已启用**
   - 访问：https://github.com/GodEama/compressPictures/settings/pages
   - 确认 Source 已设置为 "Deploy from a branch"

2. **等待时间**
   - 首次启用需要 2-10 分钟
   - 后续更新需要 1-5 分钟

3. **检查部署状态**
   - 访问：https://github.com/GodEama/compressPictures/actions
   - 查看 "pages build and deployment" 工作流状态

4. **常见问题解决**
   - 清除浏览器缓存
   - 尝试无痕模式访问
   - 检查网络连接

**部署成功后的访问地址：**
- 🌐 **演示地址**：https://GodEama.github.io/compressPictures
- 📱 **移动端友好**：支持手机和平板访问

## 📦 发布到 Gitee

### 1. 创建 Gitee 仓库
1. 登录 [Gitee](https://gitee.com)
2. 点击右上角的 "+" 按钮，选择 "新建仓库"
3. 填写仓库信息：
   - 仓库名称: `compress-pictures`
   - 仓库介绍: `智能图片压缩工具 - 现代化的客户端图片压缩网页应用`
   - 选择公开
   - 不要勾选 "使用Readme文件初始化这个仓库"

### 2. 推送代码到 Gitee
```bash
# 添加 Gitee 远程仓库
git remote add gitee https://gitee.com/gxjios/compress-pictures.git

# 推送代码到 Gitee
git push -u gitee main
```

### 3. 启用 Gitee Pages
1. 进入仓库页面
2. 点击 "服务" 选项卡
3. 选择 "Gitee Pages"
4. 选择要部署的分支 "main"
5. 选择部署目录 "/"
6. 点击 "启动"
7. 等待部署完成，您的网站将在 `https://gxjios.gitee.io/compress-pictures` 可用

## 🔄 同步更新

当您对代码进行更新时，可以同时推送到两个平台：

```bash
# 添加更改
git add .
git commit -m "更新描述"

# 同时推送到 GitHub 和 Gitee
git push origin main
git push gitee main
```

## 📝 注意事项

1. **域名配置**: 如果您有自定义域名，可以在 Pages 设置中配置
2. **HTTPS**: GitHub Pages 和 Gitee Pages 都支持 HTTPS
3. **更新延迟**: Pages 部署可能需要几分钟时间
4. **访问限制**: Gitee Pages 免费版有一定的访问限制

## 🎯 推荐设置

- 在仓库中添加 Topics/标签: `image-compression`, `javascript`, `html5`, `canvas`, `web-app`
- 设置仓库的 About 部分，包含网站链接和简短描述
- 考虑添加 Star 和 Watch 按钮的说明