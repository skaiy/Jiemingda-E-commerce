@echo off
echo 正在获取应用访问地址...
echo.

wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66

echo.
echo 如果部署成功，访问地址应该显示在上面的输出中
echo 格式通常为: https://jiemingda-web-xxx.service.jiemingda-0g8ddwgk28c2ff66.cloudbaseapp.com
echo.

pause