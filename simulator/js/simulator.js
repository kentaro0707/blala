/**
 * DRYSUITS Graphite α カラーシミュレーター メイン制御
 *
 * パーツの色変更、プレビュー描画、状態管理、エクスポート機能を担当します。
 */

// パーツ定義（オフセット情報付き）
const PARTS = {
  A: {
    name: 'Aパーツ',
    description: '胸下〜胴体〜股下付近のグレー部分',
    offsetX: 0,
    offsetY: 0
  },
  B: {
    name: 'Bパーツ',
    description: '肩〜胸上の白いパーツ部分',
    offsetX: 0,
    offsetY: 0
  },
  C: {
    name: 'Cパーツ',
    description: '左右の腕のベージュ部分',
    offsetX: 0,
    offsetY: 0
  },
  D: {
    name: 'Dパーツ',
    description: 'すね付近のグレー部分',
    offsetX: 0,
    offsetY: 0
  }
};

// ベース画像（元の完成図）
let baseImage = null;

// 初期色設定（ベース画像に合わせて調整）
const INITIAL_COLORS = {
  A: 'SFC',    // 青系迷彩
  B: 'SFC',    // 青系迷彩
  C: 'SFC',    // 青系迷彩
  D: 'SFC'     // 青系迷彩
};

// 現在の選択色状態
let currentColors = { ...INITIAL_COLORS };

// パーツ画像キャッシュ
const partImages = {};

// プレビューCanvas
let previewCanvas = null;
let previewCtx = null;

// オフスクリーンCanvas（パーツ描画用）
const offscreenCanvas = {};
const offscreenCtx = {};

// 描画バージョン管理（レースコンディション防止）
let renderVersion = 0;

// 進行中のレンダリングPromise
let pendingRender = null;

// テクスチャキャッシュ（サイズ制限）
const textureCache = new Map();
const MAX_CACHE_SIZE = 2; // 最大2枚までキャッシュ

/**
 * テクスチャ画像を取得（遅延ロード＋LRUキャッシュ）
 * @param {string} code - 色コード
 * @returns {Promise<Image|null>} テクスチャ画像、失敗時はnull
 */
async function getTexture(code) {
  if (textureCache.has(code)) {
    const cached = textureCache.get(code);
    // LRU: 最後にアクセスしたものを先頭へ
    textureCache.delete(code);
    textureCache.set(code, cached);
    console.log(`テクスチャキャッシュヒット: ${code}`);
    return cached;
  }

  const color = findColorByCode(code);
  if (!color || color.kind !== 'texture') {
    console.log(`テクスチャではありません: ${code}, kind=${color?.kind}`);
    return null;
  }

  // テクスチャパスをそのまま使用（512x512画像）
  // 絶対パスに変換（ブラウザでのパス解決問題を回避）
  const absolutePath = new URL(color.texturePath, window.location.href).href;
  console.log(`テクスチャ読み込み開始: ${code}, パス: ${color.texturePath}, 絶対パス: ${absolutePath}`);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  let loadSuccess = false;

  await new Promise((resolve) => {
    img.onload = async () => {
      loadSuccess = true;
      console.log(`テクスチャ読み込み成功: ${code}, サイズ: ${img.naturalWidth}x${img.naturalHeight}`);
      // 画像のデコードを待つ
      if (img.decode) {
        try {
          await img.decode();
          console.log(`テクスチャデコード完了: ${code}`);
        } catch (e) {
          console.warn(`テクスチャデコード警告: ${code}`, e);
        }
      }
      resolve();
    };
    img.onerror = (e) => {
      console.error(`テクスチャ読み込み失敗: ${code}`, e);
      resolve();
    };
    img.src = absolutePath;
  });

  // 読み込み失敗時はnullを返す（フォールバック）
  if (!loadSuccess || !img.complete || img.naturalWidth === 0) {
    console.error(`テクスチャ無効: ${code}, complete=${img.complete}, width=${img.naturalWidth}`);
    return null;
  }

  // LRUキャッシュ: サイズ制限を超えたら古いものを削除
  if (textureCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = textureCache.keys().next().value;
    textureCache.delete(oldestKey);
  }
  textureCache.set(code, img);
  return img;
}

