import {
	$,
	NodeInterface,
	ListPlugin,
	CARD_KEY,
	SchemaBlock,
	isEngine,
	PluginOptions,
	decodeCardValue,
	CARD_VALUE_KEY,
	READY_CARD_KEY,
} from '@aomao/engine';
import type MarkdownIt from 'markdown-it';
import TaskMarkdown from './markdown';
import CheckboxComponent, { CheckboxValue } from './checkbox';
import './index.css';

export interface TasklistOptions extends PluginOptions {
	hotkey?: string | Array<string>;
	markdown?: boolean | string[];
}

const TASK_LIST_CLASS = 'data-list-task';

export default class<
	T extends TasklistOptions = TasklistOptions,
> extends ListPlugin<T> {
	static get pluginName() {
		return 'tasklist';
	}

	cardName = 'checkbox';

	tagName = 'ul';

	attributes = {
		class: '@var0',
		'data-indent': '@var1',
	};

	variable = {
		'@var0': {
			required: true,
			value: [this.editor.list.CUSTOMZIE_UL_CLASS, TASK_LIST_CLASS],
		},
		'@var1': '@number',
	};

	allowIn = ['blockquote', '$root'];

	init() {
		super.init();
		this.editor.on('parse:html', this.parseHtml);
		if (isEngine(this.editor)) {
			this.editor.on('markdown-it', this.markdownIt);
			this.editor.on('paste:each-after', this.pasteEachAfter);
			this.editor.on('paste:each', this.pasteHtml);
		}
	}

	schema(): Array<SchemaBlock> {
		const scheam = super.schema() as SchemaBlock;
		return [
			scheam,
			{
				name: 'li',
				type: 'block',
				attributes: {
					class: {
						required: true,
						value: this.editor.list.CUSTOMZIE_LI_CLASS,
					},
					checked: ['true', 'false'],
				},
				allowIn: ['ul'],
			},
		];
	}

	isCurrent(node: NodeInterface) {
		if (node.name === 'li')
			return (
				node.hasClass(this.editor.list.CUSTOMZIE_LI_CLASS) &&
				node.first()?.attributes(CARD_KEY) === 'checkbox'
			);
		return node.hasClass('data-list') && node.hasClass(TASK_LIST_CLASS);
	}

	execute(value?: any) {
		if (!isEngine(this.editor)) return;
		const { change, list, block } = this.editor;
		list.split();
		const range = change.range.get();
		const activeBlocks = block.findBlocks(range);
		if (activeBlocks) {
			const selection = range.createSelection('tasklist-execute');
			if (list.isSpecifiedType(activeBlocks, 'ul', 'checkbox')) {
				list.unwrap(activeBlocks);
			} else {
				const listBlocks = list.toCustomize(
					activeBlocks,
					'checkbox',
					value,
				) as Array<NodeInterface>;
				listBlocks.forEach((list) => {
					if (this.editor.node.isList(list))
						list.addClass(TASK_LIST_CLASS);
				});
			}
			selection.move();
			if (
				range.collapsed &&
				range.startContainer.nodeType === Node.ELEMENT_NODE &&
				range.startContainer.childNodes.length === 0 &&
				range.startContainer.parentNode
			) {
				const brNode = document.createElement('br');
				range.startNode.before(brNode);
				range.startContainer.parentNode.removeChild(
					range.startContainer,
				);
				range.select(brNode);
				range.collapse(false);
			}
			change.apply(range);
			list.merge();
		}
	}

	hotkey() {
		return this.options.hotkey || 'mod+shift+9';
	}

	parseHtml = (
		root: NodeInterface,
		callback?: (node: NodeInterface, value: CheckboxValue) => NodeInterface,
	) => {
		const getBox = (inner: string = '') => {
			return `<span style="${
				inner
					? 'background:#347eff;position:relative;'
					: 'background:#fff;'
			}width: 16px;height: 16px;display: inline-block;border: 1px solid #347eff;border-radius: 2px;transition: all 0.3s;border-collapse: separate;">${inner}</span>`;
		};
		const results: NodeInterface[] = [];
		root.find(`[${CARD_KEY}="checkbox"]`).each((checkboxNode) => {
			const node = $(checkboxNode);

			let checkbox = $(
				`<span>${
					node.find('.data-checkbox-checked').length > 0
						? getBox(
								'<span style="transform: rotate(45deg) scale(1);position: absolute;display: block;border: 2px solid #fff;border-top: 0;border-left: 0;width:5.71428571px;height:9.14285714px;transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;opacity: 1;left:3.57142857px;top:0.14285714px;"></span>',
						  )
						: getBox()
				}</span>`,
			);
			checkbox.css({
				margin: '3px 0.5ex',
				'vertical-align': 'middle',
				width: '16px',
				height: '16px',
				color: 'color: rgba(0, 0, 0, 0.65)',
			});
			node.empty();
			if (callback) {
				const card = this.editor.card.find<
					CheckboxValue,
					CheckboxComponent<CheckboxValue>
				>(node);
				const value =
					card?.getValue() ||
					decodeCardValue(node.attributes(CARD_VALUE_KEY));
				if (value) checkbox = callback(checkbox, value);
			}
			node.append(checkbox);
			results.push(node);
		});
		root.find(`.${TASK_LIST_CLASS}`).css({
			'list-style': 'none',
		});
		return results;
	};

	markdownIt = (markdown: MarkdownIt) => {
		if (this.options.markdown !== false) {
			markdown.use(TaskMarkdown, {
				itemClass: this.editor.list.CUSTOMZIE_LI_CLASS,
				rootClass: `${this.editor.list.CUSTOMZIE_UL_CLASS} ${TASK_LIST_CLASS}`,
			});
			markdown.enable('task-list');
		}
	};

	pasteHtml = (node: NodeInterface) => {
		if (!isEngine(this.editor)) return;
		if (node.isElement()) {
			const attributes = node.attributes();
			const type = attributes[CARD_KEY] || attributes[READY_CARD_KEY];
			if (
				type &&
				type === CheckboxComponent.cardName &&
				node.parent()?.name !== 'li'
			) {
				node.remove();
				return false;
			}
		}
		return true;
	};

	pasteEachAfter = (root: NodeInterface) => {
		const liNodes = root.find(`li.${this.editor.list.CUSTOMZIE_LI_CLASS}`);
		liNodes.each((_, index) => {
			const child = liNodes.eq(index);
			if (!child) return;
			const firstChild = child.first();
			if (firstChild && firstChild.name === CheckboxComponent.cardName) {
				const card = this.editor.card.find<CheckboxValue>(firstChild);
				if (card) {
					const parent = child.parent();
					parent?.addClass(TASK_LIST_CLASS);
					const value = card.getValue();
					if (value && value.checked) {
						parent?.attributes('checked', 'true');
					} else {
						parent?.removeAttributes('checked');
					}
				}
			}
		});
	};

	destroy(): void {
		this.editor.off('parse:html', this.parseHtml);
		if (isEngine(this.editor)) {
			this.editor.off('markdown-it', this.markdownIt);
			this.editor.off('paste:each-after', this.pasteEachAfter);
			this.editor.off('paste:each', this.pasteHtml);
		}
	}
}
export { CheckboxComponent, TaskMarkdown };
export type { CheckboxValue };
