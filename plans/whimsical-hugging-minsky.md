# mesh_skinをテクスチャに変更する計画

## Context
ユーザーが提供したメッシスキン画像（ダークグレー基調のメッシュパターンテクスチャ）を使用して、現在単色として定義されている`mesh_skin`をテクスチャ形式に変更する。日本語ファイル名「メッシスキン.png」をそのまま使用する。

## 現状
- **palette.js 19行目**: `{ code: 'mesh_skin', name: 'Mesh Skin', hex: '#3e3e3f' }` （単色）
- **palette_new.js 9行目**: 同上
- **画像ファイル**: `カラー一覧/一覧/メッシスキン.png` が存在
- **processed画像**: まだ存在しない

## 実装手順

### 1. process_patterns.pyの修正

#### 1-1. PATTERNSリストにmesh_skinを追加（39行目）
**修正前:**
```python
PATTERNS = ['LEP', 'ASH', 'SEA', 'BCF', 'BLEP', 'CFC']
```
**修正後:**
```python
PATTERNS = ['LEP', 'ASH', 'SEA', 'BCF', 'BLEP', 'CFC', 'mesh_skin']
```

#### 1-2. 日本語ファイル名対応の処理を追加（145-146行目）
**修正前:**
```python
    # 画像読み込み
    input_path = INPUT_DIR / f"{code}.png"
```
**修正後:**
```python
    # 画像読み込み - mesh_skinは日本語ファイル名を使用
    if code == 'mesh_skin':
        input_path = INPUT_DIR / "メッシスキン.png"
    else:
        input_path = INPUT_DIR / f"{code}.png"
```

#### 1-3. mesh_skinを既存の処理条件に追加（205行目）
mesh_skinは既にシームレスなパターンのため、BLEPやCFCと同じ処理を使用：
**修正前:**
```python
    elif code == 'BLEP' or code == 'CFC':
```
**修正後:**
```python
    elif code == 'BLEP' or code == 'CFC' or code == 'mesh_skin':
```

### 2. テクスチャ画像の生成
```bash
cd カラー一覧 && python process_patterns.py
```
これにより `カラー一覧/一覧/processed/mesh_skin_processed_thumb.png` が生成される。

### 3. palette.jsの修正（19行目）
**修正前:**
```javascript
{ code: 'mesh_skin', name: 'Mesh Skin', hex: '#3e3e3f' }
```
**修正後:**
```javascript
{ code: 'mesh_skin', name: 'Mesh Skin', hex: '#3e3e3f', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/mesh_skin_processed_thumb.png' }
```

### 4. palette_new.jsの修正（9行目）
**修正前:**
```javascript
{ code: 'mesh_skin', name: 'Mesh Skin', hex: '#3e3e3f' }
```
**修正後:**
```javascript
{ code: 'mesh_skin', name: 'Mesh Skin', hex: '#3e3e3f', kind: 'texture', texturePath: '../カラー一覧/一覧/processed/mesh_skin_processed_thumb.png' }
```

## 変更ファイル
1. `カラー一覧/process_patterns.py` （PATTERNSリストに追加、日本語ファイル名対応、処理条件に追加）
2. `simulator/js/palette.js` （mesh_skin定義をテクスチャに変更）
3. `simulator/js/palette_new.js` （mesh_skin定義をテクスチャに変更）

## 確認方法
1. `cd カラー一覧 && python process_patterns.py` を実行してエラーがないことを確認
2. processedディレクトリに`mesh_skin_processed_thumb.png`が生成されたことを確認
3. シミュレーターを開き、mesh_skinを選択してテクスチャが正しく表示されることを確認
