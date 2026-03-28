# CFCパターンを迷彩柄に変更する計画

## Context
ユーザーが添付した迷彩パターン画像（4色：濃緑、薄緑、ベージュ、黒の不規則な色ブロック）を、CFCテクスチャとして使用するように変更する。
**画像サイズ（1024x1024）は維持する。**

## 現状
- CFCテクスチャの定義: `simulator/js/palette.js:28`
  ```javascript
  { code: 'CFC', name: 'Cfc', hex: '#4a7c59', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/CFC_processed_thumb.png' }
  ```
- 元画像: `カラー一覧/一覧/CFC.png` (1024x1024)
- 処理済み画像: `カラー一覧/一覧/processed/CFC_processed_thumb.png`
- 処理スクリプト: `カラー一覧/process_patterns.py`

## 実装手順

### 1. CHANGELOG.mdを更新
- **ファイル**: `CHANGELOG.md`
- **追加内容**:
  ```markdown
  ### Changed
  - CFCパターンを迷彩柄（4色：濃緑、薄緑、ベージュ、黒）に変更
  ```

### 2. 添付画像をCFC.pngとして保存（サイズ維持: 1024x1024）
- **ファイル**: `カラー一覧/一覧/CFC.png`
- **操作**: ユーザーが添付した迷彩パターン画像で上書き
- **注意**: 画像サイズは変更しない

### 3. 処理済み画像を生成（サイズ維持: 1024x1024）
- **方法**: 添付画像をそのまま `processed/CFC_processed_thumb.png` としてコピー
- **理由**: 画像サイズを維持するため、リサイズ処理をスキップ

### 4. codex-reviewで検証
- **コマンド**: `codex review --uncommitted`
- **確認**: 問題点やエラーがないことを確認

### 5. シミュレーターで動作確認
- **ファイル**: `simulator/index.html` をブラウザで開く
- **確認**: CFCを選択した際に迷彩パターンが正しく表示されるか

## 変更ファイル
1. `CHANGELOG.md` - CFCパターン変更の記録を追加
2. `カラー一覧/一覧/CFC.png` - 添付画像で上書き（1024x1024）
3. `カラー一覧/一覧/processed/CFC_processed_thumb.png` - 添付画像をコピー（1024x1024）

## 検証方法
1. codex-reviewで問題がないことを確認
2. シミュレーターを開く: `simulator/index.html`
3. 各パーツ（A, B, C, D）でCFCを選択
4. 迷彩パターンが正しくタイリング表示されることを確認
