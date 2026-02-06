#!/usr/bin/env node
/**
 * 同步 shared/data 到 miniprogram/data 和 web/deploy/data
 * 用法: node scripts/sync-miniprogram-data.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf-8'));
}

function writeFile(relPath, content) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf-8');
  console.log(`  -> ${relPath}`);
}

console.log('=== 同步数据到小程序 ===');

const products = readJSON('shared/data/products.json');
const categories = readJSON('shared/data/category_dictionary.json');
const brands = readJSON('shared/data/brand_dictionary.json');

// 写入小程序 JS 数据模块
const header = `// 由 sync-miniprogram-data.js 自动生成，请勿手动修改\n// 生成时间: ${new Date().toISOString().split('T')[0]}\n`;

writeFile('miniprogram/data/products.js', header + `module.exports = ${JSON.stringify(products)};\n`);
writeFile('miniprogram/data/categories.js', header + `module.exports = ${JSON.stringify(categories)};\n`);
writeFile('miniprogram/data/brands.js', header + `module.exports = ${JSON.stringify(brands)};\n`);

// 同步到 web 目录
writeFile('web/deploy/data/products.json', JSON.stringify(products, null, 2));
writeFile('web/deploy/data/category_dictionary.json', JSON.stringify(categories, null, 2));
writeFile('web/deploy/data/brand_dictionary.json', JSON.stringify(brands, null, 2));
writeFile('web/functions/initDatabase/data/products.json', JSON.stringify(products, null, 2));

// 生成 category_config.json (web legacy format)
const config = {
  categories: categories.categoryDictionary.categories.map(c => ({
    name: c.name,
    shortName: c.shortName,
    slug: c.slug
  }))
};
writeFile('web/deploy/data/category_config.json', JSON.stringify(config, null, 2));
writeFile('web/functions/initDatabase/data/category_config.json', JSON.stringify(config, null, 2));

// 统计
const totalProducts = products.categories.reduce((sum, c) => sum + (c.items || []).length, 0);
console.log(`\n✅ 同步完成！`);
console.log(`  产品数: ${totalProducts}`);
console.log(`  分类数: ${categories.categoryDictionary.categories.length}`);
console.log(`  品牌数: ${brands.brandDictionary.brands.length}`);
