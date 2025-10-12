#!/usr/bin/env python3
import csv
import json
import os
import shutil
from typing import Dict, Tuple


CSV_PATH = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/docs/产品列表.csv"
BACKUP_PATH = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/docs/产品列表.enrich.backup.csv"
PRODUCTS_JSON = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/shared/data/products.json"
BRAND_DICT_SHARED = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/shared/data/brand_dictionary.json"
BRAND_DICT_MINI = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/miniprogram/data/brand_dictionary.json"
CATEGORY_DICT_SHARED = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/shared/data/category_dictionary.json"
CLEAN_CATEGORY_NAME = True  # 输出使用字典的 name 字段（如：肉制品/香肠/培根）


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_brand_maps() -> Tuple[Dict[str, str], Dict[str, str]]:
    """
    返回两个映射：
    - company_or_name -> shortName（优先 miniprogram 字典，其次 shared）
    - alias 修正映射（手动别名，如：深圳市嘉焙食品有限公司 -> 嘉焙）
    """
    brand_map: Dict[str, str] = {}

    def ingest(d):
        for b in d.get("brandDictionary", {}).get("brands", []):
            name = (b.get("name") or "").strip()
            short = (b.get("shortName") or name).strip()
            if name:
                brand_map[name] = short
            # 也把 shortName 指到自身，便于统一
            if short:
                brand_map[short] = short

    ingest(load_json(BRAND_DICT_MINI))
    ingest(load_json(BRAND_DICT_SHARED))

    # 手动别名修正：面向消费者品牌
    alias_fix = {
        "深圳市嘉焙食品有限公司": "嘉焙",
        "广州奥昆食品有限公司": "奥昆",
        "济南高贝食品": "高贝",
        "进口产品": "进口",
    }

    return brand_map, alias_fix


def build_category_maps() -> Tuple[Dict[str, str], Dict[str, str], Dict[str, str]]:
    """
    返回：
    - code/name/shortName -> name（标准显示用）
    - 基于关键词的粗略分类规则映射（name -> 字典 name）
    """
    cat_map: Dict[str, str] = {}
    cdict = load_json(CATEGORY_DICT_SHARED)
    for c in cdict.get("categoryDictionary", {}).get("categories", []):
        code = (c.get("code") or "").strip()
        name = (c.get("name") or "").strip()
        short = (c.get("shortName") or name).strip()
        if code:
            cat_map[code] = name
        if name:
            cat_map[name] = name
        if short:
            cat_map[short] = name

    # 常见同义词/旧写法 -> 标准 name
    synonyms = {
        "果馅/果料": "果馅/果酱",
        "芝士/干酪": "干酪/芝士/马苏里拉",
        "肉类制品": "肉制品/香肠/培根",
        "奶油/乳制品": "奶油/淡稀奶油",
        "乳饮": "牛奶/乳饮",
        "面粉/粉类": "面粉/粉类",
    }

    # 简易关键词分类（用于 products.json 未覆盖的条目）
    keyword_rules = {
        "肉松": "肉制品/香肠/培根",
        "香肠": "肉制品/香肠/培根",
        "培根": "肉制品/香肠/培根",
        "鸡排": "肉制品/香肠/培根",
        "牛肉": "肉制品/香肠/培根",
        "果泥": "果馅/果酱",
        "果酱": "果馅/果酱",
        "果馅": "果馅/果酱",
        "果肉馅": "果馅/果酱",
        "果料": "果馅/果酱",
        "果茸": "果馅/果酱",
        "巧克力": "巧克力/可可",
        "可可": "巧克力/可可",
        "淡奶油": "奶油/淡稀奶油",
        "稀奶油": "奶油/淡稀奶油",
        "奶油": "奶油/淡稀奶油",
        "马苏里拉": "干酪/芝士/马苏里拉",
        "芝士": "干酪/芝士/马苏里拉",
        "干酪": "干酪/芝士/马苏里拉",
        "黄油": "黄油/油脂",
        "酥油": "黄油/油脂",
        "沙拉酱": "调味酱/沙拉酱",
        "调味酱": "调味酱/沙拉酱",
        "夹心": "调味酱/沙拉酱",
        "装饰": "装饰/插件/翻糖",
        "翻糖": "装饰/插件/翻糖",
        "插件": "装饰/插件/翻糖",
        "面粉": "面粉/粉类",
        "小麦粉": "面粉/粉类",
        "糖粉": "糖类/甜味剂",
        "白砂糖": "糖类/甜味剂",
    }

    return cat_map, keyword_rules, synonyms


