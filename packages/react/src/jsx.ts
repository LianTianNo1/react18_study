// 从shared包导入定义好的类型和常量
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Key,
	ElementType,
	Ref,
	Props,
	ReactElementType
} from 'shared/ReactTypes';

/** ReactElement */

// 实现ReactElement工厂函数
const ReactElement = function (
	type: ElementType,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	// 使用导入的类型和常量,创建ReactElement对象
	const element: ReactElementType = {
		$$typeof: REACT_ELEMENT_TYPE, // 设置$$typeof为REACT_ELEMENT_TYPE
		type, // 元素类型
		key, // 元素key
		ref, // ref属性
		props, // props对象
		__mark: 'XiaoLang' // 自定义标识
	};
	return element;
};

// 检查config对象是否有有效的key或ref
function hasValidKey(config: any) {
	return config.key !== undefined;
}

function hasValidRef(config: any) {
	return config.ref !== undefined;
}

// jsx函数实现JSX的转译
// 接收 type, config对象和子元素参数
// 从config对象中提取key, ref和props
// 处理子元素参数,传入props.children
// 使用ReactElement工厂函数创建并返回ReactElement对象
export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	for (const prop in config) {
		const val = config[prop];
		// 从config中提取key和ref
		if (prop === 'key') {
			if (hasValidKey(config)) {
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref' && val !== undefined) {
			if (hasValidRef(config)) {
				ref = val;
			}
			continue;
		}
		// 其余属性添加到props对象
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	const maybeChildrenLength = maybeChildren.length;
	if (maybeChildrenLength) {
		// 处理子元素参数,添加到props.children
		if (maybeChildrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}
	// 使用ReactElement工厂函数创建ReactElement对象并返回
	return ReactElement(type, key, ref, props);
};

// export const jsxDev = jsx;
export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	for (const prop in config) {
		const val = config[prop];
		// 从config中提取key和ref
		if (prop === 'key') {
			if (hasValidKey(config)) {
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref' && val !== undefined) {
			if (hasValidRef(config)) {
				ref = val;
			}
			continue;
		}
		// 其余属性添加到props对象
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	// 使用ReactElement工厂函数创建ReactElement对象并返回
	return ReactElement(type, key, ref, props);
};
