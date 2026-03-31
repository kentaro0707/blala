# ASHパターン変更計画

## Context
ユーザーがASHパターンを新しい織物テクスチャ（ダークグレー基調）に変更したい。BLEPと同様に50%縮小してプレビューに反映する必要がある。

## 実装手順

### Step 1: palette.jsの更新
ファイル: `simulator/js/palette.js` (line 20)
```javascript
// 変更前
{ code: 'ASH', name: 'Ash', hex: '#2D3748', kind: 'texture', texturePath: '../カラー一覧/一覧/ASH_small.png' },
// 変更後
{ code: 'ASH', name: 'Ash', hex: '#2D3748', kind: 'texture', texturePath: '../カラー一覧/一覧/ASH.png?v=20260330' },
```

### Step 2: palette_new.jsの更新
ファイル: `simulator/js/palette_new.js` (line 10)
```javascript
// 変更前
{ code: 'ASH', name: 'Ash', hex: '#2D3748', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/ASH_processed_thumb.png' },
// 変更後
{ code: 'ASH', name: 'Ash', hex: '#2D3748', kind: 'texture', texturePath: '../カラー一覧/一覧/ASH.png?v=20260330' },
```

## 50%縮小について
`simulator.js`の`drawTexturePart()`関数で既に実装済み:
```javascript
const textureScale = 0.5; // 50%に縮小
```
ASHがテクスチャとして定義されていれば自動的に50%縮小される。

## 変更ファイル
1. `simulator/js/palette.js` - ASHのtexturePathを変更
2. `simulator/js/palette_new.js` - ASHのtexturePathを変更

## 注意事項
- キャッシュ回避のためバージョンパラメータ`?v=20260330`を追加
- ユーザー提供のASH.pngをそのまま使用（processed版は作成しない）

## 検証方法
- シミュレーターを開き、ASHを選択して50%縮小で表示されることを確認
- プレビューで正しく描画されることを確認
- ブラウザキャッシュをクリアして再確認
