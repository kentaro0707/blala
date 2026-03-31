#!/usr/bin/env python3
"""
ASH_processed_thumb.pngの四隅のボヤけた線を修正し、50%縮小するスクリプト
ブレンド領域をトリミングして除外する
"""

from PIL import Image
from pathlib import Path

def fix_corners_and_shrink(input_path, output_path, blend_margin=32):
    """
    ブレンド領域をトリミングして除外し、50%縮小

    Args:
        input_path: 入力画像パス
        output_path: 出力画像パス
        blend_margin: トリミングする余白（ピクセル）
    """
    # 1. 画像読み込み（RGBA対応）
    img = Image.open(input_path)
    # 透明度がある場合は白背景と合成、ない場合はそのままRGBに変換
    if img.mode == 'RGBA':
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    else:
        img = img.convert('RGB')

    original_width, original_height = img.size
    print(f"元のサイズ: {original_width}x{original_height}")

    # 2. ブレンド領域をトリミングして除外
    cropped = img.crop((
        blend_margin,
        blend_margin,
        original_width - blend_margin,
        original_height - blend_margin
    ))
    print(f"トリミング後: {cropped.size[0]}x{cropped.size[1]}")

    # 3. 元のサイズにリサイズ（ブレンド領域を埋める）
    resized = cropped.resize((original_width, original_height), Image.Resampling.LANCZOS)
    print(f"リサイズ後: {resized.size[0]}x{resized.size[1]}")

    # 4. 256x256に縮小 (BLEP_small.pngと同じサイズ)
    new_size = (256, 256)
    result = resized.resize(new_size, Image.Resampling.LANCZOS)
    print(f"最終サイズ: {result.size[0]}x{result.size[1]}")

    # 5. 保存
    result.save(output_path, 'PNG', optimize=True)
    print(f"保存完了: {output_path}")

    return result

if __name__ == "__main__":
    base_dir = Path("/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧")
    input_file = base_dir / "一覧/processed/ASH_processed_thumb.png"
    output_file = base_dir / "一覧/ASH_small.png"
    fix_corners_and_shrink(input_file, output_file, blend_margin=32)
