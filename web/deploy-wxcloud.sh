#!/bin/bash
# 微信云托管部署脚本

set -e

echo "=== 捷明达产品目录 - 微信云托管部署 ==="
echo ""

# 检查wxcloud CLI
if ! command -v wxcloud &> /dev/null; then
    echo "❌ 未找到 wxcloud CLI，请先安装："
    echo "   npm install -g @wxcloud/cli"
    exit 1
fi

# 进入web目录
cd "$(dirname "$0")"

echo "📁 当前目录: $(pwd)"
echo ""

# 登录微信云托管
echo "🔐 登录微信云托管..."
wxcloud login

# 部署
echo ""
echo "🚀 开始部署到微信云托管..."
wxcloud run deploy --env-id jiemingda-0g8ddwgk28c2ff66 --name jiemingda-web

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 查看服务状态："
echo "   wxcloud service list --env-id jiemingda-0g8ddwgk28c2ff66"
echo ""
echo "🌐 获取访问地址："
echo "   wxcloud run list --env-id jiemingda-0g8ddwgk28c2ff66"
