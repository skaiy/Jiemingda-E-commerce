import pandas as pd
import os
from pathlib import Path
from datetime import datetime

def merge_all_excel_files():
    """
    合并所有Excel文件，调整字段结构：
    - 子文件夹名称 -> 所属类别
    - 原"所属类别" -> 品牌
    - 原"品牌" -> 子品牌
    """
    root_dir = Path(".")
    all_data = []
    
    print("开始合并Excel文件...")
    print("=" * 50)
    
    # 遍历所有子目录
    for subdir in root_dir.iterdir():
        if not subdir.is_dir():
            continue
            
        category = subdir.name
        excel_files = list(subdir.glob("*.xlsx"))
        
        if not excel_files:
            continue
            
        print(f"\n处理类别: {category}")
        print(f"  找到 {len(excel_files)} 个Excel文件")
        
        # 处理该类别下的所有Excel文件
        for excel_file in excel_files:
            try:
                print(f"    读取: {excel_file.name}")
                
                # 读取Excel文件
                df = pd.read_excel(excel_file)
                
                if df.empty:
                    print(f"      警告: {excel_file.name} 为空文件")
                    continue
                
                # 创建新的数据结构
                processed_df = df.copy()
                
                # 调整字段结构
                if '所属类别' in processed_df.columns:
                    # 将原"所属类别"重命名为"品牌"
                    processed_df['原品牌'] = processed_df['所属类别']
                
                if '品牌' in processed_df.columns:
                    # 将原"品牌"重命名为"子品牌"
                    processed_df['子品牌'] = processed_df['品牌']
                
                # 设置新的"所属类别"为子文件夹名称
                processed_df['所属类别'] = category
                
                # 设置"品牌"为原来的"所属类别"值
                if '原品牌' in processed_df.columns:
                    processed_df['品牌'] = processed_df['原品牌']
                    processed_df.drop('原品牌', axis=1, inplace=True)
                else:
                    processed_df['品牌'] = ''
                
                # 重新排列列的顺序
                columns_order = [
                    '存货编码', '存货名称', '规格型号', '计价方式', 
                    '所属类别', '品牌', '子品牌', '计量单位', 
                    '参考成本', '最新成本', '建档日期'
                ]
                
                # 确保所有列都存在，不存在的用空值填充
                for col in columns_order:
                    if col not in processed_df.columns:
                        processed_df[col] = ''
                
                # 按照指定顺序重新排列列
                processed_df = processed_df[columns_order]
                
                # 添加到总数据中
                all_data.append(processed_df)
                print(f"      成功读取 {len(processed_df)} 行数据")
                
            except Exception as e:
                print(f"      错误: 无法读取 {excel_file.name} - {e}")
                continue
    
    # 合并所有数据
    if all_data:
        print(f"\n合并所有数据...")
        merged_df = pd.concat(all_data, ignore_index=True)
        
        # 数据统计
        print(f"合并完成!")
        print(f"总行数: {len(merged_df)}")
        print(f"总列数: {len(merged_df.columns)}")
        
        # 按类别统计
        print(f"\n各类别产品数量:")
        category_counts = merged_df['所属类别'].value_counts()
        for category, count in category_counts.items():
            print(f"  {category}: {count} 个产品")
        
        # 生成输出文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"合并产品数据_{timestamp}.xlsx"
        
        # 保存到Excel文件
        print(f"\n保存到文件: {output_file}")
        merged_df.to_excel(output_file, index=False, engine='openpyxl')
        
        print(f"文件保存成功: {output_file}")
        
        # 显示前几行作为预览
        print(f"\n数据预览 (前5行):")
        print(merged_df.head().to_string())
        
        return output_file, merged_df
    else:
        print("没有找到任何有效的Excel文件!")
        return None, None

if __name__ == "__main__":
    output_file, data = merge_all_excel_files()
    if output_file:
        print(f"\n✅ 合并完成! 输出文件: {output_file}")
    else:
        print("❌ 合并失败!")