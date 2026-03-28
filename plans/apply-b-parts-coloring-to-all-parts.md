# Bパーツの黒い線保護を解除する計画

## 背景

現在のカラーシミュレーターでは、パーツごとに異なる色変換処理が適用されている：

### 現在の処理方式

| パーツ | 使用関数 | 処理内容 |
|--------|----------|----------|
| Bパーツ | `applyColorToWhiteParts()` | 白い部分のみ色変更、**黒い線を保護** |
| A/C/Dパーツ | `applyColorToImageData()` | 通常の色変換（黒保護なし） |

### ユーザーの要望

**「黒い線は無しでいい」** → Bパーツの黒い線保護処理を削除し、全パーツで統一された処理にする。

## 変更内容

### 変更箇所

**simulator/js/simulator.js** の `drawSolidColor` 関数（463-470行目）:

```javascript
// 変更前
let convertedData;
if (part === 'B') {
  convertedData = applyColorToWhiteParts(imageData, colorHex);
} else {
  convertedData = applyColorToImageData(imageData, colorHex, false);
}

// 変更後（全パーツで統一処理）
const convertedData = applyColorToImageData(imageData, colorHex, false);
```

### 変更効果

1. **コードの簡素化**: Bパーツ用の分岐が不要になる
2. **黒い線なし**: Bパーツの黒い線が保護されなくなり、色変更の対象になる
3. **統一処理**: 全パーツで同じ色変換アルゴリズムを使用

## 実装手順

1. `simulator.js` の `drawSolidColor` 関数を修正
2. ブラウザで動作確認
3. 問題なければコミット
