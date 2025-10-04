// pages/category/category.js
const apiService = require('../../utils/api.js');

Page({
  data: {
    // 数据状态
    loading: true,
    categories: [],
    displayCategories: [],
    statistics: {
      totalProducts: 0,
      totalCategories: 0
    },

    // 搜索
    searchKeyword: '',
    searchDebounceTimer: null,

    // 快速导航
    quickNavCategories: [],

    // 分类图标映射
    categoryIcons: {
      '冷冻糕点半成品': '🧁',
      '烘焙原料': '🌾',
      '包装材料': '📦',
      '设备工具': '🔧',
      '奶制品': '🥛',
      '调味品': '🧂',
      '装饰材料': '✨',
      '保鲜用品': '❄️'
    }
  },

  onLoad() {
    console.log('分类页面加载');
    this.initPage();
  },

  onShow() {
    console.log('分类页面显示');
    // 每次显示时检查数据是否已更新
    if (apiService.isDataLoaded()) {
      this.loadData();
    }
  },

  onReady() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '分类浏览'
    });
  },

  // 初始化页面
  async initPage() {
    try {
      this.setData({ loading: true });

      if (apiService.isDataLoaded()) {
        this.loadData();
      } else {
        // 等待数据加载完成
        console.log('等待数据加载...');
        this.checkDataLoadedInterval = setInterval(() => {
          if (apiService.isDataLoaded()) {
            clearInterval(this.checkDataLoadedInterval);
            this.loadData();
          }
        }, 100);

        // 超时处理
        setTimeout(() => {
          if (this.checkDataLoadedInterval) {
            clearInterval(this.checkDataLoadedInterval);
            this.setData({ loading: false });
            wx.showToast({
              title: '数据加载超时',
              icon: 'none'
            });
          }
        }, 10000);
      }
    } catch (error) {
      console.error('页面初始化失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '页面加载失败',
        icon: 'none'
      });
    }
  },

  // 数据加载完成回调（由app.js调用）
  onDataLoaded() {
    console.log('收到数据加载完成通知');
    this.loadData();
  },

  // 加载数据
  loadData() {
    try {
      console.log('开始加载分类页面数据');
      
      const categories = apiService.getCategories();
      const statistics = apiService.getStatistics();

      // 为分类添加额外信息
      const categoriesWithInfo = categories.map(cat => ({
        ...cat,
        displayName: apiService.getCategoryDisplayName(cat.name),
        bannerUrl: apiService.getCategoryBannerUrl(cat.name),
        icon: this.data.categoryIcons[cat.name] || '📋',
        description: this.getCategoryDescription(cat.name)
      }));

      // 创建快速导航（显示前4个主要分类）
      const quickNavCategories = categoriesWithInfo.slice(0, 4);

      this.setData({
        categories: categoriesWithInfo,
        displayCategories: categoriesWithInfo,
        statistics,
        quickNavCategories,
        loading: false
      });
      
      console.log('分类页面数据加载完成');
    } catch (error) {
      console.error('数据加载失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 获取分类描述
  getCategoryDescription(categoryName) {
    const descriptions = {
      '冷冻糕点半成品': '各种冷冻糕点和半成品',
      '烘焙原料': '面粉、糖类等烘焙原材料',
      '包装材料': '食品包装盒、袋等包装用品',
      '设备工具': '烘焙设备和工具用品',
      '奶制品': '牛奶、奶油等乳制品',
      '调味品': '香精、色素等调味材料',
      '装饰材料': '蛋糕装饰和美化材料',
      '保鲜用品': '食品保鲜和储存用品'
    };
    
    return descriptions[categoryName] || '查看该分类下的所有产品';
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });

    // 防抖搜索
    if (this.data.searchDebounceTimer) {
      clearTimeout(this.data.searchDebounceTimer);
    }

    this.data.searchDebounceTimer = setTimeout(() => {
      this.performSearch(keyword);
    }, 300);
  },

  // 搜索确认
  onSearchConfirm(e) {
    const keyword = e.detail.value;
    this.performSearch(keyword);
  },

  // 执行搜索
  performSearch(keyword) {
    if (!keyword || !keyword.trim()) {
      // 如果搜索为空，显示所有分类
      this.setData({
        displayCategories: this.data.categories
      });
      return;
    }

    const searchResults = apiService.searchCategories(keyword);
    const resultsWithInfo = searchResults.map(cat => {
      const originalCat = this.data.categories.find(c => c.name === cat.name);
      return originalCat || cat;
    });

    this.setData({
      displayCategories: resultsWithInfo
    });
  },

  // 分类点击
  onCategoryTap(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    if (index === -1) {
      // 跳转到产品页面显示所有产品
      wx.switchTab({
        url: '/pages/index/index'
      });
    } else {
      const category = this.data.displayCategories[index];
      if (category) {
        // 跳转到产品页面显示该分类产品
        wx.switchTab({
          url: `/pages/index/index?category=${encodeURIComponent(category.name)}`
        });
      }
    }
  },

  // 快速导航点击
  onQuickNavTap(e) {
    const category = e.currentTarget.dataset.category;
    
    // 跳转到产品页面显示该分类产品
    wx.switchTab({
      url: `/pages/index/index?category=${encodeURIComponent(category.name)}`
    });
  },

  onUnload() {
    // 清理定时器
    if (this.checkDataLoadedInterval) {
      clearInterval(this.checkDataLoadedInterval);
    }
    if (this.data.searchDebounceTimer) {
      clearTimeout(this.data.searchDebounceTimer);
    }
  }
});