# ドライスーツカラーシミュレーター UI改善計画

## Context

ドライスーツカラーシミュレーターのプロトタイプをベースに、Hockerty風の「左側で選択、右側で大きくプレビュー」UIに改善する。既存コードを最大限活かし、破壊的変更を避けながら段階的に改修する。

### 現在の実装状況
- **HTML**: `simulator/index.html`（57行、シンプル構造）
- **CSS**: `simulator/css/style.css`（842行、独自CSS）
- **JS**: `simulator.js`（メイン制御）、`palette.js`（40色定義）、`colorizer.js`（色変換）
- **現在の問題点**:
  - カラーサムネイルが小さい（20x20px）
  - 余白が狭い（gap: 8px）
  - モバイルで縦並びにならない
  - 左パネル幅が可変

---

## 実装方針

### 1. CSS変数の更新（高級感・清潔感）

```css
:root {
  /* カラー体系更新 */
  --primary-color: #2c3e50;      /* チャコールグレー */
  --secondary-color: #1e3a5f;    /* ネイビー */
  --accent-color: #f77f00;       /* アクセント（オレンジ） */
  --background: #fafafa;         /* 白に近いグレー */
  --surface: #ffffff;            /* 純白 */
  --text-primary: #1a1a1a;       /* 濃いグレー */
  --text-secondary: #6b7280;     /* 中間グレー */
  --border-color: #e5e7eb;       /* 薄いグレー */
  --color-panel-bg: #f8fafc;     /* カラーパネル背景 */

  /* シャドウ */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);

  /* 角丸・トランジション */
  --radius: 12px;
  --radius-lg: 16px;
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2. メインレイアウト（左右2カラム）

**デスクトップ（1024px以上）:**
```css
.main {
  display: flex;
  gap: 40px;
  flex: 1;
  align-items: flex-start;
}

/* 左カラム：コントロールパネル（固定幅） */
.control-section {
  flex: 0 0 400px;
  min-width: 360px;
  max-width: 420px;
  order: -1;  /* HTML順序に関わらず左側に表示 */
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

/* 右カラム：プレビュー（伸縮） */
.preview-section {
  flex: 1;
  order: 1;
  min-width: 0;
}
```

### 3. カラーサムネイルUI改善

**重要変更点:**
| 項目 | 現在 | 改善後 |
|------|------|--------|
| スウォッチサイズ | 20x20px | **44x44px** |
| 選択時スウォッチ | 24x24px | **48x48px** |
| ボタン最小高さ | なし | **72px** |
| gap | 8px | **12px** |
| レイアウト | flex-wrap | **grid** |

```css
/* カラーパレット - グリッドレイアウト */
.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 12px;
  padding: 4px 0;
}

/* カラーボタン - 大きく */
.color-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  min-height: 72px;
  position: relative;
}

/* カラースウォッチ - 44x44px */
.color-swatch {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* 選択状態 */
.color-button.selected {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.2);
}

/* 選択時のラベル色 */
.color-button.selected .color-label {
  color: white;
}

/* 選択時のスウォッチ枠線 */
.color-button.selected .color-swatch {
  border-color: rgba(255, 255, 255, 0.3);
}

.color-button.selected::before {
  content: '✓';
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

/* ホバー効果 */
.color-button:hover {
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}

/* 選択中の色情報エリア */
.selected-color-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--color-panel-bg);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.selected-color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 2px solid var(--border-color);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.selected-color-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}
```

### 4. レスポンシブ対応

**モバイル（768px以下）- 縦並びに変更:**
```css
@media (max-width: 768px) {
  .main {
    flex-direction: column;
    gap: 24px;
  }

  .control-section {
    flex: none;
    width: 100%;
    max-width: 100%;
    max-height: none;
    order: 1;  /* 下に表示 */
  }

  .preview-section {
    order: -1;  /* 上に表示 */
    width: 100%;
  }

  .color-palette {
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 10px;
  }

  .color-swatch {
    width: 40px;
    height: 40px;
  }
}
```

### 5. プレビューセクション改善

```css
.canvas-container {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.preview-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  width: 100%;
  max-width: 500px;
}
```

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `simulator/css/style.css` | **メイン変更対象**（CSS変数、レイアウト、カラーサムネイル、レスポンシブ） |
| `simulator/index.html` | 変更なし（クラス名維持） |
| `simulator/js/*.js` | 変更なし（JavaScriptへの影響なし） |

---

## 実装順序

1. **CSS変数の更新** - 色、シャドウ、角丸の調整
2. **メインレイアウト修正** - `order` プロパティで左右配置制御
3. **カラーパレットUI改善** - grid化、サイズ拡大（44x44px）
4. **選択状態表示改善** - チェックマーク、ホバー効果
5. **レスポンシブ対応** - モバイル縦並び化
6. **プレビューセクション改善** - 余白、シャドウ調整

---

## 重要な注意事項

### `.color-button`の構造変更について

**既存構造（横並び）:**
```html
<button class="color-button">
  <span class="color-swatch"></span>
  <span class="color-label">NVY</span>
</button>
```

**プランでの変更（縦並び）:**
- `flex-direction: row` → `flex-direction: column`
- これによりスウォッチの上にラベルが配置される
- **JavaScriptのHTML生成ロジックには影響しない**（クラス名は変更なし）

### 変更前後の比較

| プロパティ | 既存 | プラン |
|------------|------|--------|
| `flex-direction` | `row` | `column` |
| `min-height` | なし | `72px` |
| `gap` | `6px` | `6px`（維持） |
| `border-radius` | `6px` | `10px` |

---

## リスクと対策

| リスク | 対策 |
|--------|------|
| JavaScriptがクラス名に依存 | クラス名は変更せず、スタイルのみ変更 |
| CSSの詳細度問題 | 既存セレクタを上書きする形で追加 |
| 既存機能への影響 | 段階的に変更し、各段階で動作確認 |

---

## Verification（検証方法）

1. **ローカルサーバー起動**: `./start-server.sh` または `python3 -m http.server 8000`
2. **ブラウザでアクセス**: `http://localhost:8000/simulator/`
3. **確認項目**:
   - [ ] カラーサムネイルが44x44px以上で表示される
   - [ ] サムネイル間のgapが12px以上ある
   - [ ] 左カラムが400px固定幅で表示される
   - [ ] 右側プレビューが広く表示される
   - [ ] 選択状態が明確に分かる（チェックマーク、枠線）
   - [ ] ホバー効果が動作する
   - [ ] モバイル（768px以下）で縦並びになる
   - [ ] 色選択でプレビューが即時更新される
   - [ ] PNGエクスポートが動作する
   - [ ] URLパラメータ保存が動作する

---

## 今後さらに改善できる点

- Tailwind CSS導入（CDN版で段階的移行）
- 前面/背面切り替え機能の追加
- 色フィルタリング・検索機能
- お気に入り/プリセット機能
- キーボードナビゲーション対応
