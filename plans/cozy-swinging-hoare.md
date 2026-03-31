# BLEPカラースウォッチ テクスチャ背景スケール変更

## Context
BLEP（テクスチャカラー）のカラースウォッチ内で表示されるテクスチャ背景のスケールを、現在の150×150ピクセルから1024×1024ピクセルに変更する。

## 変更内容

### 変更対象ファイル
- `simulator/js/simulator.js`

### 変更箇所
- **ファイル**: `simulator/js/simulator.js`
- **行番号**: 154行目
- **関数**: `applySwatchStyle()`

### 変更前
```javascript
swatch.style.backgroundSize = '150px 150px';
```

### 変更後
```javascript
swatch.style.backgroundSize = '1024px 1024px';
```

## 影響範囲
- BLEPに限らず、すべてのテクスチャカラー（`kind: 'texture'`）のスウォッチ表示に影響
- スウォッチ自体のサイズは20×20ピクセルのままで、背景画像の表示スケールのみ変更

## Verification
1. `simulator/index.html` をブラウザで開く
2. BLEPカラーのスウォッチを確認
3. テクスチャパターンが1024×1024スケールで表示されていることを確認
