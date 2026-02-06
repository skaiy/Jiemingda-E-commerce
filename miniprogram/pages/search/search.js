// pages/search/search.js - 搜索页
const app = getApp();

Page({
  data: {
    keyword: '',
    results: [],
    searched: false,
    hotCategories: []
  },

  onLoad() {
    // 显示热门分类作为快捷入口
    const ds = app.globalData.dataService;
    const categories = ds.getCategories();
    // 取产品数最多的前8个分类
    const hot = categories
      .slice()
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 8);
    this.setData({ hotCategories: hot });
  },

  onShow() {
    // 页面显示时聚焦搜索框
  },

  // 输入变化
  onInput(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });

    // 实时搜索（输入超过1个字符时）
    if (keyword.trim().length >= 1) {
      this.doSearch(keyword);
    } else {
      this.setData({ results: [], searched: false });
    }
  },

  // 确认搜索
  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;
    this.doSearch(keyword);
  },

  // 执行搜索
  doSearch(keyword) {
    const ds = app.globalData.dataService;
    const results = ds.searchProducts(keyword, 100);
    this.setData({ results, searched: true });
  },

  // 清除搜索
  onClear() {
    this.setData({ keyword: '', results: [], searched: false });
  },

  // 点击热门分类
  onHotCategoryTap(e) {
    const name = e.currentTarget.dataset.name;
    this.setData({ keyword: name });
    this.doSearch(name);
  },

  // 点击产品
  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product/product?id=${id}` });
  }
});
