/**
 * CloudBase 配置文件
 * 用于管理云数据库环境配置和数据模型定义
 */

// CloudBase 环境配置
const CLOUDBASE_CONFIG = {
  // 环境ID - 替换为您的实际环境ID
  envId: 'cloud1-0gc8cbzg3efd6a99',

  // 数据库配置
  database: {
    // 产品数据集合名称
    productsCollection: 'products',

    // 配置数据集合名称
    configCollection: 'config',

    // 默认文档ID
    catalogDocId: 'catalog-data',
    configDocId: 'category-config'
  },

  // MySQL数据库配置
  mysql: {
    // 数据库连接URL - 请替换YOUR_PASSWORD和YOUR_DATABASE_NAME为实际值
    // 格式: mysql://username:password@host:port/database
    // 示例: mysql://skaiy_diao:your_actual_password@sh-cynosdbmysql-grp-94slsv2s.sql.tencentcdb.com:21976/your_database_name
    databaseUrl: 'mysql://skaiy_diao:Skaiy.290823@sh-cynosdbmysql-grp-94slsv2s.sql.tencentcdb.com:21976/cloud1-0gc8cbzg3efd6a99',

    // 云函数名称
    queryFunction: 'mysqlQuery',
    seedFunction: 'mysqlSeed2'
  },

  // 数据源配置 - 'cloudbase' 或 'mysql'
  dataSource: 'mysql',

  // 数据模型配置
  models: {
    // 产品数据模型名称
    products: 'products',

    // 配置数据模型名称
    config: 'config'
  },

  // 认证配置
  auth: {
    // 持久化方式: 'local' | 'session' | 'none'
    persistence: 'local',

    // 是否使用匿名登录
    anonymousAuth: true
  }
};

// 数据结构定义
const DATA_SCHEMA = {
  // 产品目录数据结构
  catalog: {
    _id: 'string',           // 文档ID
    categories: [            // 分类数组
      {
        name: 'string',      // 分类名称
        items: [             // 商品数组
          {
            name: 'string',        // 商品名称
            spec: 'string',        // 规格
            unit: 'string',        // 单位
            brand: 'string',       // 品牌
            description: 'string', // 描述
            price: 'string',       // 价格
            image: 'string'        // 图片
          }
        ]
      }
    ],
    updatedAt: 'timestamp',  // 更新时间
    version: 'string'        // 数据版本
  },
  
  // 分类配置数据结构
  config: {
    _id: 'string',           // 文档ID
    type: 'string',          // 配置类型
    data: {                  // 配置数据
      categories: [          // 分类数组
        {
          id: 'string',      // 分类ID（英文）
          name: 'string',    // 分类名称（中文）
          shortName: 'string', // 分类短名称
          slug: 'string'     // URL友好的标识符
        }
      ]
    },
    createdAt: 'timestamp',  // 创建时间
    updatedAt: 'timestamp'   // 更新时间
  }
};

// 导出配置（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CLOUDBASE_CONFIG,
    DATA_SCHEMA
  };
}

// 全局变量（如果在浏览器环境中）
if (typeof window !== 'undefined') {
  window.CLOUDBASE_CONFIG = CLOUDBASE_CONFIG;
  window.DATA_SCHEMA = DATA_SCHEMA;
}