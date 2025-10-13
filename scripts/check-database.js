const mysql = require('mysql2/promise');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

async function checkDatabase() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  console.log('🔍 正在检查数据库连接和数据完整性...\n');

  let connection;
  try {
    // 创建连接
    connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ 数据库连接成功');

    // 检查表结构
    console.log('\n📋 检查表结构:');
    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`   发现 ${tableNames.length} 个表: ${tableNames.join(', ')}`);

    // 检查每个表的数据量
    console.log('\n📊 数据统计:');
    for (const tableName of tableNames) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = result[0].count;
        console.log(`   ${tableName}: ${count} 条记录`);
      } catch (error) {
        console.log(`   ${tableName}: 查询失败 - ${error.message}`);
      }
    }

    // 详细检查主要表
    if (tableNames.includes('Product')) {
      console.log('\n🛍️  产品表详细信息:');
      const [productStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active,
          COUNT(CASE WHEN isOnShelf = 1 AND isDeleted = 0 THEN 1 END) as onShelf,
          COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as missingName,
          COUNT(CASE WHEN brandId IS NULL THEN 1 END) as missingBrand,
          COUNT(CASE WHEN categoryId IS NULL THEN 1 END) as missingCategory
        FROM Product
      `);
      
      const stats = productStats[0];
      console.log(`   总产品数: ${stats.total}`);
      console.log(`   活跃产品: ${stats.active}`);
      console.log(`   上架产品: ${stats.onShelf}`);
      console.log(`   缺少名称: ${stats.missingName}`);
      console.log(`   缺少品牌: ${stats.missingBrand}`);
      console.log(`   缺少分类: ${stats.missingCategory}`);

      // 显示一些样本数据
      console.log('\n📦 产品样本数据:');
      const [sampleProducts] = await connection.execute(`
        SELECT p.name, p.itemNo, p.spec, b.name as brand, c.name as category
        FROM Product p
        LEFT JOIN Brand b ON p.brandId = b.id
        LEFT JOIN Category c ON p.categoryId = c.id
        WHERE p.isDeleted = 0 AND p.isOnShelf = 1
        LIMIT 5
      `);
      
      sampleProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.itemNo || 'N/A'}) - ${product.brand || '无品牌'} / ${product.category || '无分类'}`);
      });
    }

    if (tableNames.includes('Brand')) {
      console.log('\n🏷️  品牌表信息:');
      const [brandStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active
        FROM Brand
      `);
      
      console.log(`   总品牌数: ${brandStats[0].total}`);
      console.log(`   活跃品牌: ${brandStats[0].active}`);

      // 显示品牌列表
      const [brands] = await connection.execute(`
        SELECT b.name, b.shortName, COUNT(p.id) as productCount
        FROM Brand b
        LEFT JOIN Product p ON b.id = p.brandId AND p.isDeleted = 0
        WHERE b.isDeleted = 0
        GROUP BY b.id, b.name, b.shortName
        ORDER BY productCount DESC
        LIMIT 10
      `);
      
      console.log('   热门品牌:');
      brands.forEach((brand, index) => {
        console.log(`   ${index + 1}. ${brand.name} (${brand.shortName || 'N/A'}): ${brand.productCount} 个产品`);
      });
    }

    if (tableNames.includes('Category')) {
      console.log('\n📂 分类表信息:');
      const [categoryStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active
        FROM Category
      `);
      
      console.log(`   总分类数: ${categoryStats[0].total}`);
      console.log(`   活跃分类: ${categoryStats[0].active}`);

      // 显示分类列表
      const [categories] = await connection.execute(`
        SELECT c.name, c.shortName, COUNT(p.id) as productCount
        FROM Category c
        LEFT JOIN Product p ON c.id = p.categoryId AND p.isDeleted = 0
        WHERE c.isDeleted = 0
        GROUP BY c.id, c.name, c.shortName
        ORDER BY productCount DESC
      `);
      
      console.log('   分类列表:');
      categories.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (${category.shortName || 'N/A'}): ${category.productCount} 个产品`);
      });
    }

    console.log('\n✅ 数据库检查完成！');

  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };
