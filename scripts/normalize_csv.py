import csv
import json
import os
import re
from typing import Dict, List, Optional

"""
语义增强版 CSV 规范化：
- 修复“品牌”混入“分类”的问题（检测到含有“/”或分类关键词时归位）
- 依据产品名称括号及公司名称语义，提取规范“品牌”
- 根据品牌字典生成“品牌简写”，否则回退为品牌本身
- 基于关键词规则校正“分类”，维持既有有效分类不变
"""

PROJECT_ROOT = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat"
CSV_PATH = os.path.join(PROJECT_ROOT, "docs/产品列表.csv")
PRODUCTS_JSON_PATH = os.path.join(PROJECT_ROOT, "shared/data/products.json")
BRAND_DICT_CANDIDATES = [
    os.path.join(PROJECT_ROOT, "shared/data/brand_dictionary.json"),
    os.path.join(PROJECT_ROOT, "miniprogram/data/brand_dictionary.json"),
]
CATEGORY_DICT_CANDIDATES = [
    os.path.join(PROJECT_ROOT, "shared/data/category_dictionary.json"),
    os.path.join(PROJECT_ROOT, "miniprogram/data/category_dictionary.json"),
]

EXPECTED_FIELDS = ["id", "产品名称", "规格", "单位", "品牌", "品牌简写", "分类"]


def load_json_first(paths: List[str]) -> Optional[dict]:
    for p in paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
    return None


def extract_brand_terms(brand_dict: Optional[dict]):
    terms = set()
    abbr_map: Dict[str, str] = {}
    company_map: Dict[str, str] = {}

    if not brand_dict:
        # Fallback patterns for common companies -> brands
        fallback_company_to_brand = {
            "恒天然商贸（上海）有限公司": "安佳",
            "不二（中国）投资有限公司": "不二",
            "上海英士顿食品有限公司": "英士顿",
            "蚌埠大成食品有限公司": "大成",
            "德州鲁樱食品有限公司": "鲁樱",
            "天津翘甜食品有限公司": "巧乐尚",
            "可可琳纳食品贸易（上海）股份有限公司": "可可琳纳",
            "天津南侨食品有限公司": "南侨",
            "维益烘焙（天津）有限公司": "维益",
            "菏泽华瑞面粉有限公司": "华瑞",
            "南顺（中国）控股有限公司": "金像",
            "广州高师傅食品有限公司": "高师傅",
        }
        for k, v in fallback_company_to_brand.items():
            company_map[k] = v
            terms.add(v)
        return terms, abbr_map, company_map

    if isinstance(brand_dict, list):
        iterable = brand_dict
    elif isinstance(brand_dict, dict):
        iterable = brand_dict.get("brands") or brand_dict.get("items") or []
    else:
        iterable = []

    for item in iterable:
        name = (item.get("name") or item.get("brand") or "").strip()
        if not name:
            continue
        terms.add(name)
        abbr = (item.get("abbr") or item.get("short") or "").strip()
        if abbr:
            abbr_map[name] = abbr
        for alias in item.get("aliases", []) or item.get("aka", []) or []:
            alias = str(alias).strip()
            if alias:
                terms.add(alias)
                if abbr:
                    abbr_map[alias] = abbr
        for comp in item.get("companies", []):
            comp = str(comp).strip()
            if comp:
                company_map[comp] = name

    # 常见公司到品牌的补充映射
    fallback_company_to_brand = {
        "恒天然商贸（上海）有限公司": "安佳",
        "不二（中国）投资有限公司": "不二",
        "上海英士顿食品有限公司": "英士顿",
        "蚌埠大成食品有限公司": "大成",
        "德州鲁樱食品有限公司": "鲁樱",
        "天津翘甜食品有限公司": "巧乐尚",
        "可可琳纳食品贸易（上海）股份有限公司": "可可琳纳",
        "天津南侨食品有限公司": "南侨",
        "维益烘焙（天津）有限公司": "维益",
        "菏泽华瑞面粉有限公司": "华瑞",
        "南顺（中国）控股有限公司": "金像",
        "广州高师傅食品有限公司": "高师傅",
    }
    for k, v in fallback_company_to_brand.items():
        company_map.setdefault(k, v)
        terms.add(v)

    return terms, abbr_map, company_map


