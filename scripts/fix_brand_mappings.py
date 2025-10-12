#!/usr/bin/env python3
import csv
import os
import shutil


CSV_PATH = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/docs/产品列表.csv"
BACKUP_PATH = "/Users/momohome/Desktop/家庭/捷明达/01.prd-cat/docs/产品列表.brandfix.backup.csv"


# Known company-to-brand normalizations and composite-brand cleanups
BRAND_NORMALIZATION = {
    "天津市利好公司": "利好",
    "山东凯贝食品有限公司": "凯贝",
    "上海悦醇食品有限公司": "思醇",
    "维益食品（苏州）-约翰丹尼": "约翰丹尼",
    "维益食品（苏州）有限公司-约翰丹尼": "约翰丹尼",
}


def normalize_brand(value: str) -> str:
    if value is None:
        return ""
    v = value.strip()
    # Direct mapping first
    if v in BRAND_NORMALIZATION:
        return BRAND_NORMALIZATION[v]
    # If contains hyphen linking manufacturer + brand, prefer the last segment
    if "-" in v:
        parts = [p.strip() for p in v.split("-") if p.strip()]
        if parts:
            v = parts[-1]
    # Common full company suffixes to trim to consumer-facing brand when product name hints exist
    # Keep conservative: do not guess unless mapping exists.
    return v


def normalize_abbrev(brand: str) -> str:
    # For now, abbreviate to the cleaned brand itself
    return (brand or "").strip()


def main():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    # Backup original
    shutil.copy2(CSV_PATH, BACKUP_PATH)

    rows = []
    with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        required = ["id", "产品名称", "规格", "单位", "品牌", "品牌简写", "分类"]
        # If header differs, try to adapt
        for req in required:
            if req not in fieldnames:
                raise ValueError(f"CSV header missing required field: {req}")
        for row in reader:
            # Normalize brand and abbreviation
            brand = normalize_brand(row.get("品牌"))
            row["品牌"] = brand
            row["品牌简写"] = normalize_abbrev(brand)
            rows.append(row)

    # Write back with same header order
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=required)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in required})

    print("Brand normalization completed. Backup saved:", BACKUP_PATH)


if __name__ == "__main__":
    main()