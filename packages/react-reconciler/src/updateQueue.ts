//updateQueue.ts
//导入Action类型
import { Action } from 'shared/ReactTypes';

/** 定义Update接口,
 * State是任意类型,
 * action是Action类型 */
export interface Update<State> {
	action: Action<State>;
}

/**
 * 定义UpdateQueue接口,
 * State是任意类型,
 * shared下有pending属性,
 * 类型是Update<State>或者null
 */
export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

/** 创建Update对象,
 * State和Action是对应类型,
 * 返回一个包含action的Update对象 */
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

/**
 * 创建UpdateQueue对象,
 * State是任意类型,
 * 返回一个shared下有pending为null的UpdateQueue对象
 * */
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};

/** 向UpdateQueue中添加Update,
 * State必须对应,
 * 将update赋值给updateQueue的pending */
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

/** 处理UpdateQueue,
 * State必须对应,
 * 如果pendingUpdate不为空,
 * 执行action,
 * 并返回最新状态在memoizedState  */
export const processUpdateQueue = <State>(
	baseState: State, //State的类型,可以是任意类型
	pendingUpdate: Update<State> | null //pendingUpdate可以是Update<State>类型或null
): { memoizedState: State } => {
	//返回包含memoizedState的对象,memoizedState的类型与State相同

	//定义result的类型为processUpdateQueue函数的返回值类型
	const result = {
		memoizedState: baseState
	};

	if (pendingUpdate !== null) {
		//如果pendingUpdate不为空
		const action = pendingUpdate.action; //获取action
		if (action instanceof Function) {
			//如果action是个函数,执行它并返回结果作为memoizedState
			result.memoizedState = action(baseState);
		} else {
			//如果action不是函数,直接将其作为memoizedState
			result.memoizedState = action;
		}
	}

	return result;
};
