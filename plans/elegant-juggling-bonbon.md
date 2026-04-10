# GitHub Pages 画像読み込み修正プラン

## Context

`https://kentaro0707.github.io/blala/simulator/` でプレビュー画像（パーツ画像・テクスチャ画像）が表示されない問題。

## 根本原因

**Git LFS ポインターファイル問題**

- `.gitattributes` で `parts/**/*.png` と `カラー一覧/**/*.png` が Git LFS で管理されている
- GitHub Actions の `actions/checkout@v4` はデフォルトで LFS ファイルをダウンロードしない
- そのため、ビルド時にコピーされるのは131バイトのLFSポインターテキストファイル（実画像ではない）
- 結果として、GitHub Pages は画像URLに対してLFSポインターテキストを返す → ブラウザで画像として読み込めない

## 修正内容

**ファイル**: `.github/workflows/static.yml`

checkout ステップに `lfs: true` を追加するだけ：

```yaml
      - name: Checkout
        uses: actions/checkout@v4
        with:
          lfs: true    # ← 追加：LFSファイルを実際にダウンロード
```

これにより、checkout時にLFSポインターファイルではなく実際のPNG画像が取得され、`_site/` に正しい画像がコピーされる。

## 変更箇所

1. `.github/workflows/static.yml` の25行目付近、checkoutステップに `lfs: true` を追加

## 実行フロー

1. 修正を適用
2. codex-review でレビュー実行
3. 問題があれば修正 → 再レビュー（問題なしになるまで繰り返し）
4. 問題なしになったらコミット

## 確認方法

1. codex-review でエラー・問題点が0件であることを確認
2. コミット・プッシュ後、GitHub Actions が再実行される
3. `https://kentaro0707.github.io/blala/parts/A-parts.png` にアクセスしてPNG画像が表示されることを確認
4. `https://kentaro0707.github.io/blala/simulator/` でプレビュー画像が正常に表示されることを確認
