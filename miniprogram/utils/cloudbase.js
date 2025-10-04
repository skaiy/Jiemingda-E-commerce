/**
 * CloudBase SDK 封装
 * 兼容网页版的数据结构和API
 */

class CloudBase {
  constructor(config) {
    this.config = config;
    this.app = null;
    this.db = null;
    this.auth = null;
    this.initialized = false;
  }

  // 初始化CloudBase
  async init() {
    try {
      if (!wx.cloud) {
        console.warn('微信小程序云开发未启用，使用本地数据');
        return false;
      }

      // 初始化云开发
      wx.cloud.init({
        env: this.config.envId,
        traceUser: true
      });

      this.initialized = true;
      console.log('CloudBase 初始化成功');
      return true;
    } catch (error) {
      console.error('CloudBase 初始化失败:', error);
      return false;
    }
  }

  // 获取产品数据
  async getProductData() {
    try {
      if (!this.initialized) {
        const initResult = await this.init();
        if (!initResult) {
          throw new Error('CloudBase初始化失败');
        }
      }

      // 尝试从云数据库获取产品数据
      const db = wx.cloud.database();
      const result = await db.collection('products')
        .doc('catalog-data')
        .get();

      if (result && result.data) {
        console.log('从云数据库获取产品数据成功');
        return result.data;
      }

      throw new Error('云数据库无数据');
    } catch (error) {
      console.warn('CloudBase获取产品数据失败:', error);
      return null;
    }
  }

  // 获取分类配置
  async getCategoryConfig() {
    try {
      if (!this.initialized) {
        const initResult = await this.init();
        if (!initResult) {
          throw new Error('CloudBase初始化失败');
        }
      }

      // 尝试从云数据库获取分类配置
      const db = wx.cloud.database();
      const result = await db.collection('config')
        .doc('category-config')
        .get();

      if (result && result.data) {
        console.log('从云数据库获取分类配置成功');
        return result.data;
      }

      throw new Error('云数据库无配置');
    } catch (error) {
      console.warn('CloudBase获取分类配置失败:', error);
      return null;
    }
  }

  // 检查CloudBase是否可用
  isAvailable() {
    return this.initialized && wx.cloud;
  }
}

module.exports = {
  CloudBase
};