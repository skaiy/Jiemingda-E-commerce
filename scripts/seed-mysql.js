/**
 * Seed MySQL database from local JSON dictionaries and product list
 * Requires: @prisma/client, prisma CLI, dotenv
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function loadJson(relPath) {
  const abs = path.resolve(__dirname, relPath);
  const content = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(content);
}

async function upsertBrands() {
  const data = loadJson('../shared/data/brand_dictionary.json');
  const brands = data.brandDictionary?.brands || [];
  const map = {};
  for (const b of brands) {
    const code = String(b.code).trim();
    const name = String(b.name).trim();
    const shortName = b.shortName ? String(b.shortName).trim() : null;
    const description = b.description || null;
    const rec = await prisma.brand.upsert({
      where: { code },
      update: { name, shortName, description, isDeleted: false },
      create: { code, name, shortName, description },
    });
    map[code] = rec.id;
  }
  return map;
}

async function upsertCategories() {
  const data = loadJson('../shared/data/category_dictionary.json');
  const categories = data.categoryDictionary?.categories || [];
  const map = {};
  for (const c of categories) {
    const code = String(c.code).trim();
    const name = String(c.name).trim();
    const shortName = c.shortName ? String(c.shortName).trim() : null;
    const bannerSlug = c.slug || null;
    const description = c.description || null;
    const rec = await prisma.category.upsert({
      where: { code },
      update: { name, shortName, bannerSlug, isDeleted: false },
      create: { code, name, shortName, bannerSlug },
    });
    map[code] = rec.id;
  }
  return map;
}

function parsePrice(str) {
  if (!str) return null;
  const n = Number(String(str).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

async function upsertProduct(item, brandId, categoryId) {
  const productCode = item.productCode || item.id || null;
  const name = String(item.name).trim();
  const spec = item.spec || null;
  const unit = item.unit || null;
  const price = parsePrice(item.price);
  const imageUrl = item.image ? String(item.image).trim() || null : null;
  const remark = item.description || null;

  const rec = await prisma.product.upsert({
    where: { productCode },
    update: { name, brandId, categoryId, spec, unit, price, imageUrl, remark, isOnShelf: true, isDeleted: false },
    create: { productCode, name, brandId, categoryId, spec, unit, price, imageUrl, remark },
  });

  if (imageUrl) {
    const images = await prisma.productImage.findMany({ where: { productId: rec.id } });
    if (images.length === 0) {
      await prisma.productImage.create({
        data: { productId: rec.id, url: imageUrl, sortOrder: 1 },
      });
    }
  }
}

async function importProducts(brandMap, categoryMap) {
  const data = loadJson('../shared/data/products.json');
  const cats = data.categories || [];
  let count = 0;
  for (const cat of cats) {
    const items = cat.items || [];
    for (const item of items) {
      const brandId = item.brandCode ? brandMap[String(item.brandCode).trim()] : null;
      const categoryId = item.categoryCode ? categoryMap[String(item.categoryCode).trim()] : null;
      await upsertProduct(item, brandId, categoryId);
      count += 1;
    }
  }
  return count;
}

async function main() {
  console.log('Seeding CloudBase MySQL with dictionaries and products...');
  const brandMap = await upsertBrands();
  console.log(`Upserted brands: ${Object.keys(brandMap).length}`);
  const categoryMap = await upsertCategories();
  console.log(`Upserted categories: ${Object.keys(categoryMap).length}`);
  const total = await importProducts(brandMap, categoryMap);
  console.log(`Imported/Upserted products: ${total}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });