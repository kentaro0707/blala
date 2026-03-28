# BCFパターン更新計画

## Context

ユーザーがカラー一覧/一覧/BCF.pngを新しいグレー系迷彩パターンに更新しました。この新しいBCF画像をシミュレーターで使用できるようにする必要があります。

### 現状と問題点
- `/カラー一覧/一覧/BCF.png` - 新しいグレー系迷彩パターン画像に更新済み
- `/カラー一覧/一覧/processed/BCF_processed_thumb.png` - 処理済み画像が存在するが更新が必要
- **`simulator/js/palette.js` - BCFがテクスチャとして定義されていない（重要！）**

現在のpalette.jsのBCF定義：
```javascript
{ code: 'BCF', name: 'Bcf', hex: '#373837' },
```

BLEPやCFC（テクスチャ）の定義：
```javascript
{ code: 'BLEP', name: 'Blep', hex: '#1A1A1A', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/BLEP_processed_thumb.png' },
{ code: 'CFC', name: 'Cfc', hex: '#4a7c59', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/CFC_processed_thumb.png' },
```

**BCFには `kind: 'texture'` と `texturePath` が設定されていません！**

### 画像分析結果
添付されたBCF画像は：
- **色**: グレースケール（白・黒・灰）の3色で構成
- **パターン**: 不規則な斑点（アメーバ状）が重なり合う構成
- **特徴**: シームレステクスチャとして使用可能

## Implementation Plan

### Step 1: process_patterns.pyを実行してBCF画像を処理
`process_patterns.py`を使用して、新しいBCF画像をシームレステクスチャとして処理し、512x512サイズの処理済み画像を生成します。

```bash
python3 カラー一覧/process_patterns.py
```

このスクリプトは以下の処理を行います：
1. 元画像の読み込み
2. 2x2タイリングによる繊細化
3. シームレス化（Offset-and-Blend法）
4. 512x512にリサイズして保存

### Step 2: palette.jsのBCF定義をテクスチャに変更
現在の定義：
```javascript
{ code: 'BCF', name: 'Bcf', hex: '#373837' },
```

新しい定義：
```javascript
{ code: 'BCF', name: 'Bcf', hex: '#373837', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/BCF_processed_thumb.png' },
```

### Step 3: シミュレーターでの動作確認
シミュレーターを開き、BCFパターンが正しく表示されることを確認します。

## Critical Files

- `/カラー一覧/一覧/BCF.png` - 元画像（既に更新済み）
- `/カラー一覧/一覧/processed/BCF_processed_thumb.png` - 処理済み画像（更新対象）
- `/カラー一覧/process_patterns.py` - 画像処理スクリプト
- `/simulator/js/palette.js` - パレット定義（**テクスチャ設定を追加**）

## Verification

1. process_patterns.pyが正常に完了することを確認
2. processed/BCF_processed_thumb.pngが更新されていることを確認（タイムスタンプ）
3. palette.jsでBCFにテクスチャ設定が追加されていることを確認
4. シミュレーターでBCFを選択した際、新しいグレー系迷彩パターンが表示されることを確認
