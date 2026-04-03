# スマホ分割ビューレイアウト実装計画

## Context
ユーザーがスマホサイズの画面でも、Hockertyサイトのように左側でカラー選択できるようにしたいという要望。
現在は1024px以下で縦並びに切り替わっているが、これを分割ビュー（左：カラーパネル、右：プレビュー）に変更する。

## 変更内容

### 対象ファイル
- `simulator/css/style.css` - レスポンシブスタイルの修正

### 実装詳細

#### 1. モバイル用メディアクエリの変更

**現在の動作（変更前）:**
```css
@media (max-width: 1024px) {
  .main {
    flex-direction: column;  /* 縦並び */
  }
}
```

**変更後:**
- 1024px以下でも横並び（flex-direction: row）を維持
- 各セクションの幅を固定割合で分割
- カラーパネル: 45%
- プレビュー: 55%

#### 2. モバイル用スタイル調整

```css
@media (max-width: 768px) {
  /* ヘッダーをコンパクトに */
  .header {
    padding: 10px 0;
    margin-bottom: 15px;
  }

  .header h1 {
    font-size: 1.1rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  /* メインを横並び維持 */
  .main {
    flex-direction: row;
    gap: 10px;
    flex: 1;
  }

  /* カラーパネル（左側） */
  .control-section {
    flex: 0 0 45%;
    max-height: none;
    height: calc(100vh - 120px);
    padding: 10px;
    overflow-y: auto;
  }

  /* プレビュー（右側） */
  .preview-section {
    flex: 0 0 55%;
    height: calc(100vh - 120px);
    overflow-y: auto;
  }

  /* キャンバスコンテナ */
  .canvas-container {
    padding: 8px;
  }

  /* カラーグリッド調整 */
  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 6px;
    max-height: 300px;
  }

  /* パーツタブ調整 */
  .part-tab {
    padding: 8px 4px;
    font-size: 0.85rem;
  }

  /* フッターを非表示または最小化 */
  .footer {
    display: none;
  }
}
```

#### 3. タブレット用スタイル（768px〜1024px）

```css
@media (max-width: 1024px) and (min-width: 769px) {
  .main {
    flex-direction: row;
    gap: 20px;
  }

  .control-section {
    flex: 0 0 40%;
    max-height: calc(100vh - 180px);
  }

  .preview-section {
    flex: 1;
  }
}
```

#### 4. 極小画面対応（480px以下）

```css
@media (max-width: 480px) {
  .control-section {
    flex: 0 0 50%;
    padding: 8px;
  }

  .preview-section {
    flex: 0 0 50%;
  }

  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
    gap: 4px;
  }

  .part-tab {
    padding: 6px 2px;
    font-size: 0.75rem;
  }

  .header h1 {
    font-size: 0.95rem;
  }
}
```

## 実装順序

1. CSSの`@media (max-width: 1024px)`ブロックを修正
2. 新しいモバイル用スタイルを追加
3. ブラウザで各サイズでの表示を確認

## Verification

1. ローカルサーバーを起動: `cd simulator && python3 -m http.server 8000`
2. Chrome DevToolsで以下のサイズをテスト:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad Mini (768px)
   - iPad Pro (1024px)
3. 各サイズで:
   - 左側にカラーパネルが表示される
   - 右側にプレビューが表示される
   - 各パネル内でスクロールができる
   - 色選択が正常に動作する