def build_product_lookup() -> Dict[Tuple[str, str, str], Dict]:
    """基于 name+spec+unit 建立查找表。"""
    data = load_json(PRODUCTS_JSON)
    lookup: Dict[Tuple[str, str, str], Dict] = {}
    for cat in data.get("categories", []):
        for item in cat.get("items", []):
            key = (
                (item.get("name") or "").strip(),
                (item.get("spec") or "").strip(),
                (item.get("unit") or "").strip(),
            )
            lookup[key] = item
    return lookup


def normalize_brand(brand_val: str, brand_map: Dict[str, str], alias_fix: Dict[str, str]) -> Tuple[str, str]:
    v = (brand_val or "").strip()
    if not v:
        return "未标注品牌", "未标注"
    # 优先手动别名修正
    if v in alias_fix:
        short = alias_fix[v]
        return short, short
    # 其次用字典
    if v in brand_map:
        short = brand_map[v]
        return short, short
    # 如果存在 manufacturer-品牌 的复合形式，取最后一段
    if "-" in v:
        parts = [p.strip() for p in v.split("-") if p.strip()]
        if parts:
            last = parts[-1]
            short = brand_map.get(last, last)
            return short, short
    return v, v


def normalize_category(csv_cat: str, prod_item: Dict, cat_map: Dict[str, str], keyword_rules: Dict[str, str]) -> str:
    # 优先使用 products.json 内的 categoryCode -> name
    if prod_item:
        code = (prod_item.get("categoryCode") or "").strip()
        if code and code in cat_map:
            return cat_map[code]
    # 否则如果 CSV 已写且能映射，则规范化为字典的 name
    v = (csv_cat or "").strip()
    if v and v in cat_map:
        return cat_map[v]
    # 关键词匹配
    name = (prod_item.get("name") if prod_item else "")
    source_text = f"{name} {v}".strip()
    for kw, target in keyword_rules.items():
        if kw in source_text:
            return target
    return "其他"


def main():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")
    if not os.path.exists(PRODUCTS_JSON):
        raise FileNotFoundError(f"Products JSON not found: {PRODUCTS_JSON}")

    # 备份原始 CSV
    shutil.copy2(CSV_PATH, BACKUP_PATH)

    brand_map, alias_fix = build_brand_maps()
    cat_map, keyword_rules, synonyms = build_category_maps()
    lookup = build_product_lookup()

    rows_out = []
    with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []
        required = ["id", "产品名称", "规格", "单位", "品牌", "品牌简写", "分类"]
        for req in required:
            if req not in header:
                raise ValueError(f"CSV header missing required field: {req}")

        for row in reader:
            name = (row.get("产品名称") or "").strip()
            spec = (row.get("规格") or "").strip()
            unit = (row.get("单位") or "").strip()
            prod = lookup.get((name, spec, unit))

            # Brand & Abbrev
            brand_clean, abbrev = normalize_brand(row.get("品牌"), brand_map, alias_fix)
            row["品牌"] = brand_clean
            row["品牌简写"] = abbrev

            # Category（先做同义词归一）
            csv_cat = (row.get("分类") or "").strip()
            if csv_cat in synonyms:
                csv_cat = synonyms[csv_cat]
            row["分类"] = normalize_category(csv_cat, prod, cat_map, keyword_rules)

            rows_out.append(row)

    # 写回
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "产品名称", "规格", "单位", "品牌", "品牌简写", "分类"])
        writer.writeheader()
        for r in rows_out:
            writer.writerow({k: r.get(k, "") for k in ["id", "产品名称", "规格", "单位", "品牌", "品牌简写", "分类"]})

    print("CSV enrichment completed.")
    print("Backup:", BACKUP_PATH)


if __name__ == "__main__":
    main()