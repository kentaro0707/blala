# カラー選択の更新計画

## Context
`http://localhost:8080/simulator/`のカラー選択パレットを、`カラー一覧/一覧`フォルダに入っているPNGファイルのカラーに変更する。**柄画像（テクスチャ）は単色ではなく、柄として表示する。**

## 現状分析

### 一覧フォルダのPNGファイル（41個）
- **単色**: ASH, BCF, BLEP, BLK, BLU, CFC, DCF, CYT, DGR, DGRN, GRY, HAT, JLF, KGRN, KORG, KPNK, KYEL, LEP, MAD, MBLK, MBLU, MGRN, MMAD, MRED, MST, PST, NVY, OLV, RED, RYL, SEA, SFB, SLT, SFC, TCZ, VLT, WHT, ワイン
- **柄（テクスチャ）**: zebra（シマウマ柄）, スムーススキン（縦ストライプ）, メッシスキン（格子グリッド）

### 日本語ファイル名のcode変換ルール
- `スムーススキン.png` → `smooth_skin`
- `ワイン.png` → `wine`
- `メッシスキン.png` → `mesh_skin`

### 現在の実装の課題
- `colorizer.js`は単色のHEX値で着色する仕組みのみ
- 柄画像（テクスチャ）を表示する機能がない

## 実装計画

### Step 1: palette.jsにtype追加
**ファイル**: `simulator/js/palette.js`

各色に`type`プロパティを追加：
```javascript
const COLOR_PALETTE = [
  { code: 'NVY', name: 'Nvy', hex: '#030c4c', type: 'solid' },
  { code: 'zebra', name: 'Zebra', hex: null, type: 'texture', texture: '../カラー一覧/一覧/zebra.png' },
  { code: 'smooth_skin', name: 'Smooth Skin', hex: null, type: 'texture', texture: '../カラー一覧/一覧/スムーススキン.png' },
  { code: 'mesh_skin', name: 'Mesh Skin', hex: null, type: 'texture', texture: '../カラー一覧/一覧/メッシスキン.png' },
  // ...
];
```

### Step 2: colorizer.jsにテクスチャ処理追加
**ファイル**: `simulator/js/colorizer.js`

柄画像用のテクスチャ合成処理を追加：
- `applyTextureToImageData()` - テクスチャ画像をシルエットに合成
- 画像の明るさに基づいてテクスチャの不透明度を調整

### Step 3: simulator.jsの更新
**ファイル**: `simulator/js/simulator.js`

- `type`プロパティに基づいて単色着色またはテクスチャ合成を選択
- テクスチャ画像の読み込み処理を追加

### Step 4: PNGからHEX値抽出
**ファイル**: `tools/extract_colors.py`（新規作成）

- 単色のPNGファイルからHEX値を自動抽出
- 柄画像は`type: 'texture'`としてマーク
- palette.jsの更新

### Step 5: テクスチャ画像のコピー
- `カラー一覧/一覧/`フォルダの柄画像をsimulatorからアクセス可能な場所に配置
- または相対パスで直接参照

## Critical Files

| ファイル | 役割 |
|----------|------|
| `simulator/js/palette.js` | カラーパレット定義（type追加） |
| `simulator/js/colorizer.js` | 色変換ロジック（テクスチャ処理追加） |
| `simulator/js/simulator.js` | メイン制御（type判定追加） |
| `カラー一覧/一覧/*.png` | 色抽出元のPNGファイル（41個） |
| `tools/extract_colors.py` | 色抽出スクリプト（新規作成） |

## Verification
1. Pythonスクリプトを実行して抽出結果を確認
2. `http://localhost:8080/simulator/`で単色が正しく表示されるか確認
3. zebra, smooth_skin, mesh_skinが柄として表示されるか確認
4. 各パーツ（A, B, C, D）で色選択が正常に動作するか確認
