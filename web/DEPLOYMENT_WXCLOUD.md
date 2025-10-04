# 微信云托管部署指南

## 环境信息
- 环境ID: `jiemingda-0g8ddwgk28c2ff66`
- 服务名称: `jiemingda-web`
- 项目名称: 捷明达产品目录Web版

## 部署前准备

### 1. 确认文件结构
```
web/
├── src/                      # 源代码目录
│   ├── index.html           # 主页面文件
│   └── data/                # 数据目录
│       ├── products.json
│       ├── brand_dictionary.json
│       ├── category_dictionary.json
│       └── photos/          # 产品图片
├── Dockerfile               # Docker配置文件
├── wxcloud.yaml            # 微信云托管配置
├── .dockerignore           # Docker忽略文件
└── README.md               # 部署说明
```

### 2. 确认CLI工具已安装
```bash
# 检查CLI版本
wxcloud help
```

## 部署步骤

### 1. 登录微信云托管
```bash
cd web
wxcloud login
```
按提示输入：
- 微信AppID: `您的微信公众号AppID`
- 选择环境: `jiemingda-0g8ddwgk28c2ff66`

### 2. 初始化项目（可选）
```bash
wxcloud init
```

### 3. 执行部署
```bash
wxcloud run deploy
```

或者使用完整部署命令：
```bash
wxcloud run deploy --env-id jiemingda-0g8ddwgk28c2ff66 --name jiemingda-web
```

## 配置文件说明

### wxcloud.yaml 配置
```yaml
name: jiemingda-product-catalog-web
region: ap-shanghai

service:
  name: jiemingda-web
  version: v1.0.0
  
container:
  name: jiemingda-product-catalog
  image: nginx:alpine
  port: 80
  cpu: 0.25
  memory: 512Mi
  
  env:
    - name: NODE_ENV
      value: production
    - name: WX_CLOUD_ENV_ID  
      value: jiemingda-0g8ddwgk28c2ff66

build:
  context: .
  dockerfile: Dockerfile

deploy:
  auto_release: true
  traffic_percent: 100
```

### Dockerfile 配置
- 基于 `nginx:alpine` 镜像
- 复制 `src/` 目录到nginx根目录
- 配置nginx支持SPA路由
- 设置静态资源缓存策略
- 添加安全响应头

## 部署后验证

### 1. 检查服务状态
```bash
wxcloud service list --env-id jiemingda-0g8ddwgk28c2ff66
```

### 2. 获取访问地址
```bash
wxcloud run list --env-id jiemingda-0g8ddwgk28c2ff66
```

### 3. 测试访问
通过返回的域名地址访问应用，确认：
- 页面正常加载
- 商品数据正常显示
- 图片资源正常加载
- 搜索功能正常工作

## 公众号菜单配置

部署成功后，可以在微信公众号后台配置菜单：

1. 登录微信公众号管理后台
2. 进入 "自定义菜单" 
3. 添加菜单项：
   - 菜单名称: `产品目录`
   - 菜单类型: `跳转网页`
   - 页面地址: `https://您的云托管域名`

## 常见问题

### 1. 部署失败
- 检查wxcloud.yaml配置是否正确
- 确认环境ID是否正确
- 检查网络连接

### 2. 图片无法显示
- 确认 `src/data/photos/` 目录包含所有图片文件
- 检查图片文件名是否与数据库中的记录匹配

### 3. 数据无法加载
- 确认 JSON 数据文件格式正确
- 检查 nginx 配置是否正确处理静态文件

## 更新部署

当需要更新应用时：
```bash
# 1. 更新代码或数据
# 2. 重新部署
wxcloud run deploy --env-id jiemingda-0g8ddwgk28c2ff66 --name jiemingda-web

# 3. 查看部署日志
wxcloud run logs --env-id jiemingda-0g8ddwgk28c2ff66 --name jiemingda-web
```

## 技术支持

如遇到部署问题，请检查：
1. 微信云托管官方文档
2. CLI工具版本是否最新
3. 网络连接是否正常
4. 微信开发者账号权限是否充足