const cloudbase = require('@cloudbase/node-sdk');
const CATEGORY_DICT = require('./category_dictionary.json');

const CATEGORY_LIST = (CATEGORY_DICT && (CATEGORY_DICT.categoryDictionary?.categories || CATEGORY_DICT.categories)) || [];

function isNumericCode(v){ return typeof v==='string' && /^\d{3}$/.test(v); }
function normalizeText(s){ return (s||'').trim().toLowerCase(); }
function matchCategory(input){
  const txt = normalizeText(input);
  if (!txt) return null;
  // 1) 若已是三位数字，直接校验存在
  if (isNumericCode(input)) {
    const hit = CATEGORY_LIST.find(c=> c.code===input);
    if (hit) return hit;
  }
  // 2) 按 id/slug 精确匹配
  let hit = CATEGORY_LIST.find(c=> normalizeText(c.id)===txt || normalizeText(c.slug)===txt);
  if (hit) return hit;
  // 3) 按中文名/短名精确匹配
  hit = CATEGORY_LIST.find(c=> normalizeText(c.name)===txt || normalizeText(c.shortName)===txt);
  if (hit) return hit;
  // 4) 模糊包含
  hit = CATEGORY_LIST.find(c=> normalizeText(c.name).includes(txt) || normalizeText(c.shortName).includes(txt));
  if (hit) return hit;
  return null;
}

function resolveCategoryCode(codeOrName){
  const hit = matchCategory(codeOrName);
  return hit? hit.code : '099';
}

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .slice(0, 24) || 'unknown';
}

function normalizeProduct(item, categoryName) {
  const specMatch = (item.description || '').match(/规格:([^/]+)/);
  const unitMatch = (item.description || '').match(/单位:([^/]+)/);
  const brandCode = item.brandCode || slugify(item.brand || item.brandName || '');
  const categoryCode = resolveCategoryCode(item.categoryCode || categoryName || item.categoryName || '');
  return {
    id: item.productCode || item.id || `${(item.name||'').slice(0,24)}-${brandCode||'na'}`,
    productCode: item.productCode || item.id || null,
    name: item.name || '',
    brand: item.brand || item.brandName || '',
    brandCode,
    categoryCode,
    categoryName: categoryName || '',
    spec: item.spec || (specMatch ? specMatch[1].trim() : ''),
    unit: item.unit || (unitMatch ? unitMatch[1].trim() : ''),
    price: item.price || null,
    image: item.image || null,
    description: item.description || ''
  };
}

exports.main = async (event, context) => {
  try {
    const env = process.env.TCB_ENV || process.env.SCF_NAMESPACE || (event && event.env);
    const app = cloudbase.init({ env });
    const db = app.database();

    // 读取 catalog/default
    const catalogColl = db.collection('catalog');
    const catalogRes = await catalogColl.doc('default').get();
    if (!catalogRes.data || catalogRes.data.length === 0) {
      return { code: 1, message: 'catalog/default 文档不存在或为空' };
    }
    const catalog = catalogRes.data[0];
    const categories = Array.isArray(catalog.categories) ? catalog.categories : [];

    // 扁平化为 products 数组
    const products = [];
    categories.forEach(cat => {
      (cat.items || []).forEach(item => {
        products.push(normalizeProduct(item, cat.name));
      });
    });

    // 确保集合存在
    try { await db.createCollection('products'); } catch (e) { /* ignore if exists */ }

    const productsColl = db.collection('products');
    // 前端默认读取 docId: 'catalog-data'，与配置保持一致
    const res = await productsColl.doc('catalog-data').set({ products, updatedAt: Date.now(), count: products.length });

    return { code: 0, message: 'Seed products success', result: res, count: products.length };
  } catch (err) {
    return { code: 2, message: 'Seed products failed', error: err.message };
  }
};