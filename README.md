# 捷明达产品目录 - 多平台版本

一个完整的产品目录管理系统，包含网页版和微信小程序版，提供一致的用户体验和数据模式。

## 项目概述

本项目为捷明达烘焙产品提供跨平台的产品目录浏览解决方案：

- **网页版**：响应式Web应用，适配桌面和移动端浏览器
- **小程序版**：微信原生小程序，提供流畅的移动端体验
- **共享数据**：两个版本使用相同的数据源和CloudBase后端

## 目录结构

```
01.dev/
├── shared/                    # 共享资源
│   ├── data/                  # 共享数据文件
│   │   ├── products.json      # 产品数据 (387个产品)
│   │   ├── category_config.json # 分类配置 (22个分类)
│   │   └── photos/            # 产品图片资源
│   ├── config/                # 共享配置
│   └── utils/                 # 共享工具
├── web/                       # 网页版
│   ├── src/                   # 源代码
│   ├── functions/             # 云函数
│   ├── deploy/                # 部署配置
│   └── tools/                 # 开发工具
├── miniprogram/               # 微信小程序版
│   ├── pages/                 # 小程序页面
│   ├── components/            # 小程序组件
│   ├── utils/                 # 工具类
│   └── static/                # 静态资源
├── docs/                      # 项目文档
├── CLAUDE.md                  # Claude工作指南
└── README.md                  # 项目总览
```

## 功能特性

### 核心功能
- ✅ 产品分类浏览（22个分类）
- ✅ 产品搜索（支持名称、品牌、规格搜索）
- ✅ 产品详情查看
- ✅ 响应式界面设计
- ✅ 数据实时同步

### 网页版特性
- 🌐 响应式设计，支持桌面和移动端
- 🎨 分类Banner展示
- 🔍 高级搜索筛选
- 📱 触控优化交互
- ⚡ CDN加速访问

### 小程序版特性
- 📱 原生小程序体验
- 🔄 微信生态分享
- 💾 离线数据缓存
- 🎯 一键联系客服
- 📊 用户行为统计

## 技术架构

### 后端架构
- **CloudBase**：腾讯云云开发平台
- **数据库**：CloudBase文档数据库
- **云函数**：数据初始化和管理
- **存储**：静态资源CDN存储

### 网页版技术栈
- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **UI框架**：响应式Grid布局
- **数据获取**：CloudBase Web SDK v2.17.3
- **部署**：CloudBase静态网站托管

### 小程序版技术栈
- **框架**：微信小程序原生框架
- **UI**：WXSS + Flexbox布局
- **数据管理**：CloudBase小程序SDK
- **状态管理**：页面级状态 + 全局数据

## 数据模式

### 产品数据结构
```json
{
  "categories": [
    {
      "name": "冷冻糕点半成品",
      "items": [
        {
          "id": "prd3",
          "name": "黄金酥饼",
          "brand": "捷明达",
          "spec": "20个/盒",
          "unit": "盒",
          "price": "28.00",
          "image": "prd3.png",
          "description": "产品描述"
        }
      ]
    }
  ]
}
```

### 分类配置结构
```json
{
  "categories": [
    {
      "name": "冷冻糕点半成品",
      "shortName": "冷冻糕点",
      "slug": "frozen-pastries-semi-finished"
    }
  ]
}
```

## 快速开始

### 网页版部署

```bash
# 1. 进入网页版目录
cd web/

# 2. 安装依赖
npm install

# 3. 登录CloudBase
tcb login

# 4. 部署应用
tcb hosting deploy

# 5. 初始化数据库
tcb functions deploy initDatabase
tcb functions invoke initDatabase
```

### 小程序版部署

```bash
# 1. 打开微信开发者工具
# 2. 导入项目：选择 miniprogram/ 目录
# 3. 配置AppID和云开发环境
# 4. 预览测试
# 5. 上传代码并提交审核
```

## 环境配置

### CloudBase环境
- **环境ID**：`cloud1-0gc8cbzg3efd6a99`
- **区域**：`ap-shanghai`
- **数据库**：
  - `products` 集合：产品数据
  - `config` 集合：分类配置

### 访问地址
- **网页版**：https://cloud1-0gc8cbzg3efd6a99-1251221636.tcloudbaseapp.com
- **小程序版**：通过微信搜索或扫码访问

## 开发指南

### 数据更新流程

1. **更新源数据**
   ```bash
   # 编辑共享数据文件
   vim shared/data/products.json
   vim shared/data/category_config.json
   ```

2. **同步到数据库**
   ```bash
   # 网页版数据库初始化
   cd web/
   node init-db-local.js
   tcb functions invoke initDatabase
   ```

3. **更新小程序资源**
   ```bash
   # 复制新增图片到小程序
   cp shared/data/photos/* miniprogram/static/images/products/
   ```

### 版本发布流程

1. **测试验证**
   - 网页版本地测试
   - 小程序开发者工具预览
   - 功能完整性检查

2. **部署上线**
   - 网页版：`tcb hosting deploy`
   - 小程序版：微信开发者工具上传 → 提交审核 → 发布

3. **监控验证**
   - CloudBase控制台监控
   - 小程序数据助手
   - 用户反馈收集

## 维护指南

### 性能监控
- CloudBase访问量统计
- 小程序性能分析
- 数据库读写监控

### 数据备份
- 定期导出数据库数据
- 图片资源备份
- 配置文件版本控制

### 问题排查
- CloudBase云函数日志
- 小程序错误日志
- 用户反馈分析

## 贡献指南

1. 遵循现有代码风格
2. 保持两个版本功能一致性
3. 更新相关文档
4. 充分测试后提交

## 许可证

本项目仅用于捷明达内部产品展示，不对外开源。

## 联系方式

- 技术支持：通过Claude Code工具进行代码维护
- 业务咨询：请联系捷明达相关负责人

---

**注意**：此项目需要有效的CloudBase环境和微信小程序账号才能正常运行。