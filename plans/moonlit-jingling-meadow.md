# BCFパターン繊細化計画

## Context
BCF（タクティカル・アーバン・カモフラージュ）のパターンを、元のデザイン要素を保ちながら、より繊細で細かいパターンに調整する。色味、質感、元の印象を維持しつつ、モチーフのサイズを小さくし、密度を上げて自然で統一感のある仕上がりにする。

## 現状分析

### 元画像（BCF.png）
- **解像度**: 8192 x 8192 ピクセル
- **パターン種類**: タクティカル・アーバン・カモフラージュ（Blackout edition）
- **モチーフサイズ**: 各色の塊が画像全体の10-30%を占める（中～大規模モチーフ）
- **色構成**: ブラック(~40%)、ダークグレー(~35%)、ライトグレー(~25%)
- **テクスチャ**: フラットなデジタルテクスチャ、マットな質感

### 現在の処理フロー
1. 元画像を読み込み
2. 512x512にリサイズ（中心切り出し）
3. Offset-and-Blend法でシームレス化（blend_width=24）
4. 512x512で出力

**課題**: 単純な切り出しではパターン密度が変わらない

## 実装アプローチ

### Tiling-and-Downscale法（メモリ効率版）
元画像を**先に縮小**してからタイリングすることで、メモリ使用量を抑制しつつパターンを繊細にする。

```
元画像(8192x8192)
  → 中心を4096x4096で切り出し（メモリ削減）
  → タイリング(2x2配置で8192x8192)
  → 中心を2048x2048で切り出し
  → シームレス化
  → 512x512に縮小
```

**効果**:
- 元画像のモチーフサイズが1/2になる（実質的なパターン密度が2倍）
- デザイン要素は完全に保持
- 色味・質感は不変
- **メモリ使用量を約1/4に削減**

## パラメータ設定

| パラメータ | 現在値 | 推奨値 | 説明 |
|-----------|-------|--------|------|
| `TILE_FACTOR` | - | 2 | タイリング係数（2=2x2配置） |
| `WORK_SIZE` | - | 2048 | 中間作業サイズ |
| `CROP_SIZE` | - | 4096 | 初期切り出しサイズ（メモリ削減用） |
| `THUMB_SIZE` | 512 | 512 | 最終出力サイズ |
| `BLEND_WIDTH` | 24 | 32 | シームレス化のブレンド幅 |

## 修正するファイル

### 1. `カラー一覧/process_patterns.py`（プロジェクトルートからの相対パス）

**戦略**: 既存の`process_pattern()`関数を拡張し、BCFのみ特別処理を行う

```python
# 追加する設定
BCF_TILE_FACTOR = 2  # BCF専用: タイリング係数
BCF_CROP_SIZE = 4096  # BCF専用: 初期切り出しサイズ

# 追加する関数
def tile_and_crop(img: Image.Image, factor: int, crop_size: int) -> Image.Image:
    """画像をタイリングして中心を切り出し（PILベース、メモリ効率良）"""

# 修正する関数
def process_pattern(code: str) -> bool:
    """パターンを処理（BCFは繊細化処理を適用）"""
```

**処理フロー（BCFの場合）**:
1. 元画像(8192x8192)を読み込み
2. 中心からCROP_SIZE x CROP_SIZEを切り出し（4096x4096）→ メモリ削減
3. TILE_FACTOR x TILE_FACTOR にタイリング（2x2で8192x8192）
4. 中心からWORK_SIZE x WORK_SIZEを切り出し（2048x2048）
5. シームレス化（blend_width=32）
6. THUMB_SIZE x THUMB_SIZEに縮小（512x512）
7. **既存ファイルを上書き**: `processed/BCF_processed_thumb.png`

**エラーハンドリング**:
- ファイルが見つからない場合は警告してFalseを返す
- メモリ不足の場合はGCを試行
- 処理失敗時は元の処理にフォールバック

### 2. `simulator/js/palette.js`（プロジェクトルートからの相対パス）
**変更なし** - 既存のパスをそのまま使用:
```javascript
{ code: 'BCF', name: 'Bcf', hex: '#373837', kind: 'texture',
  texturePath: '../カラー一覧/一覧/processed/BCF_processed_thumb.png' }
```

