# 手首固定パーツ実装計画

## Context（背景・目的）

ユーザーから「手首部分をカラー変更不可の固定パーツとして実装したい」という要望がありました。添付された手首画像（parts/手首.png）を基準に、左右の手首部分を常に黒固定にし、ユーザーがカラーパレットを選んでも手首には反映されないようにします。

**決定事項**: 手首画像は1枚の画像として左右両方を含み、1つの固定パーツとして管理します。

## 現在のアーキテクチャ

- **パーツ定義**: `PARTS`オブジェクト（A, B, C, Dの4パーツ）
- **パーツ画像**: `parts/`フォルダに `{PARTS_ID}-parts.png` 形式
- **描画順序**: D → A → C → B
- **色変換**: `colorizer.js`でシルエット画像に色を着色

## 変更ファイル

**`simulator/js/simulator.js`** のみ

## 重要な注意点

**`WRIST`を`PARTS`オブジェクトに追加しないこと！**
- `PARTS`のエントリはパレットUIと色状態管理を前提としている（simulator.js:245, :594, :647, :672）
- 固定パーツは独立した`FIXED_PARTS`オブジェクトで管理する

## 実装ステップ

### Step 1: 固定パーツ定義を追加（PARTS定義の直後、行33付近）

```javascript
// 固定パーツ定義（色変更不可）
// 注意: PARTSオブジェクトには追加しない（UI/状態管理が前提のため）
const FIXED_PARTS = {
  WRIST: {
    name: '手首パーツ',
    description: '左右の手首部分（黒固定）',
    imagePath: '../parts/手首.png',
    offsetX: 0,
    offsetY: 0
  }
};

// 固定パーツIDの配列（拡張性のため）
const FIXED_PART_IDS = Object.keys(FIXED_PARTS);
```

### Step 2: 固定パーツ用変数を追加（行49-58付近）

```javascript
// 固定パーツ画像キャッシュ
const fixedPartImages = {};
```

### Step 3: init()関数の修正（行163-171付近）

オフスクリーンCanvasの初期化は不要（直接描画するため）

### Step 4: loadImages()関数に固定パーツ読み込みを追加（行189-240付近）

```javascript
// 固定パーツ画像を読み込み
for (const part of FIXED_PART_IDS) {
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      fixedPartImages[part] = img;
      console.log(`固定パーツ ${part} 読み込み完了:`, img.width, 'x', img.height);
      resolve();
    };
    img.onerror = (e) => {
      // 固定パーツは必須のため、エラーを明示的に通知
      console.error(`固定パーツ ${part} の読み込みに失敗:`, e);
      alert(`固定パーツ ${part} の読み込みに失敗しました。手首が正しく表示されない可能性があります。`);
      resolve(); // 処理は続行
    };
    img.src = FIXED_PARTS[part].imagePath;
  });
  loadPromises.push(promise);
}
```

### Step 5: updatePreview()関数の描画順序に固定パーツを追加（行377付近）

```javascript
// パーツを順番に描画（重ね順: D → A → C → B）
const drawOrder = ['D', 'A', 'C', 'B'];

// ... 既存のeditableParts描画ループの後に ...

// 固定パーツを描画（最上位レイヤー）
for (const partId of FIXED_PART_IDS) {
  if (renderVersion !== currentVersion) return;
  drawFixedPart(partId);
}
```

### Step 6: drawFixedPart()関数を新規追加

```javascript
/**
 * 固定パーツを描画（色変更不可）
 * オフスクリーンCanvasを使わず、直接プレビューCanvasに描画
 * @param {string} partId - 固定パーツID
 */
function drawFixedPart(partId) {
  const img = fixedPartImages[partId];
  if (!img) {
    console.warn(`固定パーツ ${partId} 画像がありません`);
    return;
  }

  const partInfo = FIXED_PARTS[partId];

  // 直接プレビューCanvasに描画（色変換なし、オフセット適用）
  previewCtx.drawImage(img, partInfo.offsetX, partInfo.offsetY);

  console.log(`固定パーツ ${partId} 描画完了`);
}
```

## 描画順序

```
D → A → C → B → WRIST（手首）
```

手首は最後に描画されるため、他のパーツの上に重ねられます。

## 拡張性

新しい固定パーツを追加する場合：
1. `FIXED_PARTS` オブジェクトに定義を追加（offsetX, offsetYを含む）
2. `FIXED_PART_IDS` は自動的に更新される（`Object.keys(FIXED_PARTS)`のため）
3. 追加のコード変更は不要

## 検証方法

1. シミュレーターを開く
2. 任意のカラーパレットを選択
3. 手首部分が黒のまま維持されることを確認
4. 全パーツの色を変更しても手首が黒のままか確認
5. **リセットボタン**を押して手首が黒のままか確認
6. **URLパラメータ復元**時に手首が黒のままか確認
7. **PNGエクスポート**で手首が黒で出力されるか確認
8. コンソールエラーがないことを確認

## Codexレビュー結果（解決済み）

| 指摘 | 対応 |
|-----|------|
| `['WRIST']`のハードコード | `FIXED_PART_IDS`を使用 |
| オフセット未サポート | `FIXED_PARTS`にoffsetX/offsetYを追加 |
| エラーが静かに無視される | alert()でユーザーに通知 |
| オフスクリーンCanvasが不要 | 直接描画に簡素化 |
| PARTSへ追加のリスク | 明確な注意書きを追加 |
