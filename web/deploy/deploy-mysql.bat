@echo off
echo ========================================
echo MySQL数据库配置部署脚本
echo ========================================
echo.

echo 1. 检查CloudBase CLI...
cloudbase --version
if %errorlevel% neq 0 (
    echo 错误: CloudBase CLI未安装或未配置
    echo 请先安装: npm install -g @cloudbase/cli
    pause
    exit /b 1
)

echo.
echo 2. 登录CloudBase...
cloudbase login

echo.
echo 3. 部署云函数和静态资源...
cloudbase deploy

echo.
echo 4. 部署完成！
echo.
echo 接下来请：
echo 1. 访问 mysql-setup.html 页面
echo 2. 配置数据库连接信息
echo 3. 初始化数据库并导入数据
echo 4. 验证配置是否正确
echo.
echo 详细说明请查看 MYSQL_SETUP.md 文件
echo.
pause