/**
 * スウォッチにスタイルを適用（単色/テクスチャ対応）
 * @param {HTMLElement} swatch - スウォッチ要素
 * @param {Object} color - 色オブジェクト
 */
function applySwatchStyle(swatch, color) {
  swatch.style.backgroundColor = color.hex;
  if (color.kind === 'texture') {
    // テクスチャパスをそのまま使用
    const thumbPath = color.texturePath;
    // 絶対パスに変換
    const absolutePath = new URL(thumbPath, window.location.href).href;
    swatch.style.backgroundImage = `url(${absolutePath})`;
    // パターンが見やすいようにサイズを調整（テクスチャの一部を表示）
    swatch.style.backgroundSize = '150px 150px';
    swatch.style.backgroundPosition = 'center';
  } else {
    swatch.style.backgroundImage = 'none';
    swatch.style.backgroundSize = '';
    swatch.style.backgroundPosition = '';
  }
}

/**
 * 初期化処理
 */
async function init() {
  previewCanvas = document.getElementById('previewCanvas');
  previewCtx = previewCanvas.getContext('2d');

  // オフスクリーンCanvasを初期化
  ['A', 'B', 'C', 'D'].forEach(part => {
    offscreenCanvas[part] = document.createElement('canvas');
    offscreenCtx[part] = offscreenCanvas[part].getContext('2d');
  });

  // ベース画像とパーツ画像を読み込み
  await loadImages();

  // UIを初期化
  initColorPaletteUI();

  // プレビューを描画
  updatePreview();

  // イベントリスナーを設定
  setupEventListeners();
}

/**
 * 画像を読み込む（ベース画像 + パーツ画像）
 */
async function loadImages() {
  const loadPromises = [];

  // ベース画像を読み込み
  const basePromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      baseImage = img;
      console.log('ベース画像読み込み完了:', img.width, 'x', img.height);
      resolve();
    };
    img.onerror = (e) => {
      console.error('ベース画像の読み込みに失敗:', e);
      reject(new Error('ベース画像の読み込みに失敗しました'));
    };
    img.src = `../parts/ベース.png`;
  });
  loadPromises.push(basePromise);

  // パーツ画像を読み込み
  for (const part of ['A', 'B', 'C', 'D']) {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        partImages[part] = img;
        console.log(`${part}パーツ画像読み込み完了:`, img.width, 'x', img.height);

        // オフスクリーンCanvasのサイズを設定
        offscreenCanvas[part].width = img.width;
        offscreenCanvas[part].height = img.height;

        resolve();
      };
      img.onerror = (e) => {
        console.error(`${part}-parts.png の読み込みに失敗:`, e);
        reject(new Error(`${part}-parts.png の読み込みに失敗しました`));
      };
      img.src = `../parts/${part}-parts.png`;
    });
    loadPromises.push(promise);
  }

  try {
    await Promise.all(loadPromises);
    console.log('全画像を読み込みました');
  } catch (error) {
    console.error('画像読み込みエラー:', error);
    alert('画像の読み込みに失敗しました');
  }
}

/**
 * カラーパレットUIを初期化
 */
function initColorPaletteUI() {
  const container = document.getElementById('colorPalettes');

  const partList = ['A', 'B', 'C', 'D'];

  partList.forEach(part => {
    const partSection = createPartPaletteSection(part);
    container.appendChild(partSection);
  });
}

/**
 * パーツごとのパレットセクションを作成
 */
