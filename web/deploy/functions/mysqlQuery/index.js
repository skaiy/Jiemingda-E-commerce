const mysql = require('mysql2/promise');

// 查询产品数据并按分类组织
async function queryProductsByCategory(conn, event) {
  const { brandName, searchTerm } = event || {};
  
  let query = `
    SELECT 
      p.id, p.productCode, p.name, p.itemNo, p.spec, p.unit, p.price, p.imageUrl, p.remark, p.isOnShelf,
      b.name as brand, b.shortName as brandShortName,
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
      name: product.name,
      itemNo: product.itemNo,
      spec: product.spec,
      unit: product.unit,
      price: product.price ? product.price.toString() : '',
      brand: product.brand,
      description: product.remark,
      image: product.imageUrl,
      productCode: product.productCode
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
    id: category.code,
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
      case 'categories':
        result = await queryCategoryDictionary(conn);
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
