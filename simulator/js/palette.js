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
  { code: 'BK', name: 'Black', hex: '#1a1a1a' },
  { code: 'WH', name: 'White', hex: '#f5f5f5' },
  { code: 'DG', name: 'Dark Gray', hex: '#4a4a4a' },
  { code: 'GY', name: 'Gray', hex: '#808080' },
  { code: 'LG', name: 'Light Gray', hex: '#b8b8b8' },
  { code: 'NV', name: 'Navy', hex: '#1e3a5f' },
  { code: 'BL', name: 'Blue', hex: '#2c5aa0' },
  { code: 'RD', name: 'Red', hex: '#d62828' },
  { code: 'OR', name: 'Orange', hex: '#f77f00' },
  { code: 'YE', name: 'Yellow', hex: '#fcbf49' },
  { code: 'GR', name: 'Green', hex: '#2d6a4f' },
  { code: 'OL', name: 'Olive', hex: '#606c38' },
  { code: 'BR', name: 'Brown', hex: '#6f4e37' },
  { code: 'BE', name: 'Beige', hex: '#d4c4a8' },
  { code: 'PK', name: 'Pink', hex: '#e8985e' },
  { code: 'PU', name: 'Purple', hex: '#6a4c93' }
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
