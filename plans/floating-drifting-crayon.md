# カラー選択テクスチャ 50%縮小計画

## Context
ユーザーから「カラー選択BLEPを50%縮小」の依頼を受けた。確認の結果、全テクスチャ共通で縮小することが確定。

現在、テクスチャパターン（BLEP、CFC、mesh_skin等）のカラー選択スウォッチ表示サイズは `150px 150px` に設定されている。これを50%縮小して `75px 75px` に変更する。

## 変更内容

### 対象ファイル
`/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/simulator/js/simulator.js`

### 変更箇所
**154行目** - `applySwatchStyle`関数内

```javascript
// 変更前
swatch.style.backgroundSize = '150px 150px';

// 変更後
swatch.style.backgroundSize = '75px 75px';
```

## 影響範囲
- 全テクスチャパターン（BLEP、CFC、mesh_skin等）のカラー選択スウォッチ表示サイズに影響
- プレビューキャンバス上のドライスーツ表示には影響しない（あくまで選択UIの表示サイズ）

## 検証方法
1. `simulator/index.html`をブラウザで開く
2. テクスチャパターンを選択できるパーツ（例：パーツAなど）で確認
3. BLEP等のテクスチャパターンのスウォッチ表示が以前より小さく（50%）表示されていることを確認
