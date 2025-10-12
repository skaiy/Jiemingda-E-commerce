const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mysql = require('mysql2/promise');

async function loadJson(sourceUrl, localRelPath) {
  if (sourceUrl) {
    const { data } = await axios.get(sourceUrl, { timeout: 20000 });
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

async function ensureSchema(conn) {
  await conn.execute(`CREATE TABLE IF NOT EXISTS Brand (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(191) NOT NULL,
    shortName VARCHAR(191) NULL,
    description TEXT NULL,
    status VARCHAR(191) NOT NULL DEFAULT 'active',
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    isDeleted TINYINT(1) NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await conn.execute(`CREATE TABLE IF NOT EXISTS Category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(191) NOT NULL,
    shortName VARCHAR(191) NULL,
    bannerSlug VARCHAR(191) NULL,
    bannerUrl VARCHAR(191) NULL,
    sortIndex INT NULL,
    parentId INT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    isDeleted TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_category_parent FOREIGN KEY (parentId) REFERENCES Category(id) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await conn.execute(`CREATE TABLE IF NOT EXISTS Product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productCode VARCHAR(191) NULL UNIQUE,
    name VARCHAR(191) NOT NULL,
    brandId INT NULL,
    categoryId INT NULL,
    itemNo VARCHAR(191) NULL,
    spec VARCHAR(191) NULL,
    unit VARCHAR(191) NULL,
    price DECIMAL(10,2) NULL,
    imageUrl VARCHAR(191) NULL,
    remark TEXT NULL,
    isOnShelf TINYINT(1) NOT NULL DEFAULT 1,
    isDeleted TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(191) NOT NULL DEFAULT 'active',
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_product_brand FOREIGN KEY (brandId) REFERENCES Brand(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_product_category FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await conn.execute(`CREATE TABLE IF NOT EXISTS ProductImage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    url VARCHAR(512) NOT NULL,
    sortOrder INT NULL,
    CONSTRAINT fk_image_product FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}

exports.main = async (event) => {
  const databaseUrl = event?.databaseUrl || process.env.DATABASE_URL;
  if (!databaseUrl) {
    return { ok: false, error: 'DATABASE_URL 未提供，请在调用时传入 { databaseUrl }。' };
  }

  let pool;
  try {
    pool = await mysql.createPool({ uri: databaseUrl, waitForConnections: true, connectionLimit: 3, queueLimit: 0 });
  } catch (e) {
    return { ok: false, error: `连接数据库失败：${e.message}` };
  }

  let brandUpserts = 0;
  let categoryUpserts = 0;
  let productUpserts = 0;
  let imageCreates = 0;

  try {
    const brandDict = await loadJson(event?.brandUrl, './data/brand_dictionary.json');
    const categoryDict = await loadJson(event?.categoryUrl, './data/category_dictionary.json');
    const productsRaw = await loadJson(event?.productsUrl, './data/products.json');

    const conn = await pool.getConnection();
    await ensureSchema(conn);

    const brands = normalizeBrands(brandDict);
    for (const b of brands) {
      await conn.execute(
        `INSERT INTO Brand (code, name, shortName, description) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), shortName=VALUES(shortName), description=VALUES(description), updatedAt=CURRENT_TIMESTAMP(3)`,
        [b.code, b.name, b.shortName, b.description]
      );
      brandUpserts++;
    }

    const categories = normalizeCategories(categoryDict);
    const codeToId = {};
    for (const c of categories) {
      await conn.execute(
        `INSERT INTO Category (code, name, shortName, bannerSlug, bannerUrl, sortIndex) VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), shortName=VALUES(shortName), bannerSlug=VALUES(bannerSlug), bannerUrl=VALUES(bannerUrl), sortIndex=VALUES(sortIndex), updatedAt=CURRENT_TIMESTAMP(3)`,
        [c.code, c.name, c.shortName, c.bannerSlug, c.bannerUrl, c.sortIndex]
      );
      const [rows] = await conn.execute('SELECT id FROM Category WHERE code = ?', [c.code]);
      if (rows && rows[0]) codeToId[c.code] = rows[0].id;
      categoryUpserts++;
    }
    for (const c of categories) {
      if (c.parentCode && codeToId[c.parentCode]) {
        await conn.execute('UPDATE Category SET parentId = ? WHERE code = ?', [codeToId[c.parentCode], c.code]);
      }
    }

    const products = normalizeProducts(productsRaw);
    for (const p of products) {
      let brandId = null;
      if (p.brandName) {
        const [brows] = await conn.execute('SELECT id FROM Brand WHERE name = ? OR shortName = ? LIMIT 1', [p.brandName, p.brandName]);
        if (brows && brows[0]) brandId = brows[0].id;
      }
      let categoryId = null;
      if (p._categorySlug) {
        const [crows] = await conn.execute('SELECT id FROM Category WHERE bannerSlug = ? LIMIT 1', [p._categorySlug]);
        if (crows && crows[0]) categoryId = crows[0].id;
      }
      const code = p.productCode ?? `AUTO-${p.name}-${p.itemNo || ''}`;
      await conn.execute(
        `INSERT INTO Product (productCode, name, brandId, categoryId, itemNo, spec, unit, price, imageUrl, remark, isOnShelf)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), brandId=VALUES(brandId), categoryId=VALUES(categoryId), itemNo=VALUES(itemNo), spec=VALUES(spec), unit=VALUES(unit), price=VALUES(price), imageUrl=VALUES(imageUrl), remark=VALUES(remark), isOnShelf=VALUES(isOnShelf), updatedAt=CURRENT_TIMESTAMP(3)`,
        [code, p.name, brandId, categoryId, p.itemNo, p.spec, p.unit, p.price, p.imageUrl, p.remark, p.isOnShelf ? 1 : 0]
      );
      productUpserts++;

      const [prodRow] = await conn.execute('SELECT id FROM Product WHERE productCode = ? LIMIT 1', [code]);
      const pid = prodRow && prodRow[0] ? prodRow[0].id : null;
      if (pid) {
        for (let i = 0; i < (p._images || []).length; i++) {
          const img = p._images[i];
          const url = typeof img === 'string' ? img : (img?.url || null);
          if (!url) continue;
          await conn.execute('INSERT INTO ProductImage (productId, url, sortOrder) VALUES (?, ?, ?)', [pid, url, i]);
          imageCreates++;
        }
      }
    }

    await conn.release();
    await pool.end();
    return { ok: true, brands: brandUpserts, categories: categoryUpserts, products: productUpserts, images: imageCreates };
  } catch (error) {
    if (pool) await pool.end();
    return { ok: false, error: error?.message || String(error), brands: brandUpserts, categories: categoryUpserts, products: productUpserts, images: imageCreates };
  }
};