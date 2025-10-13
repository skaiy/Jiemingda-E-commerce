const mysql = require('mysql2/promise');

// 验证数据库结构和数据完整性
async function validateDatabaseStructure(conn) {
  const results = {
    tables: {},
    dataIntegrity: {},
    summary: {}
  };

  try {
    // 1. 检查表结构
    const [tables] = await conn.execute("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    results.tables.list = tableNames;
    results.tables.count = tableNames.length;

    // 2. 检查每个表的结构和数据
    for (const tableName of tableNames) {
      try {
        // 获取表结构
        const [columns] = await conn.execute(`DESCRIBE ${tableName}`);
        
        // 获取数据统计
        const [countResult] = await conn.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        
        // 获取样本数据
        const [sampleData] = await conn.execute(`SELECT * FROM ${tableName} LIMIT 3`);
        
        results.tables[tableName] = {
          columns: columns.map(col => ({
            field: col.Field,
            type: col.Type,
            null: col.Null,
            key: col.Key,
            default: col.Default
          })),
          rowCount: count,
          sampleData: sampleData
        };
      } catch (error) {
        results.tables[tableName] = { error: error.message };
      }
    }

    // 3. 数据完整性检查
    if (tableNames.includes('Product')) {
      // 检查产品数据完整性
      const [productStats] = await conn.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active,
          COUNT(CASE WHEN isOnShelf = 1 AND isDeleted = 0 THEN 1 END) as onShelf,
          COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as missingName,
          COUNT(CASE WHEN brandId IS NULL THEN 1 END) as missingBrand,
          COUNT(CASE WHEN categoryId IS NULL THEN 1 END) as missingCategory
        FROM Product
      `);
      
      results.dataIntegrity.products = productStats[0];
    }

    if (tableNames.includes('Brand')) {
      // 检查品牌数据
      const [brandStats] = await conn.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active,
          COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as missingName
        FROM Brand
      `);
      
      results.dataIntegrity.brands = brandStats[0];
    }

    if (tableNames.includes('Category')) {
      // 检查分类数据
      const [categoryStats] = await conn.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active,
          COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as missingName
        FROM Category
      `);
      
      results.dataIntegrity.categories = categoryStats[0];
    }

    // 4. 关联数据检查
    if (tableNames.includes('Product') && tableNames.includes('Brand') && tableNames.includes('Category')) {
      const [relationStats] = await conn.execute(`
        SELECT 
          COUNT(p.id) as totalProducts,
          COUNT(b.id) as productsWithBrand,
          COUNT(c.id) as productsWithCategory
        FROM Product p
        LEFT JOIN Brand b ON p.brandId = b.id AND b.isDeleted = 0
        LEFT JOIN Category c ON p.categoryId = c.id AND c.isDeleted = 0
        WHERE p.isDeleted = 0
      `);
      
      results.dataIntegrity.relations = relationStats[0];
    }

    // 5. 生成摘要
    results.summary = {
      tablesFound: tableNames.length,
      expectedTables: ['Product', 'Brand', 'Category'],
      missingTables: ['Product', 'Brand', 'Category'].filter(t => !tableNames.includes(t)),
      totalProducts: results.dataIntegrity.products?.total || 0,
      activeProducts: results.dataIntegrity.products?.active || 0,
      onShelfProducts: results.dataIntegrity.products?.onShelf || 0,
      totalBrands: results.dataIntegrity.brands?.total || 0,
      totalCategories: results.dataIntegrity.categories?.total || 0
    };

    return results;
  } catch (error) {
    return { error: error.message, results };
  }
}

// 测试数据库连接
async function testConnection(conn) {
  try {
    const [result] = await conn.execute('SELECT 1 as test');
    return { success: true, message: '数据库连接成功' };
  } catch (error) {
    return { success: false, message: `连接失败: ${error.message}` };
  }
}

exports.main = async (event) => {
  const action = event?.action || 'validate';
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
      case 'test':
        result = await testConnection(conn);
        break;
      case 'validate':
      default:
        result = await validateDatabaseStructure(conn);
        break;
    }
    
    await conn.release();
    await pool.end();
    
    return { ok: true, action, data: result };
  } catch (error) {
    if (pool) await pool.end();
    return { ok: false, error: error?.message || String(error) };
  }
};
