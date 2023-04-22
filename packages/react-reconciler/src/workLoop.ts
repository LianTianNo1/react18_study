//workLoop.ts
//导入beginWork
import { beginWork } from './beginWork';
//导入completeWork
import { completeWork } from './completeWork';
//导入FiberNode
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';

//正在执行的Fiber节点
let workInProgress: FiberNode | null = null;

//准备执行fiber,将fiber设置为workInProgress
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 调度Fiber更新
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	// fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

//标记Fiber更新路径到根节点
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

//渲染根Fiber
function renderRoot(root: FiberNode) {
	//初始化,准备执行根Fiber
	prepareFreshStack(root);

	do {
		try {
			workLoop(); //执行调度循环
			break; //跳出循环
		} catch (e) {
			console.warn('workLoop发生错误', e);
			workInProgress = null; //重置workInProgress
		}
	} while (true); //一直循环,知道跳出
}

//调度循环,不断获取下一个工作单元执行
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress); //执行工作单元
	}
}

//执行一个工作单元
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber); //获取下一个要执行的Fiber
	fiber.memoizedProps = fiber.pendingProps;

	//如果beginWork返回null,说明该分支构建完成
	if (next === null) {
		completeUnitOfWork(fiber); //完成工作单元
	} else {
		workInProgress = next; //将下一个Fiber设置为workInProgress
	}
}

//完成一个工作单元,递归向上完成Fiber
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node); //完成工作
		const sibling = node.sibling; //获取兄弟Fiber节点

		if (sibling !== null) {
			//如果兄弟Fiber存在,执行兄弟Fiber
			workInProgress = sibling;
			return;
		}
		node = node.return; //向上回溯
		workInProgress = node; //设置workInProgress
	} while (node !== null); //一直回溯,直到node为null
}
