
import * as vscode from 'vscode';	//vscode APIのimport
import * as fs from "fs";	//node.jsのFile System APIのimport https://nodejs.org/api/fs.html
import * as ps from 'path';	//node.jsのPath APIのimport https://nodejs.org/api/path.html
import * as rl from 'readline';	//node.jsのReadline APIのimport https://nodejs.org/api/path.html

//function オペランドの数字変換。
function oprDecimal(opr: RegExpMatchArray | null) {
	//step 末尾の数字２桁を抽出して、16進数変換。
	let newOpr = new Array(2);
	opr.forEach((e, i, a) => {
		if (e.match(/r/gm) !== null) {
			newOpr[i] = parseInt(String(e.match(/[0-9]+/gm)), 10);
		} else if (e.match(/0x/gm) !== null) {
			newOpr[i] = parseInt(String(e.match(/[0-9a-fA-F]+(?!x)/gm)), 16);
		}
	});
	return newOpr;
}

//function 命令機能
function procedure(opc: string | object, opr1: number, opr2: number, r: number[], flag: number[], pc: number, stack: number[], sp: number) {
	//step opcodeがnullの時はreturn
	if (opc === null) {
		return;
	}

	//step 命令機能実装
	switch (opc) {
		case "mov":
			r[opr1] = r[opr2];
			pc++;
			break;
		case "movw":
			r[opr1 + 1] = r[opr2 + 1];
			r[opr1] = r[opr1];
			pc++;
			break;
		case "ldi":
			r[opr1] = opr2;
			pc++;
			break;
		case "ld":
			r[opr1] = r[r[opr2]];
			pc++;
			break;
		case "lds":
			r[opr1] = r[opr2];
			pc++;
			break;
		case "st":
			r[r[opr1]] = r[opr2];
			pc++;
			break;
		case "sts":
			r[opr1] = r[opr2];
			pc++;
			break;
		case "in":
			r[opr1] = opr2;
			pc++;
			break;
		case "out":
			//?
			pc++;
			break;
		case "push":
			stack[sp] = r[opr1];
			sp++;
			pc++;
			break;
		case "pop":
			r[opr1] = stack[sp];
			stack[sp] = 0;	//*空にする。
			sp--;
			pc++;
			break;
		case "add":
			r[opr1] += r[opr2];
			pc++;
			break;
		case "adc":
			r[opr1] += r[opr2] + flag[0];
			pc++;
			break;
		case "sub":
			r[opr1] -= r[opr2];
			pc++;
			break;
		case "sbc":
			r[opr1] -= r[opr2] - flag[0];
			pc++;
			break;
		case "and":
			r[opr1] = r[opr1] &= r[opr2];
			flag[3] = 0;
			pc++;
			break;
		case "or":
			r[opr1] = r[opr1] |= r[opr2];
			flag[3] = 0;
			pc++;
			break;
		case "eor":
			r[opr1] = r[opr1] ^= r[opr2];
			flag[3] = 0;
			pc++;
			break;
		case "com":
			r[opr1] = ~r[opr1];
			flag[3] = 0;
			flag[0] = 1;
			pc++;
			break;
		case "inc":
			r[opr1]++;
			pc++;
			break;
		case "dec":
			r[opr1]--;
			pc++;
			break;
		case "cp":
			//?
			pc++;
			break;
		case "cpc":
			//?
			pc++;
			break;
		case "lsl":
			//?
			// flag[0]=r[opr1]%2;
			r[opr1] = r[opr1] << 1;
			pc++;
			break;
		case "lsr":
			//?
			flag[0] = r[opr1] % 2;
			r[opr1] = r[opr1] >> 1;
			pc++;
			break;
		case "asr":
			//?
			flag[0] = r[opr1] % 2;
			r[opr1] = r[opr1] >> 1;
			pc++;
			break;
		case "rol":
			//?
			r[opr1] = r[opr1] << 1;
			pc++;
			break;
		case "ror":
			//?
			r[opr1] = r[opr1] >> 1;
			pc++;
			break;
		case "rjmp":
			pc += opr1 + 1;
			break;
		case "rcall":
			stack[sp] = pc;
			sp++;
			pc += opr1 + 1;
			break;
		case "ret":
			pc = stack[sp];
			stack[sp] = 0;	//*空にする。
			sp--;
			break;
		case "brbs":
			if (flag[opr1] === 1) {
				pc += opr2 + 1;
			}
			break;
		case "brbc":
			if (flag[opr1] === 0) {
				pc += opr2 + 1;
			}
			break;
		default:
			break;
	}
	console.log(opc);
	console.log(opr1);
	console.log(opr2);

}



// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

	//　start listening
	// point ボタンが押されたときに、output.txtを作成する。
	let b = vscode.commands.registerCommand('convert-to-txt', c => {
		const savePath = ps.join(c._fsPath, '../', "output.txt");
		const streamR = fs.createReadStream(c._fsPath);
		const streamW = fs.createWriteStream(savePath);
		const reader = rl.createInterface({ input: streamR });
		let newLine = '';
		reader.on('line', line => {
			//行ごとに行う処理
			newLine = `"` + line + '\t\\n' + '"\n';
			streamW.write(newLine);
		});
	});

	// point デバッグボタンが押されたときに、デバッグ機能を実装。
	let d = vscode.commands.registerCommand("launch-debugger", e => {
		//step
		const savePath = ps.join(e._fsPath, '../', "registers.csv");
		const streamR = fs.createReadStream(e._fsPath);
		const reader = rl.createInterface({ input: streamR });
		let opcode: RegExpMatchArray | null;
		let operand: RegExpMatchArray | null;
		let oprNum = new Array(2);
		//step レジスタやフラグなどの変数宣言
		let r = new Array(32);
		let flag = new Array(8);
		let stack = new Array();
		let sp = 0;
		let pc = 0;
		r.fill(0);	//*初期値0
		flag.fill(0);	//*初期値0

		reader.on('line', line => {
			//step 正規表現で命令などを切り出し。
			opcode = line.match(/^\w*/);
			operand = line.match(/(r\d+|0x[0-9a-fA-F]{2}|\((\w*|-*\d*)\))/gm);
			//step 10進数変換
			oprNum = oprDecimal(operand);
			//step 命令機能実装
			procedure(opcode[0], oprNum[0], oprNum[1], r, flag, pc, stack, sp);
			//step csvファイルに書き込み
		});
	});
	// this method is called when your extension is deactivated
	context.subscriptions.push(b);
	context.subscriptions.push(d);
}
export function deactivate() { }
