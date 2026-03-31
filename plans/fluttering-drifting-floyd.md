# SFC柄プレビュー50%縮小計画

## Context
SFCパターンのプレビュー画像（SFC_processed_thumb.png）を現在の1024x1024から50%縮小した512x512に変更する。
既にSFC_small.png（512x512）が存在するため、これを活用する。

## 現状
- `カラー一覧/一覧/SFC.png`: 1024x1024（元画像）
- `カラー一覧/一覧/SFC_small.png`: 512x512（50%縮小版）
- `カラー一覧/一覧/processed/SFC_processed_thumb.png`: 1024x1024（シミュレータで使用中）

## 実装手順

### Step 1: SFC_small.pngをprocessedディレクトリにコピー
```bash
cp "カラー一覧/一覧/SFC_small.png" "カラー一覧/一覧/processed/SFC_processed_thumb.png"
```

### Step 2: palette.jsのキャッシュバスター更新（必要に応じて）
ファイル: `simulator/js/palette.js`
- 第29行の`?v=20260330`を新しい日付に更新

### Step 3: palette_new.jsのキャッシュバスター更新（必要に応じて）
ファイル: `simulator/js/palette_new.js`
- 第19行の`?v=20260330`を新しい日付に更新

## 影響範囲
- シミュレータでSFCパターンを適用した際のプレビュー品質が変化（1024x1024 → 512x512）
- ファイルサイズが約2MBから約450KBに削減

## 検証方法
1. シミュレータ（simulator/index.html）を開く
2. SFCパターンを選択してドライスーツに適用
3. プレビュー画像が正しく表示されることを確認
