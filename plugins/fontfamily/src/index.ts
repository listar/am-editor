import { $, isEngine, MarkPlugin } from '@aomao/engine';

export type Options = {
	hotkey?: { key: string; args: Array<string> };
};
export default class extends MarkPlugin<Options> {
	static get pluginName() {
		return 'fontfamily';
	}

	tagName = 'span';

	style = {
		'font-family': '@var0',
	};

	variable = {
		'@var0': {
			required: true,
			value: '*',
		},
	};

	isTrigger(font: string) {
		const state = this.queryState() as string[] | undefined;
		if (!state) return true;
		if (!font) {
		}
		return !!font;
	}

	execute(font: string) {
		const editor = this.editor;
		if (!isEngine(editor)) return;
		const { change, mark } = editor;
		const markNode = $(`<${this.tagName} />`);
		//获取当前光标位置字体
		const state = this.queryState() as string[] | undefined;
		//如果传入的字体，并且当前光标处没有字体或者，光标处字体与传入字体不一致
		if (font && (!state || font !== state[0])) {
			this.setStyle(markNode, font);
			if (!this.followStyle && change.getRange().collapsed) {
				return;
			}
			mark.wrap(markNode);
			return;
		}
		//未传入有效的字体。如果当前光标处有字体就移除字体
		if (state) {
			this.setStyle(markNode, state[0]);
			mark.unwrap(markNode);
		}
	}

	hotkey() {
		return this.options.hotkey || [];
	}
}