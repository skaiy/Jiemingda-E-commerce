const cloudbase = require('@cloudbase/node-sdk');

// 初始化CloudBase
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

const db = app.database();

exports.main = async (event, context) => {
  try {
    console.log('开始初始化数据库...');
    
    // 获取产品数据
    const productsData = require('./data/products.json');
    const configData = require('./data/category_config.json');
    
    // 初始化products集合
    const productsCollection = db.collection('products');
    
    // 检查是否已存在数据
    const existingProducts = await productsCollection.doc('catalog-data').get();
    
    if (!existingProducts.data.length) {
      // 插入产品数据
      await productsCollection.doc('catalog-data').set({
        data: productsData,
        updateTime: new Date(),
        version: '1.0.0'
      });
      console.log('产品数据初始化完成');
    } else {
      console.log('产品数据已存在，跳过初始化');
    }
    
    // 初始化config集合
    const configCollection = db.collection('config');
    
    // 检查是否已存在配置数据
    const existingConfig = await configCollection.doc('category-config').get();
    
    if (!existingConfig.data.length) {
      // 插入配置数据
      await configCollection.doc('category-config').set({
        data: configData,
        updateTime: new Date(),
        version: '1.0.0'
      });
      console.log('配置数据初始化完成');
    } else {
      console.log('配置数据已存在，跳过初始化');
    }
    
    return {
      success: true,
      message: '数据库初始化完成',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};