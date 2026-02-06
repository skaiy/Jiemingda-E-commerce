#!/usr/bin/env node
/**
 * 数据同步脚本
 * 将 shared/data/ 中的权威数据源同步到所有使用数据的位置:
 *   - web/deploy/data/
 *   - web/functions/initDatabase/data/
 *   - web/functions/seedCatalog/
 *   - miniprogram/data/ (转为 JS 模块)
 *
 * 用法: node scripts/sync-data.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHARED = path.join(ROOT, 'shared', 'data');

// 数据源文件
const sources = {
  products: path.join(SHARED, 'products.json'),
  categories: path.join(SHARED, 'category_dictionary.json'),
  brands: path.join(SHARED, 'brand_dictionary.json'),
};

// JSON 副本目标
const jsonCopyTargets = [
  // web/deploy/data
  { src: 'products', dest: path.join(ROOT, 'web', 'deploy', 'data', 'products.json') },
  { src: 'categories', dest: path.join(ROOT, 'web', 'deploy', 'data', 'category_dictionary.json') },
  { src: 'brands', dest: path.join(ROOT, 'web', 'deploy', 'data', 'brand_dictionary.json') },
  // web/functions
  { src: 'products', dest: path.join(ROOT, 'web', 'functions', 'initDatabase', 'data', 'products.json') },
  { src: 'products', dest: path.join(ROOT, 'web', 'functions', 'seedCatalog', 'products.json') },
];

// 小程序 JS 模块目标
const jsCopyTargets = [
  { src: 'products', dest: path.join(ROOT, 'miniprogram', 'data', 'products.js'), comment: '产品数据 - 由构建脚本自动生成，请勿手动修改' },
  { src: 'categories', dest: path.join(ROOT, 'miniprogram', 'data', 'categories.js'), comment: '分类字典 - 由构建脚本自动生成' },
  { src: 'brands', dest: path.join(ROOT, 'miniprogram', 'data', 'brands.js'), comment: '品牌字典 - 由构建脚本自动生成' },
];

function loadJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function run() {
  const now = new Date().toISOString().slice(0, 10);
  console.log(`📦 数据同步开始 (${now})`);
  console.log(`   数据源: ${SHARED}\n`);

  // 验证数据源存在
  for (const [key, filePath] of Object.entries(sources)) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 数据源缺失: ${filePath}`);
      process.exit(1);
    }
    const data = loadJson(filePath);
    console.log(`   ✅ ${key}: ${filePath.replace(ROOT, '.')}`);
  }

  // 数据一致性快速检查
  const products = loadJson(sources.products);
  const categories = loadJson(sources.categories);
  const brands = loadJson(sources.brands);

  const catCodes = new Set(categories.categoryDictionary.categories.map(c => c.code));
  const brandCodes = new Set(brands.brandDictionary.brands.map(b => b.code));
  let totalProducts = 0;
  let errors = 0;

  for (const cat of products.categories) {
    for (const item of cat.items || []) {
      totalProducts++;
      if (!catCodes.has(item.categoryCode)) {
        console.error(`   ❌ 产品 ${item.productCode} 的 categoryCode=${item.categoryCode} 不在字典中`);
        errors++;
      }
      if (item.brandCode && !brandCodes.has(item.brandCode)) {
        console.error(`   ❌ 产品 ${item.productCode} 的 brandCode=${item.brandCode} 不在字典中`);
        errors++;
      }
    }
  }

  if (errors > 0) {
    console.error(`\n❌ 数据一致性检查失败 (${errors} 个错误)，终止同步`);
    process.exit(1);
  }
  console.log(`   ✅ 数据一致性检查通过 (${totalProducts} 个产品)\n`);

  // 复制 JSON 文件
  console.log('📋 同步 JSON 副本:');
  for (const target of jsonCopyTargets) {
    const srcPath = sources[target.src];
    const destDir = path.dirname(target.dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, target.dest);
    console.log(`   ✅ ${target.dest.replace(ROOT, '.')}`);
  }

  // 生成小程序 JS 模块
  console.log('\n📱 同步小程序数据模块:');
  for (const target of jsCopyTargets) {
    const data = loadJson(sources[target.src]);
    const jsContent = `// ${target.comment}\n// 生成时间: ${now}\nmodule.exports = ${JSON.stringify(data, null, null).replace(/,/g, ',')};\n`;
    const destDir = path.dirname(target.dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.writeFileSync(target.dest, jsContent, 'utf-8');
    console.log(`   ✅ ${target.dest.replace(ROOT, '.')}`);
  }

  console.log(`\n🎉 数据同步完成!`);
}

run();
