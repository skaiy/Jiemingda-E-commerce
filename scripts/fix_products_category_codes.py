import json
import os

"""
一次性数据修复脚本：
- 将 shared/data/products.json 中分组 "果馅/果料"/"果馅/果酱" 的所有条目 categoryCode 统一修正为 "006"（果馅/果干/果酱）。
- 将分组 "肉类制品"/"肉制品/香肠/培根" 的所有条目 categoryCode 统一修正为 "010"（肉制品/香肠/培根）。
- 仅修复分类编码，不改动 productCode/id 字段，以避免牵连过多关联数据。
"""

PROJECT_ROOT = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat"
PRODUCTS_JSON = os.path.join(PROJECT_ROOT, "shared/data/products.json")
BACKUP_JSON = os.path.join(PROJECT_ROOT, "shared/data/products.before-fix.backup.json")


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data: dict):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def fix_category_codes():
    if not os.path.exists(PRODUCTS_JSON):
        raise FileNotFoundError(f"Products JSON not found: {PRODUCTS_JSON}")
    # 备份
    if not os.path.exists(BACKUP_JSON):
        with open(PRODUCTS_JSON, "r", encoding="utf-8") as rf, open(BACKUP_JSON, "w", encoding="utf-8") as wf:
            wf.write(rf.read())

    data = load_json(PRODUCTS_JSON)

    # 结构兼容：可能是 {"categories": [...]} 或 {"catalog": [...]} 或直接列表
    catalog = None
    if isinstance(data, dict):
        if isinstance(data.get("categories"), list):
            catalog = data.get("categories")
        elif isinstance(data.get("catalog"), list):
            catalog = data.get("catalog")
    if catalog is None and isinstance(data, list):
        catalog = data
    if not isinstance(catalog, list):
        raise ValueError("Unexpected products.json format: missing categories list")

    fixed_count = 0
    fixed_meat_count = 0
    for group in catalog:
        name = (group.get("name") or "").strip()
        items = group.get("items") or []
        if name in ("果馅/果料", "果馅/果干/果酱", "果馅/果酱"):
            for it in items:
                code = (it.get("categoryCode") or "").strip()
                if code != "006":
                    it["categoryCode"] = "006"
                    fixed_count += 1
        if name in ("肉类制品", "肉制品/香肠/培根"):
            for it in items:
                code = (it.get("categoryCode") or "").strip()
                if code != "010":
                    it["categoryCode"] = "010"
                    fixed_meat_count += 1

    save_json(PRODUCTS_JSON, data)
    print(f"Category codes fixed: 果馅组更新 {fixed_count} 条，肉类制品组更新 {fixed_meat_count} 条。")
    print(f"Backup: {BACKUP_JSON}")


if __name__ == "__main__":
    fix_category_codes()