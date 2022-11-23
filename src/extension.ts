
import * as vscode from 'vscode';	//vscode APIのimport
import * as fs from "fs";	//node.jsのFile System APIのimport https://nodejs.org/api/fs.html
import * as ps from 'path';	//node.jsのPath APIのimport https://nodejs.org/api/path.html
import * as rl from 'readline';	//node.jsのReadline APIのimport https://nodejs.org/api/path.html

//function 下n桁目を取り出す関数
function pickUpBit(data: number, n: number) {
	return data / (2 ** (n - 1)) % 2;
}

//function オペランドの数字変換。
function oprDecimal(opr: RegExpMatchArray | null) {
	//step 末尾の数字２桁を抽出して、16進数変換。
	let newOpr = new Array(2);
	opr.forEach((e, i, a) => {
		if (e.match(/memory/gm) !== null) {
			//point レジスタ名にmatch
			newOpr[i] = parseInt(String(e.match(/[0-9]+/gm)), 10);
		} else if (e.match(/0x/gm) !== null) {
			//point 16進数にmatch
			newOpr[i] = parseInt(String(e.match(/[0-9a-fA-F]+(?!x)/gm)), 16);
		} else {
			//point 10進数にmatch
			newOpr[i] = parseInt(String(e.match(/-?[0-9]+/gm)), 10);
		}
	});
	return newOpr;
}

//function 命令機能
function procedure(opc: string | object, opr1: number, opr2: number, memory: number[], flag: number[], pc: number, sp: number) {
	//step opcodeがnullの時はreturn
	if (opc === null) {
		return;
	}

	//step 命令機能実装
	switch (opc) {
		case "mov":
			memory[opr1] = memory[opr2];
			pc++;
			break;
		case "movw":
			memory[opr1 + 1] = memory[opr2 + 1];
			memory[opr1] = memory[opr1];
			pc++;
			break;
		case "ldi":
			memory[opr1] = opr2;
			pc++;
			break;
		case "ld":
			memory[opr1] = memory[memory[opr2]];
			pc++;
			break;
		case "lds":
			memory[opr1] = opr2;
			pc++;
			break;
		case "st":
			memory[memory[opr1]] = memory[opr2];
			pc++;
			break;
		case "sts":
			memory[opr1] = memory[opr2];
			pc += 2;
			break;
		case "in":
			memory[opr1] = memory[0x20 + opr2];
			pc++;
			break;
		case "out":
			memory[0x20 + opr1] = memory[opr2];
			pc++;
			break;
		case "push":
			memory[0x3ff - sp] = memory[opr1];
			sp--;
			pc++;
			break;
		case "pop":
			memory[opr1] = memory[0x3ff - sp];
			memory[0x3ff - sp] = 0;	//*空にする。
			sp++;
			pc++;
			break;
		case "add":
			memory[opr1] += memory[opr2];
			pc++;

			// if (memory[opr2] === 0) {
			// 	//Zフラグ
			// 	flag[1] = 1;
			// }
			// if (pickUpBit(memory[opr1], 8) === 1) {
			// 	//Nフラグ
			// 	flag[2] = 1;
			// }
			// if (pickUpBit(memory[opr1], 9) === 1) {
			// 	//Vフラグ
			// 	flag[3] = 1;
			// 	memory[opr1] -= 1 * (2 ** 8);
			// }
			// flag[4] = flag[2] ^= flag[3];
			break;
		case "adc":
			memory[opr1] += memory[opr2] + flag[0];
			pc++;
			// flag[4] = flag[2] ^= flag[3];

			break;
		case "sub":
			memory[opr1] -= memory[opr2];
			pc++;
			break;
		case "sbc":
			memory[opr1] -= memory[opr2] - flag[0];
			pc++;
			break;
		case "and":
			memory[opr1] = memory[opr1] &= memory[opr2];
			flag[3] = 0;
			pc++;
			break;
		case "or":
			memory[opr1] = memory[opr1] |= memory[opr2];
			flag[3] = 0;
			pc++;
			break;
		case "eor":
			memory[opr1] = memory[opr1] ^= memory[opr2];
			flag[3] = 0;
			pc++;
			break;
		case "com":
			memory[opr1] = ~memory[opr1];
			flag[3] = 0;
			flag[0] = 1;
			pc++;
			break;
		case "inc":
			memory[opr1]++;
			pc++;
			break;
		case "dec":
			memory[opr1]--;
			pc++;
			break;
		case "cp":
			// if (Math.abs(memory[opr1]) < Math.abs(memory[opr2])) {
			// 	flag[0] = 1;
			// } else {
			// 	flag[0] = 0;
			// }

			pc++;
			break;
		case "cpc":
			pc++;
			break;
		case "lsl":
			// flag[0]=memory[opr1]%2;
			memory[opr1] = memory[opr1] << 1;
			pc++;
			break;
		case "lsr":
			// flag[0] = memory[opr1] % 2;
			memory[opr1] = memory[opr1] >> 1;
			pc++;
			break;
		case "asr":
			// flag[0] = memory[opr1] % 2;
			memory[opr1] = memory[opr1] >> 1;
			memory[opr1] += pickUpBit(memory[opr1], 7) * (2 ** 7);
			pc++;
			break;
		case "rol":
			//?
			memory[opr1] = memory[opr1] << 1;
			memory[opr1] += flag[0];
			pc++;
			break;
		case "ror":
			//?
			memory[opr1] = memory[opr1] >> 1;
			memory[opr1] += flag[0] * (2 ** 7);
			pc++;
			break;
		case "rjmp":
			pc += opr1 + 1;
			break;
		case "rcall":
			memory[0x3ff - sp] = pc + 1;
			sp -= 2;
			pc += opr1 + 1;
			break;
		case "ret":
			pc = memory[0x3ff - sp];
			memory[0x3ff - sp] = 0;	//*空にする。
			memory[0x3ff - sp + 1] = 0;	//*空にする。
			sp += 2;
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
		case "nop":
			pc++;
			break;
		default:
			break;
	}
	//step フラグレジスタの計算

	return [sp, pc];
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
		let memory = new Array(1024);
		memory.fill(0);	//*初期値0
		memory[0x5f] = new Array(8);	//フラグレジスタ
		memory[0x5f].fill(0);
		let stack = new Array();
		let pc = 0;
		reader.on('line', line => {
			//step 正規表現で命令などを切り出し。
			opcode = line.match(/^\w*/);
			operand = line.match(/(memory\d+|0x[0-9a-fA-F]{2}|(-?\d+))/gm);
			//step 10進数変換
			oprNum = oprDecimal(operand);
			//step 命令機能実装
			[memory[0x5d], pc] = procedure(opcode[0], oprNum[0], oprNum[1], memory, memory[0x5f], pc, memory[0x5d]);
			//step csvファイルに書き込み
		});
	});
	// this method is called when your extension is deactivated
	context.subscriptions.push(b);
	context.subscriptions.push(d);
}
export function deactivate() { }
