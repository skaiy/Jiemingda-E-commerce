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
    banner_slugs: 'object',  // 分类横幅映射
    short_names: 'object',   // 分类短名称映射
    updatedAt: 'timestamp',  // 更新时间
    version: 'string'        // 配置版本
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