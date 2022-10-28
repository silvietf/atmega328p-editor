
import * as vscode from 'vscode';	//vscode APIのimport
import * as fs from "fs";	//node.jsのFile System APIのimport https://nodejs.org/api/fs.html
import * as ps from 'path';	//node.jsのPath APIのimport https://nodejs.org/api/path.html
import * as rl from 'readline';	//node.jsのReadline APIのimport https://nodejs.org/api/path.html

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	//　start listening
	// ファイルがセーブされたときにイベント発生。
	// let x = vscode.workspace.onDidSaveTextDocument(a => {
	// 	console.log(a.getText())
	// });
	// context.subscriptions.push(x);

	// point ボタンが押されたときに、output.txtを作成する。
	let b = vscode.commands.registerCommand('convert-to-txt', c => {
		const save_path = ps.join(c._fsPath, '../', "output.txt");
		const stream_r = fs.createReadStream(c._fsPath);
		const stream_w = fs.createWriteStream(save_path);
		const reader = rl.createInterface({ input: stream_r });
		let new_line = '';
		// stream_w.write('asm {\n');
		reader.on('line', line => {
			//行ごとに行う処理
			new_line = `"` + line + '\t\\n' + '"\n';
			stream_w.write(new_line);
		});
	});



	// this method is called when your extension is deactivated
	context.subscriptions.push(b);
}
export function deactivate() { }
