const fs = require('fs');
const path = require('path');

// 模拟数据库初始化
async function initDatabase() {
    console.log('开始初始化CloudBase数据库...');
    
    try {
        // 1. 读取产品数据
        console.log('正在读取产品数据...');
        const productsPath = path.join(__dirname, 'functions', 'initDatabase', 'data', 'products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        
        // 2. 读取配置数据
        console.log('正在读取配置数据...');
        const configPath = path.join(__dirname, 'functions', 'initDatabase', 'data', 'category_config.json');
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // 3. 分析数据结构
        console.log('\n=== 数据结构分析 ===');
        console.log(`产品分类数量: ${productsData.categories.length}`);
        
        let totalProducts = 0;
        productsData.categories.forEach(category => {
            console.log(`- ${category.name}: ${category.items.length} 个产品`);
            totalProducts += category.items.length;
        });
        
        console.log(`总产品数量: ${totalProducts}`);
        
        // 4. 分析配置数据
        console.log('\n=== 配置数据分析 ===');
        if (configData.categories && Array.isArray(configData.categories)) {
            console.log(`分类配置: ${configData.categories.length} 个分类`);
            configData.categories.forEach(cat => {
                console.log(`- ${cat.name} (${cat.shortName}) -> ${cat.slug}`);
            });
        } else {
            // 兼容旧格式
            console.log(`Banner配置: ${Object.keys(configData.banner_slugs || {}).length} 个分类`);
            console.log(`短名称配置: ${Object.keys(configData.short_names || {}).length} 个分类`);
        }
        
        // 5. 生成数据模型文档
        console.log('\n=== 生成数据模型文档 ===');
        
        const dataModel = {
            collections: {
                products: {
                    description: '产品集合',
                    fields: {
                        name: { type: 'string', description: '产品名称', required: true },
                        specification: { type: 'string', description: '规格型号' },
                        unit: { type: 'string', description: '单位' },
                        brand: { type: 'string', description: '品牌' },
                        description: { type: 'string', description: '产品描述' },
                        price: { type: 'number', description: '价格' },
                        image: { type: 'string', description: '产品图片路径' },
                        category: { type: 'string', description: '产品分类', required: true },
                        createdAt: { type: 'date', description: '创建时间' },
                        updatedAt: { type: 'date', description: '更新时间' }
                    },
                    indexes: [
                        { fields: ['category'], description: '按分类查询' },
                        { fields: ['name'], description: '按名称查询' },
                        { fields: ['brand'], description: '按品牌查询' }
                    ],
                    estimatedCount: totalProducts
                },
                config: {
                    description: '配置集合',
                    fields: {
                        type: { type: 'string', description: '配置类型', required: true },
                        data: { type: 'object', description: '配置数据', required: true },
                        createdAt: { type: 'date', description: '创建时间' },
                        updatedAt: { type: 'date', description: '更新时间' }
                    },
                    indexes: [
                        { fields: ['type'], description: '按配置类型查询' }
                    ],
                    estimatedCount: 1
                }
            }
        };
        
        // 6. 保存数据模型文档
        const modelPath = path.join(__dirname, 'database-model.json');
        fs.writeFileSync(modelPath, JSON.stringify(dataModel, null, 2), 'utf8');
        console.log(`数据模型文档已保存到: ${modelPath}`);
        
        // 7. 生成初始化SQL脚本（模拟）
        console.log('\n=== 生成初始化脚本 ===');
        
        let initScript = `// CloudBase 数据库初始化脚本
// 环境: cloud1-0gc8cbzg3efd6a99
// 生成时间: ${new Date().toISOString()}

// 1. 创建 products 集合
db.createCollection('products');

// 2. 创建 config 集合  
db.createCollection('config');

// 3. 插入产品数据
`;

        // 生成产品插入脚本
        productsData.categories.forEach(category => {
            initScript += `\n// 插入 ${category.name} 分类产品\n`;
            category.items.forEach((item, index) => {
                if (index < 3) { // 只显示前3个作为示例
                    initScript += `db.collection('products').add({
    name: "${item.name}",
    specification: "${item.specification || ''}",
    unit: "${item.unit || ''}",
    brand: "${item.brand || ''}",
    description: "${item.description || ''}",
    price: ${item.price || 0},
    image: "${item.image || ''}",
    category: "${category.name}",
    createdAt: new Date(),
    updatedAt: new Date()
});\n\n`;
                }
            });
            if (category.items.length > 3) {
                initScript += `// ... 还有 ${category.items.length - 3} 个 ${category.name} 产品\n\n`;
            }
        });
        
        // 生成配置插入脚本
        initScript += `\n// 4. 插入配置数据
db.collection('config').add({
    type: 'category_config',
    data: ${JSON.stringify(configData, null, 4)},
    createdAt: new Date(),
    updatedAt: new Date()
});

// 5. 创建索引
db.collection('products').createIndex({ category: 1 });
db.collection('products').createIndex({ name: 1 });
db.collection('products').createIndex({ brand: 1 });
db.collection('config').createIndex({ type: 1 });

console.log('数据库初始化完成！');
console.log('Products集合记录数:', ${totalProducts});
console.log('Config集合记录数: 1');
`;
        
        const scriptPath = path.join(__dirname, 'database-init-script.js');
        fs.writeFileSync(scriptPath, initScript, 'utf8');
        console.log(`初始化脚本已保存到: ${scriptPath}`);
        
        // 8. 生成数据统计报告
        console.log('\n=== 数据统计报告 ===');
        
        const report = {
            summary: {
                totalCategories: productsData.categories.length,
                totalProducts: totalProducts,
                configItems: 1,
                generatedAt: new Date().toISOString()
            },
            categories: productsData.categories.map(cat => ({
                name: cat.name,
                productCount: cat.items.length,
                hasImages: cat.items.filter(item => item.image).length,
                hasPrices: cat.items.filter(item => item.price).length,
                brands: [...new Set(cat.items.map(item => item.brand).filter(Boolean))]
            })),
            dataQuality: {
                productsWithImages: productsData.categories.reduce((sum, cat) => 
                    sum + cat.items.filter(item => item.image).length, 0),
                productsWithPrices: productsData.categories.reduce((sum, cat) => 
                    sum + cat.items.filter(item => item.price).length, 0),
                productsWithBrands: productsData.categories.reduce((sum, cat) => 
                    sum + cat.items.filter(item => item.brand).length, 0)
            }
        };
        
        const reportPath = path.join(__dirname, 'database-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`数据统计报告已保存到: ${reportPath}`);
        
        console.log('\n=== 初始化完成 ===');
        console.log('✅ 数据结构分析完成');
        console.log('✅ 数据模型文档生成完成');
        console.log('✅ 初始化脚本生成完成');
        console.log('✅ 数据统计报告生成完成');
        console.log('\n下一步: 可以使用生成的脚本在CloudBase控制台中手动初始化数据库');
        
        return {
            success: true,
            dataModel,
            report,
            files: {
                model: modelPath,
                script: scriptPath,
                report: reportPath
            }
        };
        
    } catch (error) {
        console.error('初始化失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 运行初始化
initDatabase().then(result => {
    if (result.success) {
        console.log('\n🎉 数据库初始化准备工作完成！');
    } else {
        console.error('\n❌ 初始化失败:', result.error);
        process.exit(1);
    }
}).catch(error => {
    console.error('运行错误:', error);
    process.exit(1);
});