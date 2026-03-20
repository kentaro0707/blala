# 画像色分離処理計画

## 目的
C1.png〜C6.pngの画像を読み込み、柄名・素材名に基づいて各領域を分離し、透過PNGとマスク画像を生成する。

## 入力ファイル
| ファイル | 内容 | 処理方式 |
|---------|------|----------|
| C1.png | 30個の色/柄スウォッチ一覧（3行×10列） | 固定レイアウト分割 |
| C2.png | 6つの柄見本（横に並んでいる） | 固定レイアウト6分割 |
| C3.png | モンステラ柄（白黒） | 見本矩形抽出 |
| C4.png | ハート柄（赤） | 見本矩形抽出 |
| C5.png | コヨーテ（CYT）色 | 見本矩形抽出 |
| C6.png | スムーススキン（上）、メッシュスキン（下） | 上の見本矩形と下の見本矩形を個別クロップ |

## 出力先
- `output/` ディレクトリ

## 実装手順

### 1. 画像ごとの切り出しルール確定

#### C1.png（スウォッチ一覧）- 各スウォッチを個別に分割
- 3行×10列のグリッド構造を認識
- 各スウォッチを個別に切り出し（計30ファイル）
- スウォッチ内の文字（カラーコード等）を除外
- ファイル名: スウォッチの位置に基づく固定名（swatch_01_01.png〜swatch_03_10.png）

#### C2.png（6つの柄見本）
- 固定座標で6つの柄見本領域を抽出
- 各タイル内の文字（BLEP, LEP, ZEB等）が重なっているため、文字も含めて出力
- 左から順に: ブラックレパード, レパード, ゼブラ, デザートカモフラージュ, シー, ジェリーフィッシュ

#### C3.png, C4.png（単一見本）
- 見本領域を矩形クロップ
- 見本内の文字（MST/モンステラ、HAT/ハート）が重なっているため、文字も含めて出力
- 見本矩形全体を透過PNGとして出力

#### C5.png（コヨーテ色）
- 見本領域を矩形クロップ
- CYT文字が見本内に重なっているため、文字も含めて出力

#### C6.png（2領域抽出）
- 上の見本矩形: スムーススキン（グラデーション）
- 下の見本矩形: メッシュスキン（グリッド）
- それぞれの見本矩形を個別クロップし、見本外の文字領域を除外

### 2. マスク生成
- 各領域のマスク画像（白黒）を生成
- 小さいノイズ領域は除去（morphological operations）

### 3. 出力命名規則
- `output/<name>.png` - 透過PNG
- `output/<name>_mask.png` - 白黒マスク
- `output/preview_all.png` - 総合プレビュー

#### 予想される出力ファイル一覧
- C1.png: `swatch_01_01.png` ~ `swatch_03_10.png`（30個）+ マスク（30個）
- C2.png:
  - `black_leopard.png`, `black_leopard_mask.png`
  - `leopard.png`, `leopard_mask.png`
  - `zebra.png`, `zebra_mask.png`
  - `desert_camouflage.png`, `desert_camouflage_mask.png`
  - `sea.png`, `sea_mask.png`
  - `jellyfish.png`, `jellyfish_mask.png`
- C3.png: `monstera.png`, `monstera_mask.png`
- C4.png: `heart.png`, `heart_mask.png`
- C5.png: `coyote.png`, `coyote_mask.png`
- C6.png:
  - `smooth_skin.png`, `smooth_skin_mask.png`
  - `mesh_skin.png`, `mesh_skin_mask.png`

### 4. 依存ライブラリ
- Pillow + NumPy（メイン）
- OpenCV（輪郭検出用、オプション）

## 技術要件
- 固定矩形クロップ + 閾値処理 + 連結成分を優先
- HSV/Lab色空間は補助的に使用
- 白色スウォッチの背景除去に注意（αチャンネルを活用）
- 相対パスを使用（pathlib.Path推奨）

## 検証方法
1. 期待出力数の確認（C1: 60個、C2: 12個、C3: 2個、C4: 2個、C5: 2個、C6: 4個、preview_all: 1個）
2. 各マスクが二値であること
3. 非空ピクセル数 > 0 であること
4. 出力ファイル名が命名規則に従っていること
