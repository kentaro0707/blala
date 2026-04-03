# スマホサイズでカラー選択をプレビューの左に配置

## Context
ドライスーツシミュレーターで、スマホサイズの画面時にカラー選択パネルがプレビューの下に配置されているが、これをプレビューの左側に配置するように変更したい。これにより、スマホでも横並びのレイアウトで操作性を向上させる。

## 現状
- デスクトップ（1024px以上）：プレビュー（左）とカラー選択（右）の横並び
- スマホ（1024px以下）：プレビュー（上）とカラー選択（下）の縦並び

## 変更後
- 640px以下：カラー選択（左）とプレビュー（右）の横並び
- 480px以下：画面が狭すぎるため、元の縦並びに戻す

---

## Implementation

### 変更ファイル
`simulator/css/style.css` - 309行目付近の `@media (max-width: 640px)` ブレークポイント

### 変更内容

#### 1. 640px以下のメディアクエリを修正

```css
@media (max-width: 640px) {
  .container {
    padding: 10px;
  }

  .header {
    padding: 10px 0;
    margin-bottom: 15px;
  }

  .header h1 {
    font-size: 1.2rem;
  }

  /* 横並びレイアウト（カラー選択を左に） */
  .main {
    flex-direction: row;
    gap: 15px;
  }

  .preview-section {
    order: 2;
    flex: 1;
  }

  .control-section {
    order: 1;
    flex: 0 0 auto;
    max-width: 170px;
    max-height: calc(100vh - 150px);
    padding: 12px;
  }

  .preview-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-button {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  /* カラーグリッド調整 */
  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
    gap: 6px;
    max-height: 280px;
  }

  .part-tab {
    padding: 8px 4px;
    font-size: 0.9rem;
  }

  .selected-part-info {
    padding: 8px;
    gap: 8px;
  }

  .selected-part-info .selected-color-swatch {
    width: 24px;
    height: 24px;
  }

  .selected-part-info .selected-color-name {
    font-size: 0.8rem;
  }

  .filter-bar {
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
  }

  .filter-toggle {
    font-size: 0.75rem;
    padding: 4px 8px;
  }

  .color-count {
    font-size: 0.75rem;
    text-align: center;
  }
}
```

#### 2. 480px以下のメディアクエリを追加（縦並びに戻す）

```css
@media (max-width: 480px) {
  .main {
    flex-direction: column;
  }

  .preview-section,
  .control-section {
    order: unset;
    flex: unset;
  }

  .control-section {
    max-width: 100%;
    max-height: none;
  }

  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    max-height: 350px;
  }
}
```

### 実装のポイント
- `order` プロパティを使用して、HTML構造を変更せずに表示順序を入れ替える
- `control-section` に `order: 1`（左側）
- `preview-section` に `order: 2`（右側）
- カラー選択の幅は `max-width: 170px` に制限してプレビュー領域を確保

---

## Verification
1. ブラウザで `simulator/index.html` を開く
2. 開発者ツールでレスポンシブモードに切り替え
3. 以下の画面幅で動作確認：
   - 640px：カラー選択が左、プレビューが右に表示される
   - 500px：同上
   - 480px：縦並び（プレビュー上、カラー選択下）に戻る
4. カラー選択のスクロール動作を確認
5. プレビューの操作（パーツ選択、ズーム等）が正常に動作することを確認
