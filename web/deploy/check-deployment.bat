@echo off
echo ========================================
echo CloudBase 部署状态检查
echo ========================================
echo.

echo 1. 检查CloudBase CLI状态...
tcb --version
echo.

echo 2. 检查当前环境...
tcb env list
echo.

echo 3. 检查云函数列表...
tcb fn list
echo.

echo 4. 检查静态托管状态...
tcb hosting list
echo.

echo 5. 测试网站访问...
echo 正在打开网站: https://cloud1-0gc8cbzg3efd6a99-1251221636.tcloudbaseapp.com/
start https://cloud1-0gc8cbzg3efd6a99-1251221636.tcloudbaseapp.com/
echo.

echo ========================================
echo 检查完成！
echo ========================================
echo.
echo 如果发现问题，请：
echo 1. 检查网络连接
echo 2. 确认CloudBase CLI已正确登录
echo 3. 查看上述输出中的错误信息
echo 4. 必要时重新运行 deploy-complete.bat
echo.
pause
