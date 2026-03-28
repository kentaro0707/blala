#!/usr/bin/env python3
"""
ドライスーツカラーシミュレーター用 柄テクスチャ高密度化・シームレス化スクリプト

5種類の柄テクスチャ（BCF、ASH、LEP、BLEP、SEA）を処理し、
シームレスなパターンに変換します。

Usage:
    python process_patterns.py
"""

import os
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

# ===== 設定 =====
THUMB_SIZE = 1024  # 出力サムネイルサイズ

# BCF専用設定（繊細化パラメータ）
BCF_TILE_FACTOR = 2  # タイリング係数（2=2x2配置）
BCF_CROP_SIZE = 4096  # 初期切り出しサイズ（メモリ削減用）
BCF_WORK_SIZE = 2048  # 中間作業サイズ
BCF_BLEND_WIDTH = 32  # シームレス化のブレンド幅

# ASH専用設定（繊細化パラメータ）
ASH_TILE_FACTOR = 1.5  # タイリング係数（1.5=柄を67%に縮小）
ASH_CROP_SIZE = 4096   # 初期切り出しサイズ
ASH_WORK_SIZE = 2048   # 中間作業サイズ
ASH_BLEND_WIDTH = 32   # シームレス化のブレンド幅

# パス設定
SCRIPT_DIR = Path(__file__).parent
INPUT_DIR = SCRIPT_DIR / "一覧"
OUTPUT_DIR = INPUT_DIR / "processed"

# 処理対象の柄
PATTERNS = ['LEP', 'ASH', 'SEA', 'BCF', 'BLEP', 'CFC', 'mesh_skin']


def tile_and_crop(img: Image.Image, factor: int, crop_size: int) -> Image.Image:
    """
    画像をタイリングして中心を切り出し（PILベース、メモリ効率良）

    Args:
        img: 入力画像（PIL Image）
        factor: タイリング係数（2=2x2配置）
        crop_size: 最終的に切り出すサイズ

    Returns:
        タイリング・切り出し後の画像

    Example:
        >>> img = Image.open('BCF.png')  # 8192x8192
        >>> result = tile_and_crop(img, 2, 2048)  # → 2048x2048
    """
    w, h = img.size
    # タイリング
    tiled = Image.new('RGB', (w * factor, h * factor))
    for y in range(factor):
        for x in range(factor):
            tiled.paste(img, (x * w, y * h))
    # 中心切り出し
    tw, th = tiled.size
    left = (tw - crop_size) // 2
    top = (th - crop_size) // 2
    return tiled.crop((left, top, left + crop_size, top + crop_size))


def refine_pattern_by_tiling(img: Image.Image, factor: float, crop_size: int) -> Image.Image:
    """
    非整数タイリング係数対応の繊細化処理

    Args:
        img: 入力画像
        factor: タイリング係数（1.5 = 柄を67%に縮小）
        crop_size: 最終的に切り出すサイズ

    Returns:
        繊細化後の画像
    """
    w, h = img.size

    # 縮小: factor分の1のサイズに
    small_w, small_h = int(w / factor), int(h / factor)
    small = img.resize((small_w, small_h), Image.Resampling.LANCZOS)

    # タイリング: crop_size以上を確保するために必要なタイル数を計算
    # ceil(crop_size / small_w) で必要なタイル数を計算
    tiles_x = int(np.ceil(crop_size / small_w)) + 1
    tiles_y = int(np.ceil(crop_size / small_h)) + 1

    tiled = Image.new('RGB', (small_w * tiles_x, small_h * tiles_y))
    for y in range(tiles_y):
        for x in range(tiles_x):
            tiled.paste(small, (x * small_w, y * small_h))

    # 中心切り出し
    tw, th = tiled.size
    left = (tw - crop_size) // 2
    top = (th - crop_size) // 2
    return tiled.crop((left, top, left + crop_size, top + crop_size))


