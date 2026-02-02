// pages/product/product.js - 产品详情页逻辑
const app = getApp();

Page({
  data: {
    loading: true,
    product: null,
    productId: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ productId: options.id });
      this.loadProduct(options.id);
    } else {
      wx.showToast({ title: '缺少产品ID', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  async loadProduct(id) {
    this.setData({ loading: true });
    
    try {
      const res = await app.callCloudFunction('productCRUD', {
        action: 'get',
        id: parseInt(id)
      });

      if (res && res.ok && res.data) {
        this.setData({ product: res.data });
        
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: res.data.name || '产品详情'
        });
      } else {
        wx.showToast({ title: '产品不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (error) {
      console.error('加载产品详情失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 预览图片
  previewImage() {
    const imageUrl = this.data.product?.imageUrl || this.data.product?.image;
    if (imageUrl) {
      wx.previewImage({
        current: imageUrl,
        urls: [imageUrl]
      });
    }
  },

  // 分享
  onShareAppMessage() {
    const product = this.data.product;
    return {
      title: product?.name || '捷明达产品目录',
      path: `/pages/product/product?id=${this.data.productId}`,
      imageUrl: product?.imageUrl || product?.image
    };
  }
});
