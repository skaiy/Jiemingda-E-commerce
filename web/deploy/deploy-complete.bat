@echo off
echo ========================================
echo CloudBase 完整部署脚本
echo ========================================
echo.

echo 1. 检查CloudBase CLI...
tcb --version
if %errorlevel% neq 0 (
    echo 错误: CloudBase CLI未安装或未配置
    echo 请先安装: npm install -g @cloudbase/cli
    pause
    exit /b 1
)

echo.
echo 2. 部署静态网站...
tcb framework deploy
if %errorlevel% neq 0 (
    echo 错误: 静态网站部署失败
    pause
    exit /b 1
)

echo.
echo 3. 部署云函数 mysqlQuery...
tcb fn deploy mysqlQuery --dir ./functions/mysqlQuery
if %errorlevel% neq 0 (
    echo 警告: mysqlQuery 云函数部署失败，请手动部署
)

echo.
echo 4. 部署云函数 mysqlSeed2...
tcb fn deploy mysqlSeed2 --dir ./functions/mysqlSeed2
if %errorlevel% neq 0 (
    echo 警告: mysqlSeed2 云函数部署失败，请手动部署
)

echo.
echo 5. 部署云函数 validateDatabase...
tcb fn deploy validateDatabase --dir ./functions/validateDatabase
if %errorlevel% neq 0 (
    echo 警告: validateDatabase 云函数部署失败，请手动部署
)

echo.
echo 6. 部署云函数 inspectData...
tcb fn deploy inspectData --dir ./functions/inspectData
if %errorlevel% neq 0 (
    echo 警告: inspectData 云函数部署失败，请手动部署
)

echo.
echo 7. 跳过 initDatabase 部署（已迁移至 MySQL，无需文档库初始化）

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 网站地址: https://cloud1-0gc8cbzg3efd6a99-1251221636.tcloudbaseapp.com/
echo.
echo 接下来请：
echo 1. 访问网站确认主页面正常
echo 2. 访问 admin.html 进行管理员登录
echo 3. 使用管理工具测试数据库连接
echo 4. 如有云函数部署失败，请在CloudBase控制台手动部署
echo.
echo 详细说明请查看 MYSQL_SETUP.md 文件
echo.
pause
