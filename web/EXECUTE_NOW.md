# 🚀 立即执行部署 - 操作指南

## 当前状态
✅ 微信云CLI已安装并登录  
✅ 所有配置文件已准备完毕  
✅ 项目结构已验证  

## 立即执行以下步骤：

### 1. 打开命令行窗口
```bash
# 在 Windows 命令提示符或 PowerShell 中执行：
cd "D:\diaoguoliang_132568\Desktop\刁国亮\捷明达\01.dev\web"
```

### 2. 执行部署命令
```bash
wxcloud run:deploy . --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --remark "产品目录Web版部署"
```

### 3. 按照提示进行交互选择

#### 步骤 3.1: 选择部署方式
```
? 请选择部署方式 (Use arrow keys)
> 手动上传代码包  ← 按回车选择这个
  镜像拉取
```
**操作**: 直接按 **回车键** 确认

#### 步骤 3.2: 选择发布类型
```
? 请选择发布类型 (Use arrow keys)
> 全量发布  ← 按回车选择这个
  灰度发布
```
**操作**: 直接按 **回车键** 确认

#### 步骤 3.3: 确认部署信息
```
服务名: jiemingda-web
环境ID: jiemingda-0g8ddwgk28c2ff66
版本备注: 产品目录Web版部署
? 确认发布? (y/N)
```
**操作**: 输入 **y** 然后按回车

### 4. 等待部署完成
部署过程包括：
- 📦 代码包上传 (约1-2分钟)
- 🐳 Docker镜像构建 (约2-3分钟)  
- 🚀 容器启动和健康检查 (约1分钟)

### 5. 获取访问地址
部署完成后，运行：
```bash
wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66
```

## 预期成功输出示例
```
服务名: jiemingda-web
状态: 运行中
访问地址: https://jiemingda-web-xxx.service.jiemingda-0g8ddwgk28c2ff66.cloudbaseapp.com
```

## 如果遇到问题
1. **网络超时**: 检查网络连接，重新执行部署命令
2. **权限错误**: 确认微信开发者账号权限
3. **构建失败**: 检查 Dockerfile 语法和文件结构

---

## 🎯 现在就开始！

**复制以下完整命令到命令行执行**：
```bash
cd "D:\diaoguoliang_132568\Desktop\刁国亮\捷明达\01.dev\web" && wxcloud run:deploy . --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --remark "产品目录Web版部署"
```

然后按照上述 3 个交互步骤操作即可！