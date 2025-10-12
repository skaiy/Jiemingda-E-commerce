const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

async function loadJson(sourceUrl, localRelPath) {
  if (sourceUrl) {
    const { data } = await axios.get(sourceUrl, { timeout: 15000 });
    return data;
  }
  const fp = path.join(__dirname, localRelPath);
  if (fs.existsSync(fp)) {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  }
  return null;
}

function normalizeBrands(dict) {
  if (!dict) return [];
  const arr = dict.brands || dict.brandDictionary?.brands || [];
  return arr.map(b => ({
    code: String(b.code || '').trim(),
    name: String(b.name || '').trim(),
    shortName: b.shortName ? String(b.shortName).trim() : null,
    description: b.description ? String(b.description).trim() : null,
  })).filter(b => b.code && b.name);
}

function normalizeCategories(dict) {
  if (!dict) return [];
  const arr = dict.categories || dict.categoryDictionary?.categories || [];
  return arr.map(c => ({
    code: String(c.code || '').trim(),
    name: String(c.name || '').trim(),
    shortName: c.shortName ? String(c.shortName).trim() : null,
    bannerSlug: c.slug ? String(c.slug).trim() : null,
    bannerUrl: c.bannerUrl ? String(c.bannerUrl).trim() : null,
    sortIndex: c.sortIndex ?? null,
    parentCode: c.parentCode ? String(c.parentCode).trim() : null,
  })).filter(c => c.code && c.name);
}

function normalizeProducts(productsRaw) {
  if (!productsRaw) return [];
  // Support shapes: [{ slug, products: [...] }], or { categories: [...] }, or flat array of products
  let items = [];
  if (Array.isArray(productsRaw)) {
    if (productsRaw.length && productsRaw[0] && productsRaw[0].products) {
      productsRaw.forEach(cat => {
        (cat.products || []).forEach(p => items.push({ ...p, _categorySlug: cat.slug || cat.id || null }));
      });
    } else {
      items = productsRaw;
    }
  } else if (productsRaw.categories) {
    productsRaw.categories.forEach(cat => {
      (cat.products || []).forEach(p => items.push({ ...p, _categorySlug: cat.slug || cat.id || null }));
    });
  } else if (productsRaw.products) {
    items = productsRaw.products;
  }
  return items.map(p => ({
    productCode: p.productCode || p.code || null,
    name: p.name || p.title || '',
    brandName: p.brand || p.brandName || null,
    itemNo: p.itemNo || p.sku || null,
    spec: p.spec || p.specification || null,
    unit: p.unit || null,
    price: p.price ?? null,
    imageUrl: Array.isArray(p.images) ? (p.images[0]?.url || p.images[0]) : (p.imageUrl || p.photo || null),
    remark: p.description || p.remark || null,
    isOnShelf: p.isOnShelf !== undefined ? !!p.isOnShelf : true,
    _images: Array.isArray(p.images) ? p.images : [],
    _categorySlug: p._categorySlug || null,
  })).filter(p => p.name);
}

async function runDbPush(cwd) {
  try {
    execSync('npx prisma db push --skip-generate', { cwd, stdio: 'inherit' });
    return true;
  } catch (e) {
    return false;
  }
}

