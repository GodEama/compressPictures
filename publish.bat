@echo off
echo ========================================
echo 智能图片压缩工具 - 发布脚本
echo ========================================
echo.

echo 请按照以下步骤发布到 GitHub 和 Gitee:
echo.

echo 检测到您已创建仓库:
echo    - GitHub: https://github.com/GodEama/compressPictures.git
echo    - Gitee:  https://gitee.com/gxjios/compress-pictures.git
echo.

echo 正在添加远程仓库...
git remote add origin https://github.com/GodEama/compressPictures.git
git remote add gitee https://gitee.com/gxjios/compress-pictures.git

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
echo GitHub: https://github.com/GodEama/compressPictures
echo Gitee:  https://gitee.com/gxjios/compress-pictures
echo.
echo 启用 Pages 服务后，在线演示地址:
echo GitHub Pages: https://GodEama.github.io/compressPictures
echo Gitee Pages:  https://gxjios.gitee.io/compress-pictures
echo.
echo 请查看 DEPLOY.md 文件了解如何启用 Pages 服务
echo.
pause