# ASH_small.png をプレビューに反映する計画

## Context

ユーザーが更新した ASH_small.png をシミュレーターのプレビューで使用できるようにする必要があります。現在は `ASH_processed_thumb.png` が参照されていますが、これを `ASH_small.png` に変更します。

## 変更内容

### 変更するファイル

- `simulator/js/palette.js`

### 具体的な変更

ASHパターンの `texturePath` を変更：

**変更前:**
```javascript
{ code: 'ASH', name: 'Ash', hex: '#2D3748', kind: 'texture',
  texturePath: '../カラー一覧/一覧/processed/ASH_processed_thumb.png' }
```

**変更後:**
```javascript
{ code: 'ASH', name: 'Ash', hex: '#2D3748', kind: 'texture',
  texturePath: '../カラー一覧/一覧/ASH_small.png' }
```

## 確認方法

1. ブラウザで `simulator/index.html` を開く
2. パレットから ASH を選択
3. プレビューに ASH_small.png のテクスチャが正しく表示されることを確認