exports.main = async (event) => {
  const databaseUrl = event?.databaseUrl || process.env.DATABASE_URL;
  if (!databaseUrl) {
    return { ok: false, error: 'DATABASE_URL 未提供，请在调用时传入 { databaseUrl }。' };
  }
  process.env.DATABASE_URL = databaseUrl;

  // Ensure Prisma Client is generated in function environment
  try { execSync('npx prisma generate', { cwd: __dirname, stdio: 'inherit' }); } catch (e) {}
  const { PrismaClient } = require('@prisma/client');
  // Ensure tables exist via prisma db push
  await runDbPush(__dirname);

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  let brandUpserts = 0;
  let categoryUpserts = 0;
  let productUpserts = 0;
  let imageCreates = 0;

  try {
    // Load dictionaries (prefer URL, fallback to local files)
    const brandDict = await loadJson(event?.brandUrl, './data/brand_dictionary.json');
    const categoryDict = await loadJson(event?.categoryUrl, './data/category_dictionary.json');
    const productsRaw = await loadJson(event?.productsUrl, './data/products.json');

    const brands = normalizeBrands(brandDict);
    for (const b of brands) {
      await prisma.brand.upsert({
        where: { code: b.code },
        update: { name: b.name, shortName: b.shortName, description: b.description },
        create: { code: b.code, name: b.name, shortName: b.shortName, description: b.description },
      });
      brandUpserts++;
    }

    const categories = normalizeCategories(categoryDict);
    // Map parent relations by code
    const codeToId = {};
    for (const c of categories) {
      const saved = await prisma.category.upsert({
        where: { code: c.code },
        update: { name: c.name, shortName: c.shortName, bannerSlug: c.bannerSlug, bannerUrl: c.bannerUrl, sortIndex: c.sortIndex },
        create: { code: c.code, name: c.name, shortName: c.shortName, bannerSlug: c.bannerSlug, bannerUrl: c.bannerUrl, sortIndex: c.sortIndex },
      });
      codeToId[c.code] = saved.id;
      categoryUpserts++;
    }
    // Second pass to set parents if provided
    for (const c of categories) {
      if (c.parentCode && codeToId[c.parentCode]) {
        await prisma.category.update({ where: { code: c.code }, data: { parentId: codeToId[c.parentCode] } });
      }
    }

    const products = normalizeProducts(productsRaw);
    for (const p of products) {
      let brandId = null;
      if (p.brandName) {
        const foundBrand = await prisma.brand.findFirst({ where: { OR: [{ name: p.brandName }, { shortName: p.brandName }] } });
        if (foundBrand) brandId = foundBrand.id;
      }
      // Try map category by slug -> find category whose bannerSlug matches
      let categoryId = null;
      if (p._categorySlug) {
        const foundCat = await prisma.category.findFirst({ where: { bannerSlug: p._categorySlug } });
        if (foundCat) categoryId = foundCat.id;
      }

      await prisma.product.upsert({
        where: { productCode: p.productCode ?? `AUTO-${p.name}-${p.itemNo || ''}` },
        update: {
          name: p.name,
          brandId,
          categoryId,
          itemNo: p.itemNo,
          spec: p.spec,
          unit: p.unit,
          price: p.price,
          imageUrl: p.imageUrl,
          remark: p.remark,
          isOnShelf: p.isOnShelf,
        },
        create: {
          productCode: p.productCode ?? `AUTO-${p.name}-${p.itemNo || ''}`,
          name: p.name,
          brandId,
          categoryId,
          itemNo: p.itemNo,
          spec: p.spec,
          unit: p.unit,
          price: p.price,
          imageUrl: p.imageUrl,
          remark: p.remark,
          isOnShelf: p.isOnShelf,
        },
      });
      productUpserts++;

      // Images
      for (let i = 0; i < (p._images || []).length; i++) {
        const img = p._images[i];
        const url = typeof img === 'string' ? img : (img?.url || null);
        if (!url) continue;
        const prod = await prisma.product.findUnique({ where: { productCode: p.productCode ?? `AUTO-${p.name}-${p.itemNo || ''}` } });
        if (prod) {
          await prisma.productImage.create({ data: { productId: prod.id, url, sortOrder: i } });
          imageCreates++;
        }
      }
    }

    await prisma.$disconnect();
    return { ok: true, brands: brandUpserts, categories: categoryUpserts, products: productUpserts, images: imageCreates };
  } catch (error) {
    await prisma.$disconnect();
    return { ok: false, error: error?.message || String(error), brands: brandUpserts, categories: categoryUpserts, products: productUpserts, images: imageCreates };
  }
};