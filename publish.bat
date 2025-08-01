@echo off
echo ========================================
echo 智能图片压缩工具 - 发布脚本
echo ========================================
echo.

echo 请按照以下步骤发布到 GitHub 和 Gitee:
echo.

echo 1. 首先在 GitHub 创建新仓库:
echo    - 访问: https://github.com/new
echo    - 仓库名: image-compressor
echo    - 描述: 智能图片压缩工具 - 现代化的客户端图片压缩网页应用
echo    - 选择 Public
echo    - 不要勾选初始化 README
echo.

echo 2. 然后在 Gitee 创建新仓库:
echo    - 访问: https://gitee.com/projects/new
echo    - 仓库名: image-compressor  
echo    - 描述: 智能图片压缩工具 - 现代化的客户端图片压缩网页应用
echo    - 选择公开
echo    - 不要勾选初始化 README
echo.

echo 3. 创建完仓库后，请输入您的用户名:
set /p username="请输入您的 GitHub/Gitee 用户名: "

echo.
echo 正在添加远程仓库...
git remote add origin https://github.com/%username%/image-compressor.git
git remote add gitee https://gitee.com/%username%/image-compressor.git

echo.
echo 正在推送到 GitHub...
git branch -M main
git push -u origin main

echo.
echo 正在推送到 Gitee...
git push -u gitee main

echo.
echo ========================================
echo 发布完成！
echo ========================================
echo.
echo 您的项目现在可以在以下地址访问:
echo GitHub: https://github.com/%username%/image-compressor
echo Gitee:  https://gitee.com/%username%/image-compressor
echo.
echo 启用 Pages 服务后，在线演示地址:
echo GitHub Pages: https://%username%.github.io/image-compressor
echo Gitee Pages:  https://%username%.gitee.io/image-compressor
echo.
echo 请查看 DEPLOY.md 文件了解如何启用 Pages 服务
echo.
pause