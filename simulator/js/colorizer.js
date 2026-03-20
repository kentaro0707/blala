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
 * RGBをHSVに変換
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Object} {h, s, v} オブジェクト
 */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

/**
 * HSVをRGBに変換
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} v - Value (0-100)
 * @returns {Object} {r, g, b} オブジェクト
 */
function hsvToRgb(h, s, v) {
  h /= 360;
  s /= 100;
  v /= 100;

  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * 黒いピクセルかどうかを判定
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @param {number} threshold - 暗色判定閾値（デフォルト: 60）
 * @returns {boolean} 黒いピクセルならtrue
 */
function isBlackPixel(r, g, b, threshold = 60) {
  return r < threshold && g < threshold && b < threshold;
}

/**
 * 陰影を保持した色変換（マルチプライブブレンド方式）
 * 元のピクセルの明度（Value）を保ちつつ、目標色の色相と彩度を適用します
 *
 * @param {number} srcR - 元のRed (0-255)
 * @param {number} srcG - 元のGreen (0-255)
 * @param {number} srcB - 元のBlue (0-255)
 * @param {string} targetHex - 目標色のHEXコード
 * @param {boolean} preserveBlack - 黒を保護するか（デフォルト: true）
 * @returns {Object} {r, g, b} 変換後の色
 */
function convertColorPreserveShadows(srcR, srcG, srcB, targetHex, preserveBlack = true) {
  // 透過ピクセルや完全に暗いピクセルのチェック
  if (srcR === 0 && srcG === 0 && srcB === 0) {
    return { r: srcR, g: srcG, b: srcB };
  }

  // 黒保護が有効な場合、黒いピクセルはそのまま返す
  if (preserveBlack && isBlackPixel(srcR, srcG, srcB)) {
    return { r: srcR, g: srcG, b: srcB };
  }

  // 目標色のRGBを取得
  const targetRgb = hexToRgb(targetHex);
  if (!targetRgb) {
    return { r: srcR, g: srcG, b: srcB };
  }

  // 元ピクセルのHSVを取得
  const srcHsv = rgbToHsv(srcR, srcG, srcB);

  // 目標色のHSVを取得
  const targetHsv = rgbToHsv(targetRgb.r, targetRgb.g, targetRgb.b);

  // 元の明度(V)と目標色の色相(H)・彩度(S)を組み合わせ
  // 彩度は元の彩度と目標彩度をブレンドして自然に見せる
  const blendedSat = (srcHsv.s * 0.3 + targetHsv.s * 0.7);

  const result = hsvToRgb(targetHsv.h, blendedSat, srcHsv.v);

  return result;
}

/**
 * Canvasの画像データ全体に色変換を適用
 * @param {ImageData} imageData - 変換対象のImageData
 * @param {string} targetHex - 目標色のHEXコード
 * @param {boolean} preserveBlack - 黒を保護するか
 * @returns {ImageData} 変換後のImageData
 */
function applyColorToImageData(imageData, targetHex, preserveBlack = true) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // 透過ピクセルはスキップ
    if (a === 0) continue;

    // 色変換を適用
    const converted = convertColorPreserveShadows(r, g, b, targetHex, preserveBlack);
    data[i] = converted.r;
    data[i + 1] = converted.g;
    data[i + 2] = converted.b;
    // アルファ値はそのまま保持
  }

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
