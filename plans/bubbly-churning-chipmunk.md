# SFCテクスチャ縮小計画

## Context
プレビューのSFC柄を縮小して、より細かい柄で表示したい。

## 変更内容

### 変更ファイル
- `simulator/js/simulator.js` (503行目)

### 変更内容
現在は全テクスチャが50%縮小で統一されている。SFCだけ30%縮小に変更する。

```javascript
// 変更前
const textureScale = 0.5; // 50%に縮小

// 変更後
const textureScale = color.code === 'SFC' ? 0.3 : 0.5; // SFCは30%、他は50%に縮小
```

## 確認方法
1. シミュレーターを開く
2. SFCテクスチャを選択して、柄がより細かく表示されることを確認
3. 他のテクスチャ（BCF、BLEPなど）は変わらないことを確認
