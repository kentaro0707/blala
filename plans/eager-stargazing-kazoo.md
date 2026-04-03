# UI変更計画: Hockertyスタイルのカラー選択UI

## Context

ユーザーがHockerty（https://www.hockerty.com/en/men/custom-suits/personalize）の**ファブリック（カラー）選択UI**を参考に、ドライスーツシミュレーターのカラー選択部分を変更したいという要望。

### Hockertyのカラー選択UIの特徴
1. **コンパクトなグリッド表示**: 小さなサムネイル画像がタイル状に並ぶ
2. **フィルター機能**: Color/Lightness/Material でフィルタリング
3. **展開/折りたたみ**: 「filters」「hide」ボタンで切り替え
4. **件数表示**: 「45 /」のように現在の表示件数を表示
5. **画像ベース**: テクスチャ画像をサムネイルとして表示

### 現状の問題点
- カラーボタンが横に長く、スペースを取る
- フィルタリング機能がない
- パーツごとに縦に並んでおり、スクロールが必要

---

## Implementation Plan

### Step 1: カラー選択UIの再設計

**ファイル**: `simulator/index.html`

新しいカラー選択エリアの構造:
```
+----------------------------------+
| [A] [B] [C] [D]  パーツ選択タブ   |
+----------------------------------+
| filters ▼ | hide | 43 colors     |
+----------------------------------+
| フィルターエリア（折りたたみ可能） |
| Color: [All] [Solid] [Pattern]   |
+----------------------------------+
| +------+ +------+ +------+       |
| | THUMB| | THUMB| | THUMB|  ...  |
| | SFC  | | ASH  | | BCF  |       |
| +------+ +------+ +------+       |
| +------+ +------+ +------+       |
| | THUMB| | THUMB| | THUMB|  ...  |
| | LEP  | | SEA  | | MBLK |       |
| +------+ +------+ +------+       |
+----------------------------------+
```

**HTML構造**:
```html
<div class="color-panel">
  <!-- パーツ選択タブ -->
  <div class="part-tabs">
    <button class="part-tab active" data-part="A">A</button>
    <button class="part-tab" data-part="B">B</button>
    <button class="part-tab" data-part="C">C</button>
    <button class="part-tab" data-part="D">D</button>
  </div>

  <!-- フィルターバー -->
  <div class="filter-bar">
    <button class="filter-toggle">filters ▼</button>
    <span class="color-count">43 colors</span>
  </div>

  <!-- フィルターオプション（折りたたみ） -->
  <div class="filter-options hidden">
    <div class="filter-group">
      <label>Type:</label>
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="solid">Solid</button>
      <button class="filter-btn" data-filter="pattern">Pattern</button>
    </div>
  </div>

  <!-- カラーグリッド -->
  <div class="color-grid" id="colorGrid">
    <!-- JSで生成 -->
  </div>
</div>
```

---

### Step 2: CSS スタイリング

**ファイル**: `simulator/css/style.css`

#### カラーグリッドスタイル（Hockerty風）
```css
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.color-item {
  aspect-ratio: 1;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  overflow: hidden;
}

.color-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.color-item.selected {
  border-color: var(--primary-color);
}

.color-item.selected::after {
  content: '✓';
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: var(--primary-color);
  color: white;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.color-item .solid-color {
  width: 100%;
  height: 100%;
}
```

#### パーツタブスタイル
```css
.part-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.part-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
  position: relative;
}

.part-tab.active {
  color: var(--primary-color);
}

.part-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-color);
}
```

---

### Step 3: JavaScript UI制御

**ファイル**: `simulator/js/simulator.js` (修正)

#### グリッド生成関数
```javascript
function generateColorGrid(partId, filterType = 'all') {
  const grid = document.getElementById('colorGrid');
  grid.innerHTML = '';

  // フィルタリング
  let colors = COLOR_PALETTE;
  if (filterType === 'solid') {
    colors = COLOR_PALETTE.filter(c => !c.kind);
  } else if (filterType === 'pattern') {
    colors = COLOR_PALETTE.filter(c => c.kind === 'texture');
  }

  // 件数更新
  document.querySelector('.color-count').textContent = `${colors.length} colors`;

  // グリッド生成
  colors.forEach(color => {
    const item = document.createElement('div');
    item.className = 'color-item';
    item.dataset.code = color.code;

    if (color.kind === 'texture') {
      // テクスチャ画像を使用
      const img = document.createElement('img');
      img.src = color.texturePath;
      img.alt = color.name;
      item.appendChild(img);
    } else {
      // 単色は背景色で表示
      const div = document.createElement('div');
      div.className = 'solid-color';
      div.style.backgroundColor = color.hex;
      item.appendChild(div);
    }

    // 選択状態
    if (currentColors[partId] === color.code) {
      item.classList.add('selected');
    }

    item.addEventListener('click', () => selectColor(partId, color));
    grid.appendChild(item);
  });
}
```

---

## Critical Files

| ファイル | 変更内容 |
|---------|---------|
| `simulator/index.html` | カラー選択エリアの構造変更 |
| `simulator/css/style.css` | グリッド・タブスタイル追加 |
| `simulator/js/simulator.js` | グリッド生成・フィルター機能追加 |

---

## Verification

1. **機能テスト**
   - パーツタブ（A/B/C/D）で切り替えできる
   - フィルター（All/Solid/Pattern）で絞り込みできる
   - フィルターの表示/非表示が切り替えできる
   - カラー選択でプレビューが更新される
   - 選択中のカラーにチェックマークが表示される

2. **UIテスト**
   - グリッドがコンパクトに表示される
   - ホバー時に拡大表示される
   - レスポンシブでグリッド列数が調整される
