#!/usr/bin/env python3
"""
BCF画像の四隅の不自然な境界線を修正するスクリプト
タイリングして中央から切り出すことで、四隅の問題を解消
"""

from PIL import Image
import numpy as np
from pathlib import Path

def fix_corners_by_tiling(input_path, output_path, blend_width=64):
    """
    タイリングとブレンドで四隅の不自然な境界線を修正

    Args:
        input_path: 入力画像のパス
        output_path: 出力画像のパス
        blend_width: ブレンド幅（ピクセル）
    """
    # 元画像を読み込む
    img = Image.open(input_path).convert('RGB')
    original_width, original_height = img.size

    print(f"元のサイズ: {original_width}x{original_height}")

    # 2x2タイル配置（四隅の問題を内部に移動）
    tiled = Image.new('RGB', (original_width * 2, original_height * 2))
    for y in range(2):
        for x in range(2):
            tiled.paste(img, (x * original_width, y * original_height))

    # 中央から切り出し（四隅の問題部分を除外）
    left = original_width // 2
    top = original_height // 2
    cropped = tiled.crop((left, top, left + original_width, top + original_height))

    # エッジをブレンドして滑らかにする
    img_array = np.array(cropped)
    h, w = img_array.shape[:2]

    # グラデーションマスクを作成（エッジ付近を滑らかに）
    mask = np.ones((h, w), dtype=np.float32)

    for i in range(blend_width):
        alpha = i / blend_width
        # 上エッジ
        mask[i, :] = min(mask[i, 0], alpha)
        # 下エッジ
        mask[h - blend_width + i, :] = min(mask[h - blend_width + i, 0], alpha)
        # 左エッジ
        mask[:, i] = np.minimum(mask[:, i], alpha)
        # 右エッジ
        mask[:, w - blend_width + i] = np.minimum(mask[:, w - blend_width + i], alpha)

    # 元の画像も同様にタイリング・切り出ししたものとブレンド
    # （オフセットを変えて2回切り出し、ブレンドする）
    left2 = original_width // 2 + original_width // 4
    top2 = original_height // 2 + original_height // 4
    if left2 >= original_width:
        left2 -= original_width
    if top2 >= original_height:
        top2 -= original_height

    cropped2 = tiled.crop((left2, top2, left2 + original_width, top2 + original_height))
    img_array2 = np.array(cropped2)

    # ブレンド
    mask_3d = mask[:, :, np.newaxis]
    blended = (img_array * mask_3d + img_array2 * (1 - mask_3d)).astype(np.uint8)

    # PIL画像に戻す
    result = Image.fromarray(blended)

    # 保存
    result.save(output_path, 'PNG', optimize=True)
    print(f"保存完了: {output_path}")
    print(f"出力サイズ: {result.size[0]}x{result.size[1]}")

    return result


def fix_corners_simple(input_path, output_path):
    """
    シンプルな方法：タイリングして中央から切り出しのみ
    四隅の不自然な境界線を画像中央に移動させて目立たなくする
    """
    # 元画像を読み込む
    img = Image.open(input_path).convert('RGB')
    original_width, original_height = img.size

    print(f"元のサイズ: {original_width}x{original_height}")

    # 3x3タイル配置
    tiled = Image.new('RGB', (original_width * 3, original_height * 3))
    for y in range(3):
        for x in range(3):
            tiled.paste(img, (x * original_width, y * original_height))

    # 中央から切り出し（元と同じサイズ）
    left = original_width
    top = original_height
    result = tiled.crop((left, top, left + original_width, top + original_height))

    # 保存
    result.save(output_path, 'PNG', optimize=True)
    print(f"保存完了: {output_path}")

    return result


if __name__ == "__main__":
    # 入力・出力パス
    input_file = Path("/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧/一覧/BCF.png")
    output_file = Path("/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧/一覧/BCF.png")

    # バックアップを作成
    backup_file = input_file.parent / "BCF_backup.png"
    if not backup_file.exists():
        import shutil
        shutil.copy(input_file, backup_file)
        print(f"バックアップ作成: {backup_file}")

    # シンプルな方法で四隅を修正
    print("\n=== 四隅修正処理 ===")
    fix_corners_simple(input_file, output_file)
    print("\n処理完了!")
