# 微信小程序版部署指南

## 概述

小程序版提供原生的移动端产品目录浏览体验，支持微信生态内的分享和交互功能。

## 目录结构

```
miniprogram/
├── pages/                 # 页面目录
│   ├── index/            # 产品目录主页
│   ├── category/         # 分类浏览页
│   └── product/          # 产品详情页
├── components/           # 组件目录
│   ├── product-card/     # 产品卡片
│   ├── category-nav/     # 分类导航
│   └── image-viewer/     # 图片查看器
├── utils/                # 工具类
│   ├── api.js           # API服务
│   ├── cloudbase.js     # CloudBase封装
│   └── storage.js       # 本地存储
├── data/                 # 本地数据
│   └── local-fallback.js # 数据备份
├── static/               # 静态资源
│   ├── images/          # 图标和图片
│   └── styles/          # 样式文件
├── app.js                # 小程序入口
├── app.json              # 小程序配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置
└── sitemap.json          # 搜索配置
```

## 开发环境配置

### 1. 安装微信开发者工具

下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram/` 目录
4. 输入项目名称和AppID

### 3. 配置CloudBase

在 `app.js` 中配置CloudBase环境：

```javascript
globalData: {
  cloudbaseConfig: {
    envId: 'cloud1-0gc8cbzg3efd6a99',
    region: 'ap-shanghai'
  }
}
```

## 云开发配置

### 1. 开通云开发

在微信开发者工具中：
1. 点击"云开发"按钮
2. 开通云开发服务
3. 创建或关联现有环境

### 2. 数据库配置

数据库集合结构：
- `products` 集合：产品数据
- `config` 集合：分类配置

### 3. 权限配置

数据库权限设置为"所有用户可读"：

```json
{
  "read": true,
  "write": false
}
```

## 部署流程

### 1. 本地测试

```bash
# 在开发者工具中预览
# 检查所有功能正常
# 验证数据加载
```

### 2. 提交审核

1. 在开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 登录微信公众平台
4. 提交审核

### 3. 发布上线

审核通过后：
1. 在微信公众平台点击"发布"
2. 确认发布信息
3. 正式上线

## 配置文件详解

### app.json
```json
{
  "pages": ["pages/index/index", "pages/category/category", "pages/product/product"],
  "window": {
    "navigationBarTitleText": "捷明达产品目录",
    "backgroundColor": "#f7f7f8"
  },
  "tabBar": {
    "list": [
      {"pagePath": "pages/index/index", "text": "产品目录"},
      {"pagePath": "pages/category/category", "text": "分类浏览"}
    ]
  }
}
```

### project.config.json
```json
{
  "appid": "wx1234567890abcdef",
  "projectname": "jiemingda-catalog-miniprogram",
  "libVersion": "2.19.4",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true
  }
}
```

## 数据同步

### 共享数据源

小程序与网页版共享相同的CloudBase数据库：
- 产品数据来源：`shared/data/products.json`
- 分类配置：`shared/data/category_config.json`
- 图片资源：需要上传到小程序static目录

### 数据更新流程

1. 更新 `shared/data/` 中的数据文件
2. 运行网页版的数据库更新脚本
3. 小程序自动获取最新数据
4. 如有新图片，需重新上传小程序

## 静态资源管理

### 图片处理

```bash
# 复制共享图片到小程序目录
cp -r ../shared/data/photos/* static/images/products/
cp -r ../shared/data/banners/* static/images/banners/
```

### 图片优化

- 压缩图片以减小包体积
- 推荐使用WebP格式
- 大图片可以使用网络链接

## 性能优化

### 代码分包

```json
{
  "subpackages": [
    {
      "root": "pages/product/",
      "pages": ["product"]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "packages": ["pages/product/"]
    }
  }
}
```

### 懒加载

- 启用图片懒加载
- 分页加载产品数据
- 组件按需加载

## 监控和分析

### 小程序数据助手

- 访问量统计
- 用户行为分析
- 性能监控

### 自定义埋点

```javascript
// 产品查看统计
wx.reportAnalytics('product_view', {
  product_id: productId,
  category: categoryName
});
```

## 注意事项

1. **包体积限制**：单包不超过2MB，总包不超过20MB
2. **域名配置**：在微信公众平台配置服务器域名
3. **用户隐私**：遵守微信小程序用户隐私规范
4. **版本兼容**：考虑不同微信版本的兼容性

## 发布检查清单

- [ ] 所有页面功能正常
- [ ] 数据加载完整
- [ ] 图片显示正确
- [ ] 分享功能正常
- [ ] 性能表现良好
- [ ] 符合微信规范
- [ ] 用户体验流畅