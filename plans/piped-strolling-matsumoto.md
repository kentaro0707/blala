# ASHパターン柄縮小・高密度化プラン

## Context

ユーザーはASHパターンの柄モチーフを現在の60〜70%程度の大きさまで縮小し、代わりに数を増やしてより細かく密度の高い柄にしたいと考えている。色味、質感、雰囲気は維持し、柄だけを小型化する。

### 現状のASHパターン
- 斜め方向の線形テクスチャ（織り交ぜられた不規則な繊維状）
- モノクログレースケール（ダークチャコールグレー、10-15%明度）
- ソフトで触感のある、わずかにファジーな質感
- 高密度パターン

### 現状の処理
- ASHは標準処理パスを使用（特別な繊細化処理なし）
- 中央から512x512を切り出し、シームレス化のみ適用

### 既存の繊細化手法（BCF用）
- `tile_and_crop`関数によるタイリング＆ダウンスケール方式
- 2x2タイリングで実質2倍のパターン密度を実現

## Implementation Plan

### Approach

BCFで使用されている「タイリング＆ダウンスケール」方式をASHに適用する。

**縮小率の計算:**
- 60-70%の縮小 → タイリング係数1.4〜1.7が必要
- タイリング係数1.5 = モチーフサイズ67%（目標範囲内）
- タイリング係数1.6 = モチーフサイズ62.5%（目標範囲内）

**採用設定:**
- `ASH_TILE_FACTOR = 1.5`（モチーフを約67%に縮小）← ユーザー選択

### Files to Modify

**`カラー一覧/process_patterns.py`**

#### 変更1: ASH専用設定を追加（21-25行目付近、BCF設定の後に追加）

```python
# ASH専用設定（繊細化パラメータ）
ASH_TILE_FACTOR = 1.5  # タイリング係数（1.5=柄を67%に縮小）
ASH_CROP_SIZE = 4096   # 初期切り出しサイズ
ASH_WORK_SIZE = 2048   # 中間作業サイズ
ASH_BLEND_WIDTH = 32   # シームレス化のブレンド幅
```

#### 変更2: 新関数`refine_pattern_by_tiling`を追加（`tile_and_crop`関数の後に追加）

上記「Technical Implementation」セクションの関数を追加。

#### 変更3: `process_pattern`関数にASH用の分岐を追加

既存の`if code == 'BCF':`ブロックの後に、`elif code == 'ASH':`ブロックを追加。
上記「Technical Implementation」セクションのコードを参照。

### Processing Flow for ASH

1. **Step 1: 初期切り出し**（メモリ削減）
   - 元画像の中央から4096x4096を切り出し

2. **Step 2: リサイズベースの密度向上**
   - 画像を1/1.5倍（約67%）に縮小
   - 縮小した画像をタイル配置して元のサイズに復元
   - これにより柄のモチーフは小さくなり、数は増える

3. **Step 3: シームレス化**
   - Offset-and-Blend法でエッジを滑らかに

4. **Step 4: 最終リサイズ**
   - 512x512で出力

### Technical Implementation

#### 新関数: `refine_pattern_by_tiling`

```python
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
```

#### `process_pattern`関数の修正

既存のBCF処理ブロックの後に、ASH用の処理を追加:

```python
# ASHの場合は繊細化処理を適用
elif code == 'ASH':
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
```

## Verification

### 実行手順

1. **スクリプトを実行**:
   ```bash
   cd /Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala
   python カラー一覧/process_patterns.py
   ```

2. **出力ファイルを確認**:
   - パス: `カラー一覧/一覧/processed/ASH_processed_thumb.png`
   - ファイルサイズ: 前回と比較（約461KB程度と予想）

3. **視覚的検証**:
   - 元のASH画像と処理後の画像を並べて比較
   - 確認ポイント:
     - [ ] 柄のモチーフが約67%に縮小されているか
     - [ ] 柄の数が増えて密度が高くなっているか
     - [ ] 色味、質感、雰囲気が維持されているか
     - [ ] 全体が粗く見えず、細かく連続した印象か
     - [ ] シームレス（継ぎ目が見えない）になっているか

4. **必要に応じて調整**:
   - 縮小率を変更したい場合: `ASH_TILE_FACTOR`を調整（1.4〜1.7の範囲）

## Notes

- 元画像（ASH.png）は102MBと大きいため、メモリ使用量に注意
- LANCZOSリサンプリングで高品質な縮小を維持
- シームレス化のブレンド幅は32px（BCFと同じ）を使用
- **エッジケース**: 元画像が4096x4096より小さい場合の処理は、既存のBCFロジックと同様に対応
