/**
 * 本地存储工具
 * 提供数据缓存和离线支持
 */

class StorageService {
  constructor() {
    this.keys = {
      PRODUCT_DATA: 'jiemingda_product_data',
      CATEGORY_CONFIG: 'jiemingda_category_config',
      SEARCH_HISTORY: 'jiemingda_search_history',
      FAVORITES: 'jiemingda_favorites',
      DATA_VERSION: 'jiemingda_data_version',
      LAST_UPDATE: 'jiemingda_last_update'
    };
  }

  // 设置产品数据
  setProductData(data) {
    try {
      wx.setStorageSync(this.keys.PRODUCT_DATA, data);
      this.setLastUpdate();
      return true;
    } catch (error) {
      console.error('保存产品数据失败:', error);
      return false;
    }
  }

  // 获取产品数据
  getProductData() {
    try {
      return wx.getStorageSync(this.keys.PRODUCT_DATA);
    } catch (error) {
      console.error('获取产品数据失败:', error);
      return null;
    }
  }

  // 设置分类配置
  setCategoryConfig(config) {
    try {
      wx.setStorageSync(this.keys.CATEGORY_CONFIG, config);
      this.setLastUpdate();
      return true;
    } catch (error) {
      console.error('保存分类配置失败:', error);
      return false;
    }
  }

  // 获取分类配置
  getCategoryConfig() {
    try {
      return wx.getStorageSync(this.keys.CATEGORY_CONFIG);
    } catch (error) {
      console.error('获取分类配置失败:', error);
      return null;
    }
  }

  // 添加搜索历史
  addSearchHistory(keyword) {
    try {
      if (!keyword || !keyword.trim()) return;
      
      const history = this.getSearchHistory();
      const filteredHistory = history.filter(item => item !== keyword);
      const newHistory = [keyword, ...filteredHistory].slice(0, 10); // 最多保存10条
      
      wx.setStorageSync(this.keys.SEARCH_HISTORY, newHistory);
      return true;
    } catch (error) {
      console.error('保存搜索历史失败:', error);
      return false;
    }
  }

  // 获取搜索历史
  getSearchHistory() {
    try {
      return wx.getStorageSync(this.keys.SEARCH_HISTORY) || [];
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return [];
    }
  }

  // 清空搜索历史
  clearSearchHistory() {
    try {
      wx.removeStorageSync(this.keys.SEARCH_HISTORY);
      return true;
    } catch (error) {
      console.error('清空搜索历史失败:', error);
      return false;
    }
  }

  // 添加收藏
  addFavorite(productId) {
    try {
      const favorites = this.getFavorites();
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        wx.setStorageSync(this.keys.FAVORITES, favorites);
      }
      return true;
    } catch (error) {
      console.error('添加收藏失败:', error);
      return false;
    }
  }

  // 移除收藏
  removeFavorite(productId) {
    try {
      const favorites = this.getFavorites();
      const newFavorites = favorites.filter(id => id !== productId);
      wx.setStorageSync(this.keys.FAVORITES, newFavorites);
      return true;
    } catch (error) {
      console.error('移除收藏失败:', error);
      return false;
    }
  }

  // 获取收藏列表
  getFavorites() {
    try {
      return wx.getStorageSync(this.keys.FAVORITES) || [];
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      return [];
    }
  }

  // 检查是否已收藏
  isFavorite(productId) {
    const favorites = this.getFavorites();
    return favorites.includes(productId);
  }

  // 设置数据版本
  setDataVersion(version) {
    try {
      wx.setStorageSync(this.keys.DATA_VERSION, version);
      return true;
    } catch (error) {
      console.error('保存数据版本失败:', error);
      return false;
    }
  }

  // 获取数据版本
  getDataVersion() {
    try {
      return wx.getStorageSync(this.keys.DATA_VERSION);
    } catch (error) {
      console.error('获取数据版本失败:', error);
      return null;
    }
  }

  // 设置最后更新时间
  setLastUpdate() {
    try {
      wx.setStorageSync(this.keys.LAST_UPDATE, Date.now());
      return true;
    } catch (error) {
      console.error('保存更新时间失败:', error);
      return false;
    }
  }

  // 获取最后更新时间
  getLastUpdate() {
    try {
      return wx.getStorageSync(this.keys.LAST_UPDATE);
    } catch (error) {
      console.error('获取更新时间失败:', error);
      return null;
    }
  }

  // 检查数据是否需要更新（超过24小时）
  shouldUpdateData() {
    const lastUpdate = this.getLastUpdate();
    if (!lastUpdate) return true;
    
    const now = Date.now();
    const diff = now - lastUpdate;
    const hours24 = 24 * 60 * 60 * 1000;
    
    return diff > hours24;
  }

  // 获取存储空间信息
  getStorageInfo() {
    try {
      return wx.getStorageInfoSync();
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return null;
    }
  }

  // 清空所有缓存
  clearAllCache() {
    try {
      const keys = Object.values(this.keys);
      keys.forEach(key => {
        wx.removeStorageSync(key);
      });
      return true;
    } catch (error) {
      console.error('清空缓存失败:', error);
      return false;
    }
  }

  // 检查是否有缓存数据
  hasCachedData() {
    const productData = this.getProductData();
    const categoryConfig = this.getCategoryConfig();
    return productData && categoryConfig;
  }
}

// 创建单例实例
const storageService = new StorageService();

module.exports = storageService;