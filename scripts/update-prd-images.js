const fs = require('fs');
const path = require('path');

console.log('开始处理prd格式图片匹配...');

const photosDir = './shared/data/photos';
const productsFile = './shared/data/products.json';

try {
    // 1. 获取所有prd格式图片
    const imageFiles = fs.readdirSync(photosDir);
    const prdImages = imageFiles.filter(file => {
        const name = path.parse(file).name;
        return /^prd\d+$/.test(name);
    }).sort((a, b) => {
        const numA = parseInt(path.parse(a).name.replace('prd', ''));
        const numB = parseInt(path.parse(b).name.replace('prd', ''));
        return numA - numB;
    });
    
    console.log(`找到 ${prdImages.length} 个prd格式图片`);
    
    // 2. 读取产品数据
    const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    
    // 3. 找到没有图片的产品
    const productsWithoutImages = [];
    
    productsData.categories.forEach(category => {
        category.items.forEach(product => {
            if (!product.image || product.image === '') {
                productsWithoutImages.push(product);
            }
        });
    });
    
    console.log(`找到 ${productsWithoutImages.length} 个没有图片的产品`);
    
    // 4. 为没有图片的产品分配prd格式图片
    let assignedCount = 0;
    const maxAssign = Math.min(productsWithoutImages.length, prdImages.length);
    
    for (let i = 0; i < maxAssign; i++) {
        productsWithoutImages[i].image = `photos/${prdImages[i]}`;
        assignedCount++;
        console.log(`分配: ${productsWithoutImages[i].id} -> ${prdImages[i]}`);
    }
    
    // 5. 保存更新后的数据
    fs.writeFileSync(productsFile, JSON.stringify(productsData, null, 2));
    
    console.log(`完成! 为 ${assignedCount} 个产品分配了prd格式图片`);
    
    // 6. 生成统计报告
    const totalProducts = productsData.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const productsWithImages = productsData.categories.reduce((sum, cat) => {
        return sum + cat.items.filter(item => item.image && item.image !== '').length;
    }, 0);
    
    console.log('\n=== 最终统计 ===');
    console.log(`总产品数: ${totalProducts}`);
    console.log(`有图片的产品: ${productsWithImages}`);
    console.log(`图片覆盖率: ${((productsWithImages / totalProducts) * 100).toFixed(1)}%`);
    
} catch (error) {
    console.error('错误:', error.message);
}