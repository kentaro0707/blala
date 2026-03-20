/**
 * カラーパレットデータ定義
 *
 * このファイルで色の追加・変更・削除を行えます
 * 各色は以下のプロパティを持ちます：
 * - code: 品番コード（省略形、URL保存などに使用）
 * - name: 色の表示名
 * - hex: 16進数カラーコード
 */

const COLOR_PALETTE = [
  { code: 'black_leopard', name: 'Black Leopard', hex: '#2c292a' },
  { code: 'coyote', name: 'Coyote', hex: '#bd9c72' },
  { code: 'desert_camouflage', name: 'Desert Camouflage', hex: '#aa9784' },
  { code: 'heart', name: 'Heart', hex: '#e68a8a' },
  { code: 'jellyfish', name: 'Jellyfish', hex: '#7fadda' },
  { code: 'leopard', name: 'Leopard', hex: '#835f4b' },
  { code: 'mesh_skin', name: 'Mesh Skin', hex: '#3e3e3f' },
  { code: 'monstera', name: 'Monstera', hex: '#d9d9d9' },
  { code: 'sea', name: 'Sea', hex: '#7da0af' },
  { code: 'smooth_skin', name: 'Smooth Skin', hex: '#898a8d' },
  { code: 'swatch_01_01', name: 'Swatch 01 01', hex: '#221f20' },
  { code: 'swatch_01_02', name: 'Swatch 01 02', hex: '#ffffff' },
  { code: 'swatch_01_03', name: 'Swatch 01 03', hex: '#db3931' },
  { code: 'swatch_01_04', name: 'Swatch 01 04', hex: '#822458' },
  { code: 'swatch_01_05', name: 'Swatch 01 05', hex: '#461710' },
  { code: 'swatch_01_06', name: 'Swatch 01 06', hex: '#4eacbc' },
  { code: 'swatch_01_07', name: 'Swatch 01 07', hex: '#84c6c2' },
  { code: 'swatch_01_08', name: 'Swatch 01 08', hex: '#dd5380' },
  { code: 'swatch_01_09', name: 'Swatch 01 09', hex: '#eae868' },
  { code: 'swatch_01_10', name: 'Swatch 01 10', hex: '#2a486d' },
  { code: 'swatch_02_01', name: 'Swatch 02 01', hex: '#030c4c' },
  { code: 'swatch_02_02', name: 'Swatch 02 02', hex: '#2b3890' },
  { code: 'swatch_02_03', name: 'Swatch 02 03', hex: '#3d8acd' },
  { code: 'swatch_02_04', name: 'Swatch 02 04', hex: '#44474f' },
  { code: 'swatch_02_05', name: 'Swatch 02 05', hex: '#bcbdc0' },
  { code: 'swatch_02_06', name: 'Swatch 02 06', hex: '#64643f' },
  { code: 'swatch_02_07', name: 'Swatch 02 07', hex: '#213e25' },
  { code: 'swatch_02_08', name: 'Swatch 02 08', hex: '#eca34f' },
  { code: 'swatch_02_09', name: 'Swatch 02 09', hex: '#bfd462' },
  { code: 'swatch_02_10', name: 'Swatch 02 10', hex: '#a23684' },
  { code: 'swatch_03_01', name: 'Swatch 03 01', hex: '#878282' },
  { code: 'swatch_03_02', name: 'Swatch 03 02', hex: '#90b598' },
  { code: 'swatch_03_03', name: 'Swatch 03 03', hex: '#96846e' },
  { code: 'swatch_03_04', name: 'Swatch 03 04', hex: '#7796b6' },
  { code: 'swatch_03_05', name: 'Swatch 03 05', hex: '#ae7566' },
  { code: 'swatch_03_06', name: 'Swatch 03 06', hex: '#3e4445' },
  { code: 'swatch_03_07', name: 'Swatch 03 07', hex: '#7c7c80' },
  { code: 'swatch_03_08', name: 'Swatch 03 08', hex: '#6d726e' },
  { code: 'swatch_03_09', name: 'Swatch 03 09', hex: '#63755d' },
  { code: 'swatch_03_10', name: 'Swatch 03 10', hex: '#373837' },
  { code: 'zebra', name: 'Zebra', hex: '#f5f5f5' }
];

/**
 * パレット内の色を品番コードから検索
 * @param {string} code - 品番コード
 * @returns {Object|null} 色オブジェクト、見つからない場合はnull
 */
function findColorByCode(code) {
  return COLOR_PALETTE.find(c => c.code === code) || null;
}

/**
 * パレット内の色をHEX値から検索
 * @param {string} hex - 16進数カラーコード
 * @returns {Object|null} 色オブジェクト、見つからない場合はnull
 */
function findColorByHex(hex) {
  return COLOR_PALETTE.find(c => c.hex.toLowerCase() === hex.toLowerCase()) || null;
}
