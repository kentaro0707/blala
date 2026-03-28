/**
 * 色変換ロジック
 *
 * このモジュールは、元画像の陰影・立体感・質感を保持したまま
 * 色のみを変更する処理を担当します。
 */

/**
 * HEX色をRGBに変換
 * @param {string} hex - #RRGGBB形式のカラーコード
 * @returns {Object} {r, g, b} オブジェクト
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 黒いシルエット画像に色を着色
 * 黒い部分（暗いピクセル）を目標色に置き換えます
 *
 * @param {number} srcR - 元のRed (0-255)
 * @param {number} srcG - 元のGreen (0-255)
 * @param {number} srcB - 元のBlue (0-255)
 * @param {number} srcA - 元のAlpha (0-255)
 * @param {string} targetHex - 目標色のHEXコード
 * @returns {Object} {r, g, b, a} 変換後の色
 */
function colorizeSilhouette(srcR, srcG, srcB, srcA, targetHex) {
  // 透過ピクセルはそのまま透過させる
  if (srcA === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // 目標色のRGBを取得
  const targetRgb = hexToRgb(targetHex);
  if (!targetRgb) {
    return { r: srcR, g: srcG, b: srcB, a: srcA };
  }

  // 元のピクセルの明るさを計算（0=黒、1=白）
  // 黒いシルエットの場合、明るさは低い値になる
  const brightness = (srcR + srcG + srcB) / (3 * 255);

  // 黒い部分（brightnessが低い）ほど、目標色を濃く表示
  // 白い部分（brightnessが高い）ほど、目標色を薄く表示
  // 反転した明るさを使用：黒→1.0、白→0.0
  const intensity = 1 - brightness;

  // 目標色に強度を適用
  const r = Math.round(targetRgb.r * intensity);
  const g = Math.round(targetRgb.g * intensity);
  const b = Math.round(targetRgb.b * intensity);

  // アルファ値は元のまま（不透明なら255）
  return { r, g, b, a: srcA };
}

/**
 * Canvasの画像データ全体に色変換を適用
 * @param {ImageData} imageData - 変換対象のImageData
 * @param {string} targetHex - 目標色のHEXコード
 * @param {boolean} preserveBlack - 黒を保護するか（現在は使用しません）
 * @returns {ImageData} 変換後のImageData
 */
function applyColorToImageData(imageData, targetHex, preserveBlack = true) {
  const data = imageData.data;

  let changedPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // 透過ピクセルはスキップ
    if (a === 0) continue;

    // 色変換を適用
    const converted = colorizeSilhouette(r, g, b, a, targetHex);
    data[i] = converted.r;
    data[i + 1] = converted.g;
    data[i + 2] = converted.b;
    data[i + 3] = converted.a;
    changedPixels++;
  }

  console.log(`色変換完了: ${changedPixels}ピクセルを変更、目標色: ${targetHex}`);

  return imageData;
}

/**
 * ソースCanvasから色変換済みのピクセルデータを取得
 * @param {HTMLCanvasElement} sourceCanvas - ソースCanvas
 * @param {string} targetHex - 目標色のHEXコード
 * @param {boolean} preserveBlack - 黒を保護するか
 * @returns {ImageData} 色変換後のImageData
 */
function getColorizedImageData(sourceCanvas, targetHex, preserveBlack = true) {
  const ctx = sourceCanvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  return applyColorToImageData(imageData, targetHex, preserveBlack);
}

/**
 * Bパーツ用：白い部分のみを色変更し、黒い線を保護する
 * 白い部分（明るいピクセル）を目標色に置き換え、黒い線はそのまま保持
 *
 * @param {number} srcR - 元のRed (0-255)
 * @param {number} srcG - 元のGreen (0-255)
 * @param {number} srcB - 元のBlue (0-255)
 * @param {number} srcA - 元のAlpha (0-255)
 * @param {string} targetHex - 目標色のHEXコード
 * @returns {Object} {r, g, b, a} 変換後の色
 */
function colorizeWhitePart(srcR, srcG, srcB, srcA, targetHex) {
  // 透過ピクセルはそのまま透過させる
  if (srcA === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // 黒い線の判定（暗いピクセルは保護）
  const brightness = (srcR + srcG + srcB) / 3;
  if (brightness < 30) {
    // 黒い線は元のまま保護
    return { r: srcR, g: srcG, b: srcB, a: srcA };
  }

  // 目標色のRGBを取得
  const targetRgb = hexToRgb(targetHex);
  if (!targetRgb) {
    return { r: srcR, g: srcG, b: srcB, a: srcA };
  }

  // Aパーツと同じ明るさに変換（Aパーツの平均輝度128に合わせる）
  const adjustedBrightness = 128;
  const intensity = 1 - (adjustedBrightness / 255);

  const r = Math.round(targetRgb.r * intensity);
  const g = Math.round(targetRgb.g * intensity);
  const b = Math.round(targetRgb.b * intensity);

  return { r, g, b, a: srcA };
}

/**
 * Bパーツ用：白い部分のみ色変換を適用（黒い線を保護）
 * @param {ImageData} imageData - 変換対象のImageData
 * @param {string} targetHex - 目標色のHEXコード
 * @returns {ImageData} 変換後のImageData
 */
function applyColorToWhiteParts(imageData, targetHex) {
  const data = imageData.data;

  let changedPixels = 0;
  let protectedPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // 透過ピクセルはスキップ
    if (a === 0) continue;

    // 色変換を適用（黒い線は保護される）
    const converted = colorizeWhitePart(r, g, b, a, targetHex);
    data[i] = converted.r;
    data[i + 1] = converted.g;
    data[i + 2] = converted.b;
    data[i + 3] = converted.a;

    const brightness = (r + g + b) / 3;
    if (brightness < 30) {
      protectedPixels++;
    } else {
      changedPixels++;
    }
  }

  console.log(`Bパーツ色変換完了: ${changedPixels}ピクセルを変更、${protectedPixels}ピクセル（黒線）を保護、目標色: ${targetHex}`);

  return imageData;
}
