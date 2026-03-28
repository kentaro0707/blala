# BパーツのNVY色を全パーツに統一する計画

## Context

ユーザーは「BパーツのNVYでHTMLに表示される同じ色合いでAパーツ、Cパーツ、Dパーツも同じ色合いになるようにしたい（Bパーツの黒い線はBパーツのみ）」と要望している。

現在、Bパーツと他のパーツ（A, C, D）で異なる色変換ロジックが使用されているため、同じ色を指定しても異なる色合いになってしまう。

## 現在の問題

| パーツ | 使用関数 | ロジック |
|--------|----------|----------|
| Bパーツ | `colorizeWhitePart` | 白い部分ほど目標色を濃く着色 |
| A, C, Dパーツ | `colorizeSilhouette` | 黒い部分ほど目標色を濃く着色 |

これらは逆のロジックのため、同じNVY色を指定しても全く異なる結果になる。

## 実装計画

### 1. colorizer.js に新しい関数を追加

`colorizeWhiteBasedPart` と `applyColorToWhiteBasedParts` を追加する。
Bパーツと同じ「白い部分ほど濃く着色」ロジックだが、黒い線の保護は行わない。

```javascript
/**
 * 白ベースのパーツ用：明るい部分を目標色に着色（黒線保護なし）
 */
function colorizeWhiteBasedPart(srcR, srcG, srcB, srcA, targetHex) {
  if (srcA === 0) return { r: 0, g: 0, b: 0, a: 0 };

  const targetRgb = hexToRgb(targetHex);
  if (!targetRgb) return { r: srcR, g: srcG, b: srcB, a: srcA };

  const brightness = (srcR + srcG + srcB) / 3;
  const intensity = brightness / 255;

  return {
    r: Math.round(targetRgb.r * intensity),
    g: Math.round(targetRgb.g * intensity),
    b: Math.round(targetRgb.b * intensity),
    a: srcA
  };
}

function applyColorToWhiteBasedParts(imageData, targetHex) {
  // colorizeWhiteBasedPartを全ピクセルに適用
}
```

### 2. simulator.js の drawSolidColor() を修正

**変更前 (463-470行目):**
```javascript
if (part === 'B') {
  convertedData = applyColorToWhiteParts(imageData, colorHex);
} else {
  convertedData = applyColorToImageData(imageData, colorHex, false);
}
```

**変更後:**
```javascript
if (part === 'B') {
  // Bパーツ：白い部分を着色＋黒線保護
  convertedData = applyColorToWhiteParts(imageData, colorHex);
} else {
  // A、C、Dパーツ：白い部分を着色（黒線保護なし）
  convertedData = applyColorToWhiteBasedParts(imageData, colorHex);
}
```

## Critical Files

- `/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/simulator/js/colorizer.js`
  - 新しい関数 `colorizeWhiteBasedPart` と `applyColorToWhiteBasedParts` を追加
- `/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/simulator/js/simulator.js`
  - `drawSolidColor()` 関数の条件分岐を修正（463-470行目）

## Verification

1. シミュレーターを開く（`simulator/index.html`）
2. 各パーツ（A, B, C, D）にNVY色を選択
3. すべてのパーツが同じ色合いで表示されることを確認
4. Bパーツのみ黒い線が保護されていることを確認
5. 他の色でも同様に統一された色合いになることを確認

## Notes

- テクスチャ描画（`drawTexturePart`）は影響を受けない。Bパーツの黒ライン保護処理は維持される。
- この変更は単色（solid color）モードのみに影響する。
