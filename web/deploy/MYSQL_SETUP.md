# MySQL数据库配置指南

本指南将帮助您配置程序使用MySQL数据库作为数据源。

## 1. 数据库信息

根据您提供的信息：

- **内网地址**: 10.11.104.130:3306
- **外网地址**: sh-cynosdbmysql-grp-94slsv2s.sql.tencentcdb.com:21976
- **账号名**: skaiy_diao
- **密码**: [需要您提供]
- **数据库名**: [需要您创建或指定]

## 2. 配置步骤

### 步骤1: 更新配置文件

编辑 `cloudbase.config.js` 文件，更新MySQL配置：

```javascript
mysql: {
  // 数据库连接URL - 请替换YOUR_PASSWORD和YOUR_DATABASE_NAME
  databaseUrl: 'mysql://skaiy_diao:YOUR_PASSWORD@sh-cynosdbmysql-grp-94slsv2s.sql.tencentcdb.com:21976/YOUR_DATABASE_NAME',
  
  // 云函数名称
  queryFunction: 'mysqlQuery',
  seedFunction: 'mysqlSeed2'
},

// 数据源配置 - 设置为 'mysql'
dataSource: 'mysql',
```

### 步骤2: 部署云函数

运行以下命令部署云函数：

```bash
cd web/deploy
cloudbase deploy
```

### 步骤3: 初始化数据库

1. 打开浏览器访问: `https://your-domain.com/mysql-setup.html`
2. 输入正确的数据库连接URL和密码
3. 点击"测试连接"确保连接正常
4. 点击"初始化数据库"创建表结构
5. 点击"导入数据"导入产品数据

### 步骤4: 验证配置

1. 点击"查询数据"验证数据导入成功
2. 访问主页面确认数据正常显示

## 3. 数据库表结构

系统会自动创建以下表：

- **Brand**: 品牌表
- **Category**: 分类表
- **Product**: 产品表
- **ProductImage**: 产品图片表

## 4. 云函数说明

### mysqlSeed2
- 用途: 数据库初始化和数据导入
- 支持操作: test, init, seed, query, categories, brands

### mysqlQuery
- 用途: 前端数据查询
- 支持操作: products, config, brands, categories

## 5. 故障排除

### 连接失败
- 检查数据库URL格式是否正确
- 确认密码和数据库名是否正确
- 检查网络连接

### 数据导入失败
- 确保数据库表结构已初始化
- 检查数据文件格式是否正确
- 查看云函数日志获取详细错误信息

### 前端显示异常
- 确认dataSource配置为'mysql'
- 检查云函数是否部署成功
- 查看浏览器控制台错误信息

## 6. 性能优化建议

1. **索引优化**: 为常用查询字段添加索引
2. **连接池**: 云函数已配置连接池，无需额外配置
3. **缓存**: 考虑添加Redis缓存层提升查询性能
4. **分页**: 对于大量数据，建议实现分页查询

## 7. 安全注意事项

1. **密码安全**: 不要在代码中硬编码数据库密码
2. **访问控制**: 配置数据库访问白名单
3. **SSL连接**: 建议启用SSL连接
4. **权限最小化**: 数据库用户只授予必要权限

## 8. 监控和维护

1. **性能监控**: 监控数据库连接数和查询性能
2. **日志记录**: 启用慢查询日志
3. **备份策略**: 定期备份数据库
4. **版本更新**: 定期更新依赖包版本
