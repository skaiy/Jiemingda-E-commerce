// app.js - 捷明达产品目录小程序入口
const dataService = require('./utils/dataService');

App({
  globalData: {
    envId: 'cloud1-0gc8cbzg3efd6a99',
    dataService: dataService
  },

  onLaunch() {
    // 预加载数据
    const categories = dataService.getCategories();
    console.log(`[App] 已加载 ${categories.length} 个分类`);
    const products = dataService.getAllProducts();
    console.log(`[App] 已加载 ${products.length} 个产品`);
  }
});
