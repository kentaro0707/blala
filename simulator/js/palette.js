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
  { code: 'NVY', name: 'Nvy', hex: '#030c4c' },
  { code: 'BLK', name: 'Blk', hex: '#221f20' },
  { code: 'MAD', name: 'Mad', hex: '#461710' },
  { code: 'BLEP', name: 'Blep', hex: '#1A1A1A', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/BLEP_processed_thumb.png' },
  { code: 'DGRN', name: 'Dgrn', hex: '#213e25' },
  { code: 'BCF', name: 'Bcf', hex: '#373837', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/BCF_processed_thumb.png' },
  { code: 'RYL', name: 'Ryl', hex: '#2b3890' },
  { code: 'mesh_skin', name: 'Mesh Skin', hex: '#3e3e3f', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/mesh_skin_processed_thumb.png' },
  { code: 'ASH', name: 'Ash', hex: '#3e4445', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/ASH_processed_thumb.png' },
  { code: 'SLT', name: 'Slt', hex: '#2a486d' },
  { code: 'wine', name: 'Wine', hex: '#822458' },
  { code: 'DGR', name: 'Dgr', hex: '#44474f' },
  { code: 'OLV', name: 'Olv', hex: '#64643f' },
  { code: 'VLT', name: 'Vlt', hex: '#a23684' },
  { code: 'LEP', name: 'Lep', hex: '#835f4b', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/LEP_processed_thumb.png' },
  { code: 'RED', name: 'Red', hex: '#db3931' },
  { code: 'CFC', name: 'Cfc', hex: '#4a7c59', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/CFC_processed_thumb.png' },
  { code: 'SFC', name: 'Sfc', hex: '#6d726e', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/SFC_processed_thumb.png' },
  { code: 'BLU', name: 'Blu', hex: '#3d8acd' },
  { code: 'SFB', name: 'Sfb', hex: '#7c7c80', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/SFB_processed_thumb.png' },
  { code: 'KPNK', name: 'Kpnk', hex: '#dd5380' },
  { code: 'MBLK', name: 'Mblk', hex: '#878282', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/MBLK_processed_thumb.png' },
  { code: 'MRED', name: 'Mred', hex: '#ae7566', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/MRED_processed_thumb.png' },
  { code: 'MMAD', name: 'Mmad', hex: '#96846e', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/MMAD_processed_thumb.png' },
  { code: 'smooth_skin', name: 'Smooth Skin', hex: '#898a8d', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/smooth_skin_processed_thumb.png' },
  { code: 'MBLU', name: 'Mblu', hex: '#7796b6', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/MBLU_processed_thumb.png' },
  { code: 'TCZ', name: 'Tcz', hex: '#4eacbc' },
  { code: 'SEA', name: 'Sea', hex: '#7da0af', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/SEA_processed_thumb.png' },
  { code: 'DCF', name: 'Dcf', hex: '#aa9784', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/DCF_processed_thumb.png' },
  { code: 'CYT', name: 'Cyt', hex: '#bd9c72' },
  { code: 'JLF', name: 'Jlf', hex: '#7fadda', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/JLF_processed_thumb.png' },
  { code: 'HAT', name: 'Hat', hex: '#e68a8a', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/HAT_processed_thumb.png' },
  { code: 'MGRN', name: 'Mgrn', hex: '#90b598', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/MGRN_processed_thumb.png' },
  { code: 'KORG', name: 'Korg', hex: '#eca34f' },
  { code: 'PST', name: 'Pst', hex: '#84c6c2' },
  { code: 'GRY', name: 'Gry', hex: '#bcbdc0' },
  { code: 'KGRN', name: 'Kgrn', hex: '#bfd462' },
  { code: 'MST', name: 'Mst', hex: '#d9d9d9', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/MST_processed_thumb.png' },
  { code: 'KYEL', name: 'Kyel', hex: '#eae868' },
  { code: 'zebra', name: 'Zebra', hex: '#f5f5f5', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/zebra_processed_thumb.png' },
  { code: 'WHT', name: 'Wht', hex: '#ffffff' }
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
