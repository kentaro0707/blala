# カラー選択UIの高さ増加計画

## Context（背景・目的）

ドライスーツシミュレーターのカラー選択UIにおいて、各カラー項目の「通常時の高さ」を増やしたい。現在のUIはカラー項目が縦方向に窮屈に見え、高級感に欠ける。参考UI（Hockerty）のような余白感のある上品な見た目に改善し、押しやすさと見やすさを向上させる。

## 現状分析

### 現在の構造（`simulator/css/style.css`）

**カラー項目（line 759-772）:**
```css
.color-item {
  aspect-ratio: 4/5;  /* 現在: 幅4に対して高さ5 */
  /* 高さはアスペクト比で制御されており、明示的な高さ指定なし */
}
```

**カラーグリッド（line 750-757）:**
```css
.color-grid {
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  /* デスクトップ: 90px幅 × aspect-ratio 4/5 = 約112px高さ */
}
```

**レスポンシブ（768px以下）:**
```css
.color-grid {
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  /* 70px幅 × 4/5 = 約87px高さ */
}
```

**レスポンシブ（480px以下）:**
```css
.color-grid {
  grid-template-columns: repeat(3, 1fr);
  /* 画面幅による可変 */
}
```

## 修正方針

高さを増やすために **aspect-ratio** を変更し、必要に応じて **min-height** を追加する。

### 変更内容

| ブレークポイント | 現在 | 変更後 |
|---|---|---|
| デスクトップ | `aspect-ratio: 4/5` (約112px) | `aspect-ratio: 3/4` (約120px) + `min-height: 100px` |
| 768px以下 | 継承 (約87px) | `aspect-ratio: 3/4` + `min-height: 85px` |
| 480px以下 | 継承 | `aspect-ratio: 3/4` + `min-height: 75px` |

## 実装計画

### Step 1: `.color-item` のアスペクト比を変更

**ファイル:** `simulator/css/style.css`
**行:** 759-772

```css
.color-item {
  aspect-ratio: 3/4;  /* 変更: 4/5 → 3/4 (より縦長に) */
  min-height: 100px;  /* 追加: 最小高さを確保 */
  /* 他のプロパティはそのまま */
}
```

### Step 2: 768px以下のレスポンシブ調整

**ファイル:** `simulator/css/style.css`
**行:** 369付近（@media (max-width: 768px) 内）

メディアクエリ内に以下を追加:
```css
.color-item {
  min-height: 85px;
}
```

### Step 3: 480px以下のレスポンシブ調整

**ファイル:** `simulator/css/style.css`
**行:** 498付近（@media (max-width: 480px) 内）

メディアクエリ内に以下を追加:
```css
.color-item {
  min-height: 75px;
}
```

## 変更ファイル一覧

| ファイル | 変更箇所 | 変更内容 |
|---|---|---|
| `simulator/css/style.css` | line 760 | `aspect-ratio: 4/5` → `aspect-ratio: 3/4` |
| `simulator/css/style.css` | line 760付近 | `min-height: 100px` 追加 |
| `simulator/css/style.css` | @media 768px内 | `.color-item { min-height: 85px; }` 追加 |
| `simulator/css/style.css` | @media 480px内 | `.color-item { min-height: 75px; }` 追加 |

## 高さ変更の効果

- **デスクトップ**: 約112px → 約120px+ (8px以上の増加)
- **タブレット**: 約87px → 85px以上確保
- **モバイル**: 可変 → 75px以上確保

## 注意点

- 選択時・hover時に高さが変わらないよう、`aspect-ratio` は全状態で共通
- `selected` 状態では `border-width: 3px` に変更されるが、高さへの影響は最小限
- グリッドの `max-height` はそのままで、スクロール可能な状態を維持

## Verification（確認方法）

1. `simulator/index.html` をブラウザで開く
2. 各パーツ（A, B, C, D）のカラー選択項目の高さを確認
3. 通常時・hover時・選択時で高さが変わらないことを確認
4. 画面幅を変更して768px以下、480px以下でも適切に表示されることを確認
5. 全体的に余白感があり、高級感のあるUIになっていることを確認
