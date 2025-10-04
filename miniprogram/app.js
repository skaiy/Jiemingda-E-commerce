const { CloudBase } = require('./utils/cloudbase.js');

App({
  globalData: {
    // CloudBase配置
    cloudbaseConfig: {
      envId: 'cloud1-0gc8cbzg3efd6a99', // 从web版配置复制
      region: 'ap-shanghai'
    },
    // 数据缓存
    productData: null,
    categoryConfig: null,
    brandDictionary: null,
    categoryDictionary: null,
    // 数据加载状态
    dataLoaded: false
  },

  onLaunch() {
    console.log('小程序启动');
    this.initCloudBase();
    this.loadInitialData();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  // 初始化CloudBase
  initCloudBase() {
    try {
      this.cloudbase = new CloudBase(this.globalData.cloudbaseConfig);
    } catch (error) {
      console.error('CloudBase初始化失败:', error);
    }
  },

  // 加载初始数据
  async loadInitialData() {
    try {
      // 并行加载所有数据
      const [productData, categoryConfig, brandDict, categoryDict] = await Promise.all([
        this.loadProductData(),
        this.loadCategoryConfig(),
        this.loadDictionaryData('./data/brand_dictionary.json'),
        this.loadDictionaryData('./data/category_dictionary.json')
      ]);

      if (productData) {
        this.globalData.productData = productData;
      }
      
      if (categoryConfig) {
        this.globalData.categoryConfig = categoryConfig;
      }

      if (brandDict) {
        this.globalData.brandDictionary = brandDict;
      }

      if (categoryDict) {
        this.globalData.categoryDictionary = categoryDict;
      }

      this.globalData.dataLoaded = true;
      
      // 通知页面数据已加载
      this.notifyDataLoaded();
    } catch (error) {
      console.error('初始数据加载失败:', error);
    }
  },

  // 加载产品数据
  async loadProductData() {
    try {
      // 优先尝试CloudBase
      if (this.cloudbase) {
        const cloudData = await this.cloudbase.getProductData();
        if (cloudData) {
          console.log('从CloudBase获取产品数据成功');
          return cloudData;
        }
      }

      // 回退到本地数据
      console.log('回退到本地产品数据');
      return require('./data/local-fallback.js').getProductData();
    } catch (error) {
      console.error('产品数据加载失败:', error);
      return null;
    }
  },

  // 加载分类配置
  async loadCategoryConfig() {
    try {
      // 优先尝试CloudBase
      if (this.cloudbase) {
        const cloudConfig = await this.cloudbase.getCategoryConfig();
        if (cloudConfig) {
          console.log('从CloudBase获取分类配置成功');
          return cloudConfig;
        }
      }

      // 回退到本地配置
      console.log('回退到本地分类配置');
      return require('./data/local-fallback.js').getCategoryConfig();
    } catch (error) {
      console.error('分类配置加载失败:', error);
      return null;
    }
  },

  // 通知页面数据已加载
  notifyDataLoaded() {
    // 获取当前页面栈
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      // 如果当前页面有onDataLoaded方法，则调用
      if (typeof currentPage.onDataLoaded === 'function') {
        currentPage.onDataLoaded();
      }
    }
  },

  // 获取产品数据
  getProductData() {
    return this.globalData.productData;
  },

  // 获取分类配置  
  getCategoryConfig() {
    return this.globalData.categoryConfig;
  },

  // 获取品牌字典
  getBrandDictionary() {
    return this.globalData.brandDictionary;
  },

  // 获取分类字典
  getCategoryDictionary() {
    return this.globalData.categoryDictionary;
  },

  // 加载字典数据
  async loadDictionaryData(url) {
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: url,
          method: 'GET',
          success: resolve,
          fail: reject
        });
      });
      
      if (response.statusCode === 200) {
        return response.data;
      } else {
        console.warn('字典数据获取失败:', response);
        return null;
      }
    } catch (error) {
      console.warn('字典数据获取失败:', error);
      return null;
    }
  },

  // 检查数据是否已加载
  isDataLoaded() {
    return this.globalData.dataLoaded;
  }
});