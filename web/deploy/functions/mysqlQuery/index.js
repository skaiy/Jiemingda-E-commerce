const mysql = require('mysql2/promise');

// 查询产品数据并按分类组织
async function queryProductsByCategory(conn, event) {
  const { brandName, searchTerm } = event || {};
  
  let query = `
    SELECT
      p.id, p.productCode, p.name, p.itemNo, p.spec, p.unit, p.price, p.imageUrl, p.remark, p.isOnShelf,
      p.brandId, p.categoryId,
      b.code as brandCode, b.name as brandName, b.shortName as brandShortName,
      c.name as categoryName, c.bannerSlug as categorySlug, c.shortName as categoryShortName
    FROM Product p
    LEFT JOIN Brand b ON p.brandId = b.id
    LEFT JOIN Category c ON p.categoryId = c.id
    WHERE p.isDeleted = 0 AND p.isOnShelf = 1
  `;
  
  const params = [];
  
  if (brandName) {
    query += ' AND (b.name = ? OR b.shortName = ?)';
    params.push(brandName, brandName);
  }
  
  if (searchTerm) {
    query += ' AND (p.name LIKE ? OR p.itemNo LIKE ? OR p.spec LIKE ?)';
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  query += ' ORDER BY c.sortIndex ASC, c.name ASC, p.updatedAt DESC';
  
  const [rows] = await conn.execute(query, params);
  
  // 按分类组织数据
  const categoryMap = new Map();
  
  rows.forEach(product => {
    const categoryName = product.categoryName || '未分类';
    const categorySlug = product.categorySlug || 'uncategorized';
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        slug: categorySlug,
        items: []
      });
    }
    
    // 格式化产品数据以匹配前端期望的格式
    const item = {
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      itemNo: product.itemNo,
      spec: product.spec,
      unit: product.unit,
      price: product.price ? product.price.toString() : '',
      image: product.imageUrl,
      description: product.remark,
      isOnShelf: !!product.isOnShelf,
      brandId: product.brandId,
      categoryId: product.categoryId,
      brand: product.brandName,
      brandName: product.brandName,
      brandCode: product.brandCode,
      brandShortName: product.brandShortName
    };
    
    categoryMap.get(categoryName).items.push(item);
  });
  
  const categories = Array.from(categoryMap.values());
  
  return {
    categories,
    updatedAt: Date.now(),
    count: rows.length,
    version: 'mysql-v1.0'
  };
}

// 查询分类配置数据
async function queryCategoryConfig(conn) {
  const [rows] = await conn.execute(`
    SELECT 
      c.id, c.code, c.name, c.shortName, c.bannerSlug, c.bannerUrl, c.sortIndex,
      COUNT(p.id) as productCount
    FROM Category c
    LEFT JOIN Product p ON c.id = p.categoryId AND p.isDeleted = 0 AND p.isOnShelf = 1
    WHERE c.isDeleted = 0
    GROUP BY c.id, c.code, c.name, c.shortName, c.bannerSlug, c.bannerUrl, c.sortIndex
    ORDER BY productCount DESC, c.sortIndex ASC, c.name ASC
  `);
  
  const banner_slugs = {};
  const short_names = {};
  
  rows.forEach(category => {
    if (category.bannerSlug) {
      banner_slugs[category.name] = category.bannerSlug;
    }
    if (category.shortName) {
      short_names[category.name] = category.shortName;
    }
  });
  
  return {
    banner_slugs,
    short_names,
    categories: rows
  };
}

// 查询品牌字典数据
async function queryBrandDictionary(conn) {
  const [rows] = await conn.execute(`
    SELECT 
      b.id, b.code, b.name, b.shortName, b.description,
      COUNT(p.id) as productCount
    FROM Brand b
    LEFT JOIN Product p ON b.id = p.brandId AND p.isDeleted = 0 AND p.isOnShelf = 1
    WHERE b.isDeleted = 0
    GROUP BY b.id, b.code, b.name, b.shortName, b.description
    HAVING productCount > 0
    ORDER BY productCount DESC, b.name ASC
  `);
  
  const brands = rows.map(brand => ({
    id: brand.id,
    code: brand.code,
    name: brand.name,
    shortName: brand.shortName,
    description: brand.description,
    productCount: brand.productCount
  }));
  
  return {
    brandDictionary: {
      brands
    }
  };
}

// 查询分类字典数据
async function queryCategoryDictionary(conn) {
  const [rows] = await conn.execute(`
    SELECT 
      c.id, c.code, c.name, c.shortName, c.bannerSlug, c.bannerUrl, c.sortIndex,
      COUNT(p.id) as productCount
    FROM Category c
    LEFT JOIN Product p ON c.id = p.categoryId AND p.isDeleted = 0 AND p.isOnShelf = 1
    WHERE c.isDeleted = 0
    GROUP BY c.id, c.code, c.name, c.shortName, c.bannerSlug, c.bannerUrl, c.sortIndex
    ORDER BY productCount DESC, c.sortIndex ASC, c.name ASC
  `);
  
  const categories = rows.map(category => ({
    id: category.id,
    code: category.code,
    name: category.name,
    shortName: category.shortName,
    slug: category.bannerSlug,
    bannerUrl: category.bannerUrl,
    sortIndex: category.sortIndex,
    productCount: category.productCount
  }));
  
  return {
    categoryDictionary: {
      categories
    }
  };
}

