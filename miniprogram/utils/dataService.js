/**
 * 数据服务层 - 统一数据访问接口
 * 优先使用本地 JSON 数据，后续可切换为云端 API
 */
const productsData = require('../data/products');
const categoriesData = require('../data/categories');
const brandsData = require('../data/brands');

// 构建索引缓存
let _allProducts = null;
let _categories = null;
let _brands = null;
let _brandMap = null;
let _categoryMap = null;

/**
 * 获取所有分类（含产品计数）
 */
function getCategories() {
  if (_categories) return _categories;

  const catDict = categoriesData.categoryDictionary.categories;
  const countMap = {};

  // 统计每个分类的产品数
  for (const cat of productsData.categories) {
    const items = cat.items || [];
    if (items.length > 0) {
      const code = items[0].categoryCode;
      countMap[code] = items.length;
    }
  }

  _categories = catDict
    .filter(c => c.code !== '099' || countMap[c.code])
    .map(c => ({
      code: c.code,
      name: c.name,
      shortName: c.shortName,
      slug: c.slug,
      productCount: countMap[c.code] || 0
    }))
    .filter(c => c.productCount > 0);

  return _categories;
}

/**
 * 获取品牌映射 { code: brand }
 */
function getBrandMap() {
  if (_brandMap) return _brandMap;
  _brandMap = {};
  for (const b of brandsData.brandDictionary.brands) {
    _brandMap[b.code] = b;
  }
  return _brandMap;
}

/**
 * 获取分类映射 { code: category }
 */
function getCategoryMap() {
  if (_categoryMap) return _categoryMap;
  _categoryMap = {};
  for (const c of categoriesData.categoryDictionary.categories) {
    _categoryMap[c.code] = c;
  }
  return _categoryMap;
}

/**
 * 获取所有产品（扁平化列表，附带分类名和品牌短名）
 */
function getAllProducts() {
  if (_allProducts) return _allProducts;

  const brandMap = getBrandMap();
  const categoryMap = getCategoryMap();
  _allProducts = [];

  for (const cat of productsData.categories) {
    const items = cat.items || [];
    for (const item of items) {
      const brand = brandMap[item.brandCode];
      const category = categoryMap[item.categoryCode];
      _allProducts.push({
        id: item.id,
        productCode: item.productCode,
        name: item.name,
        spec: item.spec || '',
        unit: item.unit || '',
        price: item.price || '',
        image: item.image || '',
        brand: item.brand || '',
        brandShort: brand ? (brand.shortName || brand.name) : '',
        brandCode: item.brandCode,
        categoryCode: item.categoryCode,
        categoryName: category ? category.name : cat.name,
        categoryShort: category ? (category.shortName || category.name) : cat.name,
        description: item.description || ''
      });
    }
  }

  return _allProducts;
}

/**
 * 按分类获取产品
 * @param {string} categoryCode - 分类编码，null 表示全部
 * @param {number} page - 页码，从 1 开始
 * @param {number} pageSize - 每页数量
 */
function getProductsByCategory(categoryCode, page = 1, pageSize = 20) {
  let products = getAllProducts();

  if (categoryCode) {
    products = products.filter(p => p.categoryCode === categoryCode);
  }

  const total = products.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = products.slice(start, end);

  return {
    list,
    total,
    page,
    pageSize,
    hasMore: end < total
  };
}

/**
 * 搜索产品
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 最大返回数量
 */
function searchProducts(keyword, limit = 50) {
  if (!keyword || !keyword.trim()) return [];

  const kw = keyword.trim().toLowerCase();
  const products = getAllProducts();

  return products.filter(p => {
    return p.name.toLowerCase().includes(kw) ||
           p.brand.toLowerCase().includes(kw) ||
           p.brandShort.toLowerCase().includes(kw) ||
           p.spec.toLowerCase().includes(kw) ||
           p.categoryName.toLowerCase().includes(kw) ||
           p.productCode.includes(kw);
  }).slice(0, limit);
}

/**
 * 获取单个产品详情
 * @param {string} productId - 产品 ID（productCode）
 */
function getProductById(productId) {
  if (!productId) return null;
  const products = getAllProducts();
  return products.find(p => p.id === productId || p.productCode === productId) || null;
}

/**
 * 获取活跃品牌列表（有产品的品牌）
 */
function getActiveBrands() {
  if (_brands) return _brands;
  _brands = brandsData.brandDictionary.brands
    .filter(b => b.productCount > 0)
    .map(b => ({
      code: b.code,
      name: b.name,
      shortName: b.shortName || b.name,
      productCount: b.productCount
    }));
  return _brands;
}

/**
 * 按品牌获取产品
 */
function getProductsByBrand(brandCode, page = 1, pageSize = 20) {
  let products = getAllProducts();

  if (brandCode) {
    products = products.filter(p => p.brandCode === brandCode);
  }

  const total = products.length;
  const start = (page - 1) * pageSize;
  const list = products.slice(start, start + pageSize);

  return {
    list,
    total,
    page,
    pageSize,
    hasMore: (start + pageSize) < total
  };
}

module.exports = {
  getCategories,
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  getProductById,
  getActiveBrands,
  getProductsByBrand,
  getBrandMap,
  getCategoryMap
};
