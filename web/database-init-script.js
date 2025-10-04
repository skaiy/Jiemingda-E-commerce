// CloudBase 数据库初始化脚本
// 环境: cloud1-0gc8cbzg3efd6a99
// 生成时间: 2025-09-25T16:33:15.277Z

// 1. 创建 products 集合
db.createCollection('products');

// 2. 创建 config 集合  
db.createCollection('config');

// 3. 插入产品数据

// 插入 调味酱/沙拉酱 分类产品
db.collection('products').add({
    name: "片状可丝达蛋黄（不二）",
    specification: "",
    unit: "箱",
    brand: "不二（中国）投资有限公司",
    description: "规格: 1*10*0.6kg / 单位: 箱",
    price: 0,
    image: "",
    category: "调味酱/沙拉酱",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "可丝达酱（蛋奶味）（不二）",
    specification: "",
    unit: "箱",
    brand: "不二（中国）投资有限公司",
    description: "规格: 1*6*1kg / 单位: 箱",
    price: 0,
    image: "",
    category: "调味酱/沙拉酱",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "可丝达酱（酸奶味）（不二）",
    specification: "",
    unit: "箱",
    brand: "不二（中国）投资有限公司",
    description: "规格: 1*6*1kg / 单位: 箱",
    price: 0,
    image: "",
    category: "调味酱/沙拉酱",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 23 个 调味酱/沙拉酱 产品


// 插入 馅料/卡仕达 分类产品
db.collection('products').add({
    name: "焙可诗即用馅料香缇蛋奶（南侨）",
    specification: "",
    unit: "箱",
    brand: "",
    description: "规格: 1*6*750g / 单位: 箱",
    price: 0,
    image: "",
    category: "馅料/卡仕达",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "利好枣泥馅（3）",
    specification: "",
    unit: "箱",
    brand: "天津市利好公司",
    description: "规格: 1*3*5kg / 单位: 箱",
    price: 0,
    image: "",
    category: "馅料/卡仕达",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "利好山楂馅（3）",
    specification: "",
    unit: "箱",
    brand: "天津市利好公司",
    description: "规格: 1*3*5kg / 单位: 箱",
    price: 0,
    image: "",
    category: "馅料/卡仕达",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 5 个 馅料/卡仕达 产品


// 插入 罐头/蜜饯 分类产品
db.collection('products').add({
    name: "蓝钻杏仁粉（扁桃仁粉）",
    specification: "",
    unit: "箱",
    brand: "进口产品",
    description: "规格: 1*11.34kg / 单位: 箱",
    price: 0,
    image: "",
    category: "罐头/蜜饯",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "蓝钻杏仁粉（扁桃仁粉）",
    specification: "",
    unit: "公斤",
    brand: "进口产品",
    description: "规格: 1*11.34kg / 单位: 公斤",
    price: 0,
    image: "",
    category: "罐头/蜜饯",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "蓝钻杏仁片（扁桃仁片）",
    specification: "",
    unit: "箱",
    brand: "进口产品",
    description: "规格: 1*11.34kg / 单位: 箱",
    price: 0,
    image: "",
    category: "罐头/蜜饯",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 3 个 罐头/蜜饯 产品


// 插入 果馅/果干/果酱 分类产品
db.collection('products').add({
    name: "高师傅菠萝果肉馅",
    specification: "",
    unit: "桶",
    brand: "﻿广州高师傅食品有限公司",
    description: "规格: 1*4*3kg / 单位: 桶",
    price: 0,
    image: "",
    category: "果馅/果干/果酱",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "高师傅蓝莓果肉馅",
    specification: "",
    unit: "桶",
    brand: "﻿广州高师傅食品有限公司",
    description: "规格: 1*4*3kg / 单位: 桶",
    price: 0,
    image: "",
    category: "果馅/果干/果酱",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "高师傅草莓果肉馅",
    specification: "",
    unit: "桶",
    brand: "﻿广州高师傅食品有限公司",
    description: "规格: 1*4*3kg / 单位: 桶",
    price: 0,
    image: "",
    category: "果馅/果干/果酱",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 27 个 果馅/果干/果酱 产品


// 插入 冷冻点心/速冻半成品 分类产品
db.collection('products').add({
    name: "思醇 彩虹慕斯蛋糕 8寸",
    specification: "",
    unit: "盒",
    brand: "",
    description: "规格: 1*8盒*1.3kg / 单位: 盒",
    price: 0,
    image: "",
    category: "冷冻点心/速冻半成品",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "思醇 榴莲千层（8寸）",
    specification: "",
    unit: "盒",
    brand: "",
    description: "规格: 1*10盒*1.05kg / 单位: 盒",
    price: 0,
    image: "",
    category: "冷冻点心/速冻半成品",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "思醇黑森林小方",
    specification: "",
    unit: "盒",
    brand: "",
    description: "规格: 1*6盒/8个*840g / 单位: 盒",
    price: 0,
    image: "",
    category: "冷冻点心/速冻半成品",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 45 个 冷冻点心/速冻半成品 产品


// 插入 奶油/淡稀奶油 分类产品
db.collection('products').add({
    name: "西点奶油夹心（奶酪味）（不二）",
    specification: "",
    unit: "箱",
    brand: "不二（中国）投资有限公司",
    description: "规格: 1*6*1kg / 单位: 箱",
    price: 0,
    image: "",
    category: "奶油/淡稀奶油",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "乐奇含乳脂植脂奶油（不二）",
    specification: "",
    unit: "箱",
    brand: "不二（中国）投资有限公司",
    description: "规格: 1*12*1 / 单位: 箱",
    price: 0,
    image: "",
    category: "奶油/淡稀奶油",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "液态奶油（牛奶味）（不二）",
    specification: "",
    unit: "桶",
    brand: "不二（中国）投资有限公司",
    description: "规格: 1*16kg / 单位: 桶",
    price: 0,
    image: "",
    category: "奶油/淡稀奶油",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 47 个 奶油/淡稀奶油 产品


// 插入 巧克力/可可 分类产品
db.collection('products').add({
    name: "可可琳纳浓郁黑巧克力纽扣58%",
    specification: "",
    unit: "袋",
    brand: "可可琳纳食品贸易（上海）股份有限公司",
    description: "规格: 1*5*1kg / 单位: 袋",
    price: 0,
    image: "",
    category: "巧克力/可可",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "可可琳纳代可可脂巧克力豆（耐烤）",
    specification: "",
    unit: "袋",
    brand: "可可琳纳食品贸易（上海）股份有限公司",
    description: "规格: 1*5*1kg / 单位: 袋",
    price: 0,
    image: "",
    category: "巧克力/可可",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "可可琳纳代可可脂奶香白巧克力",
    specification: "",
    unit: "袋",
    brand: "可可琳纳食品贸易（上海）股份有限公司",
    description: "规格: 1*10块*1kg / 单位: 袋",
    price: 0,
    image: "",
    category: "巧克力/可可",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 34 个 巧克力/可可 产品


// 插入 干酪/芝士/马苏里拉 分类产品
db.collection('products').add({
    name: "安佳块状马苏里拉干酪",
    specification: "",
    unit: "箱",
    brand: "恒天然商贸（上海）有限公司",
    description: "规格: 1*2*10kg / 单位: 箱",
    price: 0,
    image: "",
    category: "干酪/芝士/马苏里拉",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "安佳碎条状马苏里拉干酪",
    specification: "",
    unit: "箱",
    brand: "恒天然商贸（上海）有限公司",
    description: "规格: 1*12kg / 单位: 箱",
    price: 0,
    image: "",
    category: "干酪/芝士/马苏里拉",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "安佳芝易马苏里拉干酪碎（袋）",
    specification: "",
    unit: "袋",
    brand: "恒天然商贸（上海）有限公司",
    description: "规格: 1*12*1kg / 单位: 袋",
    price: 0,
    image: "",
    category: "干酪/芝士/马苏里拉",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 17 个 干酪/芝士/马苏里拉 产品


// 插入 牛奶/乳饮 分类产品
db.collection('products').add({
    name: "新西兰奶粉",
    specification: "",
    unit: "袋",
    brand: "进口产品",
    description: "规格: 1*25kg / 单位: 袋",
    price: 0,
    image: "",
    category: "牛奶/乳饮",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "波兰大M全脂纯牛奶",
    specification: "",
    unit: "箱",
    brand: "进口产品",
    description: "规格: 12*1L / 单位: 箱",
    price: 0,
    image: "",
    category: "牛奶/乳饮",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "可培谷全脂纯牛奶",
    specification: "",
    unit: "箱",
    brand: "",
    description: "规格: 12*1L / 单位: 箱",
    price: 0,
    image: "",
    category: "牛奶/乳饮",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 1 个 牛奶/乳饮 产品


// 插入 糖类/甜味剂 分类产品
db.collection('products').add({
    name: "凯贝糖粉",
    specification: "",
    unit: "袋",
    brand: "山东凯贝食品有限公司",
    description: "规格: 1*4*5kg / 单位: 袋",
    price: 0,
    image: "",
    category: "糖类/甜味剂",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "凯贝防潮糖粉",
    specification: "",
    unit: "袋",
    brand: "山东凯贝食品有限公司",
    description: "规格: 20袋*1kg / 单位: 袋",
    price: 0,
    image: "",
    category: "糖类/甜味剂",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "韩国白砂糖",
    specification: "",
    unit: "袋",
    brand: "山东凯贝食品有限公司",
    description: "规格: 1*30kg / 单位: 袋",
    price: 0,
    image: "",
    category: "糖类/甜味剂",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 3 个 糖类/甜味剂 产品


// 插入 肉制品/香肠/培根 分类产品
db.collection('products').add({
    name: "嘉焙F1烘焙猪肉松（金黄）",
    specification: "",
    unit: "袋",
    brand: "深圳市嘉焙食品有限公司",
    description: "规格: 1*6*2.5 / 单位: 袋",
    price: 0,
    image: "",
    category: "肉制品/香肠/培根",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "嘉焙海苔贝贝肉松",
    specification: "",
    unit: "袋",
    brand: "深圳市嘉焙食品有限公司",
    description: "规格: 1*10*1kg / 单位: 袋",
    price: 0,
    image: "",
    category: "肉制品/香肠/培根",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "30g德式香肠（烘焙用）安心吗（大成）",
    specification: "",
    unit: "袋",
    brand: "蚌埠大成食品有限公司",
    description: "规格: 1*12*1kg / 单位: 袋",
    price: 0,
    image: "",
    category: "肉制品/香肠/培根",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 24 个 肉制品/香肠/培根 产品


// 插入 装饰/插件/翻糖 分类产品
db.collection('products').add({
    name: "顺祥巧克力配件（黒碎）",
    specification: "",
    unit: "盒",
    brand: "",
    description: "规格: 500g / 单位: 盒",
    price: 0,
    image: "",
    category: "装饰/插件/翻糖",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "顺祥巧克力配件（白碎）",
    specification: "",
    unit: "盒",
    brand: "",
    description: "规格: 500g / 单位: 盒",
    price: 0,
    image: "",
    category: "装饰/插件/翻糖",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "顺祥巧克力配件（仿真麻将万）",
    specification: "",
    unit: "盒",
    brand: "",
    description: "规格: 28个 / 单位: 盒",
    price: 0,
    image: "",
    category: "装饰/插件/翻糖",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 14 个 装饰/插件/翻糖 产品


// 插入 辅料/添加剂 分类产品
db.collection('products').add({
    name: "凯贝珠葱",
    specification: "",
    unit: "桶",
    brand: "山东凯贝食品有限公司",
    description: "规格: 1*24桶*110g / 单位: 桶",
    price: 0,
    image: "",
    category: "辅料/添加剂",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "凯贝抹茶粉",
    specification: "",
    unit: "桶",
    brand: "山东凯贝食品有限公司",
    description: "规格: 1*24*500g / 单位: 桶",
    price: 0,
    image: "",
    category: "辅料/添加剂",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "凯贝植物炭黑",
    specification: "",
    unit: "桶",
    brand: "山东凯贝食品有限公司",
    description: "规格: 1*24*100g / 单位: 桶",
    price: 0,
    image: "",
    category: "辅料/添加剂",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 23 个 辅料/添加剂 产品


// 插入 酒饮/风味酒 分类产品
db.collection('products').add({
    name: "摩根船长（黑标）朗姆酒",
    specification: "",
    unit: "瓶",
    brand: "",
    description: "规格: 1*700ml / 单位: 瓶",
    price: 0,
    image: "",
    category: "酒饮/风味酒",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "百加得白朗姆酒",
    specification: "",
    unit: "瓶",
    brand: "",
    description: "规格: 1*750ml / 单位: 瓶",
    price: 0,
    image: "",
    category: "酒饮/风味酒",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "君度力娇酒（桔皮味）",
    specification: "",
    unit: "瓶",
    brand: "",
    description: "规格: 1*700ml / 单位: 瓶",
    price: 0,
    image: "",
    category: "酒饮/风味酒",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 3 个 酒饮/风味酒 产品


// 插入 酵母 分类产品
db.collection('products').add({
    name: "马利500g高糖干酵母（马利干）",
    specification: "",
    unit: "袋",
    brand: "",
    description: "规格: 1*20*500g / 单位: 袋",
    price: 0,
    image: "",
    category: "酵母",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "1210101CN 燕牌酵母（高糖）（燕子）",
    specification: "",
    unit: "袋",
    brand: "",
    description: "规格: 1*20*500g / 单位: 袋",
    price: 0,
    image: "",
    category: "酵母",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "1210101CN 燕牌酵母（高糖）（燕子整箱）",
    specification: "",
    unit: "箱",
    brand: "",
    description: "规格: 1*20*500g / 单位: 箱",
    price: 0,
    image: "",
    category: "酵母",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 1 个 酵母 产品


// 插入 面粉/谷物粉 分类产品
db.collection('products').add({
    name: "华瑞优质低筋粉",
    specification: "",
    unit: "袋",
    brand: "菏泽华瑞面粉有限公司",
    description: "规格: 1*25kg / 单位: 袋",
    price: 0,
    image: "",
    category: "面粉/谷物粉",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "华瑞国色面包用小麦粉（纸袋）",
    specification: "",
    unit: "袋",
    brand: "菏泽华瑞面粉有限公司",
    description: "规格: 1*25kg / 单位: 袋",
    price: 0,
    image: "",
    category: "面粉/谷物粉",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "金像“B”（PRC）（22.7kg布）（南顺）",
    specification: "",
    unit: "袋",
    brand: "",
    description: "规格: 1*22.7kg / 单位: 袋",
    price: 0,
    image: "",
    category: "面粉/谷物粉",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 13 个 面粉/谷物粉 产品


// 插入 预拌粉/预混粉 分类产品
db.collection('products').add({
    name: "华瑞月饼专用粉",
    specification: "",
    unit: "袋",
    brand: "菏泽华瑞面粉有限公司",
    description: "规格: 1*25kg / 单位: 袋",
    price: 0,
    image: "",
    category: "预拌粉/预混粉",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "焙乐道红丝绒蛋糕预拌粉",
    specification: "",
    unit: "盒",
    brand: "广州焙乐道食品有限公司",
    description: "规格: 1*2*5kg / 单位: 盒",
    price: 0,
    image: "",
    category: "预拌粉/预混粉",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "复配酶制剂S500综合面包改良剂(焙乐道)",
    specification: "",
    unit: "包",
    brand: "广州焙乐道食品有限公司",
    description: "规格: 1*20*1kg / 单位: 包",
    price: 0,
    image: "",
    category: "预拌粉/预混粉",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 3 个 预拌粉/预混粉 产品


// 插入 食用油/植物油/起酥油 分类产品
db.collection('products').add({
    name: "南侨酥油/16kg纸箱CNO15",
    specification: "",
    unit: "箱",
    brand: "",
    description: "规格: 1*16kg / 单位: 箱",
    price: 0,
    image: "",
    category: "食用油/植物油/起酥油",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "南侨酥油/16kg铁桶CNO15",
    specification: "",
    unit: "桶",
    brand: "",
    description: "规格: 1*16kg / 单位: 桶",
    price: 0,
    image: "",
    category: "食用油/植物油/起酥油",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "南侨液态酥油/20kg",
    specification: "",
    unit: "桶",
    brand: "",
    description: "规格: 1*20kg / 单位: 桶",
    price: 0,
    image: "",
    category: "食用油/植物油/起酥油",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 12 个 食用油/植物油/起酥油 产品


// 插入 饼干/奥利奥 分类产品
db.collection('products').add({
    name: "奥利奥中号饼干碎",
    specification: "",
    unit: "袋",
    brand: "亿滋",
    description: "规格: 1*24*400g / 单位: 袋",
    price: 0,
    image: "",
    category: "饼干/奥利奥",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "奥利奥中号饼干碎",
    specification: "",
    unit: "箱",
    brand: "亿滋",
    description: "规格: 1*24*400g / 单位: 箱",
    price: 0,
    image: "",
    category: "饼干/奥利奥",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "奥利奥原味夹心饼干家庭装",
    specification: "",
    unit: "箱",
    brand: "亿滋",
    description: "规格: 1*12*466g / 单位: 箱",
    price: 0,
    image: "",
    category: "饼干/奥利奥",
    createdAt: new Date(),
    updatedAt: new Date()
});


// 插入 黄油/乳制油脂 分类产品
db.collection('products').add({
    name: "安佳乳酸黄油",
    specification: "",
    unit: "箱",
    brand: "恒天然商贸（上海）有限公司",
    description: "规格: 1*25 / 单位: 箱",
    price: 0,
    image: "",
    category: "黄油/乳制油脂",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "安佳片状乳酸黄油",
    specification: "",
    unit: "箱",
    brand: "恒天然商贸（上海）有限公司",
    description: "规格: 1*20 / 单位: 箱",
    price: 0,
    image: "",
    category: "黄油/乳制油脂",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "安佳黄油薄片20*1kg",
    specification: "",
    unit: "箱",
    brand: "恒天然商贸（上海）有限公司",
    description: "规格: 20*1kg / 单位: 箱",
    price: 0,
    image: "",
    category: "黄油/乳制油脂",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 12 个 黄油/乳制油脂 产品


// 插入 其他 分类产品
db.collection('products').add({
    name: "焙乐道CPT",
    specification: "",
    unit: "桶",
    brand: "广州焙乐道食品有限公司",
    description: "规格: 1*6*1.7kg / 单位: 桶",
    price: 0,
    image: "",
    category: "其他",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "朋宗玫瑰花饼",
    specification: "",
    unit: "箱",
    brand: "朋宗",
    description: "规格: 16包*16个*45g / 单位: 箱",
    price: 0,
    image: "",
    category: "其他",
    createdAt: new Date(),
    updatedAt: new Date()
});

db.collection('products').add({
    name: "朋宗椒盐饼（牛舌饼）",
    specification: "",
    unit: "箱",
    brand: "朋宗",
    description: "规格: 19包*12个 / 单位: 箱",
    price: 0,
    image: "",
    category: "其他",
    createdAt: new Date(),
    updatedAt: new Date()
});

// ... 还有 14 个 其他 产品


// 4. 插入配置数据
db.collection('config').add({
    type: 'category_config',
    data: {
    "categories": [
        {
            "id": 1,
            "name": "全部商品",
            "shortName": "全部",
            "slug": "all-products"
        },
        {
            "id": 2,
            "name": "冷冻点心/速冻半成品",
            "shortName": "冷冻半成品",
            "slug": "frozen-pastries-semi-finished"
        },
        {
            "id": 3,
            "name": "奶油/淡稀奶油",
            "shortName": "奶油",
            "slug": "whipping-cream"
        },
        {
            "id": 4,
            "name": "巧克力/可可",
            "shortName": "巧克力",
            "slug": "chocolate-cocoa"
        },
        {
            "id": 5,
            "name": "干酪/芝士/马苏里拉",
            "shortName": "干酪/芝士",
            "slug": "cheese-mozzarella"
        },
        {
            "id": 6,
            "name": "果馅/果干/果酱",
            "shortName": "果馅/果酱",
            "slug": "fruit-filling-puree-jam"
        },
        {
            "id": 7,
            "name": "牛奶/乳饮",
            "shortName": "乳饮",
            "slug": "milk-dairy-drinks"
        },
        {
            "id": 8,
            "name": "糖类/甜味剂",
            "shortName": "糖/甜味",
            "slug": "sugars-sweeteners"
        },
        {
            "id": 9,
            "name": "罐头/蜜饯",
            "shortName": "罐头/蜜饯",
            "slug": "canned-preserves"
        },
        {
            "id": 10,
            "name": "肉制品/香肠/培根",
            "shortName": "肉制品",
            "slug": "meat-sausage-bacon"
        },
        {
            "id": 11,
            "name": "装饰/插件/翻糖",
            "shortName": "装饰/翻糖",
            "slug": "decorations-toppers-fondant"
        },
        {
            "id": 12,
            "name": "调味酱/沙拉酱",
            "shortName": "调味/沙拉",
            "slug": "sauces-salad-dressing"
        },
        {
            "id": 13,
            "name": "辅料/添加剂",
            "shortName": "辅料/添加",
            "slug": "additives"
        },
        {
            "id": 14,
            "name": "酒饮/风味酒",
            "shortName": "酒饮",
            "slug": "alcoholic-beverages-liqueurs"
        },
        {
            "id": 15,
            "name": "酵母",
            "shortName": "酵母",
            "slug": "yeast"
        },
        {
            "id": 16,
            "name": "面粉/谷物粉",
            "shortName": "面/谷粉",
            "slug": "flour-grain-flours"
        },
        {
            "id": 17,
            "name": "预拌粉/预混粉",
            "shortName": "预拌粉",
            "slug": "premix"
        },
        {
            "id": 18,
            "name": "饼干/奥利奥",
            "shortName": "饼干",
            "slug": "biscuits-oreo"
        },
        {
            "id": 19,
            "name": "黄油/乳制油脂",
            "shortName": "黄油/乳脂",
            "slug": "butter-dairy-fats"
        },
        {
            "id": 20,
            "name": "馅料/卡仕达",
            "shortName": "馅料/卡仕达",
            "slug": "filling-custard"
        },
        {
            "id": 21,
            "name": "食用油/植物油/起酥油",
            "shortName": "食用油/起酥油",
            "slug": "edible-plant-shortening-oils"
        },
        {
            "id": 22,
            "name": "其他",
            "shortName": "其他",
            "slug": "others"
        }
    ]
},
    createdAt: new Date(),
    updatedAt: new Date()
});

// 5. 创建索引
db.collection('products').createIndex({ category: 1 });
db.collection('products').createIndex({ name: 1 });
db.collection('products').createIndex({ brand: 1 });
db.collection('config').createIndex({ type: 1 });

console.log('数据库初始化完成！');
console.log('Products集合记录数:', 387);
console.log('Config集合记录数: 1');
