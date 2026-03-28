# Pattern Refinement Skill

柄テクスチャの繊細化（高密度化）処理を実行するスキルです。

## Usage

```
/refine-pattern [pattern] [factor]
```

- `pattern`: 処理対象のパターンコード（例: ASH, BCF, LEP, SEA, BLEP）
- `factor`: タイリング係数（省略時は現在の設定値を使用）

## Examples

```
/refine-pattern ASH 1.5    # ASHを係数1.5で繊細化（柄を67%に縮小）
/refine-pattern ASH        # ASHを現在の設定で再処理
/refine-pattern BCF 2      # BCFを係数2で繊細化
```

## Instructions

ユーザーがこのスキルを呼び出したら、以下の手順を実行してください：

### Step 1: パラメータの解析

1. 引数からパターンコード（pattern）とタイリング係数（factor）を抽出
2. patternが指定されていない場合は、ユーザーに確認
3. factorが指定されていない場合は、現在の設定値を確認

### Step 2: 設定の確認・更新

`カラー一覧/process_patterns.py`の該当する設定を確認・更新：

- BCFの場合: `BCF_TILE_FACTOR`
- ASHの場合: `ASH_TILE_FACTOR`
- その他のパターンの場合: 必要に応じて新しい設定を追加

**タイリング係数と縮小率の関係:**
- 1.4 = 柄を71%に縮小
- 1.5 = 柄を67%に縮小（推奨）
- 1.6 = 柄を62.5%に縮小
- 1.7 = 柄を59%に縮小
- 2.0 = 柄を50%に縮小

### Step 3: スクリプトの実行

```bash
cd /Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala
python3 カラー一覧/process_patterns.py
```

### Step 4: 結果の確認

1. 出力ファイルのサイズを確認
2. 処理後の画像を表示して視覚的に確認
3. 必要に応じて元画像と比較

### Step 5: Web シミュレーターへの反映確認

`simulator/js/palette.js`で該当パターンの`texturePath`が正しく設定されているか確認：

```javascript
{ code: 'ASH', name: 'Ash', hex: '#3e4445', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/ASH_processed_thumb.png' },
```

## Technical Details

### 繊細化処理の仕組み

1. **初期切り出し**: 元画像の中央から4096x4096を切り出し（メモリ削減）
2. **タイリング＆ダウンスケール**:
   - 画像を1/factor倍に縮小
   - 縮小した画像をタイル配置して元のサイズに復元
   - これにより柄のモチーフは小さくなり、数は増える
3. **シームレス化**: Offset-and-Blend法でエッジを滑らかに
4. **最終リサイズ**: 512x512で出力

### 関連ファイル

- `カラー一覧/process_patterns.py` - 処理スクリプト
- `カラー一覧/一覧/*.png` - 元画像
- `カラー一覧/一覧/processed/*_processed_thumb.png` - 処理済み画像
- `simulator/js/palette.js` - パレット設定
- `simulator/js/simulator.js` - テクスチャ読み込み処理

## Notes

- 元画像は大きい場合（100MB以上）があるため、メモリ使用量に注意
- LANCZOSリサンプリングで高品質な縮小を維持
- シームレス化のブレンド幅は32pxを使用
