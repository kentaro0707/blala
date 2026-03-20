# カラーシミュレーターのカラー差し替え計画

## Context

「カラー」フォルダ内の6つの画像（C1.png〜C6.png）から抽出したカラーを、カラーシミュレーターのカラーパレットに反映する必要があります。

## 抽出したカラー一覧（正確なHEXコード）

### C1.png - 29色のカラーバリエーション
| コード | 名称 | HEXコード |
|--------|------|-----------|
| BLK | Black | #000000 |
| WHT | White | #FFFFFF |
| RED | Red | #E53935 |
| MAD | Magenta | #6A1B9A |
| TCZ | Teal | #00838F |
| PST | Pistachio | #4DB6AC |
| KPNK | Pink | #EC407A |
| KYEL | Key Yellow | #FDD835 |
| SLT | Slate | #1A237E |
| NVY | Navy | #0D47A1 |
| RYL | Royal Blue | #1E88E5 |
| BLU | Blue | #2196F3 |
| DGR | Dark Gray | #37474F |
| GRY | Gray | #BDBDBD |
| OLV | Olive | #558B2F |
| DGRN | Dark Green | #1B5E20 |
| KORG | Orange | #FF6F00 |
| KGRN | Green | #388E3C |
| VLT | Violet | #8E24AA |
| MBLK | Mono Black | #424242 |
| MGRN | Mono Green | #2E7D32 |
| MMAD | Mono Magenta | #5D4037 |
| MBLU | Mono Blue | #1976D2 |
| MRED | Mono Red | #C62828 |
| ASH | Ash | #9E9E9E |
| SFB | Silver Forest | #616161 |
| SFC | Silver Concrete | #757575 |
| CEC | Camouflage | #556B2F |
| BCF | Black Carbon | #212121 |

### C2.png - 6色のパターン
| コード | 名称 | HEXコード |
|--------|------|-----------|
| BLEP | Black Leopard | #1A1A1A |
| LEP | Leopard | #D2B48C |
| ZEB | Zebra | #FFFFFF |
| DCF | Desert Camouflage | #8B7355 |
| SEA | Sea | #87CEEB |
| JLF | Jellyfish | #1E90FF |

### C3-C6.png - クラシックカラー
| コード | 名称 | HEXコード |
|--------|------|-----------|
| GRYC | Gray Classic | #E0E0E0 |
| REDC | Red Classic | #D62828 |
| BEGC | Beige Classic | #B9976B |
| GRYMC | Gray Mono | #808080 |

## 最終カラーパレット（重複排除済み）

全40色を統合。重複するHEXコードは最初のものを優先。

```javascript
const COLOR_PALETTE = [
  // C1.png - 29色
  { code: 'BLK', name: 'Black', hex: '#000000' },
  { code: 'WHT', name: 'White', hex: '#FFFFFF' },
  { code: 'RED', name: 'Red', hex: '#E53935' },
  { code: 'MAD', name: 'Magenta', hex: '#6A1B9A' },
  { code: 'TCZ', name: 'Teal', hex: '#00838F' },
  { code: 'PST', name: 'Pistachio', hex: '#4DB6AC' },
  { code: 'KPNK', name: 'Pink', hex: '#EC407A' },
  { code: 'KYEL', name: 'Key Yellow', hex: '#FDD835' },
  { code: 'SLT', name: 'Slate', hex: '#1A237E' },
  { code: 'NVY', name: 'Navy', hex: '#0D47A1' },
  { code: 'RYL', name: 'Royal Blue', hex: '#1E88E5' },
  { code: 'BLU', name: 'Blue', hex: '#2196F3' },
  { code: 'DGR', name: 'Dark Gray', hex: '#37474F' },
  { code: 'GRY', name: 'Gray', hex: '#BDBDBD' },
  { code: 'OLV', name: 'Olive', hex: '#558B2F' },
  { code: 'DGRN', name: 'Dark Green', hex: '#1B5E20' },
  { code: 'KORG', name: 'Orange', hex: '#FF6F00' },
  { code: 'KGRN', name: 'Green', hex: '#388E3C' },
  { code: 'VLT', name: 'Violet', hex: '#8E24AA' },
  { code: 'MBLK', name: 'Mono Black', hex: '#424242' },
  { code: 'MGRN', name: 'Mono Green', hex: '#2E7D32' },
  { code: 'MMAD', name: 'Mono Magenta', hex: '#5D4037' },
  { code: 'MBLU', name: 'Mono Blue', hex: '#1976D2' },
  { code: 'MRED', name: 'Mono Red', hex: '#C62828' },
  { code: 'ASH', name: 'Ash', hex: '#9E9E9E' },
  { code: 'SFB', name: 'Silver Forest', hex: '#616161' },
  { code: 'SFC', name: 'Silver Concrete', hex: '#757575' },
  { code: 'CEC', name: 'Camouflage', hex: '#556B2F' },
  { code: 'BCF', name: 'Black Carbon', hex: '#212121' },
  // C2.png - 6色
  { code: 'BLEP', name: 'Black Leopard', hex: '#1A1A1A' },
  { code: 'LEP', name: 'Leopard', hex: '#D2B48C' },
  { code: 'ZEB', name: 'Zebra', hex: '#FFFFFF' },
  { code: 'DCF', name: 'Desert Camo', hex: '#8B7355' },
  { code: 'SEA', name: 'Sea', hex: '#87CEEB' },
  { code: 'JLF', name: 'Jellyfish', hex: '#1E90FF' },
  // C3-C6 - 4色（重複を除外）
  { code: 'GRYC', name: 'Gray Classic', hex: '#E0E0E0' },
  { code: 'REDC', name: 'Red Classic', hex: '#D62828' },
  { code: 'BEGC', name: 'Beige Classic', hex: '#B9976B' },
  { code: 'GRYMC', name: 'Gray Mono', hex: '#808080' }
];
```

## 実装計画

### 変更対象ファイル
- `simulator/js/palette.js`

### 変更内容
既存の`COLOR_PALETTE`配列（15色）を、新しい40色のカラーパレットで完全に置き換えます。

### 検証方法
1. ブラウザで`simulator/index.html`を開く
2. カラーパレットに新しい40色が表示されていることを確認
3. 各色を選択してプレビューに反映されることを確認
