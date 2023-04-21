// Ref是一个任意类型的引用,在react中用于获取DOM节点或class组件实例
export type Ref = any;

// ElementType表示react元素的类型,可以是原生DOM元素类型,也可以是函数组件或class组件
export type ElementType = any;

// Key是react元素的key属性,用于给元素标识
export type Key = string | null;

// Props是react元素的props对象,可以包含任意属性和children
export type Props = {
	[key: string]: any; // 任意属性
	children?: any; // children属性是可选的
};

// ReactElement接口定义了一个react元素
// $$typeof是一个用来区分react元素的标识(使用上面定义的REPLACEMENT_ELEMENT_TYPE)
// type表示元素类型
// key是元素key
// props是元素props
// ref是ref属性
// __mark是我自定义加上的,没有实际意义,只是为了说明这是我自己实现的ReactElement
export interface ReactElement {
	$$typeof: symbol | number;
	type: ElementType;
	key: Key;
	props: Props;
	ref: Ref;
	__mark: 'XiaoLang'; // 自定义标识,说明这是一个我自己实现的ReactElement
}
