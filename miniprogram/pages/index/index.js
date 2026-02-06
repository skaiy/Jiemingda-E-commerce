// pages/index/index.js - 首页
const app = getApp();

Page({
  data: {
    categories: [],
    currentCategory: '',
    products: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },

  onLoad() {
    const ds = app.globalData.dataService;
    const categories = ds.getCategories();
    this.setData({ categories });
    this.loadProducts();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadProducts();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadProducts(true);
    }
  },

  // 加载产品
  loadProducts(append = false) {
    this.setData({ loading: true });
    const ds = app.globalData.dataService;
    const result = ds.getProductsByCategory(
      this.data.currentCategory || null,
      this.data.page,
      this.data.pageSize
    );

    this.setData({
      products: append ? [...this.data.products, ...result.list] : result.list,
      hasMore: result.hasMore,
      loading: false
    });
  },

  // 选择分类
  onCategoryTap(e) {
    const code = e.currentTarget.dataset.code;
    this.setData({
      currentCategory: code === this.data.currentCategory ? '' : code,
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  // 跳转搜索
  onSearchTap() {
    wx.switchTab({ url: '/pages/search/search' });
  },

  // 跳转产品详情
  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product/product?id=${id}` });
  }
});
