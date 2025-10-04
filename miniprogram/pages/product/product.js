// pages/product/product.js
const apiService = require('../../utils/api.js');

Page({
  data: {
    // 产品数据
    product: {},
    relatedProducts: [],
    
    // 状态
    loading: true,
    error: '',
    showImagePreview: false,
    
    // 页面参数
    productId: ''
  },

  onLoad(options) {
    console.log('产品详情页加载', options);
    
    if (options.id) {
      this.setData({
        productId: options.id
      });
      this.loadProductDetail();
    } else {
      this.setData({
        loading: false,
        error: '产品ID不能为空'
      });
    }
  },

  onReady() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '产品详情'
    });
  },

  onShow() {
    // 页面显示时可以检查数据更新
  },

  // 分享配置
  onShareAppMessage() {
    const product = this.data.product;
    return {
      title: `${product.name || '产品详情'} - 捷明达产品目录`,
      path: `/pages/product/product?id=${this.data.productId}`,
      imageUrl: product.imageUrl || '/static/images/share-default.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const product = this.data.product;
    return {
      title: `${product.name || '产品详情'} - 捷明达产品目录`,
      query: `id=${this.data.productId}`,
      imageUrl: product.imageUrl || '/static/images/share-default.png'
    };
  },

  // 加载产品详情
  async loadProductDetail() {
    try {
      this.setData({ loading: true, error: '' });

      // 等待数据加载完成
      if (!apiService.isDataLoaded()) {
        await this.waitForDataLoaded();
      }

      const product = apiService.getProductDetail(this.data.productId);
      
      if (!product) {
        throw new Error('产品不存在');
      }

      // 准备产品数据
      const productWithImage = {
        ...product,
        imageUrl: apiService.getProductImageUrl(product.image),
        spec: product.spec || this.extractSpec(product.description),
        unit: product.unit || this.extractUnit(product.description),
        brandName: apiService.getBrandName(product.brandCode || '099'),
        categoryNameFromDict: apiService.getCategoryName(product.categoryCode || '099')
      };

      // 加载相关产品（同分类的其他产品）
      const relatedProducts = this.getRelatedProducts(product);

      this.setData({
        product: productWithImage,
        relatedProducts,
        loading: false
      });

      // 更新页面标题
      wx.setNavigationBarTitle({
        title: product.name || '产品详情'
      });

    } catch (error) {
      console.error('加载产品详情失败:', error);
      this.setData({
        loading: false,
        error: error.message || '加载失败'
      });
    }
  },

  // 等待数据加载完成
  waitForDataLoaded() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (apiService.isDataLoaded()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // 超时处理
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  },

  // 获取相关产品
  getRelatedProducts(currentProduct) {
    try {
      const categoryProducts = apiService.getCategoryProducts(currentProduct.categoryName);
      
      // 过滤掉当前产品，最多显示5个相关产品
      const related = categoryProducts
        .filter(p => p.id !== currentProduct.id)
        .slice(0, 5)
        .map(product => ({
          ...product,
          imageUrl: apiService.getProductImageUrl(product.image)
        }));

      return related;
    } catch (error) {
      console.error('获取相关产品失败:', error);
      return [];
    }
  },

  // 从描述中提取规格
  extractSpec(description) {
    if (!description) return '';
    const match = description.match(/规格:([^/]+)/);
    return match ? match[1].trim() : '';
  },

  // 从描述中提取单位
  extractUnit(description) {
    if (!description) return '';
    const match = description.match(/单位:([^/]+)/);
    return match ? match[1].trim() : '';
  },

  // 图片点击 - 预览
  onImageTap() {
    this.setData({
      showImagePreview: true
    });
  },

  // 关闭图片预览
  onCloseImagePreview() {
    this.setData({
      showImagePreview: false
    });
  },

  // 图片加载失败
  onImageError() {
    const product = this.data.product;
    product.imageUrl = '/static/images/placeholder.png';
    this.setData({
      product
    });
  },

  // 联系客服
  onContact() {
    wx.showModal({
      title: '联系客服',
      content: '如需了解更多产品信息或进行采购咨询，请通过以下方式联系我们：\n\n电话：400-123-4567\n微信：jiemingda_service',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制电话',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: '400-123-4567',
            success: () => {
              wx.showToast({
                title: '电话已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 相关产品点击
  onRelatedProductTap(e) {
    const product = e.currentTarget.dataset.product;
    
    // 跳转到新的产品详情页
    wx.redirectTo({
      url: `/pages/product/product?id=${product.id}`
    });
  },

  // 重试加载
  onRetry() {
    this.loadProductDetail();
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});