function createPartPaletteSection(part) {
  const section = document.createElement('div');
  section.className = 'part-section';
  section.dataset.part = part;

  const partInfo = PARTS[part];
  const initialColorCode = INITIAL_COLORS[part];
  const initialColor = findColorByCode(initialColorCode);

  section.innerHTML = `
    <div class="part-header">
      <h3>${partInfo.name}</h3>
      <p class="part-description">${partInfo.description}</p>
      <div class="selected-color-info">
        <span class="selected-color-swatch"></span>
        <span class="selected-color-name">${initialColor.code} - ${initialColor.name}</span>
      </div>
    </div>
    <div class="color-palette" id="palette-${part}"></div>
  `;

  // 選択中の色スウォッチにスタイルを適用
  const selectedSwatch = section.querySelector('.selected-color-swatch');
  applySwatchStyle(selectedSwatch, initialColor);

  // パレットボタンを生成
  const paletteContainer = section.querySelector(`#palette-${part}`);

  COLOR_PALETTE.forEach(color => {
    const button = document.createElement('button');
    button.className = 'color-button';
    button.dataset.code = color.code;
    button.title = `${color.code} - ${color.name}`;

    // 色見本
    const swatch = document.createElement('span');
    swatch.className = 'color-swatch';
    applySwatchStyle(swatch, color);

    // 色名と品番
    const label = document.createElement('span');
    label.className = 'color-label';
    label.textContent = color.code;

    button.appendChild(swatch);
    button.appendChild(label);

    // 初期選択状態
    if (color.code === initialColorCode) {
      button.classList.add('selected');
    }

    button.addEventListener('click', () => selectColor(part, color));

    paletteContainer.appendChild(button);
  });

  return section;
}

/**
 * 色を選択
 */
function selectColor(part, color) {
  // 状態を更新（codeのみ保持）
  currentColors[part] = color.code;

  // 選択状態のUIを更新
  const partSection = document.querySelector(`.part-section[data-part="${part}"]`);
  const buttons = partSection.querySelectorAll('.color-button');
  buttons.forEach(btn => btn.classList.remove('selected'));
  partSection.querySelector(`.color-button[data-code="${color.code}"]`).classList.add('selected');

  // 選択中の色情報を更新
  const swatch = partSection.querySelector('.selected-color-swatch');
  const label = partSection.querySelector('.selected-color-name');
  applySwatchStyle(swatch, color);
  label.textContent = `${color.code} - ${color.name}`;

  // プレビューを更新
  updatePreview();

  // URLパラメータを更新
  updateURLParams();
}

/**
 * 描画完了を待つヘルパー
 */
async function waitForRender() {
  while (pendingRender) {
    await pendingRender;
  }
}

/**
 * プレビューを更新（非同期）
 */
async function updatePreview() {
  const currentVersion = ++renderVersion;

  // 新しいレンダリングPromiseを作成
  const renderPromise = (async () => {
    const width = partImages.A.width;
    const height = partImages.A.height;

    previewCanvas.width = width;
    previewCanvas.height = height;

    // キャンバスをクリア
    previewCtx.clearRect(0, 0, width, height);

    // ベース画像を描画（パーツと同じサイズにリサイズ）
    if (baseImage) {
      previewCtx.drawImage(baseImage, 0, 0, width, height);
    }

    // パーツを順番に描画（重ね順: D → A → C → B）
    const drawOrder = ['D', 'A', 'C', 'B'];

    for (const part of drawOrder) {
      // バージョンチェック：古いリクエストは中断
      if (renderVersion !== currentVersion) return;
      await drawPart(part, currentColors[part], currentVersion);
    }
  })();

  pendingRender = renderPromise;

  try {
    await renderPromise;
  } finally {
    // 同一性チェック：自分が最新のPromiseの場合のみクリア
    if (pendingRender === renderPromise) {
      pendingRender = null;
    }
  }
}

/**
 * パーツを描画（非同期、テクスチャ対応）
 * @param {string} part - パーツ名
 * @param {string} colorCode - 色コード
 * @param {number} version - 描画バージョン
 */
async function drawPart(part, colorCode, version) {
  if (!partImages[part]) {
    console.warn(`${part}パーツ画像がありません`);
    return;
  }

  const color = findColorByCode(colorCode);
  if (!color) {
    console.warn(`色コード ${colorCode} が見つかりません`);
    return;
  }

  console.log(`${part}パーツ描画開始: code=${colorCode}, kind=${color.kind}`);

  if (color.kind === 'texture') {
    console.log(`${part}パーツ: テクスチャモード`);
    const texture = await getTexture(colorCode);
    // バージョンチェック：await後に古いリクエストなら中断
    if (version !== undefined && version !== renderVersion) {
      console.log(`${part}パーツ: バージョンチェックで中断`);
      return;
    }
    if (!texture) {
      console.log(`${part}パーツ: テクスチャ取得失敗、フォールバック`);
      // フォールバック: 単色で描画
      drawSolidColor(part, color.hex);
      return;
    }
    // テクスチャ描画
    console.log(`${part}パーツ: テクスチャ描画開始`);
    drawTexturePart(part, texture, color);
  } else {
    console.log(`${part}パーツ: 単色モード`);
    // 単色描画
    drawSolidColor(part, color.hex);
  }
}