// 创建产品
async function createProduct(conn, event) {
  const p = event?.payload || {};
  const name = String(p.name || '').trim();
  if (!name) throw new Error('缺少产品名称');
  let productCode = p.productCode ? String(p.productCode).trim() : null;
  if (!productCode) {
    const ts = Date.now().toString(36).toUpperCase();
    productCode = `P${ts}`;
  }
  const brandId = p.brandId ?? null;
  const categoryId = p.categoryId ?? null;
  const itemNo = p.itemNo ?? null;
  const spec = p.spec ?? null;
  const unit = p.unit ?? null;
  const price = p.price != null ? Number(p.price) : null;
  const imageUrl = p.imageUrl ?? null;
  const remark = p.remark ?? null;
  const isOnShelf = p.isOnShelf !== undefined ? (p.isOnShelf ? 1 : 0) : 1;

  const [result] = await conn.execute(
    'INSERT INTO Product (productCode, name, brandId, categoryId, itemNo, spec, unit, price, imageUrl, remark, isOnShelf, status, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active", 0)',
    [productCode, name, brandId, categoryId, itemNo, spec, unit, price, imageUrl, remark, isOnShelf]
  );
  return { id: result.insertId, productCode };
}

// 更新产品（部分更新：仅更新 event.payload 中出现的字段）
async function updateProduct(conn, event) {
  const p = event?.payload || {};
  const id = p.id;
  if (!id) throw new Error('缺少产品 id');

  const fields = [];
  const params = [];

  // 若提供 productCode：空字符串则生成一个，否则使用提供的值
  if (Object.prototype.hasOwnProperty.call(p, 'productCode')) {
    let productCode = p.productCode ? String(p.productCode).trim() : null;
    if (!productCode) {
      const ts = Date.now().toString(36).toUpperCase();
      productCode = `P${ts}`;
    }
    fields.push('productCode = ?');
    params.push(productCode);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'name')) {
    fields.push('name = ?');
    params.push(String(p.name || '').trim());
  }

  if (Object.prototype.hasOwnProperty.call(p, 'brandId')) {
    fields.push('brandId = ?');
    params.push(p.brandId ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'categoryId')) {
    fields.push('categoryId = ?');
    params.push(p.categoryId ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'itemNo')) {
    fields.push('itemNo = ?');
    params.push(p.itemNo ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'spec')) {
    fields.push('spec = ?');
    params.push(p.spec ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'unit')) {
    fields.push('unit = ?');
    params.push(p.unit ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'price')) {
    const price = p.price != null ? Number(p.price) : null;
    fields.push('price = ?');
    params.push(Number.isFinite(price) ? price : null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'imageUrl')) {
    fields.push('imageUrl = ?');
    params.push(p.imageUrl ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'remark')) {
    fields.push('remark = ?');
    params.push(p.remark ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(p, 'isOnShelf')) {
    fields.push('isOnShelf = ?');
    params.push(p.isOnShelf ? 1 : 0);
  }

  // 总是更新更新时间
  fields.push('updatedAt = CURRENT_TIMESTAMP(3)');

  if (fields.length === 1) { // 只有 updatedAt
    return { affectedRows: 0, message: '未提供可更新字段' };
  }

  const sql = `UPDATE Product SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);
  const [res] = await conn.execute(sql, params);
  return { affectedRows: res.affectedRows };
}

// 删除产品（软删除）
async function deleteProduct(conn, event) {
  const id = event?.payload?.id;
  if (!id) throw new Error('缺少产品 id');
  const [res] = await conn.execute('UPDATE Product SET isDeleted = 1 WHERE id = ?', [id]);
  return { affectedRows: res.affectedRows };
}

exports.main = async (event) => {
  const action = event?.action || 'products'; // 'products', 'config', 'brands', 'categories'
  const databaseUrl = event?.databaseUrl || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return { ok: false, error: 'DATABASE_URL 未提供，请在调用时传入 { databaseUrl }。' };
  }

  let pool;
  try {
    pool = await mysql.createPool({ 
      uri: databaseUrl, 
      waitForConnections: true, 
      connectionLimit: 3, 
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000
    });
  } catch (e) {
    return { ok: false, error: `连接数据库失败：${e.message}` };
  }

  try {
    const conn = await pool.getConnection();
    
    let result;
    
    switch (action) {
      case 'products':
        result = await queryProductsByCategory(conn, event);
        break;
      case 'config':
        result = await queryCategoryConfig(conn);
        break;
      case 'brands':
        result = await queryBrandDictionary(conn);
        break;
      case 'brands.all':
        result = (await queryBrandDictionary(conn)).brandDictionary?.brands || [];
        break;
      case 'categories':
        result = await queryCategoryDictionary(conn);
        break;
      case 'categories.all':
        result = (await queryCategoryDictionary(conn)).categoryDictionary?.categories || [];
        break;
      case 'product.create':
        result = await createProduct(conn, event);
        break;
      case 'product.update':
        result = await updateProduct(conn, event);
        break;
      case 'product.delete':
        result = await deleteProduct(conn, event);
        break;
      default:
        result = await queryProductsByCategory(conn, event);
    }
    
    await conn.release();
    await pool.end();
    
    return { ok: true, action, data: result };
  } catch (error) {
    if (pool) await pool.end();
    return { ok: false, error: error?.message || String(error) };
  }
};
