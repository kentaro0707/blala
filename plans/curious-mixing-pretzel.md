# 柄追加スキル（add-pattern）作成計画

## Context

今回の作業で行った「新しい柄画像の追加・変更」手順を再利用可能なスキルとして保存します。これにより、今後同様の作業を行う際に `/add-pattern` コマンド一つで自動化できます。

### 今回の作業内容
1. LEP.png（1024x1024）を50%縮小して LEP_small.png（512x512）を作成
2. 処理済みサムネイル processed/LEP_processed_thumb.png（1024x1024）を生成
3. 四隅のボヤけを避けるため、シームレス化ブレンド処理はスキップ
4. palette.js と palette_new.js を更新してテクスチャとして登録

---

## Implementation Plan

### 1. スキルファイルの作成

**ファイル:** `~/.claude/skills/add-pattern/SKILL.md`

```yaml
---
name: add-pattern
description: "ドライスーツシミュレーターに新しい柄テクスチャを追加または更新するスキル。Triggers: add-pattern, 柄追加, 柄を追加, パターン追加, /add-pattern"
allowed-tools:
  - Read
  - Write
  - Bash
  - Edit
  - Glob
user-invocable: true
---
```

### 2. スキルの内容

スキルは以下のステップを実行：

1. **引数確認** - 柄コード（LEP, ASHなど）を取得
2. **元画像確認** - `カラー一覧/一覧/{CODE}.png` の存在確認
3. **縮小版生成** - 50%縮小して `{CODE}_small.png` を作成
4. **サムネイル生成** - 四隅ボヤケなしで `processed/{CODE}_processed_thumb.png` を作成
5. **パレット更新** - palette.js と palette_new.js にテクスチャとして登録

### 3. 使用方法

```
/add-pattern LEP
/add-pattern ASH
柄を追加して NEWP
```

---

## Critical Files

| ファイル | 用途 |
|---------|------|
| `~/.claude/skills/add-pattern/SKILL.md` | 新規作成するスキルファイル |
| `カラー一覧/process_patterns.py` | 既存の処理スクリプト（参考） |
| `simulator/js/palette.js` | パレット定義（更新対象） |
| `simulator/js/palette_new.js` | パレット定義（更新対象） |

---

## Verification

1. スキルファイルを `~/.claude/skills/add-pattern/SKILL.md` に作成
2. `/add-pattern` と入力してスキルが起動することを確認
3. テスト用の柄コードを指定して実行し、以下が生成されることを確認：
   - `{CODE}_small.png`
   - `processed/{CODE}_processed_thumb.png`
   - palette.js / palette_new.js の更新
