# BCF画像の四隅のボヤけた線修正計画

## Context
`BCF_processed_thumb.png` の四隅に白いボヤけた線が表示されている。
元の `BCF.png` は四隅が綺麗だが、`process_patterns.py` の `make_seamless` 関数でシームレス化処理を行った際に、四隅のブレンド処理が重複してアーティファクトが発生している。

## 原因分析
`make_seamless` 関数（process_patterns.py:106-131）で：
- 上下エッジと左右エッジそれぞれにグラデーションマスクを適用
- 四隅では両方のマスクが重なり、角が最も明るくなってしまう
- これが白いボヤけた線として表示される

## 修正アプローチ

### 推奨: BCFをシームレス化処理から除外
BCFは元々シームレスなパターンなので、`make_seamless` 処理をスキップして単純にリサイズのみ行う。

**修正ファイル:** `カラー一覧/process_patterns.py`

**変更内容:**
- BCFの処理分岐（159-184行目）を、BLEP/CFC/mesh_skinと同様にシンプルな切り出し＆リサイズのみに変更

```python
# 変更前: タイリング＆シームレス化処理
# 変更後: 単純な切り出し＆リサイズのみ
if code == 'BLEP' or code == 'CFC' or code == 'mesh_skin' or code == 'BCF':
    # 元のパターンが既にシームレスなので、シームレス化処理をスキップ
    if img.width >= THUMB_SIZE and img.height >= THUMB_SIZE:
        # 中心を切り出し
        left = (img.width - THUMB_SIZE) // 2
        top = (img.height - THUMB_SIZE) // 2
        result_img = img.crop((left, top, left + THUMB_SIZE, top + THUMB_SIZE))
    else:
        result_img = img.resize((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
```

## 実行手順
1. `process_patterns.py` のBCF処理をシンプルな切り出し＆リサイズに変更
2. スクリプトを実行して `BCF_processed_thumb.png` を再生成
3. 四隅のボヤけた線が消えたことを確認

## 検証方法
1. スクリプト実行: `python カラー一覧/process_patterns.py`
2. 生成された `カラー一覧/一覧/processed/BCF_processed_thumb.png` を確認
3. 四隅にボヤけた線がないことを目視確認
