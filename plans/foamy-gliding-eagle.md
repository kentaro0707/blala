# プレビュー画像読み込み問題の修正計画

## Context
ユーザーがドライスーツシミュレーターのプレビューで服の画像が読み込めないと報告。
エラー: `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'width')`

### 根本原因
`loadImages()` 関数の `catch` ブロックでエラーを再スローしていないため、画像読み込みが失敗しても `init()` の処理が続行してしまう。結果として `updatePreview()` が呼ばれ、`partImages.A` が `undefined` のままアクセスされてエラーになる。

## Implementation Plan

### 修正1: `loadImages()` でエラーを適切に伝播（最重要）

**ファイル**: `simulator/js/simulator.js`
**場所**: 233-239行目

```javascript
// 修正前
try {
  await Promise.all(loadPromises);
  console.log('全画像を読み込みました');
} catch (error) {
  console.error('画像読み込みエラー:', error);
  alert('画像の読み込みに失敗しました');
}

// 修正後
try {
  await Promise.all(loadPromises);
  console.log('全画像を読み込みました');
} catch (error) {
  console.error('画像読み込みエラー:', error);
  alert('画像の読み込みに失敗しました: ' + error.message);
  throw error;  // エラーを再スロー
}
```

### 修正2: `init()` で画像読み込み失敗時の処理を追加

**ファイル**: `simulator/js/simulator.js`
**場所**: 163-184行目

```javascript
// 修正後のinit()関数
async function init() {
  previewCanvas = document.getElementById('previewCanvas');
  previewCtx = previewCanvas.getContext('2d');

  // オフスクリーンCanvasを初期化
  ['A', 'B', 'C', 'D'].forEach(part => {
    offscreenCanvas[part] = document.createElement('canvas');
    offscreenCtx[part] = offscreenCanvas[part].getContext('2d');
  });

  // ベース画像とパーツ画像を読み込み
  try {
    await loadImages();
  } catch (error) {
    console.error('初期化失敗: 画像を読み込めませんでした');
    const container = document.querySelector('.canvas-container');
    if (container) {
      container.innerHTML = '<p style="color: red; padding: 20px;">画像の読み込みに失敗しました。ページを再読み込みしてください。</p>';
    }
    return;  // 初期化を中断
  }

  // UIを初期化
  initColorPaletteUI();

  // プレビューを描画
  updatePreview();

  // イベントリスナーを設定
  setupEventListeners();
}
```

### 修正3: `updatePreview()` に防御的チェックを追加（二重防御）

**ファイル**: `simulator/js/simulator.js`
**場所**: 357-396行目

```javascript
async function updatePreview() {
  // 防御的チェック: 画像が読み込まれていない場合は何もしない
  if (!partImages.A) {
    console.warn('パーツ画像が読み込まれていないため、プレビューを更新できません');
    return;
  }

  const currentVersion = ++renderVersion;
  // ... 残りは同じ
}
```

## Critical Files
- `simulator/js/simulator.js` - メインの修正対象

## Verification
1. ローカルサーバーを起動: `cd simulator && python3 -m http.server 8080`
2. ブラウザで `http://localhost:8080` にアクセス
3. プレビューにドライスーツの画像が表示されることを確認
4. 色を選択してプレビューが更新されることを確認
5. コンソールにエラーがないことを確認
