# ASH_processed_thumb 四隅修正・50%縮小計画

## Context
ユーザーから、ASH_processed_thumb.png の四隅にあるボヤけた線を除去し、BLEP_small.png のように50%縮小する依頼がありました。

## 現状
- **ASH_processed_thumb.png**: 1024x1024 (processed ディレクトリ内)
- **BLEP_small.png**: 256x256 (一覧ディレクトリ内)
- 四隅のボヤけた線は、process_patterns.py のシームレス化処理（ブレンド幅32px）によるもの

## 実装計画

既存の `fix_bcf_corners.py` の `fix_corners_simple()` 関数をベースに、ASH用に修正します。

### 新規作成: `カラー一覧/fix_ash_corners.py`

```python
#!/usr/bin/env python3
"""
ASH_processed_thumb.pngの四隅のボヤけた線を修正し、50%縮小するスクリプト
"""

from PIL import Image
from pathlib import Path

def fix_corners_and_shrink(input_path, output_path):
    """
    タイリングして中央から切り出しで四隅を修正し、50%縮小
    """
    # 1. 画像読み込み
    img = Image.open(input_path).convert('RGB')
    original_width, original_height = img.size
    print(f"元のサイズ: {original_width}x{original_height}")

    # 2. 3x3タイル配置（四隅の境界線を画像中央に移動）
    tiled = Image.new('RGB', (original_width * 3, original_height * 3))
    for y in range(3):
        for x in range(3):
            tiled.paste(img, (x * original_width, y * original_height))

    # 3. 中央から切り出し
    left = original_width
    top = original_height
    result = tiled.crop((left, top, left + original_width, top + original_height))

    # 4. 50%縮小 (1024x1024 → 512x512)
    new_size = (original_width // 2, original_height // 2)
    result = result.resize(new_size, Image.Resampling.LANCZOS)
    print(f"縮小後サイズ: {result.size[0]}x{result.size[1]}")

    # 5. 保存
    result.save(output_path, 'PNG', optimize=True)
    print(f"保存完了: {output_path}")

    return result

if __name__ == "__main__":
    input_file = Path(".../processed/ASH_processed_thumb.png")
    output_file = Path(".../一覧/ASH_small.png")
    fix_corners_and_shrink(input_file, output_file)
```

### 処理フロー
1. ASH_processed_thumb.png (1024x1024) を読み込む
2. 3x3タイル配置で四隅の境界線を中央に移動
3. 中央から1024x1024を切り出し（四隅の問題が解消）
4. 50%縮小 → 512x512
5. ASH_small.png として保存

## 出力ファイル
- **パス**: `カラー一覧/一覧/ASH_small.png`
- **サイズ**: 512x512
- **命名規則**: BLEP_small.png と同じ `_small` サフィックス

## 検証方法
1. スクリプトを実行して ASH_small.png を生成
2. シミュレーターでパレットに追加して確認
3. 四隅のボヤけた線が消えていることを視覚的に確認
4. サイズが512x512になっていることを確認
