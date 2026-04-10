# 単色選択時の色表示修正計画

## Context

ドライスーツシミュレーターで、単色のカラー選択時にプレビューが実際の選択色よりも暗く表示される問題を修正する。

**問題の原因**: `colorizeSilhouette()` 関数で `intensity = 1 - brightness` の処理を行っており、黒いシルエット画像の暗いピクセルほど目標色が暗く表示される。

## 修正方針

A, Cパーツの単色選択時に、選択した色をそのまま（陰影なしで）表示する新しい関数を追加する。既存のテクスチャ選択時の動作には影響しない。

## 実装ステップ

### 1. colorizer.js - 新しい関数の追加

以下の2つの関数を `colorizer.js` の末尾（264行目以降）に追加：

```javascript
/**
 * 単色選択用：選択した色をそのまま表示（陰影なし）
 * シルエットの形だけを使用し、色は選択色をそのまま適用
 */
function colorizeSolid(srcR, srcG, srcB, srcA, targetHex) {
  if (srcA === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  const targetRgb = hexToRgb(targetHex);
  if (!targetRgb) {
    return { r: srcR, g: srcG, b: srcB, a: srcA };
  }

  // 不透明ピクセルには選択色をそのまま適用（陰影なし）
  return {
    r: targetRgb.r,
    g: targetRgb.g,
    b: targetRgb.b,
    a: srcA
  };
}

/**
 * 単色選択用：Canvas全体に単色を適用（陰影なし）
 */
function applySolidColor(imageData, targetHex) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // 透過ピクセルはスキップ

    const converted = colorizeSolid(data[i], data[i + 1], data[i + 2], data[i + 3], targetHex);
    data[i] = converted.r;
    data[i + 1] = converted.g;
    data[i + 2] = converted.b;
    data[i + 3] = converted.a;
  }

  return imageData;
}
```

### 2. simulator.js - drawSolidColor関数の修正

`simulator.js` の470-472行目を修正：

**変更前:**
```javascript
} else {
  // A, Cパーツは黒いシルエット用の色変換
  convertedData = applyColorToImageData(imageData, colorHex, false);
}
```

**変更後:**
```javascript
} else {
  // A, Cパーツは単色用の変換（陰影なし、選択色をそのまま表示）
  convertedData = applySolidColor(imageData, colorHex);
}
```

## Critical Files

- `/simulator/js/colorizer.js` - 新しい `colorizeSolid()` と `applySolidColor()` 関数を追加
- `/simulator/js/simulator.js` - `drawSolidColor()` 関数内でA, Cパーツの処理を変更（472行目）

## 影響範囲

| パーツ | 変更前 | 変更後 |
|--------|--------|--------|
| Aパーツ | 陰影ありで暗く表示 | 選択色をそのまま表示 |
| Cパーツ | 陰影ありで暗く表示 | 選択色をそのまま表示 |
| Bパーツ | 黒線保護（変更なし） | 黒線保護（変更なし） |
| Dパーツ | 明るさ維持（変更なし） | 明るさ維持（変更なし） |
| テクスチャ選択 | 既存動作（変更なし） | 既存動作（変更なし） |

## Verification

1. シミュレーターを起動し、Aパーツで単色を選択
2. 選択した色がそのまま表示されることを確認（暗くならない）
3. Cパーツでも同様に確認
4. テクスチャ選択（SFC、BLEP等）が従来通り動作することを確認
5. PNGエクスポートで正しく色が反映されることを確認
