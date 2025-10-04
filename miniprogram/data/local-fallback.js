/**
 * 本地数据备份
 * 当CloudBase无法使用时的兜底数据
 */

// 从共享数据目录引用产品数据的简化版本
function getProductData() {
  return {
    "categories": [
      {
        "name": "冷冻糕点半成品",
        "items": [
          {
            "id": "prd3",
            "name": "黄金酥饼",
            "brand": "捷明达",
            "spec": "20个/盒",
            "unit": "盒",
            "price": "28.00",
            "image": "prd3.png",
            "description": "酥脆可口的黄金酥饼"
          }
          // 更多产品数据将从共享目录读取
          // 这里只是示例结构
        ]
      },
      {
        "name": "烘焙原料",
        "items": [
          {
            "id": "prd4", 
            "name": "高筋面粉",
            "brand": "金龙鱼",
            "spec": "5kg/袋",
            "unit": "袋",
            "price": "35.00",
            "image": "prd4.png",
            "description": "优质高筋面粉，适合制作面包"
          }
        ]
      }
      // 更多分类...
    ]
  };
}

// 分类配置备份数据
function getCategoryConfig() {
  return {
    "categories": [
      {
        "name": "冷冻糕点半成品",
        "shortName": "冷冻糕点",
        "slug": "frozen-pastries-semi-finished"
      },
      {
        "name": "烘焙原料", 
        "shortName": "原料",
        "slug": "baking-ingredients"
      },
      {
        "name": "包装材料",
        "shortName": "包装",
        "slug": "packaging"
      },
      {
        "name": "设备工具",
        "shortName": "设备", 
        "slug": "equipment"
      }
      // 更多分类配置...
    ]
  };
}

// 工具函数：从描述中提取规格
function extractSpec(description) {
  if (!description) return '';
  const match = description.match(/规格:([^/]+)/);
  return match ? match[1].trim() : '';
}

// 工具函数：从描述中提取单位
function extractUnit(description) {
  if (!description) return '';
  const match = description.match(/单位:([^/]+)/);
  return match ? match[1].trim() : '';
}

module.exports = {
  getProductData,
  getCategoryConfig,
  extractSpec,
  extractUnit
};