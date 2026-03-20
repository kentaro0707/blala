#!/usr/bin/env python3
"""
カラーシミュレーターの色データ抽出スクリプト

カラー一覧/一覧/ フォルダにあるPNG画像から以下を抽出:
- code: ファイル名（拡張子除く）
- name: ファイル名から変換（スネークケース→スペース区切り＋先頭大文字）
- hex: 画像の中央領域（中央20%）のピクセル値の中央値
"""

import os
import re
from pathlib import Path
from PIL import Image
import numpy as np


def snake_to_title(name: str) -> str:
    """スネークケースをタイトルケースに変換

    例: swatch_01_01 → Swatch 01 01
        black_leopard → Black Leopard
    """
    # アンダースコアをスペースに変換
    with_spaces = name.replace('_', ' ')
    # 各単語の先頭を大文字に
    return ' '.join(word.capitalize() for word in with_spaces.split())


def extract_median_hex(image_path: Path) -> str:
    """画像の中央領域（中央20%）のピクセル値の中央値をHEXで返す

    アンチエイリアス対策として、中央領域のピクセル値の中央値を使用
    """
    img = Image.open(image_path)

    # RGBモードに変換（必要な場合）
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # NumPy配列に変換
    img_array = np.array(img)

    height, width = img_array.shape[:2]

    # 中央領域の座標を計算（中央20%）
    margin_y = int(height * 0.4)  # 上下40%ずつ除外
    margin_x = int(width * 0.4)   # 左右40%ずつ除外

    # 中央領域を抽出
    central_region = img_array[margin_y:height-margin_y, margin_x:width-margin_x]

    # ピクセル値を平坦化して中央値を計算
    median_color = np.median(central_region.reshape(-1, 3), axis=0).astype(int)

    # HEX形式に変換
    r, g, b = median_color
    return f'#{r:02x}{g:02x}{b:02x}'


def process_images(source_dir: Path) -> list[dict]:
    """画像フォルダを処理して色データを抽出

    Args:
        source_dir: 画像フォルダのパス

    Returns:
        色データのリスト [{code, name, hex}, ...]
    """
    color_data = []

    # 除外ファイルリスト
    exclude_files = {'preview_all.png', 'preview_all.jpg', 'preview_all.jpeg'}

    # 全PNGファイルを処理
    for image_file in sorted(source_dir.glob('*.png')):
        # 除外ファイルをスキップ
        if image_file.name.lower() in exclude_files:
            continue

        # code: ファイル名（拡張子除く）
        code = image_file.stem

        # name: スネークケースをタイトルケースに変換
        name = snake_to_title(code)

        # hex: 中央領域のピクセル値の中央値
        hex_value = extract_median_hex(image_file)

        color_data.append({
            'code': code,
            'name': name,
            'hex': hex_value
        })

        print(f'{code}: {name} -> {hex_value}')

    return color_data


def generate_javascript_palette(color_data: list[dict]) -> str:
    """JavaScriptのCOLOR_PALETTE配列を生成

    Args:
        color_data: 色データのリスト

    Returns:
        JavaScriptコード（文字列）
    """
    lines = ['const COLOR_PALETTE = [']

    for item in color_data:
        lines.append(f"  {{ code: '{item['code']}', name: '{item['name']}', hex: '{item['hex']}' }},")

    lines.append('];')

    return '\n'.join(lines)


def main():
    # カレントディレクトリのベースを取得
    base_dir = Path(__file__).parent

    # 画像フォルダ
    source_dir = base_dir / 'カラー一覧' / '一覧'

    if not source_dir.exists():
        print(f"エラー: {source_dir} が見つかりません")
        return

    print(f"処理対象フォルダ: {source_dir}")
    print(f"除外ファイル: preview_all.png")
    print()

    # 色データを抽出
    color_data = process_images(source_dir)

    print()
    print(f"合計 {len(color_data)} 色を抽出しました")

    # JavaScriptパレットコードを生成
    js_palette = generate_javascript_palette(color_data)

    # 出力ファイルに保存
    output_file = base_dir / 'simulator' / 'js' / 'palette_new.js'
    output_file.write_text(js_palette, encoding='utf-8')

    print(f"\nJavaScriptパレットを {output_file} に出力しました")

    # INITIAL_COLORSの候補も出力
    print("\n--- INITIAL_COLORS 候補（各色相から代表色を選定）---")

    # 黒系・暗色
    dark_candidates = [c for c in color_data if c['hex'] < '#404040']
    if dark_candidates:
        print(f"// 黒系・暗色: {dark_candidates[0]['code']} ({dark_candidates[0]['hex']})")

    # 白系・明色
    light_candidates = [c for c in color_data if c['hex'] > '#c0c0c0']
    if light_candidates:
        print(f"// 白系・明色: {light_candidates[0]['code']} ({light_candidates[0]['hex']})")

    # ベージュ系
    beige_candidates = [c for c in color_data if 'd4c4a8' <= c['hex'] <= 'e8d8b8' or 'beige' in c['name'].lower()]
    if beige_candidates:
        print(f"// ベージュ系: {beige_candidates[0]['code']} ({beige_candidates[0]['hex']})")

    # グレー系
    gray_candidates = [c for c in color_data if 'gray' in c['name'].lower() or 'grey' in c['name'].lower()]
    if gray_candidates:
        print(f"// グレー系: {gray_candidates[0]['code']} ({gray_candidates[0]['hex']})")


if __name__ == '__main__':
    main()
