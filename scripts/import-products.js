const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

// 解析CSV文件
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length >= headers.length) {
      const product = {};
      headers.forEach((header, index) => {
        product[header] = values[index] || '';
      });
      products.push(product);
    }
  }

  return products;
}

async function importProducts() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  console.log('📦 开始导入产品数据...\n');

  // 读取CSV文件
  const csvPath = path.join(__dirname, '../docs/产品列表.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ 产品列表CSV文件不存在:', csvPath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const products = parseCSV(csvContent);
  console.log(`📋 从CSV文件读取到 ${products.length} 个产品`);

  let connection;
  try {
    // 创建连接
    connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ 数据库连接成功');

    // 开始事务
    await connection.beginTransaction();

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // 查找品牌ID
        let brandId = null;
        if (product['品牌代码']) {
          const [brandResult] = await connection.execute(
            'SELECT id FROM Brand WHERE code = ?',
            [product['品牌代码']]
          );
          if (brandResult.length > 0) {
            brandId = brandResult[0].id;
          }
        }

        // 查找分类ID
        let categoryId = null;
        if (product['分类代码']) {
          const [categoryResult] = await connection.execute(
            'SELECT id FROM Category WHERE code = ?',
            [product['分类代码']]
          );
          if (categoryResult.length > 0) {
            categoryId = categoryResult[0].id;
          }
        }

        // 检查产品是否已存在
        const [existingProduct] = await connection.execute(
          'SELECT id FROM Product WHERE productCode = ?',
          [product['产品编码']]
        );

        if (existingProduct.length > 0) {
          // 更新现有产品
          await connection.execute(`
            UPDATE Product SET
              name = ?,
              brandId = ?,
              categoryId = ?,
              itemNo = ?,
              spec = ?,
              unit = ?,
              price = ?,
              imageUrl = ?,
              remark = ?,
              updatedAt = NOW()
            WHERE productCode = ?
          `, [
            product['产品名称'],
            brandId,
            categoryId,
            product['id'], // 使用CSV中的id作为itemNo
            product['规格'],
            product['单位'],
            product['价格'] ? parseFloat(product['价格']) : null,
            product['图片'],
            product['描述'],
            product['产品编码']
          ]);
          console.log(`🔄 更新产品: ${product['产品名称']}`);
        } else {
          // 插入新产品
          await connection.execute(`
            INSERT INTO Product (
              productCode, name, brandId, categoryId, itemNo, spec, unit, price, imageUrl, remark, isOnShelf, isDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
          `, [
            product['产品编码'],
            product['产品名称'],
            brandId,
            categoryId,
            product['id'], // 使用CSV中的id作为itemNo
            product['规格'],
            product['单位'],
            product['价格'] ? parseFloat(product['价格']) : null,
            product['图片'],
            product['描述']
          ]);
          console.log(`✅ 导入产品: ${product['产品名称']}`);
        }

        importedCount++;
      } catch (error) {
        console.error(`❌ 导入产品失败 [${product['产品名称']}]:`, error.message);
        errorCount++;
      }
    }

    // 提交事务
    await connection.commit();

    console.log('\n📊 导入统计:');
    console.log(`   成功导入: ${importedCount} 个产品`);
    console.log(`   跳过: ${skippedCount} 个产品`);
    console.log(`   错误: ${errorCount} 个产品`);

    // 显示最终统计
    const [finalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN isDeleted = 0 THEN 1 END) as active,
        COUNT(CASE WHEN isOnShelf = 1 AND isDeleted = 0 THEN 1 END) as onShelf
      FROM Product
    `);

    console.log('\n📈 数据库最终状态:');
    console.log(`   总产品数: ${finalStats[0].total}`);
    console.log(`   活跃产品: ${finalStats[0].active}`);
    console.log(`   上架产品: ${finalStats[0].onShelf}`);

    console.log('\n✅ 产品数据导入完成！');

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ 导入失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  importProducts();
}

module.exports = { importProducts };
