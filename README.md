gulp・webpack・babel のプロジェクトテンプレート

### 使い方

`git clone`
`npm install`
`npx gulp`

### 概要

gulp ベースの scss,pug,js バンドルテンプレートです。
src フォルダにて作業すると dist にコンパイル後のファイルが格納されます。
scss フォルダは FLOCCS ベースとなっています。

### 機能一覧

- scss->css
- Pug->HTML
  - `src= hogehoge/img` を`src="./img/に変更`(pug の画像参照ルート解決のため)
- 画像圧縮
- js バンドル
- object-fit イメージ prefix,polyfill 付与
  その他 pacake.json 参照

### 参考文献

以下を参考に構築しました。
この場を借りて御礼申し上げます。
https://qiita.com/KazuyoshiGoto/items/3059c99330cdc19e97ad
https://www.radia.jp/archives/1190
https://glatchdesign.com/blog/gulp-webpack-babel/
https://qiita.com/tonkotsuboy_com/items/2d4f3862e6d05dc0bea1
https://qiita.com/koedamon/items/92c986456e4b9e845acd

### 備考

vulnerability が出た場合はこちらを参照ください。
https://zenn.dev/mizuki/articles/1b958248024875