def build_category_rules(category_dict: Optional[dict]):
    # 关键词规则；如有字典可按需补强
    rules = [
        ("巧克力/可可", ["巧克力", "可可", "夹心巧克力", "黑巧", "白巧", "代可可脂"]),
        ("奶油/乳制品", ["奶油", "稀奶油", "植脂", "牛奶奶油", "淡奶油", "马斯卡彭", "黄奶油"]),
        ("黄油/油脂", ["黄油", "酥油", "玛琪琳", "澳仕", "欧仕", "液态酥油"]),
        ("芝士/干酪", ["芝士", "干酪", "马苏里拉", "奶酪", "切达", "奶油芝士", "芝易"]),
        ("果馅/果料", ["果泥", "果茸", "果肉馅", "果粒馅", "库利", "果胶", "镜面果胶"]),
        ("馅料/豆沙类", ["豆沙", "枣泥", "山楂馅", "糖纳红小豆", "粒馅"]),
        ("调味酱/沙拉酱", ["酱", "卡仕达", "可丝达", "淋酱", "乳酪酱", "夹心酱"]),
        ("肉类制品", ["香肠", "培根", "鸡排", "牛肉", "肉松", "火腿", "鸡肉片", "肉扒"]),
        ("面粉/粉类", ["面粉", "小麦粉", "低筋粉", "高筋粉", "月饼专用粉"]),
        ("蛋糕/甜品", ["蛋糕", "布丁", "甜品", "挞", "布蕾"]),
    ]

    merged = {}
    for cat, kws in rules:
        merged.setdefault(cat, set()).update(kws)
    return merged


def detect_category(product_name: str, current_cat: str, cat_rules: Dict[str, set]) -> str:
    cur = (current_cat or "").strip()
    # 已是有效分类格式（含“/”）直接保留
    if cur and "/" in cur:
        return cur
    name = product_name.strip()
    for cat, kws in cat_rules.items():
        for kw in kws:
            if kw and kw in name:
                return cat
    return cur or ""


def detect_brand(product_name: str, current_brand: str, brand_terms: set, company_map: Dict[str, str]) -> str:
    brand = ""
    # 1) 从产品名称括号中解析品牌
    for token in re.findall(r"（([^）]+)）", product_name):
        t = token.strip()
        if not t:
            continue
        if t in brand_terms:
            brand = t
            break
        # 模糊包含
        for bt in brand_terms:
            if t in bt or bt in t:
                brand = bt
                break
        if brand:
            break

    # 2) 从当前品牌（可能是公司名）映射到规范品牌
    if not brand:
        cb = (current_brand or "").strip()
        # 若误填了分类到品牌（含“/”），丢弃
        if "/" in cb:
            cb = ""
        for comp, bname in company_map.items():
            if comp and comp in cb:
                brand = bname
                break
        # 3) 在产品名称里直接查找已知品牌词
        if not brand:
            for bt in brand_terms:
                if bt and bt in product_name:
                    brand = bt
                    break

    return brand or (current_brand.strip() if current_brand and "/" not in current_brand else "")


def abbr_for_brand(brand: str, abbr_map: Dict[str, str]) -> str:
    if not brand:
        return ""
    if brand in abbr_map:
        return abbr_map[brand]
    return brand


def normalize_csv():
    brand_dict = load_json_first(BRAND_DICT_CANDIDATES)
    category_dict = load_json_first(CATEGORY_DICT_CANDIDATES)
    brand_terms, abbr_map, company_map = extract_brand_terms(brand_dict)
    cat_rules = build_category_rules(category_dict)

    rows: List[Dict[str, str]] = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None:
            raise RuntimeError("CSV 缺少表头")
        fieldnames = EXPECTED_FIELDS

        for row in reader:
            for key in EXPECTED_FIELDS:
                row.setdefault(key, "")

            name = row.get("产品名称", "")
            cur_brand = row.get("品牌", "")
            cur_cat = row.get("分类", "")

            fixed_cat = detect_category(name, cur_cat, cat_rules)
            fixed_brand = detect_brand(name, cur_brand, brand_terms, company_map)
            fixed_abbr = abbr_for_brand(fixed_brand, abbr_map)

            # 若“品牌”看起来像分类（含“/”），作为分类使用
            if cur_brand and "/" in cur_brand and not fixed_cat:
                fixed_cat = cur_brand

            row["品牌"] = fixed_brand
            row["品牌简写"] = fixed_abbr
            row["分类"] = fixed_cat

            rows.append({k: row.get(k, "") for k in fieldnames})

    backup_path = CSV_PATH.replace("产品列表.csv", "产品列表.backup.csv")
    with open(backup_path, "w", encoding="utf-8", newline="") as bf:
        writer = csv.DictWriter(bf, fieldnames=EXPECTED_FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    with open(CSV_PATH, "w", encoding="utf-8", newline="") as wf:
        writer = csv.DictWriter(wf, fieldnames=EXPECTED_FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"CSV 规范化完成。备份已保存：{backup_path}")


if __name__ == "__main__":
    normalize_csv()