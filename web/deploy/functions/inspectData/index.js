const cloudbase = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  try {
    const env = process.env.TCB_ENV || process.env.SCF_NAMESPACE || (event && event.env);
    const app = cloudbase.init({ env });
    const db = app.database();

    const out = { env, checks: {} };

    // 1) products/catalog-data
    try {
      const prodDoc = await db.collection('products').doc('catalog-data').get();
      const doc = (prodDoc.data && prodDoc.data[0]) || {};
      const arr = Array.isArray(doc.products) ? doc.products : [];
      const missingCode = arr.filter(p => !p.productCode && !p.id).length;
      const missingBrandCode = arr.filter(p => !p.brandCode).length;
      const samples = arr.slice(0, 8).map(p => ({
        name: p.name,
        productCode: p.productCode,
        id: p.id,
        brand: p.brand,
        brandCode: p.brandCode,
        categoryName: p.categoryName,
        categoryCode: p.categoryCode
      }));
      out.checks.products = {
        exists: !!prodDoc.data && prodDoc.data.length > 0,
        count: arr.length,
        missingCode,
        missingBrandCode,
        samples
      };
    } catch (e) {
      out.checks.products = { error: e.message };
    }

    // 2) config/brand-dictionary
    try {
      const brandDoc = await db.collection('config').doc('brand-dictionary').get();
      const doc = (brandDoc.data && brandDoc.data[0]) || {};
      const list = doc.brandDictionary && Array.isArray(doc.brandDictionary.brands) ? doc.brandDictionary.brands : [];
      const samples = list.slice(0, 8);
      out.checks.brandDictionary = {
        exists: !!brandDoc.data && brandDoc.data.length > 0,
        count: list.length,
        samples
      };
    } catch (e) {
      out.checks.brandDictionary = { error: e.message };
    }

    // 3) config/category-dictionary
    try {
      const catDoc = await db.collection('config').doc('category-dictionary').get();
      const doc = (catDoc.data && catDoc.data[0]) || {};
      const list = doc.categoryDictionary && Array.isArray(doc.categoryDictionary.categories) ? doc.categoryDictionary.categories : [];
      const samples = list.slice(0, 8);
      out.checks.categoryDictionary = {
        exists: !!catDoc.data && catDoc.data.length > 0,
        count: list.length,
        samples
      };
    } catch (e) {
      out.checks.categoryDictionary = { error: e.message };
    }

    return { code: 0, message: 'inspect ok', data: out };
  } catch (err) {
    return { code: 2, message: 'inspect failed', error: err.message };
  }
};