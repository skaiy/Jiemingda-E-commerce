// pages/index/index.js
const apiService = require('../../utils/api.js');

Page({
  data: {
    // 数据状态
    loading: true,
    categories: [],
    displayProducts: [],
    statistics: {
      totalProducts: 0,
      totalCategories: 0
    },

    // 搜索和筛选
    searchKeyword: '',
    activeCategoryIndex: -1, // -1表示全部产品
    currentCategoryName: '全部产品',
    currentBannerUrl: '',

    // UI状态
    showBackToTop: false,
    searchDebounceTimer: null
  },

  onLoad() {
    console.log('首页加载');
    this.initPage();
  },

  onShow() {
    console.log('首页显示');
    // 每次显示时检查数据是否已更新
    if (apiService.isDataLoaded()) {
      this.loadData();
    }
  },

  onReady() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '捷明达产品目录'
    });
  },

  onPageScroll(e) {
    // 控制返回顶部按钮显示
    const showBackToTop = e.scrollTop > 300;
    if (showBackToTop !== this.data.showBackToTop) {
      this.setData({
        showBackToTop
      });
    }
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
        // 设置一个检查间隔
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
      console.log('开始加载页面数据');
      
      const categories = apiService.getCategories();
      const statistics = apiService.getStatistics();

      // 为分类添加显示名称
      const categoriesWithDisplay = categories.map(cat => ({
        ...cat,
        displayName: apiService.getCategoryDisplayName(cat.name)
      }));

      this.setData({
        categories: categoriesWithDisplay,
        statistics,
        loading: false
      });

      // 默认显示全部产品
      this.showAllProducts();
      
      console.log('页面数据加载完成');
    } catch (error) {
      console.error('数据加载失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 显示全部产品
  showAllProducts() {
    const allProducts = apiService.getAllProducts();
    const displayProducts = this.prepareDisplayProducts(allProducts);
    
    this.setData({
      displayProducts,
      activeCategoryIndex: -1,
      currentCategoryName: '全部产品',
      currentBannerUrl: ''
    });
  },

  // 显示指定分类产品
  showCategoryProducts(categoryIndex) {
    const category = this.data.categories[categoryIndex];
    if (!category) return;

    const products = category.items;
    const displayProducts = this.prepareDisplayProducts(products);
    const bannerUrl = apiService.getCategoryBannerUrl(category.name);

    this.setData({
      displayProducts,
      activeCategoryIndex: categoryIndex,
      currentCategoryName: category.name,
      currentBannerUrl: bannerUrl
    });
  },

  // 准备显示用的产品数据
  prepareDisplayProducts(products) {
    return products.map(product => ({
      ...product,
      imageUrl: apiService.getProductImageUrl(product.image),
      spec: product.spec || apiService.extractSpec ? apiService.extractSpec(product.description) : '',
      unit: product.unit || apiService.extractUnit ? apiService.extractUnit(product.description) : '',
      brandName: apiService.getBrandName(product.brandCode || '099'),
      categoryNameFromDict: apiService.getCategoryName(product.categoryCode || '099')
    }));
  },

  // 分类选择
  onSelectCategory(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    if (index === -1) {
      this.showAllProducts();
    } else {
      this.showCategoryProducts(index);
    }

    // 清空搜索
    this.setData({
      searchKeyword: ''
    });
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
      // 如果搜索为空，恢复当前分类显示
      if (this.data.activeCategoryIndex === -1) {
        this.showAllProducts();
      } else {
        this.showCategoryProducts(this.data.activeCategoryIndex);
      }
      return;
    }

    const searchResults = apiService.searchProducts(keyword);
    const displayProducts = this.prepareDisplayProducts(searchResults);

    this.setData({
      displayProducts,
      currentCategoryName: `搜索结果 (${searchResults.length})`
    });
  },

  // 产品卡片点击
  onProductTap(e) {
    const product = e.currentTarget.dataset.product;
    this.navigateToDetail(product);
  },

  // 查看详情按钮
  onViewDetail(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const product = e.currentTarget.dataset.product;
    this.navigateToDetail(product);
  },

  // 跳转到详情页
  navigateToDetail(product) {
    wx.navigateTo({
      url: `/pages/product/product?id=${product.id}`
    });
  },

  // 图片加载失败
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const displayProducts = this.data.displayProducts;
    
    if (displayProducts[index]) {
      displayProducts[index].imageUrl = '/static/images/placeholder.png';
      this.setData({
        displayProducts
      });
    }
  },

  // Banner图片加载失败
  onBannerError() {
    console.log('Banner图片加载失败，使用默认背景');
    // 小程序中可以通过CSS设置默认背景，这里不需要特殊处理
  },

  // 返回顶部
  onBackToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
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