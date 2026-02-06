// pages/product/product.js - 产品详情页
const app = getApp();

Page({
  data: {
    product: null,
    relatedProducts: []
  },

  onLoad(options) {
    const id = options.id;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }

    const ds = app.globalData.dataService;
    const product = ds.getProductById(id);

    if (!product) {
      wx.showToast({ title: '产品不存在', icon: 'none' });
      return;
    }

    // 设置页面标题
    wx.setNavigationBarTitle({ title: product.name });

    // 获取同分类推荐产品（排除自身，最多6个）
    const result = ds.getProductsByCategory(product.categoryCode, 1, 7);
    const related = result.list
      .filter(p => p.id !== product.id)
      .slice(0, 6);

    this.setData({ product, relatedProducts: related });
  },

  // 复制产品编码
  onCopyCode() {
    const code = this.data.product.productCode;
    wx.setClipboardData({
      data: code,
      success() {
        wx.showToast({ title: '已复制编码', icon: 'success' });
      }
    });
  },

  // 联系客服（拨打电话或预留）
  onContact() {
    wx.showActionSheet({
      itemList: ['复制产品信息'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const p = this.data.product;
          const info = `产品: ${p.name}\n规格: ${p.spec}\n品牌: ${p.brand}\n编码: ${p.productCode}`;
          wx.setClipboardData({
            data: info,
            success() {
              wx.showToast({ title: '已复制', icon: 'success' });
            }
          });
        }
      }
    });
  },

  // 跳转推荐产品
  onRelatedTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({ url: `/pages/product/product?id=${id}` });
  },

  // 分享
  onShareAppMessage() {
    const p = this.data.product;
    return {
      title: `${p.name} - 捷明达产品目录`,
      path: `/pages/product/product?id=${p.id}`
    };
  }
});
