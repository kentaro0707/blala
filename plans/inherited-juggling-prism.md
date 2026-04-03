# カラー選択UI余白改善計画

## Context
ドライスーツシミュレーターのカラー選択UIにおいて、各カラー項目の間に十分な余白を作り、見やすく押しやすいUIに改善する。参考はHockertyのカスタマイザーUI。

## 現在の問題点

### 1. カラーグリッド (`.color-grid`)
```css
/* 現在 */
grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
row-gap: 24px;
column-gap: 12px;  /* 列間が狭い */
padding: 8px;      /* パディングが少ない */
```

### 2. カラーアイテム (`.color-item`)
```css
/* 現在 */
margin: 4px;              /* gapと二重管理で複雑 */
border-radius: 4px;       /* 丸みが足りない */
border: 2px solid transparent;  /* 選択時の視認性が弱い */
```

### 3. 選択状態
- ボーダー色変更のみ → リング効果や影が不足
- `ring-2 ring-offset-2` のような浮き上がり感がない

### 4. hover効果
- `box-shadow: 0 2px 8px` → 浮き上がり感が弱い
- `translate` によるリフト効果がない

---

## 改善計画

### 修正ファイル
`simulator/css/style.css`

### 1. カラーグリッド余白の改善

**行 749-758 を修正:**
```css
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 16px;                    /* 統一されたgap (row/col同じ) */
  padding: 16px;                /* 8px → 16px に増加 */
  max-height: 450px;
  overflow-y: auto;
}
```

**変更点:**
- `row-gap: 24px; column-gap: 12px;` → `gap: 16px;` に統一
- `padding: 8px` → `padding: 16px` に増加

### 2. カラーアイテムの改善

**行 760-781 を修正:**
```css
.color-item {
  aspect-ratio: 1;
  border-radius: 8px;           /* 4px → 8px 丸み追加 */
  border: 2px solid var(--border-color);  /* デフォルトで薄いボーダー */
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* margin: 4px; 削除 - gapで管理 */
  background: white;            /* 背景追加で独立性UP */
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);  /* 常に薄い影 */
}

.color-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);  /* 浮き上がり効果 */
  z-index: 1;
}

.color-item.selected {
  border-color: var(--accent-color);
  border-width: 3px;            /* 太いボーダー */
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.2);  /* 外側リング */
}
```

### 3. モバイル対応の改善

**768px以下のメディアクエリ内に追加:**
```css
.color-grid {
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 12px;
  padding: 12px;
}
```

**480px以下のメディアクエリ内に追加:**
```css
.color-grid {
  grid-template-columns: repeat(3, 1fr);  /* 固定3列 */
  gap: 10px;
  padding: 10px;
}
```

---

## 修正箇所まとめ

| セレクタ | 行番号 | 変更内容 |
|---------|--------|---------|
| `.color-grid` | 749-758 | gap統一、padding増加 |
| `.color-item` | 760-772 | margin削除、border-radius増加、box-shadow追加 |
| `.color-item:hover` | 774-777 | transform追加 |
| `.color-item.selected` | 779-781 | border-width増加、外側リング追加 |
| `@media (max-width: 768px)` | 316付近 | カラーグリッド設定追加 |
| `@media (max-width: 480px)` | 449付近 | カラーグリッド設定追加 |

---

## 期待される効果

1. **余白の統一**: gap 16px で縦横均等な間隔
2. **クリック領域の明確化**: 各アイテムが独立したカードとして認識
3. **選択状態の視認性**: リング効果で選択中が一目でわかる
4. **hover体験の向上**: 浮き上がるアニメーション
5. **レスポンシブ対応**: 画面サイズに応じた列数と余白調整
6. **将来の拡張性**: 色数が増えても崩れにくいグリッドレイアウト

---

## Verification

1. `simulator/index.html` をブラウザで開く
2. カラーグリッドの余白が適切であることを確認
3. 各カラー項目をhoverして浮き上がり効果を確認
4. 色を選択してリング効果を確認
5. ブラウザ幅を変更してレスポンシブ対応を確認
6. モバイルサイズ（375px程度）で窮屈さがないことを確認
