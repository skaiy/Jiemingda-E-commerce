// pages/category/category.js - 分类页逻辑
const app = getApp();

Page({
  data: {
    loading: true,
    categories: []
  },

  onLoad() {
    this.loadCategories();
  },

  async loadCategories() {
    this.setData({ loading: true });
    
    try {
      // 优先使用全局缓存
      if (app.globalData.categories.length > 0) {
        this.setData({ 
          categories: app.globalData.categories,
          loading: false 
        });
        return;
      }

      const res = await app.callCloudFunction('mysqlQuery', { action: 'categories' });
      if (res && res.ok) {
        const categories = res.data?.categoryDictionary?.categories || [];
        this.setData({ categories });
        app.globalData.categories = categories;
      }
    } catch (error) {
      console.error('加载分类失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  selectCategory(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/index/index?categoryId=${id}&categoryName=${encodeURIComponent(name)}`
    });
  }
});
