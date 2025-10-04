# 网页版部署指南

## 概述

网页版基于CloudBase（腾讯云云开发），提供响应式的产品目录浏览体验。

## 目录结构

```
web/
├── src/                    # 源代码
│   ├── index.html         # 主页面
│   ├── styles/            # CSS样式
│   ├── scripts/           # JavaScript代码
│   └── components/        # 组件模块
├── functions/             # 云函数
│   └── initDatabase/      # 数据库初始化
├── deploy/                # 部署配置
│   ├── cloudbaserc.json   # CloudBase配置
│   └── deploy-scripts/    # 部署脚本
├── tools/                 # 开发工具
│   ├── init-database.html # 数据库管理
│   └── migrate-data.html  # 数据迁移
├── package.json           # 依赖配置
└── README.md             # 说明文档
```

## 环境配置

### 1. 安装CloudBase CLI

```bash
npm install -g @cloudbase/cli
```

### 2. 登录CloudBase

```bash
tcb login
```

### 3. 初始化环境

```bash
cd web/
npm install
```

## 部署命令

### 完整部署

```bash
# 部署所有文件
tcb hosting deploy

# 或使用framework方式
cloudbase framework deploy
```

### 分步部署

```bash
# 仅部署静态文件
tcb hosting deploy src/

# 部署云函数
tcb functions deploy initDatabase

# 部署特定页面
tcb hosting deploy tools/init-database.html
```

### 数据库管理

```bash
# 本地生成数据库脚本
node init-db-local.js

# 部署数据库初始化函数
tcb functions deploy initDatabase

# 执行数据库初始化
tcb functions invoke initDatabase
```

## 配置文件

### cloudbaserc.json
- 环境ID：`cloud1-0gc8cbzg3efd6a99`
- 区域：`ap-shanghai`
- 部署目标：静态网站托管 + 云函数

### package.json
包含所需的开发依赖和部署脚本

## 注意事项

1. **数据权限**：生产环境数据库为只读权限
2. **数据更新**：需通过云函数或管理员权限操作
3. **CDN加速**：静态资源自动启用CDN加速
4. **HTTPS**：默认启用HTTPS访问

## 监控和维护

- 使用CloudBase控制台监控访问量和性能
- 定期检查云函数执行日志
- 监控数据库读写频次