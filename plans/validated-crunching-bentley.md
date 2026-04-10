# Cパーツのカラー変更時の表示バグ修正

## Context
Cパーツのカラーを変更（特に柄を選択）すると以下の問題が発生：
1. 背景が黒色になる
2. 柄を選択すると背景も同様の柄になる
3. Aパーツ、Dパーツが見えなくなる

## Root Cause
`drawTexturePart`関数（554行目）でテクスチャ描画する際、Cパーツの黒い背景を透明にする処理が不足している。

- `drawSolidColor`関数（511-527行目）にはCパーツの黒い背景を透明にする処理がある
- しかし`drawTexturePart`関数には同様の処理がない
- そのため、テクスチャモードでは黒い背景（またはテクスチャが敷き詰められた背景）が残り、他のパーツ（A、D）を覆ってしまう

## Solution
`drawTexturePart`関数に、Cパーツの黒い背景を透明にする処理を追加する。

### 修正箇所
**ファイル**: `simulator/js/simulator.js`
**関数**: `drawTexturePart`（554行目〜）

### 修正内容
`drawTexturePart`関数内で、シルエットマスク後にCパーツの黒い背景を透明にする処理を追加：

```javascript
// 2. パーツのシルエットでマスク（globalCompositeOperationを使用）
ctx.globalCompositeOperation = 'destination-in';
ctx.drawImage(img, 0, 0);
ctx.globalCompositeOperation = 'source-over';
console.log(`シルエットマスク完了: ${part}`);

// Cパーツは黒い背景を透明にする（追加）
if (part === 'C') {
  console.log(`Cパーツ黒背景透明化開始`);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    // ほぼ黒いピクセル（閾値30以下）を透明にする
    if (a > 0 && r < 30 && g < 30 && b < 30) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  console.log(`Cパーツ黒背景透明化完了`);
}
```

## Files to Modify
- `simulator/js/simulator.js` - `drawTexturePart`関数にCパーツの黒背景透明化処理を追加

## Verification
1. シミュレーターを開く
2. Cパーツのカラーを単色に変更 → 背景が黒くならないことを確認
3. Cパーツのカラーを柄（テクスチャ）に変更 → 背景に柄が表示されないことを確認
4. Aパーツ、Dパーツが正しく表示されることを確認
