// fiberReconciler.ts`
import { Container } from 'hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

export function createContainer(container: Container) {
	// 创建HostRoot类型的Fiber节点作为根Fiber
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	//  创建FiberRootNode作为Fiber根节点
	const root = new FiberRootNode(container, hostRootFiber);
	// 为根Fiber创建更新队列
	hostRootFiber.updateQueue = createUpdateQueue();
	// 返回Fiber根节点
	return root;
}

export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	//获取根Fibe
	const hostRootFiber = root.current;
	//创建更新
	const update = createUpdate<ReactElementType | null>(element);
	//将更新加入更新队列
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	//调度更新
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