/**
 * 単色でパーツを描画
 * @param {string} part - パーツ名
 * @param {string} colorHex - 色コード
 */
function drawSolidColor(part, colorHex) {
  const img = partImages[part];
  const ctx = offscreenCtx[part];
  const canvas = offscreenCanvas[part];
  const partInfo = PARTS[part];

  console.log(`${part}パーツ描画開始（単色）、色: ${colorHex}`);

  // オフスクリーンCanvasに元画像を描画
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  // 画像データを取得
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Bパーツは白い部分のみ色変更（黒い線を保護）
  let convertedData;
  if (part === 'B') {
    convertedData = applyColorToWhiteParts(imageData, colorHex);
  } else {
    // 他のパーツは通常の色変換（黒保護なし）
    convertedData = applyColorToImageData(imageData, colorHex, false);
  }

  // 変換後の画像データをオフスクリーンCanvasに描画
  ctx.putImageData(convertedData, 0, 0);

  // プレビューCanvasに転送（オフセットを適用）
  previewCtx.drawImage(canvas, partInfo.offsetX, partInfo.offsetY);

  console.log(`${part}パーツ描画完了`);
}

/**
 * テクスチャでパーツを描画（シルエット維持・柄を表示）
 * テクスチャ画像はタイリング可能なパターン画像
 * @param {string} part - パーツ名
 * @param {Image} texture - テクスチャ画像（パターン画像）
 * @param {Object} color - 色オブジェクト
 */
function drawTexturePart(part, texture, color) {
  const img = partImages[part];
  const canvas = offscreenCanvas[part];
  const ctx = offscreenCtx[part];
  const partInfo = PARTS[part];

  // HTMLImageElementの場合はnaturalWidth/naturalHeightを使用
  const texWidth = texture.naturalWidth || texture.width;
  const texHeight = texture.naturalHeight || texture.height;

  console.log(`${part}パーツ描画開始（テクスチャ）、色: ${color.code}, テクスチャサイズ: ${texWidth}x${texHeight}, キャンバスサイズ: ${canvas.width}x${canvas.height}`);

  // 1. テクスチャパターンを敷き詰める
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // テクスチャのスケール（柄のサイズ調整）
  const textureScale = (color.code === 'SFC' || color.code === 'BLEP' || color.code === 'LEP' || color.code === 'SFB' || color.code === 'MST') ? 0.3 : 0.5; // SFC、BLEP、LEP、SFB、MSTは元サイズの30%、他は50%
  console.log(`テクスチャスケール: ${textureScale}, color.code: ${color.code}`);
  const scaledWidth = texWidth * textureScale;
  const scaledHeight = texHeight * textureScale;

  // テクスチャを縮小したキャンバスを作成
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = scaledWidth;
  scaledCanvas.height = scaledHeight;
  const scaledCtx = scaledCanvas.getContext('2d');
  scaledCtx.drawImage(texture, 0, 0, scaledWidth, scaledHeight);

  // テクスチャ画像を直接描画してタイリング（createPatternが失敗する場合のフォールバック）
  try {
    const pattern = ctx.createPattern(scaledCanvas, 'repeat');

    if (!pattern) {
      console.error(`パターン作成失敗: ${part}、手動タイリングに切り替え`);
      // 手動タイリング
      for (let y = 0; y < canvas.height; y += scaledHeight) {
        for (let x = 0; x < canvas.width; x += scaledWidth) {
          ctx.drawImage(scaledCanvas, x, y);
        }
      }
    } else {
      console.log(`パターン作成成功: ${part}`);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } catch (e) {
    console.error(`テクスチャ描画エラー: ${part}`, e);
    drawSolidColor(part, color.hex);
    return;
  }

  console.log(`テクスチャパターン描画完了: ${part}`);

  // 2. パーツのシルエットでマスク（globalCompositeOperationを使用）
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  console.log(`シルエットマスク完了: ${part}`);

  // 3. Bパーツの黒ライン保護
  if (part === 'B') {
    console.log(`Bパーツ黒ライン保護開始`);
    const blackLineCanvas = document.createElement('canvas');
    blackLineCanvas.width = canvas.width;
    blackLineCanvas.height = canvas.height;
    const blackLineCtx = blackLineCanvas.getContext('2d');
    blackLineCtx.drawImage(img, 0, 0);
    const imgData = blackLineCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a > 200 && r < 30 && g < 30 && b < 30) {
        data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }
    blackLineCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(blackLineCanvas, 0, 0);
    console.log(`Bパーツ黒ライン保護完了`);
  }

  // 4. プレビューCanvasに転送（オフセット適用）
  previewCtx.drawImage(canvas, partInfo.offsetX, partInfo.offsetY);

  console.log(`${part}パーツ描画完了（テクスチャ）`);
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
  // リセットボタン
  document.getElementById('resetButton').addEventListener('click', resetToInitial);

  // エクスポートボタン
  document.getElementById('exportButton').addEventListener('click', exportPNG);

  // URLパラメータから状態を復元
  if (window.location.search) {
    loadFromURLParams();
  }
}

