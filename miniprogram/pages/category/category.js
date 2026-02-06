// pages/category/category.js - 分类浏览页
const app = getApp();

Page({
  data: {
    categories: [],
    currentIndex: 0,
    currentCode: '',
    products: [],
    scrollTop: 0
  },

  onLoad() {
    const ds = app.globalData.dataService;
    const categories = ds.getCategories();

    if (categories.length > 0) {
      this.setData({
        categories,
        currentIndex: 0,
        currentCode: categories[0].code
      });
      this.loadCategoryProducts(categories[0].code);
    }
  },

  // 切换分类
  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index;
    const cat = this.data.categories[index];
    if (!cat || index === this.data.currentIndex) return;

    this.setData({
      currentIndex: index,
      currentCode: cat.code,
      scrollTop: 0
    });
    this.loadCategoryProducts(cat.code);
  },

  // 加载分类产品
  loadCategoryProducts(categoryCode) {
    const ds = app.globalData.dataService;
    // 加载该分类全部产品（分类页不分页）
    const result = ds.getProductsByCategory(categoryCode, 1, 999);
    this.setData({ products: result.list });
  },

  // 跳转产品详情
  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product/product?id=${id}` });
  }
});
