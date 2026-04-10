# スマホサイズでカラー選択を横並びに変更

## Context
現在、スマホサイズ（768px以下）ではプレビューが上、カラー選択が下の縦並びレイアウトになっている。ユーザーから「カラー選択をしながらプレビューをすぐ確認したい」という要望があり、スマホサイズでもPCと同じ横並びレイアウトに変更する。

## 変更内容

### 対象ファイル
- `simulator/css/style.css`

### 変更箇所

#### 1. モバイル用スタイル（768px以下）の修正

**現在のコード（382-397行目付近）:**
```css
/* メインを縦並びに変更 */
.main {
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

/* カラーパネル（下側） */
.control-section {
  flex: none;
  width: 100%;
  max-width: 100%;
  max-height: none;
  order: 1;
  padding: 15px;
  overflow-y: auto;
}

/* プレビュー（上側） */
.preview-section {
  order: -1;
  width: 100%;
}
```

**変更後:**
```css
/* メインを横並びに維持 */
.main {
  flex-direction: row;
  gap: 12px;
  flex: 1;
}

/* カラーパネル（左側・コンパクト） */
.control-section {
  flex: 0 0 180px;
  min-width: 160px;
  max-width: 220px;
  order: -1;
  padding: 10px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
}

/* プレビュー（右側） */
.preview-section {
  order: 1;
  flex: 1;
  min-width: 0;
}
```

#### 2. 極小画面（480px以下）の修正

**現在のコード（528-541行目付近）:**
```css
.main {
  gap: 16px;
}

.control-section {
  width: 100%;
  padding: 10px;
  order: 1;
}

.preview-section {
  order: -1;
  width: 100%;
}
```

**変更後:**
```css
.main {
  gap: 8px;
}

.control-section {
  flex: 0 0 150px;
  min-width: 140px;
  padding: 8px;
  order: -1;
}

.preview-section {
  order: 1;
  flex: 1;
}
```

#### 3. カラーパレットのグリッド調整

スマホの横並び時にカラー選択パネルが狭くなるため、グリッドを1列に変更：

```css
/* モバイル用（768px以下） */
.color-palette {
  grid-template-columns: 1fr;
  gap: 8px;
}

.color-button {
  min-height: 56px;
  padding: 4px;
  font-size: 0.75rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
}
```

#### 4. キャンバスコンテナのパディング調整

プレビュー領域を広く確保：

```css
.canvas-container {
  padding: 8px;
}
```

## レイアウトイメージ

```
┌─────────────────────────────┐
│          ヘッダー            │
├──────────┬──────────────────┤
│          │                  │
│ カラー選択│    プレビュー     │
│ (180px)  │     (flex: 1)    │
│          │                  │
│ スクロール│                  │
│   可能   │                  │
│          │                  │
└──────────┴──────────────────┘
```

## 検証方法

1. ブラウザの開発者ツールでモバイル表示に切り替え（幅375px〜768px）
2. プレビューとカラー選択が横並びになっていることを確認
3. カラー選択パネルがスクロール可能であることを確認
4. 色を選択した際、プレビューが即座に更新されることを確認
5. 極小画面（320px〜480px）でも同様に動作することを確認
