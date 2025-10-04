# 部署后验证和管理命令

## 1. 获取服务访问地址
```bash
wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66
```

## 2. 检查服务状态
```bash
wxcloud service list --envId jiemingda-0g8ddwgk28c2ff66
```

## 3. 查看部署日志
```bash
wxcloud run logs --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web
```

## 4. 查看实时日志（监控模式）
```bash
wxcloud run logs --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --follow
```

## 5. 查看版本列表
```bash
wxcloud version list --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web
```

## 6. 更新服务配置（如需要）
```bash
wxcloud service update --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web
```

## 7. 如需重新部署
```bash
wxcloud run:deploy . --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --remark "更新版本"
```

## 8. 版本回退（如有问题）
```bash
wxcloud run:rollback --envId jiemingda-0g8ddwgk28c2ff66 --serviceName jiemingda-web --versionName <版本名>
```

## 常用组合命令脚本

### 快速检查脚本 (check.bat)
```batch
@echo off
echo 正在检查服务状态...
wxcloud service list --envId jiemingda-0g8ddwgk28c2ff66
echo.
echo 正在获取访问地址...
wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66
pause
```

### 获取访问地址脚本 (geturl.bat)
```batch
@echo off
echo 获取访问地址...
wxcloud run list --envId jiemingda-0g8ddwgk28c2ff66 | findstr "https://"
pause
```

## 预期部署结果

部署成功后，您应该看到类似这样的访问地址：
```
https://jiemingda-web-[随机字符].service.jiemingda-0g8ddwgk28c2ff66.cloudbaseapp.com
```

## 验证功能清单

访问部署的应用后，请验证以下功能：

### ✅ 基本功能
- [ ] 页面正常加载
- [ ] 侧栏分类导航显示正常
- [ ] 产品列表正常显示
- [ ] 产品图片正常加载

### ✅ 数据显示
- [ ] 商品编号正确显示
- [ ] 品牌名称从字典正确获取
- [ ] 分类名称从字典正确获取
- [ ] 规格和单位信息正确

### ✅ 交互功能
- [ ] 分类切换正常工作
- [ ] 搜索功能正常
- [ ] 产品详情弹窗正常
- [ ] 移动端适配正常

### ✅ 性能检查
- [ ] 首次加载速度 < 3秒
- [ ] 图片懒加载工作正常
- [ ] 数据缓存工作正常

## 问题排查

### 如果无法访问：
1. 检查域名是否正确
2. 确认服务是否正常运行
3. 查看部署日志是否有错误

### 如果功能异常：
1. 检查浏览器控制台错误
2. 确认数据文件是否正确加载
3. 检查nginx配置是否正确

### 如果性能问题：
1. 检查图片大小和格式
2. 确认CDN缓存设置
3. 优化数据加载策略