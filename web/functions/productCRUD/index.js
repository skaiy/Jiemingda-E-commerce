const mysql = require('mysql2/promise');

/**
 * 产品CRUD云函数
 * 支持操作: list, get, create, update, delete, stats
 */

// 从传入参数或环境变量获取数据库连接
async function getConnection(databaseUrl) {
  const url = databaseUrl || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('数据库连接URL未配置');
  }
  return await mysql.createConnection(url);
}

// 获取产品列表
async function listProducts(conn, params = {}) {
  const { page = 1, pageSize = 50, categoryId, brandId, search, status = 'active' } = params;
  const offset = (page - 1) * pageSize;
  
  let whereClause = 'WHERE p.isDeleted = 0';
  const queryParams = [];
  
  if (status === 'active') {
    whereClause += ' AND p.isOnShelf = 1';
  }
  
  if (categoryId) {
    whereClause += ' AND p.categoryId = ?';
    queryParams.push(categoryId);
  }
  
  if (brandId) {
    whereClause += ' AND p.brandId = ?';
    queryParams.push(brandId);
  }
  
  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.productCode LIKE ? OR p.spec LIKE ?)';
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }
  
  // 获取总数
  const [countResult] = await conn.execute(
    `SELECT COUNT(*) as total FROM Product p ${whereClause}`,
    queryParams
  );
  const total = countResult[0].total;
  
  // 获取分页数据
  const [products] = await conn.execute(
    `SELECT 
      p.id, p.productCode, p.name, p.spec, p.unit, p.price, p.imageUrl, p.remark,
      p.isOnShelf, p.status, p.createdAt, p.updatedAt,
      b.code as brandCode, b.name as brandName, b.shortName as brandShortName,
      c.code as categoryCode, c.name as categoryName, c.shortName as categoryShortName
    FROM Product p
    LEFT JOIN Brand b ON p.brandId = b.id
    LEFT JOIN Category c ON p.categoryId = c.id
    ${whereClause}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?`,
    [...queryParams, pageSize, offset]
  );
  
  return {
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

// 获取单个产品
async function getProduct(conn, id) {
  const [products] = await conn.execute(
    `SELECT 
      p.*, 
      b.code as brandCode, b.name as brandName,
      c.code as categoryCode, c.name as categoryName
    FROM Product p
    LEFT JOIN Brand b ON p.brandId = b.id
    LEFT JOIN Category c ON p.categoryId = c.id
    WHERE p.id = ? AND p.isDeleted = 0`,
    [id]
  );
  
  if (products.length === 0) {
    return null;
  }
  
  return products[0];
}

// 创建产品
async function createProduct(conn, data) {
  const {
    productCode, name, brandId, categoryId, itemNo,
    spec, unit, price, imageUrl, remark, isOnShelf = true
  } = data;
  
  // 检查产品编码是否已存在
  if (productCode) {
    const [existing] = await conn.execute(
      'SELECT id FROM Product WHERE productCode = ?',
      [productCode]
    );
    if (existing.length > 0) {
      throw new Error(`产品编码 ${productCode} 已存在`);
    }
  }
  
  const [result] = await conn.execute(
    `INSERT INTO Product (
      productCode, name, brandId, categoryId, itemNo, spec, unit, 
      price, imageUrl, remark, isOnShelf, isDeleted, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
    [productCode, name, brandId, categoryId, itemNo, spec, unit, 
     price, imageUrl, remark, isOnShelf ? 1 : 0]
  );
  
  return { id: result.insertId, productCode, name };
}

// 更新产品
async function updateProduct(conn, id, data) {
  const {
    productCode, name, brandId, categoryId, itemNo,
    spec, unit, price, imageUrl, remark, isOnShelf, status
  } = data;
  
  // 检查产品是否存在
  const [existing] = await conn.execute(
    'SELECT id FROM Product WHERE id = ? AND isDeleted = 0',
    [id]
  );
  if (existing.length === 0) {
    throw new Error('产品不存在');
  }
  
  // 如果更新产品编码，检查新编码是否已被其他产品使用
  if (productCode) {
    const [codeCheck] = await conn.execute(
      'SELECT id FROM Product WHERE productCode = ? AND id != ?',
      [productCode, id]
    );
    if (codeCheck.length > 0) {
      throw new Error(`产品编码 ${productCode} 已被其他产品使用`);
    }
  }
  
  // 构建更新字段
  const updates = [];
  const values = [];
  
  if (productCode !== undefined) { updates.push('productCode = ?'); values.push(productCode); }
  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (brandId !== undefined) { updates.push('brandId = ?'); values.push(brandId); }
  if (categoryId !== undefined) { updates.push('categoryId = ?'); values.push(categoryId); }
  if (itemNo !== undefined) { updates.push('itemNo = ?'); values.push(itemNo); }
  if (spec !== undefined) { updates.push('spec = ?'); values.push(spec); }
  if (unit !== undefined) { updates.push('unit = ?'); values.push(unit); }
  if (price !== undefined) { updates.push('price = ?'); values.push(price); }
  if (imageUrl !== undefined) { updates.push('imageUrl = ?'); values.push(imageUrl); }
  if (remark !== undefined) { updates.push('remark = ?'); values.push(remark); }
  if (isOnShelf !== undefined) { updates.push('isOnShelf = ?'); values.push(isOnShelf ? 1 : 0); }
  if (status !== undefined) { updates.push('status = ?'); values.push(status); }
  
  updates.push('updatedAt = NOW()');
  values.push(id);
  
  await conn.execute(
    `UPDATE Product SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  return { id, message: '更新成功' };
}

// 删除产品（软删除）
async function deleteProduct(conn, id) {
  const [existing] = await conn.execute(
    'SELECT id, name FROM Product WHERE id = ? AND isDeleted = 0',
    [id]
  );
  
  if (existing.length === 0) {
    throw new Error('产品不存在');
  }
  
  await conn.execute(
    'UPDATE Product SET isDeleted = 1, updatedAt = NOW() WHERE id = ?',
    [id]
  );
  
  return { id, name: existing[0].name, message: '删除成功' };
}

// 获取统计数据
async function getStats(conn) {
  const [productStats] = await conn.execute(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active,
      COUNT(CASE WHEN isOnShelf = 1 AND isDeleted = 0 THEN 1 END) as onShelf
    FROM Product
  `);
  
  const [brandStats] = await conn.execute('SELECT COUNT(*) as count FROM Brand WHERE isDeleted = 0');
  const [categoryStats] = await conn.execute('SELECT COUNT(*) as count FROM Category WHERE isDeleted = 0');
  
  return {
    products: productStats[0],
    brands: brandStats[0].count,
    categories: categoryStats[0].count
  };
}

// 获取品牌列表
async function listBrands(conn) {
  const [brands] = await conn.execute(`
    SELECT b.id, b.code, b.name, b.shortName,
      (SELECT COUNT(*) FROM Product p WHERE p.brandId = b.id AND p.isDeleted = 0) as productCount
    FROM Brand b
    WHERE b.isDeleted = 0
    ORDER BY productCount DESC
  `);
  return brands;
}

// 获取分类列表
async function listCategories(conn) {
  const [categories] = await conn.execute(`
    SELECT c.id, c.code, c.name, c.shortName, c.bannerSlug, c.sortIndex,
      (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id AND p.isDeleted = 0) as productCount
    FROM Category c
    WHERE c.isDeleted = 0
    ORDER BY c.sortIndex, productCount DESC
  `);
  return categories;
}

// 云函数入口
exports.main = async (event, context) => {
  const { action, databaseUrl, ...params } = event;
  
  let conn = null;
  try {
    conn = await getConnection(databaseUrl);
    
    let result;
    switch (action) {
      case 'list':
        result = await listProducts(conn, params);
        break;
      case 'get':
        result = await getProduct(conn, params.id);
        if (!result) {
          return { ok: false, error: '产品不存在' };
        }
        break;
      case 'create':
        result = await createProduct(conn, params);
        break;
      case 'update':
        result = await updateProduct(conn, params.id, params);
        break;
      case 'delete':
        result = await deleteProduct(conn, params.id);
        break;
      case 'stats':
        result = await getStats(conn);
        break;
      case 'brands':
        result = await listBrands(conn);
        break;
      case 'categories':
        result = await listCategories(conn);
        break;
      default:
        return { ok: false, error: `未知操作: ${action}` };
    }
    
    return { ok: true, data: result };
    
  } catch (error) {
    console.error('productCRUD 错误:', error);
    return { ok: false, error: error.message };
  } finally {
    if (conn) {
      await conn.end();
    }
  }
};