/**
 * 初期状態にリセット
 */
function resetToInitial() {
  currentColors = { ...INITIAL_COLORS };

  // UIを更新
  Object.keys(PARTS).forEach(part => {
    const colorCode = currentColors[part];
    const color = findColorByCode(colorCode);
    const partSection = document.querySelector(`.part-section[data-part="${part}"]`);

    const buttons = partSection.querySelectorAll('.color-button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    partSection.querySelector(`.color-button[data-code="${colorCode}"]`).classList.add('selected');

    const swatch = partSection.querySelector('.selected-color-swatch');
    const label = partSection.querySelector('.selected-color-name');
    applySwatchStyle(swatch, color);
    label.textContent = `${color.code} - ${color.name}`;
  });

  updatePreview();
  updateURLParams();
}

/**
 * PNGとしてエクスポート（非同期）
 */
async function exportPNG() {
  // 描画完了を待つ
  await waitForRender();

  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  const colors = Object.values(currentColors).join('-');
  link.download = `DRYSUITS-${colors}-${timestamp}.png`;
  link.href = previewCanvas.toDataURL('image/png');
  link.click();
}

/**
 * URLパラメータを更新
 */
function updateURLParams() {
  const params = new URLSearchParams();
  Object.keys(currentColors).forEach(part => {
    params.set(part, currentColors[part]);
  });
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newURL);
}

/**
 * URLパラメータから状態を復元
 */
function loadFromURLParams() {
  const params = new URLSearchParams(window.location.search);

  Object.keys(PARTS).forEach(part => {
    const code = params.get(part);
    const color = findColorByCode(code);

    if (color) {
      selectColor(part, color);
    }
  });
}

/**
 * JSON形式で現在の状態を取得
 * @returns {string} JSON文字列
 */
function getStateAsJSON() {
  return JSON.stringify(currentColors, null, 2);
}

/**
 * JSONから状態を復元
 * @param {string} json - JSON文字列
 */
function loadStateFromJSON(json) {
  try {
    const state = JSON.parse(json);
    Object.keys(state).forEach(part => {
      if (state[part] && PARTS[part]) {
        // 新形式（codeのみ）と旧形式（{ code, hex }）の両方に対応
        let code;
        if (typeof state[part] === 'string') {
          code = state[part];
        } else if (state[part].code) {
          code = state[part].code;
        }

        if (code) {
          const color = findColorByCode(code);
          if (color) {
            selectColor(part, color);
          }
        }
      }
    });
  } catch (e) {
    console.error('JSONの解析に失敗しました:', e);
  }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
