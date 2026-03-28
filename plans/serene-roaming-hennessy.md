# NVY_white.png の色を #030C4C に変更

## Context
ユーザーがNVY（ネイビー）の色をカラーコード「#030C4C」に変更するよう依頼。
調査の結果、Bパーツ用の画像ファイル `NVY_white.png` が正しいネイビー色になっていないことが判明。

## 問題
`カラー一覧/一覧/NVY_white.png` 画像が正しいネイビー色（#030C4C）になっていない。
現在は薄い紫がかった青色（ライトパープル/ラベンダー）になっている。

**元の画像情報:**
- サイズ: 8192 x 8192 ピクセル
- フォーマット: PNG (RGBA, 8-bit/color)

## 修正内容

### 1. NVY_white.png を #030C4C に変更
**ファイル**: `カラー一覧/一覧/NVY_white.png`

PythonのPillowライブラリを使用して、画像を正しいネイビー色（#030C4C）で作成し直す。

```python
from PIL import Image

# ネイビー色 #030C4C (RGB)
navy_color = (3, 12, 76)

# 元の画像と同じサイズ (8192x8192) でRGBA画像を作成
img = Image.new('RGBA', (8192, 8192), navy_color + (255,))
img.save('カラー一覧/一覧/NVY_white.png')
print("NVY_white.png を作成しました: 8192x8192, #030C4C")
```

### 2. 確認事項
- `simulator/js/palette.js` のNVY定義は既に `#030c4c` で正しい（変更不要）
- シミュレーター側は単色モードで処理される

## 影響範囲
- `カラー一覧/一覧/NVY_white.png` のみ

## Verification
1. 画像を開いて色が #030C4C（RGB: 3, 12, 76）になっていることを確認
2. `sips -g all カラー一覧/一覧/NVY_white.png` で画像情報を確認
3. Pythonスクリプトでピクセル値をサンプリングして確認
