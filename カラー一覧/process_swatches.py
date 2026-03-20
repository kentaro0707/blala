#!/usr/bin/env python3
"""
画像色分離処理スクリプト
C1.png〜C6.pngの画像から色/柄スウォッチを抽出し、透過PNGとマスク画像を生成する。
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np


def create_output_dir(base_path: Path) -> Path:
    """出力ディレクトリを作成"""
    output_dir = base_path / "output"
    output_dir.mkdir(exist_ok=True)
    return output_dir


def extract_grid_swatches(img_path: Path, output_dir: Path, rows: int = 3, cols: int = 10):
    """
    C1.png用: グリッド状のスウォッチを分割
    3行×10列の構造を想定
    """
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size

    # スウォッチのサイズを計算
    swatch_w = width // cols
    swatch_h = height // rows

    extracted = []

    for row in range(rows):
        for col in range(cols):
            # スウォッチ領域を切り出し（内側5%をマージンとして除外）
            left = col * swatch_w + int(swatch_w * 0.05)
            top = row * swatch_h + int(swatch_h * 0.05)
            right = (col + 1) * swatch_w - int(swatch_w * 0.05)
            bottom = (row + 1) * swatch_h - int(swatch_h * 0.05)

            swatch = img.crop((left, top, right, bottom))

            # スウォッチ内の文字（カラーコード等）を除去
            # 下部15%を文字領域として除外
            text_h = int(swatch_h * 0.15)
            swatch_content = swatch.crop((0, 0, swatch.width, swatch.height - text_h))

            name = f"swatch_{row+1:02d}_{col+1:02d}"
            extracted.append((name, swatch_content))

    return extracted


def extract_horizontal_tiles(img_path: Path, output_dir: Path, count: int = 6):
    """
    C2.png用: 横に並んだ6つの柄見本を抽出
    """
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size

    tile_w = width // count

    names = [
        "black_leopard",
        "leopard",
        "zebra",
        "desert_camouflage",
        "sea",
        "jellyfish"
    ]

    extracted = []

    for i in range(count):
        left = i * tile_w + int(tile_w * 0.05)
        top = int(height * 0.1)
        right = (i + 1) * tile_w - int(tile_w * 0.05)
        bottom = int(height * 0.9)

        tile = img.crop((left, top, right, bottom))
        extracted.append((names[i], tile))

    return extracted


def extract_single_sample(img_path: Path, output_dir: Path, name: str,
                          margin_ratio: float = 0.1):
    """
    C3.png, C4.png, C5.png用: 単一見本を抽出
    画像の中心付近から見本領域を検出
    """
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img)

    # アルファチャンネルがある場合、非透明領域を検出
    if arr.shape[2] == 4:
        alpha = arr[:, :, 3]
        has_content = alpha > 0
    else:
        has_content = np.ones((arr.shape[0], arr.shape[1]), dtype=bool)

    # 内容がある領域のバウンディングボックスを取得
    rows = np.any(has_content, axis=1)
    cols = np.any(has_content, axis=0)

    if not np.any(rows) or not np.any(cols):
        return [(name, img)]

    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]

    # マージンを追加
    h = rmax - rmin
    w = cmax - cmin
    margin_h = int(h * margin_ratio)
    margin_w = int(w * margin_ratio)

    rmin = max(0, rmin - margin_h)
    rmax = min(img.height, rmax + margin_h)
    cmin = max(0, cmin - margin_w)
    cmax = min(img.width, cmax + margin_w)

    cropped = img.crop((cmin, rmin, cmax, rmax))

    return [(name, cropped)]


def extract_dual_samples(img_path: Path, output_dir: Path):
    """
    C6.png用: 上下2つの見本を抽出
    上: スムーススキン、下: メッシュスキン
    """
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size

    # 上下半分ずつを抽出
    mid = height // 2

    # 上部（スムーススキン）
    top_sample = img.crop((int(width * 0.1), int(height * 0.05),
                           int(width * 0.9), mid - int(height * 0.05)))

    # 下部（メッシュスキン）
    bottom_sample = img.crop((int(width * 0.1), mid + int(height * 0.05),
                              int(width * 0.9), int(height * 0.95)))

    return [
        ("smooth_skin", top_sample),
        ("mesh_skin", bottom_sample)
    ]


def create_mask(img: Image.Image) -> Image.Image:
    """
    画像から白黒マスクを生成
    非透明/非白領域を白、その他を黒とする
    """
    arr = np.array(img)

    if arr.shape[2] == 4:
        # アルファチャンネルを使用
        alpha = arr[:, :, 3]
        mask = (alpha > 10).astype(np.uint8) * 255
    else:
        # RGB画像の場合、白色以外をマスク
        rgb = arr[:, :, :3]
        # 白色判定（各チャンネルが240以上）
        is_white = np.all(rgb > 240, axis=2)
        mask = (~is_white).astype(np.uint8) * 255

    # ノイズ除去（PILを使用）
    mask_img = Image.fromarray(mask, 'L')

    # モルフォロジー操作（閉じてから開く）- フィルタサイズは奇数
    mask_img = mask_img.filter(ImageFilter.MinFilter(3))
    mask_img = mask_img.filter(ImageFilter.MaxFilter(5))
    mask_img = mask_img.filter(ImageFilter.MinFilter(3))

    return mask_img


def make_transparent(img: Image.Image, mask: Image.Image) -> Image.Image:
    """
    マスクに基づいて画像を透過PNGに変換
    """
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    arr = np.array(img)
    mask_arr = np.array(mask)

    # マスクが黒の領域を透明に
    arr[:, :, 3] = np.where(mask_arr > 128, arr[:, :, 3], 0).astype(np.uint8)

    return Image.fromarray(arr)


def save_sample(name: str, img: Image.Image, output_dir: Path):
    """
    透過PNGとマスクを保存
    """
    # マスク生成
    mask = create_mask(img)

    # 透過PNG生成
    transparent = make_transparent(img, mask)

    # 保存
    transparent_path = output_dir / f"{name}.png"
    mask_path = output_dir / f"{name}_mask.png"

    transparent.save(transparent_path)
    mask.save(mask_path)

    print(f"  Saved: {transparent_path.name}, {mask_path.name}")

    return transparent


def create_preview(extracted_images: list, output_dir: Path, output_path: str = "preview_all.png"):
    """
    総合プレビュー画像を生成
    """
    # 各画像をサムネイルサイズに統一
    thumbnail_size = (100, 100)
    thumbnails = []

    for name, img in extracted_images:
        # アスペクト比を維持してリサイズ
        img_ratio = img.width / img.height
        if img_ratio > 1:
            new_w = thumbnail_size[0]
            new_h = int(thumbnail_size[0] / img_ratio)
        else:
            new_h = thumbnail_size[1]
            new_w = int(thumbnail_size[1] * img_ratio)

        thumb = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # 正方形のキャンバスに配置
        canvas = Image.new('RGBA', thumbnail_size, (240, 240, 240, 255))
        offset = ((thumbnail_size[0] - new_w) // 2, (thumbnail_size[1] - new_h) // 2)
        canvas.paste(thumb, offset, thumb)

        thumbnails.append(canvas)

    # グリッド状に配置
    cols = 10
    rows = (len(thumbnails) + cols - 1) // cols

    preview_width = cols * (thumbnail_size[0] + 10)
    preview_height = rows * (thumbnail_size[1] + 10)

    preview = Image.new('RGBA', (preview_width, preview_height), (255, 255, 255, 255))

    for i, thumb in enumerate(thumbnails):
        row = i // cols
        col = i % cols
        x = col * (thumbnail_size[0] + 10) + 5
        y = row * (thumbnail_size[1] + 10) + 5
        preview.paste(thumb, (x, y), thumb)

    preview.save(output_dir / output_path)
    print(f"  Saved preview: {output_path}")


def main():
    base_path = Path(__file__).parent
    output_dir = create_output_dir(base_path)

    print("Starting image processing...")
    print(f"Output directory: {output_dir}")
    print()

    all_extracted = []

    # C1.png: スウォッチ一覧
    print("Processing C1.png (30 swatches)...")
    c1_results = extract_grid_swatches(base_path / "C1.png", output_dir, rows=3, cols=10)
    for name, img in c1_results:
        save_sample(name, img, output_dir)
        all_extracted.append((name, img))
    print(f"  Extracted {len(c1_results)} swatches")
    print()

    # C2.png: 6つの柄見本
    print("Processing C2.png (6 patterns)...")
    c2_results = extract_horizontal_tiles(base_path / "C2.png", output_dir, count=6)
    for name, img in c2_results:
        save_sample(name, img, output_dir)
        all_extracted.append((name, img))
    print(f"  Extracted {len(c2_results)} patterns")
    print()

    # C3.png: モンステラ柄
    print("Processing C3.png (monstera)...")
    c3_results = extract_single_sample(base_path / "C3.png", output_dir, "monstera")
    for name, img in c3_results:
        save_sample(name, img, output_dir)
        all_extracted.append((name, img))
    print()

    # C4.png: ハート柄
    print("Processing C4.png (heart)...")
    c4_results = extract_single_sample(base_path / "C4.png", output_dir, "heart")
    for name, img in c4_results:
        save_sample(name, img, output_dir)
        all_extracted.append((name, img))
    print()

    # C5.png: コヨーテ色
    print("Processing C5.png (coyote)...")
    c5_results = extract_single_sample(base_path / "C5.png", output_dir, "coyote")
    for name, img in c5_results:
        save_sample(name, img, output_dir)
        all_extracted.append((name, img))
    print()

    # C6.png: スムーススキン、メッシュスキン
    print("Processing C6.png (smooth_skin, mesh_skin)...")
    c6_results = extract_dual_samples(base_path / "C6.png", output_dir)
    for name, img in c6_results:
        save_sample(name, img, output_dir)
        all_extracted.append((name, img))
    print(f"  Extracted {len(c6_results)} samples")
    print()

    # プレビュー画像生成
    print("Creating preview...")
    create_preview(all_extracted, output_dir)
    print()

    # 結果サマリー
    print("=" * 50)
    print("Processing complete!")
    print(f"Total samples extracted: {len(all_extracted)}")
    print(f"Total output files: {len(all_extracted) * 2 + 1}")  # PNG + mask + preview
    print(f"Output directory: {output_dir}")
    print("=" * 50)


if __name__ == "__main__":
    main()
