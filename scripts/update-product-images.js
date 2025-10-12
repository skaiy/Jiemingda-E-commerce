const fs = require('fs');
const path = require('path');

console.log('开始图片匹配流程...');

// 读取图片目录
const photosDir = './shared/data/photos';
const productsFile = './shared/data/products.json';

try {
    // 1. 获取所有图片文件
    const imageFiles = fs.readdirSync(photosDir);
    console.log(`找到 ${imageFiles.length} 个文件`);
    
    // 2. 筛选图片文件并分类
    const productIdImages = [];
    const prdImages = [];
    
    imageFiles.forEach(file => {
        const name = path.parse(file).name;
        if (/^\d{9}$/.test(name)) {
            productIdImages.push(file);
        } else if (/^prd\d+$/.test(name)) {
            prdImages.push(file);
        }
    });
    
    console.log(`商品ID格式图片: ${productIdImages.length} 个`);
    console.log(`prd格式图片: ${prdImages.length} 个`);
    
    // 3. 读取产品数据
    const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    
    // 4. 创建备份
    fs.copyFileSync(productsFile, productsFile + '.backup');
    console.log('已创建备份文件');
    
    // 5. 匹配图片
    let matchedCount = 0;
    
    productsData.categories.forEach(category => {
        category.items.forEach(product => {
            const productId = product.id;
            
            // 查找对应的图片文件
            const matchingImage = productIdImages.find(img => 
                path.parse(img).name === productId
            );
            
            if (matchingImage) {
                product.image = `photos/${matchingImage}`;
                matchedCount++;
                console.log(`匹配: ${productId} -> ${matchingImage}`);
            }
        });
    });
    
    // 6. 保存更新后的数据
    fs.writeFileSync(productsFile, JSON.stringify(productsData, null, 2));
    
    console.log(`完成! 共匹配 ${matchedCount} 个产品图片`);
    
} catch (error) {
    console.error('错误:', error.message);
}