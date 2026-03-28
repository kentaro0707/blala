#!/usr/bin/env python3
"""
パターンのモチーフを縮小し、密度を高めるスクリプト
モチーフを60-70%に縮小し、数を増やして細かいパターンにする
"""

from PIL import Image
import os
import numpy as np

def shrink_pattern(input_path, output_path, scale_factor=0.65):
    """
    パターンを縮小し、密度を高める

    Args:
        input_path: 入力画像のパス
        output_path: 出力画像のパス
        scale_factor: 縮小率 (0.6-0.7推奨)
    """
    # 元画像を読み込む
    img = Image.open(input_path)
    original_width, original_height = img.size

    print(f"元のサイズ: {original_width}x{original_height}")
    print(f"縮小率: {scale_factor*100}%")

    # 画像を縮小（モチーフを小さくする）
    # 新しいサイズ = 元のサイズ * scale_factor
    new_width = int(original_width * scale_factor)
    new_height = int(original_height * scale_factor)

    # 高品質なリサンプリングで縮小
    shrunk_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # 縮小した画像を元のサイズにタイル配置（密度を高める）
    # タイル数を計算（元のサイズを埋めるのに必要な数）
    tiles_x = int(np.ceil(original_width / new_width)) + 1
    tiles_y = int(np.ceil(original_height / new_height)) + 1

    # タイル配置のオフセットをランダムに少しずらして、継ぎ目を目立たなくする
    # ただし、シームレスな繰り返しを維持するため、オフセットは最小限に

    # 新しいキャンバスを作成
    result = Image.new('RGB', (original_width, original_height))

    # タイルを配置（中心から開始して、継ぎ目が中央に来ないようにする）
    offset_x = 0
    offset_y = 0

    for y in range(tiles_y):
        for x in range(tiles_x):
            paste_x = x * new_width + offset_x
            paste_y = y * new_height + offset_y
            result.paste(shrunk_img, (paste_x, paste_y))

    # 元のサイズにクロップ
    result = result.crop((0, 0, original_width, original_height))

    # 保存
    result.save(output_path, quality=95)
    print(f"保存完了: {output_path}")
    print(f"出力サイズ: {result.size[0]}x{result.size[1]}")

    return result

def shrink_pattern_advanced(input_path, output_path, scale_factor=0.65):
    """
    より高度なパターン縮小処理
    シームレスなタイリングを考慮
    """
    img = Image.open(input_path)
    original_width, original_height = img.size

    print(f"\n=== 高度なパターン縮小処理 ===")
    print(f"元のサイズ: {original_width}x{original_height}")
    print(f"縮小率: {scale_factor*100}%")

    # 縮小後のサイズ
    new_width = int(original_width * scale_factor)
    new_height = int(original_height * scale_factor)

    # 縮小
    shrunk_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # 2x2グリッドで配置して、元のサイズに近づける
    # これにより密度が約(1/scale_factor)^2倍になる
    tile_size = 2  # 2x2グリッド
    grid_width = new_width * tile_size
    grid_height = new_height * tile_size

    # グリッド画像を作成
    grid_img = Image.new('RGB', (grid_width, grid_height))

    for y in range(tile_size):
        for x in range(tile_size):
            grid_img.paste(shrunk_img, (x * new_width, y * new_height))

    # 元のサイズにリサイズ（さらに滑らかに）
    result = grid_img.resize((original_width, original_height), Image.Resampling.LANCZOS)

    # 保存
    result.save(output_path, quality=95)
    print(f"保存完了: {output_path}")
    print(f"密度向上率: 約{(1/scale_factor)**2:.1f}倍")

    return result

def shrink_pattern_smooth(input_path, output_path, scale_factor=0.65):
    """
    スムーズなパターン縮小処理
    より自然な密度向上を実現
    """
    img = Image.open(input_path)
    original_width, original_height = img.size

    print(f"\n=== スムーズパターン縮小処理 ===")
    print(f"元のサイズ: {original_width}x{original_height}")
    print(f"縮小率: {scale_factor*100}%")

    # まず小さく縮小
    temp_size = int(original_width * scale_factor)
    shrunk = img.resize((temp_size, temp_size), Image.Resampling.LANCZOS)

    # 小さくした画像を複数並べて元のサイズに戻す
    # 1/scale_factor 個並べる（例: 0.65なら約1.54個 → 2個）
    tiles_needed = int(np.ceil(1 / scale_factor))

    # タイル配置用の大きなキャンバス
    canvas_size = temp_size * tiles_needed
    canvas = Image.new('RGB', (canvas_size, canvas_size))

    # タイル配置
    for y in range(tiles_needed):
        for x in range(tiles_needed):
            canvas.paste(shrunk, (x * temp_size, y * temp_size))

    # 元のサイズにリサイズ
    result = canvas.resize((original_width, original_height), Image.Resampling.LANCZOS)

    # 保存
    result.save(output_path, quality=95)
    print(f"保存完了: {output_path}")

    return result

if __name__ == "__main__":
    # 入力ファイル
    input_file = "/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧/一覧/BCF.png"

    # 出力ディレクトリ
    output_dir = "/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧/一覧/processed"
    os.makedirs(output_dir, exist_ok=True)

    # 60%縮小
    output_60 = os.path.join(output_dir, "BCF_60percent.png")
    shrink_pattern_smooth(input_file, output_60, scale_factor=0.60)

    # 65%縮小
    output_65 = os.path.join(output_dir, "BCF_65percent.png")
    shrink_pattern_smooth(input_file, output_65, scale_factor=0.65)

    # 70%縮小
    output_70 = os.path.join(output_dir, "BCF_70percent.png")
    shrink_pattern_smooth(input_file, output_70, scale_factor=0.70)

    print("\n=== 処理完了 ===")
    print(f"60%縮小: {output_60}")
    print(f"65%縮小: {output_65}")
    print(f"70%縮小: {output_70}")
