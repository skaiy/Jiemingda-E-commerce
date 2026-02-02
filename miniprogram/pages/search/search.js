// pages/search/search.js
const app = getApp();

Page({
  data: {
    keyword: '',
    products: [],
    loading: false,
    searched: false
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  clearKeyword() {
    this.setData({ keyword: '', products: [], searched: false });
  },

  async doSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;

    this.setData({ loading: true, searched: true });

    try {
      const res = await app.searchProducts(keyword);
      if (res && res.ok) {
        this.setData({ products: res.data?.products || [] });
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  goToProduct(e) {
    wx.navigateTo({ url: `/pages/product/product?id=${e.currentTarget.dataset.id}` });
  },

  goBack() {
    wx.navigateBack();
  }
});
