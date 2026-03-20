# カラーシミュレーターの色選択変更プラン

## Context

カラーシミュレーター（http://localhost:8001/simulator）の色選択機能を変更し、`カラー一覧/一覧/` フォルダにある全画像を選択可能にする。

現在のシミュレーターは16色の固定パレットを使用している。`カラー一覧/一覧/` には以下の画像が存在する：
- 30色のスウォッチ（swatch_01_01.png〜swatch_03_10.png）
- 柄画像（leopard.png, zebra.png等 6枚）
- その他（monstera.png, heart.png, coyote.png, smooth_skin.png, mesh_skin.png）

**仕様**: ファイル名をそのままcodeとして使用する。

## 実装方針

### 1. 色データの抽出

`カラー一覧/一覧/` フォルダにあるPNGファイルから以下を抽出（`preview_all.png`は除外）：

- **code**: ファイル名（拡張子除く）例: `swatch_01_01`, `leopard`, `monstera`
- **name**: ファイル名から変換（スネークケース→スペース区切り＋先頭大文字）例: `swatch_01_01` → `Swatch 01 01`
- **hex**: 画像の中央領域（中央20%）のピクセル値の中央値

**対象ファイル数**: 41個（30色スウォッチ + 6柄 + 5その他）

### 2. カラーパレットデータの更新

**ファイル**: `simulator/js/palette.js`

現在の16色の定義を全画像（41個）に置き換える。

変更後の形式：
```javascript
const COLOR_PALETTE = [
  { code: 'swatch_01_01', name: 'Swatch 01 01', hex: '#1a1a1a' },
  { code: 'swatch_01_02', name: 'Swatch 01 02', hex: '#2d2d2d' },
  { code: 'leopard', name: 'Leopard', hex: '#8b7355' },
  { code: 'zebra', name: 'Zebra', hex: '#1a1a1a' },
  // ... 全画像分
];
```

### 3. 初期色設定の更新

**ファイル**: `simulator/js/simulator.js`

INITIAL_COLORSを更新（codeとhexの両方を同期）：
```javascript
const INITIAL_COLORS = {
  A: { code: 'swatch_01_01', hex: '#1a1a1a' },  // 例：黒系
  B: { code: 'swatch_01_02', hex: '#f5f5f5' },  // 例：白系
  C: { code: 'swatch_01_03', hex: '#d4c4a8' },  // 例：ベージュ系
  D: { code: 'swatch_01_04', hex: '#4a4a4a' }   // 例：グレー系
};
```

**注意**: INITIAL_COLORSのcodeは必ずCOLOR_PALETTE内に存在するものにする。

### 4. 既存URL互換性について

既存の共有URL（`?A=BK&B=WH...`）は機能しなくなるため、移行処理は実装せず切り捨てる。

## 変更対象ファイル

1. `simulator/js/palette.js` - メインのカラーパレット定義
2. `simulator/js/simulator.js` - 初期色設定（INITIAL_COLORS）

## 実装手順

1. **Pythonスクリプトを作成**: `カラー一覧/一覧/` の全PNGからcode/name/hexを抽出
2. **HEX抽出ロジック**: 中央領域（中央20%）のピクセル値の中央値を使用（アンチエイリアス対策）
3. **COLOR_PALETTE生成**: 抽出データからJavaScript配列形式で出力
4. **palette.js更新**: 生成したCOLOR_PALETTEで上書き
5. **INITIAL_COLORS更新**: 適切な初期色4色を選定し、codeとhexの両方を設定
6. **整合性チェック**: INITIAL_COLORSの全codeがCOLOR_PALETTEに存在することを確認
7. **動作確認**: シミュレーターで表示と動作をテスト

## 検証方法

1. シミュレーターを起動（http://localhost:8001/simulator）
2. カラーパレットに全41個が表示されていることを確認（`preview_all.png`は除外されていること）
3. 各パーツ（A/B/C/D）の色変更が正常に動作することを確認
4. **新形式URLパラメータ**（`?A=swatch_01_01&B=swatch_01_02...`）による状態保存・復元が正常に動作することを確認
5. カラーボタンの表示崩れ（長いcode名による折返し等）がないことを確認
6. INITIAL_COLORSの全codeがCOLOR_PALETTEに存在することを確認（null参照エラーがないこと）
