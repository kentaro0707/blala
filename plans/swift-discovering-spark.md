# カラーパレットへの柄（texture）設定追加計画

## Context
`カラー一覧/一覧/processed/` ディレクトリに加工済みの柄サムネイル画像が18個存在するが、現在palette.jsでtexture設定が適用されているのは4色のみ（BLEP, BCF, mesh_skin, CFC）。

ユーザーの要望により、processed画像が存在するすべての色にtexture設定を追加し、シミュレーターで柄を正しく表示できるようにする。

## 対象ファイル
- `/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/simulator/js/palette.js`

## 変更内容

palette.jsの以下の14色に `kind: 'texture'` と `texturePath` を追加：

| Code | 現在の行 | 変更内容 |
|------|---------|---------|
| ASH | 20 | texture設定追加 |
| LEP | 26 | texture設定追加 |
| CFC | 28 | 既存（確認のみ）|
| SFC | 29 | texture設定追加 |
| SFB | 31 | texture設定追加 |
| MBLK | 33 | texture設定追加 |
| MRED | 34 | texture設定追加 |
| MMAD | 35 | texture設定追加 |
| MBLU | 37 | texture設定追加 |
| SEA | 39 | texture設定追加 |
| JLF | 42 | texture設定追加 |
| HAT | 43 | texture設定追加 |
| MGRN | 44 | texture設定追加 |
| MST | 49 | texture設定追加 |
| zebra | 51 | texture設定追加 |

## 変更例

```javascript
// 変更前
{ code: 'ASH', name: 'Ash', hex: '#3e4445' },

// 変更後
{ code: 'ASH', name: 'Ash', hex: '#3e4445', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/ASH_processed_thumb.png' },
```

## Verification
1. シミュレーター（simulator/index.html）をブラウザで開く
2. 各パーツ（A, B, C, D）で追加した柄を選択
3. 柄が正しく表示されることを確認
4. コンソールにエラーがないことを確認
