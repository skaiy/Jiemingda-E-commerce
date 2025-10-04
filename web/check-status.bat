@echo off
echo 正在检查微信云托管服务状态...
echo.

echo === 服务列表 ===
wxcloud service list --envId jiemingda-0g8ddwgk28c2ff66

echo.
echo === 运行实例 ===
wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66

echo.
echo === 访问地址 ===
wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66 | findstr "https://" > temp_url.txt
if exist temp_url.txt (
    for /f "tokens=*" %%a in (temp_url.txt) do (
        echo 您的应用访问地址: %%a
    )
    del temp_url.txt
) else (
    echo 未找到访问地址，请检查部署状态
)

echo.
pause