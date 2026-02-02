// app.js - 捷明达产品目录小程序入口
App({
  globalData: {
    // CloudBase 环境ID
    envId: 'cloud1-0gc8cbzg3efd6a99',
    // MySQL云函数
    queryFunction: 'mysqlQuery',
    productCRUDFunction: 'productCRUD',
    // 缓存数据
    categories: [],
    brands: [],
    products: []
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云开发功能');
      return;
    }
    
    wx.cloud.init({
      env: this.globalData.envId,
      traceUser: true
    });

    // 预加载基础数据
    this.loadBaseData();
  },

  // 加载基础数据（分类和品牌）
  async loadBaseData() {
    try {
      // 加载分类
      const categoriesRes = await this.callCloudFunction('mysqlQuery', { action: 'categories' });
      if (categoriesRes && categoriesRes.ok) {
        this.globalData.categories = categoriesRes.data?.categoryDictionary?.categories || [];
      }

      // 加载品牌
      const brandsRes = await this.callCloudFunction('mysqlQuery', { action: 'brands' });
      if (brandsRes && brandsRes.ok) {
        this.globalData.brands = brandsRes.data?.brandDictionary?.brands || [];
      }
    } catch (error) {
      console.error('加载基础数据失败:', error);
    }
  },

  // 调用云函数封装
  async callCloudFunction(name, data = {}) {
    try {
      const result = await wx.cloud.callFunction({
        name: name,
        data: data
      });
      return result.result;
    } catch (error) {
      console.error(`调用云函数 ${name} 失败:`, error);
      return null;
    }
  },

  // 获取产品列表
  async getProducts(params = {}) {
    return await this.callCloudFunction('mysqlQuery', {
      action: 'products',
      ...params
    });
  },

  // 获取单个产品详情
  async getProductDetail(id) {
    return await this.callCloudFunction('productCRUD', {
      action: 'get',
      id: id
    });
  },

  // 搜索产品
  async searchProducts(keyword) {
    return await this.callCloudFunction('productCRUD', {
      action: 'list',
      search: keyword,
      pageSize: 50
    });
  }
});
