# 微信云托管部署操作指南

## 当前状态
✅ 已登录微信云托管  
✅ 配置文件已创建  
✅ Dockerfile已准备  
✅ 静态资源已复制  

## 立即执行部署

### 方式一：使用批处理脚本（推荐）
```bash
# 在 web 目录下运行
deploy.bat
```

### 方式二：手动执行命令
```bash
cd web
wxcloud run:deploy . --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --remark "产品目录Web版部署"
```

## 部署过程中的交互选择

1. **选择部署方式**
   ```
   ? 请选择部署方式
   > 手动上传代码包  ← 选择这个
     镜像拉取
   ```

2. **确认服务配置**
   - 服务名: `jiemingda-web`
   - 环境ID: `jiemingda-0g8ddwgk28c2ff66`
   - 端口: `80`
   - 资源配置: `0.25核/512Mi内存`

3. **等待构建过程**
   - 代码包上传
   - Docker镜像构建
   - 容器启动
   - 健康检查

## 部署完成后的验证步骤

### 1. 检查服务状态
```bash
wxcloud service list --envId jiemingda-0g8ddwgk28c2ff66
```

### 2. 获取访问地址
```bash
wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66
```

### 3. 查看部署日志（如有问题）
```bash
wxcloud run logs --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web
```

## 预期结果

部署成功后您将获得：
- 一个可通过HTTPS访问的域名地址
- 完整的产品目录Web应用
- 支持移动端和桌面端访问
- 可直接配置到微信公众号菜单

## 示例访问地址格式
```
https://jiemingda-web-xxx.service.envId.cloudbaseapp.com
```

## 公众号菜单配置

拿到访问地址后，在微信公众号后台：
1. 进入"自定义菜单"
2. 添加菜单项：
   - 名称：`产品目录`
   - 类型：`跳转网页`
   - 地址：`您的云托管域名`

## 问题排查

如果部署失败，请检查：
1. 网络连接是否正常
2. 微信开发者账号权限
3. 环境配额是否充足
4. Dockerfile语法是否正确

---

**下一步操作**: 
1. 运行 `deploy.bat` 或执行手动部署命令
2. 选择"手动上传代码包"
3. 等待部署完成
4. 获取访问地址并测试