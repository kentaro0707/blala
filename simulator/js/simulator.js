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
  A: { code: 'swatch_03_01', hex: '#878282' },  // Gray
  B: { code: 'swatch_01_02', hex: '#ffffff' },  // White
  C: { code: 'coyote', hex: '#bd9c72' },        // Beige
  D: { code: 'swatch_03_10', hex: '#373837' }   // Dark Gray
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
    img.onload = () => {
      baseImage = img;
      resolve();
    };
    img.onerror = () => reject(new Error('ベース画像の読み込みに失敗しました'));
    img.src = `../DRYSUITS Graphite α.png`;
  });
  loadPromises.push(basePromise);

  // パーツ画像を読み込み
  for (const part of ['A', 'B', 'C', 'D']) {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        partImages[part] = img;

        // オフスクリーンCanvasのサイズを設定
        offscreenCanvas[part].width = img.width;
        offscreenCanvas[part].height = img.height;

        resolve();
      };
      img.onerror = () => reject(new Error(`${part}-parts.png の読み込みに失敗しました`));
      img.src = `../parts/${part}-parts.png`;
    });
    loadPromises.push(promise);
  }

  try {
    await Promise.all(loadPromises);
    console.log('画像を読み込みました');
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
  const initialColor = INITIAL_COLORS[part];

  section.innerHTML = `
    <div class="part-header">
      <h3>${partInfo.name}</h3>
      <p class="part-description">${partInfo.description}</p>
      <div class="selected-color-info">
        <span class="selected-color-swatch" style="background-color: ${initialColor.hex}"></span>
        <span class="selected-color-name">${initialColor.code} - ${findColorByCode(initialColor.code).name}</span>
      </div>
    </div>
    <div class="color-palette" id="palette-${part}"></div>
  `;

  // パレットボタンを生成
  const paletteContainer = section.querySelector(`#palette-${part}`);

  COLOR_PALETTE.forEach(color => {
    const button = document.createElement('button');
    button.className = 'color-button';
    button.dataset.code = color.code;
    button.dataset.hex = color.hex;
    button.title = `${color.code} - ${color.name}`;

    // 色見本
    const swatch = document.createElement('span');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color.hex;

    // 色名と品番
    const label = document.createElement('span');
    label.className = 'color-label';
    label.textContent = color.code;

    button.appendChild(swatch);
    button.appendChild(label);

    // 初期選択状態
    if (color.code === initialColor.code) {
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
  // 状態を更新
  currentColors[part] = { code: color.code, hex: color.hex };

  // 選択状態のUIを更新
  const partSection = document.querySelector(`.part-section[data-part="${part}"]`);
  const buttons = partSection.querySelectorAll('.color-button');
  buttons.forEach(btn => btn.classList.remove('selected'));
  partSection.querySelector(`.color-button[data-code="${color.code}"]`).classList.add('selected');

  // 選択中の色情報を更新
  const swatch = partSection.querySelector('.selected-color-swatch');
  const label = partSection.querySelector('.selected-color-name');
  swatch.style.backgroundColor = color.hex;
  label.textContent = `${color.code} - ${color.name}`;

  // プレビューを更新
  updatePreview();

  // URLパラメータを更新
  updateURLParams();
}

/**
 * プレビューを更新
 */
function updatePreview() {
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

  drawOrder.forEach(part => {
    drawPart(part, currentColors[part].hex);
  });
}

/**
 * パーツを描画
 * @param {string} part - パーツ名
 * @param {string} colorHex - 色コード
 */
function drawPart(part, colorHex) {
  if (!partImages[part]) return;

  const img = partImages[part];
  const ctx = offscreenCtx[part];
  const canvas = offscreenCanvas[part];
  const partInfo = PARTS[part];

  // オフスクリーンCanvasに元画像を描画
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  // 画像データを取得
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 色変換を適用（Bパーツのみ黒保護有効）
  const preserveBlack = (part === 'B');
  const convertedData = applyColorToImageData(imageData, colorHex, preserveBlack);

  // 変換後の画像データをオフスクリーンCanvasに描画
  ctx.putImageData(convertedData, 0, 0);

  // プレビューCanvasに転送（オフセットを適用）
  previewCtx.drawImage(
    canvas,
    partInfo.offsetX,
    partInfo.offsetY
  );
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
    const color = currentColors[part];
    const partSection = document.querySelector(`.part-section[data-part="${part}"]`);

    const buttons = partSection.querySelectorAll('.color-button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    partSection.querySelector(`.color-button[data-code="${color.code}"]`).classList.add('selected');

    const swatch = partSection.querySelector('.selected-color-swatch');
    const label = partSection.querySelector('.selected-color-name');
    swatch.style.backgroundColor = color.hex;
    label.textContent = `${color.code} - ${findColorByCode(color.code).name}`;
  });

  updatePreview();
  updateURLParams();
}

/**
 * PNGとしてエクスポート
 */
function exportPNG() {
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  const colors = Object.values(currentColors).map(c => c.code).join('-');
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
    params.set(part, currentColors[part].code);
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
        const color = findColorByCode(state[part].code) || state[part];
        if (color.hex) {
          selectColor(part, color);
        }
      }
    });
  } catch (e) {
    console.error('JSONの解析に失敗しました:', e);
  }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