## 処理フロー詳細

```
Step 1: 元画像読み込み
  BCF.png (8192x8192)
  → 各モチーフは画像の10-30%

        ↓

Step 2: 初期切り出し (CROP_SIZE=4096) ★メモリ削減
  8192x8192 → 4096x4096
  → 中心部分を取得

        ↓

Step 3: タイリング (TILE_FACTOR=2)
  2x2配置 → 8192x8192
  → 画像内に元パターンが4回繰り返される
  → 各モチーフは相対的に1/2に縮小

        ↓

Step 4: 中心切り出し (WORK_SIZE=2048)
  8192x8192 → 2048x2048
  → 実質的に元画像の1/2エリアを取得

        ↓

Step 5: シームレス化 (blend_width=32)
  Offset-and-Blend法
  → エッジの継ぎ目をグラデーションで滑らかに

        ↓

Step 6: 最終リサイズ (THUMB_SIZE=512)
  2048x2048 → 512x512 (LANCZOS補間)
  → 最終的なパターン密度は元の約2倍
```

## 検証方法

1. **視覚的検証**:
   - 処理前後の画像を並べて比較
   - タイリングした際の継ぎ目を確認
   - シミュレーターで実際に適用して確認

2. **シミュレーターでの検証**:
   - 各パーツ（A, B, C, D）にBCFを適用
   - タイリングの見た目を確認
   - 他のパターンとの統一感を確認

3. **コード検証**:
   - Pythonスクリプトの実行: `python process_patterns.py`
   - エラーなく処理完了することを確認
   - 出力ファイルが正しく生成されることを確認

## オプション: さらなる微細化

より繊細なパターンが必要な場合の調整値:

| 手法 | パラメータ変更 | 効果 |
|------|--------------|------|
| 微細化レベル2 | `TILE_FACTOR=3, CROP_SIZE=3072, WORK_SIZE=1536` | パターンサイズ1/3 |
| 微細化レベル3 | `TILE_FACTOR=4, CROP_SIZE=2048, WORK_SIZE=1024` | パターンサイズ1/4 |

## 注意事項

1. 元画像（BCF.png）は変更しない
2. **既存の出力ファイルを上書き**: `processed/BCF_processed_thumb.png`
3. 処理完了後、ブラウザのキャッシュをクリアする必要がある（Ctrl+F5）
4. **未使用のcv2インポートを削除**（既存コードのクリーンアップ）

## 既知の問題と対策

| 問題 | 対策 |
|------|------|
| メモリ不足 | 初期切り出しで画像サイズを削減 |
| タイリングの継ぎ目 | blend_width=32で滑らかにブレンド |
| 日本語パス | PILは日本語パスに対応済み |
| 既存ファイルとの整合性 | 上書き更新で対応 |

## 実装の要点サマリー

1. **変更ファイル**: `カラー一覧/process_patterns.py` のみ
2. **変更内容**:
   - BCF専用のタイリング処理を`process_pattern()`に追加
   - 未使用の`import cv2`を削除
3. **palette.js**: 変更なし
4. **実行コマンド**: `cd カラー一覧 && python process_patterns.py`
5. **期待される結果**: `processed/BCF_processed_thumb.png`が繊細なパターンで上書きされる

## 関数の詳細仕様

### `tile_and_crop(img: Image.Image, factor: int, crop_size: int) -> Image.Image`
```python
def tile_and_crop(img: Image.Image, factor: int, crop_size: int) -> Image.Image:
    """
    画像をタイリングして中心を切り出し

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
```

### `process_pattern(code: str) -> bool` の修正箇所
```python
def process_pattern(code: str) -> bool:
    # ... 既存の読み込み処理 ...

    # BCFの場合は繊細化処理を適用
    if code == 'BCF':
        # Step 1: 初期切り出し（メモリ削減）
        crop_size = 4096
        left = (img.width - crop_size) // 2
        top = (img.height - crop_size) // 2
        img = img.crop((left, top, left + crop_size, top + crop_size))

        # Step 2: タイリング
        img = tile_and_crop(img, 2, 2048)

    # ... 以降の処理は変更なし ...
```
