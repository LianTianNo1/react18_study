//fiberFlags.ts
//定义Flags类型
export type Flags = number;

//初始状态
export const NoFlags = 0b0000001;
//新增Fiber
export const Placement = 0b0000010;
//更新Fiber
export const Update = 0b0000100;
//删除子Fiber
export const ChildDeletion = 0b0001000;
