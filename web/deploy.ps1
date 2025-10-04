# 微信云托管自动部署脚本
# PowerShell版本

Write-Host "正在准备部署捷明达产品目录Web版..." -ForegroundColor Green
Write-Host ""

# 检查当前目录
$currentDir = Get-Location
Write-Host "当前目录: $currentDir"

# 检查必要文件
$requiredFiles = @("src\index.html", "Dockerfile", "wxcloud.yaml")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ 找到 $file" -ForegroundColor Green
    } else {
        Write-Host "✗ 缺少 $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "请确保以下文件存在后重试:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""
Write-Host "部署参数:" -ForegroundColor Yellow
Write-Host "  环境ID: jiemingda-0g8ddwgk28c2ff66"
Write-Host "  服务名: jiemingda-web"
Write-Host "  部署方式: 手动上传代码包"
Write-Host ""

Write-Host "正在启动部署..." -ForegroundColor Green
Write-Host ""
Write-Host "注意: CLI工具将显示交互选择，请按以下方式操作:" -ForegroundColor Yellow
Write-Host "1. 选择 '手动上传代码包' (按回车确认)"
Write-Host "2. 选择 '全量发布' (按回车确认)"
Write-Host "3. 确认部署信息 (输入 'y' 确认)"
Write-Host ""

Read-Host "按回车键开始部署"

# 执行部署命令
try {
    & wxcloud run:deploy . --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --remark "产品目录Web版部署"
} catch {
    Write-Host "部署过程中出现错误: $_" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""
Write-Host "部署流程已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "部署完成后，请运行以下命令获取访问地址:" -ForegroundColor Yellow
Write-Host "wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66"
Write-Host ""

Read-Host "按回车键退出"