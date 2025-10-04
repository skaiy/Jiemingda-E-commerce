# 代码库重构计划

## 新目录结构设计

```
01.dev/
├── shared/                    # 共享资源目录
│   ├── data/                  # 共享数据文件
│   │   ├── products.json      # 产品数据
│   │   ├── category_config.json # 分类配置
│   │   └── photos/            # 产品图片
│   ├── config/                # 共享配置文件
│   │   ├── cloudbase.config.js # CloudBase基础配置
│   │   └── database-schemas/   # 数据库模式定义
│   └── utils/                 # 共享工具函数
│       ├── data-loader.js     # 数据加载工具
│       └── image-utils.js     # 图片处理工具
├── web/                       # 网页版独立目录
│   ├── src/                   # 网页版源代码
│   │   ├── index.html         # 主页面
│   │   ├── styles/            # CSS样式
│   │   ├── scripts/           # JavaScript代码
│   │   └── components/        # 组件模块
│   ├── functions/             # 云函数
│   │   └── initDatabase/      # 数据库初始化函数
│   ├── deploy/                # 部署相关文件
│   │   ├── cloudbaserc.json   # CloudBase部署配置
│   │   └── deploy-scripts/    # 部署脚本
│   └── tools/                 # 开发工具
│       ├── init-database.html # 数据库管理页面
│       └── migrate-data.html  # 数据迁移工具
├── miniprogram/               # 微信小程序版独立目录
│   ├── pages/                 # 小程序页面
│   │   ├── index/             # 主页面
│   │   ├── category/          # 分类页面
│   │   └── product/           # 产品详情页面
│   ├── components/            # 小程序组件
│   │   ├── product-card/      # 产品卡片组件
│   │   ├── category-nav/      # 分类导航组件
│   │   └── image-viewer/      # 图片查看器组件
│   ├── utils/                 # 小程序工具函数
│   │   ├── api.js             # API请求封装
│   │   ├── storage.js         # 本地存储
│   │   └── cloudbase.js       # CloudBase SDK封装
│   ├── data/                  # 小程序本地数据
│   │   └── local-fallback.js  # 本地数据备份
│   ├── static/                # 静态资源
│   │   ├── images/            # 图标等静态图片
│   │   └── styles/            # WXSS样式文件
│   ├── app.js                 # 小程序入口文件
│   ├── app.json               # 小程序配置文件
│   ├── app.wxss               # 全局样式
│   └── project.config.json    # 小程序项目配置
├── docs/                      # 文档目录
│   ├── web-deployment.md      # 网页版部署文档
│   ├── miniprogram-setup.md   # 小程序配置文档
│   └── api-documentation.md   # API文档
├── CLAUDE.md                  # Claude工作指南
└── README.md                  # 项目总体说明
```

## 重构步骤

1. **创建新目录结构** - 建立上述目录框架
2. **移动网页版文件** - 将现有文件按模块移动到web目录
3. **提取共享资源** - 将数据、配置等提取到shared目录
4. **创建小程序版本** - 基于网页版功能创建小程序版本
5. **配置独立部署** - 为两个版本配置独立的部署流程

## 版本对应关系

| 功能模块 | 网页版文件 | 小程序版对应 |
|---------|-----------|-------------|
| 产品展示 | index.html | pages/index/index |
| 分类导航 | 侧边栏组件 | components/category-nav |
| 产品详情 | 弹窗组件 | pages/product/product |
| 数据加载 | CloudBase API | utils/api.js |
| 图片展示 | CSS Grid | 小程序image组件 |

## 数据模式保持一致

两个版本将共享相同的：
- 产品数据结构 (products.json)
- 分类配置 (category_config.json)  
- CloudBase数据库模式
- 图片资源路径规范