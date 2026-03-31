# SFCパターン シームレス化計画

## Context
前回の50%縮小処理でSFC.pngのパターン密度を約4倍にしたが、2x2タイル配置により**タイル間の境界線（シーム）が見えている**。ユーザーはこの境界線をなくし、滑らかに繋がるシームレスなパターンにしたい。

## 対象ファイル
- **入力**: `/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧/一覧/SFC.png`（既に50%縮小済み）
- **出力**: 同じパス（上書き保存）
- **バックアップ**: `SFC_backup.png`は既に存在

## 実装アプローチ

### 使用する既存関数
`process_patterns.py`の`make_seamless()`関数を使用:
- **手法**: Offset-and-Blend法
- **処理内容**:
  1. 画像を半分ロール（中心を端に移動）
  2. エッジにグラデーションマスクを作成
  3. ロール画像と元画像をブレンド

### パラメータ
- **blend_width**: 32px（エッジのブレンド幅）

## 実行コマンド
```bash
cd /Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧 && python3 -c "
from pathlib import Path
from PIL import Image
import numpy as np

def make_seamless(img: np.ndarray, blend_width: int = 32) -> np.ndarray:
    '''Offset-and-Blend法でシームレス化'''
    h, w = img.shape[:2]

    # 中心を端に移動（ロール）
    rolled = np.roll(np.roll(img, h // 2, axis=0), w // 2, axis=1)

    # ブレンドマスクを作成（エッジでグラデーション）
    mask = np.zeros((h, w), dtype=np.float32)
    for i in range(blend_width):
        alpha = i / blend_width
        mask[i, :] = max(mask[i, 0], alpha)
        mask[h - blend_width + i, :] = max(mask[h - blend_width + i, 0], alpha)
        mask[:, i] = np.maximum(mask[:, i], alpha)
        mask[:, w - blend_width + i] = np.maximum(mask[:, w - blend_width + i], alpha)

    mask = np.clip(mask, 0, 1)

    # ブレンド
    if len(img.shape) == 3:
        mask = mask[:, :, np.newaxis]

    result = (rolled * mask + img * (1 - mask)).astype(np.uint8)
    return result

# パス設定
input_path = Path('/Users/takahashikentarou/Desktop/Topclaude/Topファイル/blala/カラー一覧/一覧/SFC.png')

# 画像読み込み
img = Image.open(input_path).convert('RGB')
print(f'画像サイズ: {img.size}')

# NumPy配列に変換
img_array = np.array(img)

# シームレス化
result = make_seamless(img_array, blend_width=32)

# 保存
result_img = Image.fromarray(result)
result_img.save(input_path, 'PNG', optimize=True)
print(f'シームレス化完了: {input_path}')
"
```

## Verification
1. 処理後の画像でタイル境界線が見えなくなっていることを視覚確認
2. パターンが滑らかに繋がっていることを確認
3. 色味・雰囲気が維持されていることを確認
