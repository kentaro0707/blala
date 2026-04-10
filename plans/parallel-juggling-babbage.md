# カラー名表示のシンプル化

## Context
ドライスーツシミュレーターで、選択されたカラー名が「NVY - Nvy」のように `code - name` 形式で表示されている。ユーザーの要望により、これを「NVY」のようにコードのみの表示にシンプル化する。

## 変更内容

### 修正ファイル
`simulator/js/simulator.js`

### 修正箇所（4箇所）

1. **行274** - 初期表示のHTML生成
   ```javascript
   // Before
   <span class="selected-color-name">${initialColor.code} - ${initialColor.name}</span>

   // After
   <span class="selected-color-name">${initialColor.code}</span>
   ```

2. **行291** - ボタンのツールチップ
   ```javascript
   // Before
   button.title = `${color.code} - ${color.name}`;

   // After
   button.title = color.code;
   ```

3. **行336** - 色選択時のラベル更新
   ```javascript
   // Before
   label.textContent = `${color.code} - ${color.name}`;

   // After
   label.textContent = color.code;
   ```

4. **行611** - リセット時のラベル更新
   ```javascript
   // Before
   label.textContent = `${color.code} - ${color.name}`;

   // After
   label.textContent = color.code;
   ```

## 影響範囲
- `palette.js` の `name` プロパティは引き続き使用される可能性があるため、データ自体は変更しない
- 表示ロジックのみを変更

## Verification
1. シミュレーターを起動（`./start-server.sh` またはローカルサーバー）
2. 各パーツのカラー選択時、ラベルが「NVY」「BLK」のようにコードのみ表示されることを確認
3. 色ボタンのツールチップもコードのみ表示されることを確認
4. リセット機能が正常に動作することを確認
