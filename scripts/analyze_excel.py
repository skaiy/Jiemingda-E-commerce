import pandas as pd
import os
from pathlib import Path

# 分析Excel文件结构
def analyze_excel_structure():
    root_dir = Path(".")
    
    print("=== 文件夹结构分析 ===")
    categories = []
    for subdir in root_dir.iterdir():
        if subdir.is_dir():
            excel_files = list(subdir.glob("*.xlsx"))
            categories.append(subdir.name)
            print(f"类别: {subdir.name}")
            print(f"  Excel文件数量: {len(excel_files)}")
            for file in excel_files[:3]:  # 只显示前3个文件
                print(f"    - {file.name}")
            if len(excel_files) > 3:
                print(f"    ... 还有 {len(excel_files) - 3} 个文件")
            print()
    
    print(f"总共发现 {len(categories)} 个类别:")
    for cat in categories:
        print(f"  - {cat}")
    
    # 分析几个示例Excel文件的结构
    print("\n=== Excel文件结构分析 ===")
    sample_files = []
    
    # 从每个类别中选择一个文件进行分析
    for subdir in root_dir.iterdir():
        if subdir.is_dir():
            excel_files = list(subdir.glob("*.xlsx"))
            if excel_files:
                sample_files.append((subdir.name, excel_files[0]))
    
    for category, file_path in sample_files[:5]:  # 分析前5个类别的文件
        try:
            print(f"\n分析文件: {category}/{file_path.name}")
            df = pd.read_excel(file_path)
            print(f"  行数: {len(df)}")
            print(f"  列数: {len(df.columns)}")
            print(f"  列名: {list(df.columns)}")
            
            # 显示前几行数据示例
            if len(df) > 0:
                print("  前3行数据:")
                for i, row in df.head(3).iterrows():
                    print(f"    行{i+1}: {dict(row)}")
        except Exception as e:
            print(f"  读取失败: {e}")
    
    return categories

if __name__ == "__main__":
    analyze_excel_structure()