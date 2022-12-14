# ATmega328p Assembly Language Editor for Arduino Uno
## 必要環境
* [Node.js](https://nodejs.org/ja/download/)
* [Arduino IDE](https://www.arduino.cc/en/software)
* [Arduino 拡張機能](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-arduino)
* [C/C++拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)
* [Excel Viewer](https://marketplace.visualstudio.com/items?itemName=GrapeCity.gc-excelviewer)
## 機能
* コードの色付け機能（SyntaxHiglighting）
![IMG 0001](./img/highlight.gif)
起動方法：
    1. [ファイル名].asmファイルを作成。
    2. 言語を"ino assembly"に変更。
* 入力補完機能（Code Snippets）
![IMG 0002](./img/snippets.gif)
※ 予測変換を使用する際、マウスを使わずに、十字キーで選択、Tabキーで挿入することができる。
* テキスト出力機能
![IMG 0003](./img/convert_txt.gif)
使い方：
    1. [ファイル名].asmの編集が完了した後、右上の「.asmのコードを.ino用に出力する」ボタンをクリック。
    2. output.txtに、`asm();`で使用できるテキストが使用できる。
    3. [ファイル名].inoで、`asm();`内にoutput.txtの内容をコピーする。
* デバッグ機能（プロトタイプ）
![IMG 0004](./img/debugger.gif)
使い方：
    1. [ファイル名].asmファイル上で、右上の「デバッグ開始」ボタンをクリック。
    2. レジスタとフラグの値が保存されたregisters.csvが作成される。
    ※フラグの挙動には現在未対応。
    3. Excel Viewerのインストール。
    4. registers.csvを右クリックして、"Open Preview"をクリック
    5. レジスタとフラグの表が表示される。
## Release Notes
### Ver.0.1.0
* 初リリース。
### Ver.0.2.0
* デバッグ機能プロトタイプ搭載
* push,pop,cp,cpc,lsl,lsr,aser,rol,.ror,rjmp,rcall,ret,brbrs,brbcには非対応。
### Ver 0.2.1
* ld機能の修正
* output.txt機能の改善。
### Ver 0.2.2
* output.txt機能のバグの改善。