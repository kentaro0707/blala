# BLEPテクスチャ適用計画

## Context

ユーザーが添付した柄（BLEP.png）をカラー選択のBLEPとして反映する必要があります。
現在BLEPは単色（`#1A1A1A`）として定義されていますが、実際のBLEP.pngは黒ベースにグレーの曲線模様が入ったテクスチャパターンです。

## 現状分析

- **BLEP.png**: 黒（ダークグレー）ベースにグレーの曲線状模様が入ったテクスチャ
- **palette.js**: BLEPは単色 `{ code: 'BLEP', name: 'Blep', hex: '#1A1A1A' }` として定義
- **process_patterns.py**: BLEPは処理対象リストに含まれているが、処理済みファイルは未生成
- **processedフォルダ**: 現在NVY_processed_thumb.pngのみ存在

## 実装手順

### Step 0: 前提条件の確認

Python依存パッケージがインストールされていることを確認：
```bash
pip install -r カラー一覧/requirements.txt
```

必要なパッケージ：
- Pillow>=9.0.0
- numpy>=1.21.0

### Step 1: テクスチャ処理の実行（BLEPのみ）

`process_patterns.py`を一時的に修正してBLEPのみを処理します。

**方法A: PATTERNSリストを一時的に変更**

`カラー一覧/process_patterns.py`の39行目を一時的に変更：
```python
# 変更前
PATTERNS = ['LEP', 'ASH', 'SEA', 'BCF', 'BLEP']

# 変更後（BLEPのみ処理）
PATTERNS = ['BLEP']
```

その後、スクリプトを実行：
```bash
cd /Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala
python3 カラー一覧/process_patterns.py
```

これにより `カラー一覧/一覧/processed/BLEP_processed_thumb.png` のみが生成されます。

**処理完了後、PATTERNSを元に戻す**ことを忘れないでください。

### Step 2: palette.jsの更新

`simulator/js/palette.js`のBLEP定義を単色からテクスチャに変更します。

**重要**: `simulator.js`の92行目で`texturePath.replace('.png', '_thumb.png')`が実行されるため、`texturePath`には`_thumb`を含まないパスを指定する必要があります。

**変更前:**
```javascript
{ code: 'BLEP', name: 'Blep', hex: '#1A1A1A' },
```

**変更後:**
```javascript
{ code: 'BLEP', name: 'Blep', hex: '#1A1A1A', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/BLEP_processed.png' },
```

**動作原理**:
- `texturePath` = `BLEP_processed.png`
- simulator.jsが自動的に `_thumb` を追加 → `BLEP_processed_thumb.png` を読み込む

## 変更対象ファイル

1. `simulator/js/palette.js` (line 15) - BLEP定義にtexture設定を追加
2. `カラー一覧/process_patterns.py` (line 39) - 一時的にPATTERNSを`['BLEP']`に変更（処理後元に戻す）
3. `カラー一覧/一覧/processed/BLEP_processed_thumb.png` (新規生成)
   - process_patterns.pyが生成するファイル名: `{code}_processed_thumb.png`
   - texturePathには`_thumb`を除いたパスを指定（simulator.jsが自動追加）

## 検証方法

1. シミュレーターを開く: `open simulator/index.html`
2. 各パーツ（A, B, C, D）でBLEPを選択
3. テクスチャパターン（黒ベースにグレーの曲線模様）が正しく表示されることを確認
4. スウォッチにパターンが表示されることを確認

## BLEP処理の詳細

BLEPは`process_patterns.py`の「通常処理」で処理されます：
1. 元画像の中心部分を512x512で切り出し
2. シームレス化処理（blend_width=24）
3. `BLEP_processed_thumb.png`として保存

（BCFやASHのような繊細化処理は適用されません）

## 注意点

- `texturePath`には`_thumb`を含めない（simulator.jsが自動追加）
- 日本語パスを含むため、ファイル操作時はエンコーディングに注意
- **BLEPのみ処理**: 他のパターン（LEP, ASH, SEA, BCF）は処理しない
- 処理完了後、`PATTERNS`を元に戻すことを忘れないでください
