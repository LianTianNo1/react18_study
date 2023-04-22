//workTags.ts
//工作单元类型
export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

//函数组件
export const FunctionComponent = 0;

//根Fiber
export const HostRoot = 3;

//宿主组件(DOM组件)
export const HostComponent = 5;

//<div>123</div> 就像123这个文本
export const HostText = 6;
