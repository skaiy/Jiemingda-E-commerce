/**
 * API工具类
 * 统一管理数据获取，提供搜索和筛选功能
 */

const { extractSpec, extractUnit } = require('../data/local-fallback.js');

class APIService {
  constructor() {
    this.app = getApp();
  }

  // 获取所有产品数据
  getProductData() {
    return this.app.getProductData();
  }

  // 获取分类配置
  getCategoryConfig() {
    return this.app.getCategoryConfig();
  }

  // 获取品牌字典
  getBrandDictionary() {
    return this.app.getBrandDictionary();
  }

  // 获取分类字典
  getCategoryDictionary() {
    return this.app.getCategoryDictionary();
  }

  // 获取品牌名称
  getBrandName(brandCode) {
    const dict = this.getBrandDictionary();
    if (!brandCode || !dict || !dict.brandDictionary) return '未知品牌';
    const brand = dict.brandDictionary.brands.find(b => b.code === brandCode);
    return brand ? brand.shortName || brand.name : '未知品牌';
  }

  // 获取分类名称
  getCategoryName(categoryCode) {
    const dict = this.getCategoryDictionary();
    if (!categoryCode || !dict || !dict.categoryDictionary) return '未知分类';
    const category = dict.categoryDictionary.categories.find(c => c.code === categoryCode);
    return category ? category.shortName || category.name : '未知分类';
  }

  // 获取所有分类
  getCategories() {
    const data = this.getProductData();
    return data ? data.categories : [];
  }

  // 获取指定分类的产品
  getCategoryProducts(categoryName) {
    const categories = this.getCategories();
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.items : [];
  }

  // 获取所有产品（扁平化）
  getAllProducts() {
    const categories = this.getCategories();
    return categories.reduce((allProducts, category) => {
      return allProducts.concat(
        category.items.map(item => ({
          ...item,
          categoryName: category.name
        }))
      );
    }, []);
  }

  // 搜索产品
  searchProducts(keyword) {
    if (!keyword || !keyword.trim()) {
      return this.getAllProducts();
    }

    const query = keyword.toLowerCase().trim();
    const allProducts = this.getAllProducts();

    return allProducts.filter(product => {
      const name = (product.name || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase(); 
      const description = (product.description || '').toLowerCase();
      const spec = (product.spec || extractSpec(product.description) || '').toLowerCase();
      const unit = (product.unit || extractUnit(product.description) || '').toLowerCase();
      const categoryName = (product.categoryName || '').toLowerCase();

      return name.includes(query) ||
             brand.includes(query) ||
             description.includes(query) ||
             spec.includes(query) ||
             unit.includes(query) ||
             categoryName.includes(query);
    });
  }

  // 获取产品详情
  getProductDetail(productId) {
    const allProducts = this.getAllProducts();
    return allProducts.find(product => product.id === productId);
  }

  // 搜索分类
  searchCategories(keyword) {
    const categories = this.getCategories();
    const config = this.getCategoryConfig();

    if (!keyword || !keyword.trim()) {
      return categories;
    }

    const query = keyword.toLowerCase().trim();

    return categories.filter(category => {
      const name = (category.name || '').toLowerCase();
      
      // 检查短名称
      let shortName = '';
      if (config && config.categories) {
        const categoryConfig = config.categories.find(c => c.name === category.name);
        if (categoryConfig) {
          shortName = (categoryConfig.shortName || '').toLowerCase();
        }
      }

      return name.includes(query) || shortName.includes(query);
    });
  }

  // 获取分类的显示名称
  getCategoryDisplayName(categoryName) {
    const config = this.getCategoryConfig();
    
    if (config && config.categories) {
      const categoryConfig = config.categories.find(c => c.name === categoryName);
      return categoryConfig ? categoryConfig.shortName : categoryName;
    }

    return categoryName;
  }

  // 获取分类的Banner slug
  getCategoryBannerSlug(categoryName) {
    const config = this.getCategoryConfig();
    
    if (config && config.categories) {
      const categoryConfig = config.categories.find(c => c.name === categoryName);
      return categoryConfig ? categoryConfig.slug : 'others';
    }

    return 'others';
  }

  // 获取统计信息
  getStatistics() {
    const categories = this.getCategories();
    const totalProducts = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    
    return {
      totalCategories: categories.length,
      totalProducts: totalProducts,
      categoriesWithCount: categories.map(cat => ({
        name: cat.name,
        displayName: this.getCategoryDisplayName(cat.name),
        count: cat.items.length
      }))
    };
  }

  // 检查数据是否已加载
  isDataLoaded() {
    return this.app.isDataLoaded();
  }

  // 格式化价格显示
  formatPrice(price) {
    if (!price) return '';
    return `¥${price}`;
  }

  // 获取产品图片URL
  getProductImageUrl(imageName) {
    if (!imageName) return '/static/images/placeholder.png';
    
    // 在小程序中，我们需要使用本地图片或网络图片
    // 这里假设图片已经放在小程序的static目录中
    return `/static/images/products/${imageName}`;
  }

  // 获取分类Banner图片URL
  getCategoryBannerUrl(categoryName) {
    const slug = this.getCategoryBannerSlug(categoryName);
    return `/static/images/banners/${slug}.png`;
  }
}

// 创建单例实例
const apiService = new APIService();

module.exports = apiService;