def make_seamless(img: np.ndarray, blend_width: int = 32) -> np.ndarray:
    """Offset-and-Blend法でシームレス化"""
    h, w = img.shape[:2]

    # 中心を端に移動（ロール）
    rolled = np.roll(np.roll(img, h // 2, axis=0), w // 2, axis=1)

    # ブレンドマスクを作成（エッジでグラデーション）
    mask = np.zeros((h, w), dtype=np.float32)
    for i in range(blend_width):
        alpha = i / blend_width
        # 上下エッジ
        mask[i, :] = max(mask[i, 0], alpha)
        mask[h - blend_width + i, :] = max(mask[h - blend_width + i, 0], alpha)
        # 左右エッジ
        mask[:, i] = np.maximum(mask[:, i], alpha)
        mask[:, w - blend_width + i] = np.maximum(mask[:, w - blend_width + i], alpha)

    mask = np.clip(mask, 0, 1)

    # ブレンド
    if len(img.shape) == 3:
        mask = mask[:, :, np.newaxis]

    result = (rolled * mask + img * (1 - mask)).astype(np.uint8)
    return result


def process_pattern(code: str) -> bool:
    """
    パターンを処理：
    1. 元画像を読み込み
    2. 512x512にリサイズ（アスペクト比維持、中央切り出し）
       ※ BCFのみ繊細化処理（タイリング＆ダウンスケール）を適用
    3. タイリング用にシームレス化
    4. 512x512で出力
    """
    print(f"\n--- {code} ---")

    # 画像読み込み - mesh_skinは日本語ファイル名を使用
    if code == 'mesh_skin':
        input_path = INPUT_DIR / "メッシスキン.png"
    else:
        input_path = INPUT_DIR / f"{code}.png"
    if not input_path.exists():
        print(f"[ERROR] {input_path} が見つかりません")
        return False

    # PILで読み込み
    img = Image.open(input_path).convert('RGB')
    print(f"[INFO] {code} 読み込み完了: {img.size}")

    # BCFの場合は繊細化処理を適用
    if code == 'BCF':
        print(f"[INFO] BCF繊細化処理開始")

        # Step 1: 初期切り出し（メモリ削減）- 画像が小さい場合はスキップ
        if img.width > BCF_CROP_SIZE and img.height > BCF_CROP_SIZE:
            crop_size = BCF_CROP_SIZE
            left = (img.width - crop_size) // 2
            top = (img.height - crop_size) // 2
            img = img.crop((left, top, left + crop_size, top + crop_size))
            print(f"[INFO] 初期切り出し完了: {img.size}")
        else:
            print(f"[INFO] 画像サイズが小さいため初期切り出しスキップ: {img.size}")

        # Step 2: タイリング＆中心切り出し（作業サイズを画像サイズに合わせる）
        work_size = min(BCF_WORK_SIZE, min(img.width, img.height))
        img = tile_and_crop(img, BCF_TILE_FACTOR, work_size)
        print(f"[INFO] タイリング完了: {img.size}")

        # Step 3: シームレス化（NumPy配列に変換）
        img_array = np.array(img)
        img_seamless = make_seamless(img_array, blend_width=BCF_BLEND_WIDTH)

        # Step 4: 最終リサイズ
        result_img = Image.fromarray(img_seamless)
        result_img = result_img.resize((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
        print(f"[INFO] 最終リサイズ完了: {THUMB_SIZE}x{THUMB_SIZE}")
    elif code == 'ASH':
        # ASHの場合は繊細化処理を適用
        print(f"[INFO] ASH繊細化処理開始")

        # Step 1: 初期切り出し（メモリ削減）
        crop_size = ASH_CROP_SIZE
        left = (img.width - crop_size) // 2
        top = (img.height - crop_size) // 2
        img = img.crop((left, top, left + crop_size, top + crop_size))
        print(f"[INFO] 初期切り出し完了: {img.size}")

        # Step 2: タイリング＆中心切り出し（非整数係数対応）
        img = refine_pattern_by_tiling(img, ASH_TILE_FACTOR, ASH_WORK_SIZE)
        print(f"[INFO] 繊細化タイリング完了: {img.size}")

        # Step 3: シームレス化（NumPy配列に変換）
        img_array = np.array(img)
        img_seamless = make_seamless(img_array, blend_width=ASH_BLEND_WIDTH)

        # Step 4: 最終リサイズ
        result_img = Image.fromarray(img_seamless)
        result_img = result_img.resize((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
        print(f"[INFO] 最終リサイズ完了: {THUMB_SIZE}x{THUMB_SIZE}")
    elif code == 'BLEP' or code == 'CFC' or code == 'mesh_skin':
        # BLEPとCFCは元のパターンが既にシームレスなので、シームレス化処理をスキップ
        # そのまま512x512にリサイズのみ
        if img.width >= THUMB_SIZE and img.height >= THUMB_SIZE:
            # 右下部分を切り出し
            left = img.width - THUMB_SIZE
            top = img.height - THUMB_SIZE
            result_img = img.crop((left, top, left + THUMB_SIZE, top + THUMB_SIZE))
        else:
            # 小さい場合はリサイズ
            result_img = img.resize((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
    else:
        # 通常処理：元画像から切り出し
        if img.width >= THUMB_SIZE and img.height >= THUMB_SIZE:
            # 中心部分を切り出し
            left = (img.width - THUMB_SIZE) // 2
            top = (img.height - THUMB_SIZE) // 2
            img_cropped = img.crop((left, top, left + THUMB_SIZE, top + THUMB_SIZE))
        else:
            # 小さい場合はリサイズ
            img_cropped = img.resize((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)

        # NumPy配列に変換
        img_array = np.array(img_cropped)

        # シームレス化
        img_seamless = make_seamless(img_array, blend_width=24)
        result_img = Image.fromarray(img_seamless)

    # 保存
    output_path = OUTPUT_DIR / f"{code}_processed_thumb.png"
    result_img.save(output_path, 'PNG', optimize=True)
    print(f"[INFO] 保存完了: {output_path}")

    return True


def process_all_patterns():
    """すべての柄を処理"""
    print("=" * 60)
    print("柄テクスチャ シームレス化処理")
    print(f"設定: THUMB_SIZE={THUMB_SIZE}")
    print("=" * 60)

    # 出力ディレクトリを作成
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    success_count = 0
    for code in PATTERNS:
        if process_pattern(code):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"処理完了: {success_count}/{len(PATTERNS)} 成功")
    print(f"出力先: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == '__main__':
    process_all_patterns()
