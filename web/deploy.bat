@echo off
echo 正在部署捷明达产品目录Web版到微信云托管...
echo.

cd /d "%~dp0"

echo 1. 检查当前目录结构...
if exist "src\index.html" (
    echo    ✓ 找到主页面文件
) else (
    echo    ✗ 未找到主页面文件，请检查目录结构
    pause
    exit /b 1
)

if exist "Dockerfile" (
    echo    ✓ 找到Dockerfile
) else (
    echo    ✗ 未找到Dockerfile
    pause
    exit /b 1
)

if exist "wxcloud.yaml" (
    echo    ✓ 找到配置文件
) else (
    echo    ✗ 未找到wxcloud.yaml配置文件
    pause
    exit /b 1
)

echo.
echo 2. 开始部署...
echo    环境ID: jiemingda-0g8ddwgk28c2ff66
echo    服务名: jiemingda-web
echo.

echo 请按照提示操作：
echo 1) 选择 "手动上传代码包"
echo 2) 确认部署信息
echo 3) 等待构建完成
echo.

wxcloud run:deploy . --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --remark "产品目录Web版部署"

echo.
echo 部署完成后，请运行以下命令获取访问地址：
echo wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66
echo.

pause