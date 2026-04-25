# live2d-psd-template

> English: [README.md](README.md)

Live2D 用 PSD テンプレート生成ツール。YAML に書いたフォルダ・レイヤー構造から、空のレイヤーが並んだ PSD を自動生成する。

Live2D 化に使う PSD は「パーツ分けされたレイヤー構造」が必要だが、毎回ゼロから階層を組むのは手戻りが多い。このツールを使えば:

- **構造を YAML で管理** — バージョン管理・差分確認が容易
- **PSD は再生成可能** — 構造を変えるたびに再生成
- **CSP のテンプレートとして登録** — 以降は新規作成時に即呼び出し

---

## 動作環境

- Node.js 20+
- macOS / Linux / Windows（`canvas` パッケージのプリビルドバイナリ対応環境）

## セットアップ

```bash
git clone https://github.com/284km/live2d-psd-template.git
cd live2d-psd-template
npm install
```

`canvas` パッケージのインストールに数分かかる場合があります（プリビルドバイナリを取得）。

### macOS でインストールに失敗する場合

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

---

## 使い方

### 単一テンプレを生成

```bash
node generate.mjs templates/phase1-minimum.yaml
# → output/Live2D_Phase1_Minimum.psd
```

### npm スクリプトで

```bash
npm run generate:phase1   # Phase 1（最小・約15レイヤー）
npm run generate:phase2   # Phase 2（標準・約35レイヤー）
npm run generate:phase3   # Phase 3（上半身フル・約65レイヤー）
npm run generate:phase4   # Phase 4（全身・約95レイヤー）
npm run generate:all      # 4つすべて
```

---

## Clip Studio Paint でテンプレート化する手順

1. スクリプトで PSD を生成（上記）
2. **CSP で `output/*.psd` を開く**
3. レイヤー構造を確認（フォルダ・レイヤー名・カラーが保持されているはず）
4. 必要に応じて調整（対称定規の設置、3D デッサン人形のアタリ等）
5. **「ファイル → テンプレートとして登録」** で CSP のテンプレ一覧に保存
6. 以降は新規作成時に「テンプレートから作成」で即呼び出し可能

### 構造を変更したいとき

1. `templates/*.yaml` を編集
2. `npm run generate:phaseN` で再生成
3. CSP で開き直して `.clip` 保存 → テンプレ登録し直し

---

## YAML のフォーマット

```yaml
name: 出力ファイル名            # 拡張子なし
description: 説明

canvas:
  width: 2000                  # px
  height: 3000                 # px
  dpi: 350                     # 解像度

guides:                        # ガイド線（任意）
  - { direction: vertical, position: 1000 }
  - { direction: horizontal, position: 2500 }

structure:                     # レイヤー構造（上 → 下の順、CSPのレイヤーパネルと同じ並び）
  - type: layer
    name: 前髪
    color: blue                # red / orange / yellow / green / blue / violet / gray
    hidden: false              # 初期の表示/非表示
    opacity: 1.0               # 0.0〜1.0

  - type: folder
    name: 顔パーツ
    color: red
    opened: true               # フォルダの展開状態
    children:
      - { type: layer, name: 右眉, color: red }
      # ネスト可
```

### 並び順の注意

YAML は**上から下**の順で書く（CSP のレイヤーパネルと同じ並び）。スクリプトが PSD 出力時に内部で逆順化するので、YAML は見た目通りに書けばOK。

---

## 既存テンプレート

| ファイル | レイヤー数 | 対応する動き | 用途 |
|---------|----------|-------------|------|
| `phase1-minimum.yaml` | 約15 | 瞬き・口パク・頷き | 練習・ラクガキキャラ向け |
| `phase2-standard.yaml` | 約35 | 表情プリセット・頭部XYZ・基本揺れ | 本番キャラの最初の形 |
| `phase3-full.yaml` | 約65 | 髪揺れ物理・呼吸・手腕・衣装差分 | 本格運用・配信・商用（上半身） |
| `phase4-fullbody.yaml` | 約95 | Phase 3 + 脚・腰・スカート/パンツ・靴 | 全身運用・ダンス・モーキャプ |

段階的に育てる前提で3つ用意している。最初は **Phase 1** だけ使うのがおすすめ。

---

## Live2D 向けイラストの推奨仕様

- **正面向き・カメラ目線**（わずかな斜めはOK、横顔・振り向きは難易度が跳ね上がる）
- **バストアップ or 上半身**（全身は初回には重い）
- **ニュートラルポーズ**
- **手は体に添う or 画面外**

### 命名規則

テンプレ内のレイヤー名は日本語で統一している:

- CSP → PSD → Live2D Cubism まで**日本語対応が通る**
- 部位名は日本語の方が簡潔かつ一意（`前髪`, `後ろ髪`, `右目`, `口_閉じ` 等）
- 既存の Live2D チュートリアル・コミュニティ資料の多くが日本語
- 好みで英語（や他言語）に書き換えてもOK

### レイヤーカラーの運用（CSP フォルダカラー）

| 色 | 部位 |
|----|------|
| 赤（red） | 顔パーツ全般（目・眉・口） |
| 橙（orange） | 肌系（顔ベース・首・耳） |
| 青（blue） | 髪（前髪・後ろ髪・横髪） |
| 緑（green） | 衣装（服・下着） |
| 黄（yellow） | アクセ（リボン・ピン・帽子） |
| 灰（gray） | ガイド・背景 |

---

## 使用ライブラリ

- [ag-psd](https://github.com/Agamnentzar/ag-psd) — PSD 書き出し
- [canvas](https://github.com/Automattic/node-canvas) — Node.js での Canvas 実装
- [js-yaml](https://github.com/nodeca/js-yaml) — YAML パーサー

---

## License

MIT
