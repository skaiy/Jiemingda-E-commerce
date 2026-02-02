// pages/index/index.js - 首页逻辑
const app = getApp();

Page({
  data: {
    loading: true,
    products: [],
    categories: [],
    currentCategoryId: null,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.loadCategories();
    this.loadProducts();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadProducts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载分类数据
  async loadCategories() {
    // 优先使用全局缓存
    if (app.globalData.categories.length > 0) {
      this.setData({ categories: app.globalData.categories });
      return;
    }

    try {
      const res = await app.callCloudFunction('mysqlQuery', { action: 'categories' });
      if (res && res.ok) {
        const categories = res.data?.categoryDictionary?.categories || [];
        this.setData({ categories });
        app.globalData.categories = categories;
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  },

  // 加载产品数据
  async loadProducts(append = false) {
    if (!append) {
      this.setData({ loading: true });
    }

    try {
      const params = {
        action: 'products',
        page: this.data.page,
        pageSize: this.data.pageSize
      };

      if (this.data.currentCategoryId) {
        params.categoryId = this.data.currentCategoryId;
      }

      const res = await app.callCloudFunction('mysqlQuery', params);
      
      if (res && res.ok) {
        let products = [];
        
        // 解析产品数据结构
        if (res.data?.categories) {
          res.data.categories.forEach(category => {
            if (category.items) {
              category.items.forEach(product => {
                products.push({
                  ...product,
                  categoryName: category.name
                });
              });
            }
          });
        } else if (res.data?.products) {
          products = res.data.products;
        }

        if (append) {
          this.setData({
            products: [...this.data.products, ...products],
            hasMore: products.length >= this.data.pageSize
          });
        } else {
          this.setData({
            products: products,
            hasMore: products.length >= this.data.pageSize
          });
        }
      }
    } catch (error) {
      console.error('加载产品失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 选择分类
  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      currentCategoryId: categoryId,
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ page: this.data.page + 1 });
    this.loadProducts(true);
  },

  // 跳转到搜索页
  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  // 跳转到产品详情
  goToProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product/product?id=${id}` });
  }
});
