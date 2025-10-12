/**
 * 产品编码生成器
 * 生成格式：品类码(3位) + 品牌码(3位) + 商品码(3位)
 */

const fs = require('fs');
const path = require('path');

// 文件路径
const PRODUCTS_FILE = path.join(__dirname, 'shared/data/products.json');
const CATEGORY_DICT_FILE = path.join(__dirname, 'shared/data/category_dictionary.json');
const BRAND_DICT_FILE = path.join(__dirname, 'shared/data/brand_dictionary.json');
const OUTPUT_FILE = path.join(__dirname, 'shared/data/products_with_codes.json');

class ProductCodeGenerator {
  constructor() {
    this.categoryDict = {};
    this.brandDict = {};
    this.productsByCategory = {};
    this.productCounters = {}; // 用于每个类别+品牌组合的商品计数
  }

  // 加载数据字典
  loadDictionaries() {
    try {
      console.log('加载品类字典...');
      const categoryData = JSON.parse(fs.readFileSync(CATEGORY_DICT_FILE, 'utf8'));
      categoryData.categoryDictionary.categories.forEach(cat => {
        this.categoryDict[cat.name] = cat.code;
      });

      console.log('加载品牌字典...');
      const brandData = JSON.parse(fs.readFileSync(BRAND_DICT_FILE, 'utf8'));
      brandData.brandDictionary.brands.forEach(brand => {
        this.brandDict[brand.name] = brand.code;
      });

      console.log(`品类字典加载完成，共 ${Object.keys(this.categoryDict).length} 个品类`);
      console.log(`品牌字典加载完成，共 ${Object.keys(this.brandDict).length} 个品牌`);
    } catch (error) {
      console.error('加载数据字典失败:', error);
      throw error;
    }
  }

  // 加载产品数据
  loadProducts() {
    try {
      console.log('加载产品数据...');
      const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      return productsData;
    } catch (error) {
      console.error('加载产品数据失败:', error);
      throw error;
    }
  }

  // 获取品类编码
  getCategoryCode(categoryName) {
    const code = this.categoryDict[categoryName];
    if (!code) {
      console.warn(`未找到品类编码: ${categoryName}，使用默认编码 099`);
      return '099'; // 其他类别
    }
    return code;
  }

  // 获取品牌编码
  getBrandCode(brandName) {
    // 处理空品牌
    if (!brandName || brandName.trim() === '') {
      return '099'; // 未标注品牌
    }

    const code = this.brandDict[brandName];
    if (!code) {
      console.warn(`未找到品牌编码: ${brandName}，使用默认编码 099`);
      return '099'; // 未标注品牌
    }
    return code;
  }

  // 生成商品编码
  generateProductCode(categoryName, brandName) {
    const categoryCode = this.getCategoryCode(categoryName);
    const brandCode = this.getBrandCode(brandName);
    
    // 创建组合键用于计数
    const key = `${categoryCode}_${brandCode}`;
    
    // 如果是第一次遇到这个组合，初始化计数器
    if (!this.productCounters[key]) {
      this.productCounters[key] = 0;
    }
    
    // 递增计数器
    this.productCounters[key]++;
    
    // 生成3位数的商品编码
    const productCode = this.productCounters[key].toString().padStart(3, '0');
    
    // 返回完整的产品编码
    return `${categoryCode}${brandCode}${productCode}`;
  }

  // 处理所有产品
  processProducts() {
    console.log('开始处理产品编码...');
    
    const productsData = this.loadProducts();
    let totalProducts = 0;
    let processedProducts = 0;

    // 处理每个分类
    productsData.categories.forEach((category, categoryIndex) => {
      console.log(`处理分类: ${category.name}`);
      
      // 处理该分类下的每个产品
      category.items.forEach((product, productIndex) => {
        totalProducts++;
        
        // 生成产品编码
        const productCode = this.generateProductCode(category.name, product.brand || '');
        
        // 添加编码字段
        product.productCode = productCode;
        product.id = product.id || productCode; // 如果没有id，使用编码作为id
        
        // 添加品类和品牌编码
        product.categoryCode = this.getCategoryCode(category.name);
        product.brandCode = this.getBrandCode(product.brand || '');
        
        processedProducts++;
        
        if (processedProducts % 50 === 0) {
          console.log(`已处理 ${processedProducts}/${totalProducts} 个产品`);
        }
      });
    });

    console.log(`\n编码生成完成！`);
    console.log(`总产品数: ${totalProducts}`);
    console.log(`成功编码: ${processedProducts}`);
    
    return productsData;
  }

  // 保存处理后的数据
  saveProducts(productsData) {
    try {
      console.log('保存编码后的产品数据...');
      
      // 创建备份
      const backupFile = PRODUCTS_FILE.replace('.json', '_backup.json');
      fs.copyFileSync(PRODUCTS_FILE, backupFile);
      console.log(`原文件已备份到: ${backupFile}`);
      
      // 保存新数据到原文件
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2), 'utf8');
      console.log(`产品数据已更新: ${PRODUCTS_FILE}`);
      
      // 同时保存一份带编码的副本
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(productsData, null, 2), 'utf8');
      console.log(`编码数据副本已保存: ${OUTPUT_FILE}`);
      
    } catch (error) {
      console.error('保存文件失败:', error);
      throw error;
    }
  }

  // 生成编码统计报告
  generateReport(productsData) {
    console.log('\n=== 产品编码统计报告 ===');
    
    const stats = {
      totalProducts: 0,
      categoriesCount: productsData.categories.length,
      brandCounts: {},
      categoryCounts: {}
    };

    productsData.categories.forEach(category => {
      const categoryName = category.name;
      stats.categoryCounts[categoryName] = category.items.length;
      stats.totalProducts += category.items.length;

      category.items.forEach(product => {
        const brand = product.brand || '未标注品牌';
        stats.brandCounts[brand] = (stats.brandCounts[brand] || 0) + 1;
      });
    });

    console.log(`总分类数: ${stats.categoriesCount}`);
    console.log(`总产品数: ${stats.totalProducts}`);
    console.log(`品牌数量: ${Object.keys(stats.brandCounts).length}`);
    
    console.log('\n各分类产品数量:');
    Object.entries(stats.categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个产品`);
    });

    console.log('\n编码格式示例:');
    console.log('001001001 = 冷冻点心(001) + 扬州和华(001) + 第1个产品(001)');
    console.log('002006001 = 调味酱(002) + 不二制油(006) + 第1个产品(001)');
    
    return stats;
  }

  // 执行完整流程
  run() {
    try {
      console.log('=== 产品编码生成器启动 ===\n');
      
      // 1. 加载数据字典
      this.loadDictionaries();
      
      // 2. 处理产品编码
      const productsData = this.processProducts();
      
      // 3. 保存结果
      this.saveProducts(productsData);
      
      // 4. 生成报告
      this.generateReport(productsData);
      
      console.log('\n=== 编码生成任务完成 ===');
      
    } catch (error) {
      console.error('编码生成失败:', error);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const generator = new ProductCodeGenerator();
  generator.run();
}

module.exports = ProductCodeGenerator;