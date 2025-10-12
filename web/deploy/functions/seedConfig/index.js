const cloudbase = require('@cloudbase/node-sdk');

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .slice(0, 24) || 'unknown';
}

exports.main = async (event, context) => {
  try {
    const env = process.env.TCB_ENV || process.env.SCF_NAMESPACE || (event && event.env);
    const app = cloudbase.init({ env });
    const db = app.database();

    // 优先从 products/catalog-data 读取，以覆盖更全面的数据
    const prodRes = await db.collection('products').doc('catalog-data').get();
    if (!prodRes.data || prodRes.data.length === 0) {
      // 回退到 catalog/default
      const catalogRes = await db.collection('catalog').doc('default').get();
      if (!catalogRes.data || catalogRes.data.length === 0) {
        return { code: 1, message: 'products/catalog-data 与 catalog/default 文档均不存在或为空' };
      }
      const catalog = catalogRes.data[0];
      const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
      // 基于 categories 提取 items 汇总为 products
      const products = [];
      categories.forEach(cat => { (cat.items || []).forEach(item => products.push({ ...item, categoryName: cat.name })); });
      var sourceProducts = products;
    } else {
      const doc = prodRes.data[0];
      var sourceProducts = Array.isArray(doc.products) ? doc.products : [];
    }

    // 品牌字典：从所有产品中提取 brandCode 与品牌名
    const brandMap = new Map();
    (sourceProducts || []).forEach(item => {
      const code = item.brandCode || slugify(item.brand || '');
      const name = item.brand || item.brandName || '未知品牌';
      if (!code) return;
      if (!brandMap.has(code)) {
        brandMap.set(code, { code, name, shortName: name.length > 6 ? name.slice(0,6) : name });
      }
    });
    const brands = Array.from(brandMap.values()).sort((a,b)=> a.name.localeCompare(b.name, 'zh'));

    // 分类字典：基于产品中的 categoryName 或 categoryCode 汇总
    const catMap = new Map();
    (sourceProducts || []).forEach(p => {
      const name = p.categoryName || '未命名分类';
      const code = p.categoryCode || slugify(name);
      const shortName = name.length > 6 ? name.slice(0,6) : name;
      if (!catMap.has(code)) catMap.set(code, { code, name, shortName });
    });
    const categoryDict = Array.from(catMap.values()).sort((a,b)=> a.name.localeCompare(b.name, 'zh'));

    // 确保集合存在
    try { await db.createCollection('config'); } catch (e) { /* ignore */ }

    const configColl = db.collection('config');
    const brandRes = await configColl.doc('brand-dictionary').set({ brandDictionary: { brands }, updatedAt: Date.now() });
    const categoryRes = await configColl.doc('category-dictionary').set({ categoryDictionary: { categories: categoryDict }, updatedAt: Date.now() });

    return { code: 0, message: 'Seed config success', brandResult: brandRes, categoryResult: categoryRes, brandCount: brands.length, categoryCount: categoryDict.length };
  } catch (err) {
    return { code: 2, message: 'Seed config failed', error: err.message };
  }
};