const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const tcb = require('@cloudbase/node-sdk');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error('Request failed with status ' + res.statusCode));
          res.resume();
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

exports.main = async (event, context) => {
  event = event || {};
  const env = process.env.TCB_ENV || process.env.SCF_NAMESPACE || event.env;
  const app = tcb.init({ env });
  const db = app.database();

  // 允许传入集合名和文档ID，默认 catalog/default
  const collectionName = event.collection || 'catalog';
  const docId = event.docId || 'default';

  // 允许通过 URL 远程拉取 JSON，否则读取本地文件
  const jsonUrl = event.url;
  let data;
  if (jsonUrl) {
    data = await fetchJson(jsonUrl);
  } else {
    const jsonPath = path.join(__dirname, 'products.json');
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    data = JSON.parse(raw);
  }

  if (!data || !Array.isArray(data.categories)) {
    return { code: 1, message: 'Invalid data format: expect { categories: [...] }' };
  }

  // 确保集合存在
  try { await db.createCollection(collectionName); } catch (e) { /* 已存在忽略 */ }

  // 覆写写入到指定文档
  const coll = db.collection(collectionName);
  const res = await coll.doc(docId).set({ categories: data.categories, updatedAt: Date.now() });
  return { code: 0, message: 'Seed success', result: res };
};