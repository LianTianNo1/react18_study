//fiber.ts
//导入Props, Key, Ref类型
import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
//导入WorkTag类型
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
//导入Flags和NoFlags类型
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

/** FiberNode:定义Fiber节点,表示工作单元/渲染单元 */
export class FiberNode {
	//节点类型
	type: any;
	//节点tag,标识节点类型
	tag: WorkTag;
	//待更新的props
	pendingProps: Props;
	//节点key
	key: Key;
	//与节点对应的DOM节点
	stateNode: any;
	//Ref对象
	ref: Ref;

	//父Fiber节点
	return: FiberNode | null;
	//兄弟Fiber节点
	sibling: FiberNode | null;
	//第一个子Fiber节点
	child: FiberNode | null;
	//索引
	index: number;
	//上一次渲染的props
	memoizedProps: Props | null;
	// 记忆的状态,表示Fiber节点上一次渲染后的状态
	memoizedState: any;
	//fiber的备用节点
	alternate: FiberNode | null;
	// fiber的状态标志操作 增加/删除/移动
	flags: Flags;
	// 更新队列,用于保存对Fiber节点的更新
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		// HostComponent <div> div DOM
		this.stateNode = null;
		// FunctionComponent () => {}
		this.type = null;

		// 构成树状结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
	}
}
/** FiberRootNode:定义Fiber节点,表示工作单元/渲染单元 */
export class FiberRootNode {
	container: Container; //容器
	current: FiberNode; //当前Fiber
	finishedWork: FiberNode | null; //完成工作的Fiber
	constructor(container: Container, hostRootFiber: FiberNode) {
		// 初始化Fiber根节点
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

/** 创建工作中的进度Fiber,用于更新 */
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	// 如果current.alternate 不存在,说明是首次渲染,创建一个新的Fiber节点作为工作中的进度Fiber
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// 否则更新工作中的进度Fiber的pendingProps和flags
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
	}
	// 将其他属性从当前Fiber复制到工作中的进度Fiber
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	// 返回工作中的进度Fiber
	return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// <div/> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('为定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
