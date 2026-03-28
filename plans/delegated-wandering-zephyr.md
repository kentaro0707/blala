# CFC テクスチャ処理追加計画

## Context
CFCカラーは現在palette.jsでテクスチャタイプとして定義されているが、実際のテクスチャファイルが存在しない。また、既存のテクスチャカラー（BLEP）もpalette.jsが参照するパス（`_processed.png`）と実際のファイル名（`_processed_thumb.png`）が不一致している。

## 現状の問題点
1. **CFC**: テクスチャファイル（`processed/CFC_processed.png`）が存在しない
2. **process_patterns.py line 39**: PATTERNSリストが`['LEP', 'ASH', 'SEA', 'BCF', 'BLEP']`のみでCFCが含まれていない
3. **パスの不一致**: スクリプトは`_processed_thumb.png`を出力するが、palette.jsは`_processed.png`を参照している
   - BLEPのpalette.js: `../カラー一覧/一覧/processed/BLEP_processed.png`
   - 実際のファイル: `BLEP_processed_thumb.png`

## 実装計画

### Step 1: process_patterns.pyにCFCを追加
**ファイル**: `カラー一覧/process_patterns.py` line 39
```python
# 変更前
PATTERNS = ['LEP', 'ASH', 'SEA', 'BCF', 'BLEP']
# 変更後
PATTERNS = ['LEP', 'ASH', 'SEA', 'BCF', 'BLEP', 'CFC']
```

### Step 2: palette.jsのテクスチャパスを修正
**ファイル**: `simulator/js/palette.js`

BLEP（line 15）とCFC（line 28）のテクスチャパスを`_processed_thumb.png`に修正:
```javascript
// BLEP
{ code: 'BLEP', name: 'Blep', hex: '#1A1A1A', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/BLEP_processed_thumb.png' }
// CFC
{ code: 'CFC', name: 'Cfc', hex: '#4a7c59', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/CFC_processed_thumb.png' }
```

### Step 3: スクリプトを実行してテクスチャを生成
```bash
cd /Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧
python process_patterns.py
```

CFCは迷彩パターンのため、通常処理（LEP、SEAと同様）が適用される:
- 512x512にリサイズ
- シームレス化処理

### Step 4: CHANGELOG.mdを更新
**ファイル**: `CHANGELOG.md`

`[Unreleased]`セクションに以下を追加:
```markdown
### Added
- CFCテクスチャ処理を追加: process_patterns.pyのPATTERNSリストにCFCを追加
- `カラー一覧/一覧/processed/CFC_processed_thumb.png` (512x512) を生成

### Fixed
- BLEPとCFCのテクスチャパスを修正: `_processed.png` → `_processed_thumb.png`
```

## 変更ファイル
1. `カラー一覧/process_patterns.py` - PATTERNSリストにCFC追加
2. `simulator/js/palette.js` - BLEPとCFCのテクスチャパスを`_thumb.png`に修正
3. `CHANGELOG.md` - 変更内容を記録

## 生成されるファイル
- `カラー一覧/一覧/processed/CFC_processed_thumb.png` (512x512)

## 検証方法
1. スクリプト実行後、`CFC_processed_thumb.png`が生成されていることを確認
2. `simulator/index.html`をブラウザで開く
3. CFCカラーを選択し、テクスチャが正しく表示されることを確認
4. BLEPカラーも同様に正しく表示されることを確認
5. codex reviewでコードレビューを実施し、問題がないことを確認
