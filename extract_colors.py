#!/usr/bin/env python3
"""
カラーシミュレーターの色データ抽出スクリプト

カラー一覧/一覧/ フォルダにあるPNG画像から以下を抽出:
- code: ファイル名（拡張子除く、日本語は英語に変換）
- name: ファイル名から変換（スネークケース→スペース区切り＋先頭大文字）
- hex: 画像の中央領域（中央20%）のピクセル値の中央値
"""

import os
import re
from pathlib import Path
from PIL import Image
import numpy as np


# 日本語ファイル名のマッピング
JA_NAME_MAP = {
    'スムーススキン': 'smooth_skin',
    'メッシスキン': 'mesh_skin',
    'ワイン': 'wine'
}


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

    # RGBAの場合、アルファチャンネルを考慮
    has_alpha = img.mode == 'RGBA'
    if has_alpha:
        # RGBモードに変換（透明ピクセルは黒に）
        background = Image.new('RGB', img.size, (0, 0, 0))
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != 'RGB':
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
    exclude_files = {'.DS_Store', 'preview_all.png', 'preview_all.jpg', 'preview_all.jpeg'}

    # 全PNGファイルを処理
    for image_file in sorted(source_dir.glob('*.png')):
        # 除外ファイルをスキップ
        if image_file.name in exclude_files:
            continue

        # code: ファイル名（拡張子除く）
        code = image_file.stem

        # 日本語ファイル名を英語に変換
        if code in JA_NAME_MAP:
            code = JA_NAME_MAP[code]

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


def hex_to_brightness(hex_value: str) -> int:
    """HEX色の明度を計算（0-255）"""
    hex_value = hex_value.lstrip('#')
    r, g, b = int(hex_value[0:2], 16), int(hex_value[2:4], 16), int(hex_value[4:6], 16)
    return int(0.299 * r + 0.587 * g + 0.114 * b)


def main():
    # カレントディレクトリのベースを取得
    base_dir = Path(__file__).parent

    # 画像フォルダ
    source_dir = base_dir / 'カラー一覧' / '一覧'

    if not source_dir.exists():
        print(f"エラー: {source_dir} が見つかりません")
        return

    print(f"処理対象フォルダ: {source_dir}")
    print(f"除外ファイル: .DS_Store, preview_all.png")
    print()

    # 色データを抽出
    color_data = process_images(source_dir)

    print()
    print(f"合計 {len(color_data)} 色を抽出しました")

    # 明るさ順にソート
    color_data_sorted = sorted(color_data, key=lambda x: hex_to_brightness(x['hex']))

    # JavaScriptパレットコードを生成
    js_palette = generate_javascript_palette(color_data_sorted)

    # 出力ファイルに保存
    output_file = base_dir / 'simulator' / 'js' / 'palette_new.js'
    output_file.write_text(js_palette, encoding='utf-8')

    print(f"\nJavaScriptパレットを {output_file} に出力しました")

    # INITIAL_COLORSの候補も出力
    print("\n--- INITIAL_COLORS 候補（各色相から代表色を選定）---")

    # 暗色（黒系）
    dark = [c for c in color_data if hex_to_brightness(c['hex']) < 80]
    if dark:
        cand = max(dark, key=lambda x: hex_to_brightness(x['hex']))
        print(f"// 暗色: {cand['code']} ({cand['hex']})")

    # 明色（白系）
    light = [c for c in color_data if hex_to_brightness(c['hex']) > 200]
    if light:
        cand = min(light, key=lambda x: hex_to_brightness(x['hex']))
        print(f"// 明色: {cand['code']} ({cand['hex']})")

    # 中間色（ベージュ/カーキ系）
    mid_light = [c for c in color_data if 120 <= hex_to_brightness(c['hex']) <= 180]
    if mid_light:
        cand = mid_light[0]
        print(f"// 中間色: {cand['code']} ({cand['hex']})")

    # グレー系
    mid_dark = [c for c in color_data if 80 <= hex_to_brightness(c['hex']) < 120]
    if mid_dark:
        cand = mid_dark[0]
        print(f"// 中間暗色: {cand['code']} ({cand['hex']})")


if __name__ == '__main__':
    main()
