# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CFCテクスチャ処理を追加: process_patterns.pyのPATTERNSリストにCFCを追加
- `カラー一覧/一覧/processed/CFC_processed_thumb.png` (512x512) を生成

### Fixed
- BLEPとCFCのテクスチャパスを修正: `_processed.png` → `_processed_thumb.png`
- CFCのシームレス化処理をスキップ: 四隅のボヤケた線を削除

### Changed

- CFCパターンを迷彩柄（4色：濃緑、薄緑、ベージュ、黒）に変更
- カラーシミュレーターの色選択機能を刷新：固定16色パレットから画像ファイルベースの41色パレットに変更
- `simulator/js/palette.js`: COLOR_PALETTEを新しい画像ファイル名（ASH.png, BCF.png等）ベースのコード体系に更新
- `simulator/js/simulator.js`: INITIAL_COLORSを新しいコード体系（BLK, WHT, CYT, MBLK）に更新
- `カラー一覧/一覧/`: 古いスウォッチ画像（swatch_01_01.png等）を削除し、新しい画像ファイル（ASH.png等41個）を追加
- `extract_colors.py`: 画像から色データを抽出してJavaScriptパレットを生成するスクリプトを追加

### Technical Details

- ファイル名をそのまま品番コードとして使用（例: ASH.png → code: 'ASH'）
- 日本語ファイル名は英語コードに変換（スムーススキン.png → smooth_skin）
- HEX値は画像の中央20%領域のピクセル値の中央値を使用（アンチエイリアス対策）
- URLパラメータ形式が変更され、旧形式（?A=BK&B=WH...）との互換性はなし
