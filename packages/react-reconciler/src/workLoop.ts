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
/**
prepareFreshStack这个方法主要是准备执行新的根Fiber,它会将根Fiber的alternate设置为workInProgress。
workInProgress代表正在执行的Fiber节点。在渲染过程中,会从根Fiber开始,不断构建子Fiber,这些正在构建的Fiber节点都被设置为workInProgress,表示它们正处于未完成状态。
workInProgress在任意时刻只有一个。它会随着调度循环的执行而不断切换到下一个要执行的Fiber节点。比如:
1. 初始化时,workInProgress被设置为根Fiber的alternate
2. 执行完根Fiber后,workInProgress被设置为根Fiber的第一个子Fiber
3. 执行完第一个子Fiber后,workInProgress被设置为下一个子Fiber
4. 所有子Fiber执行完后,workInProgress被设置为根Fiber的兄弟Fiber(如果存在)
5. 所有Fiber执行完后,workInProgress被重置为null
所以,workInProgress是一个动态的指针,它总是指向正在执行的Fiber,并随着调度循环的推进而改变
 */
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 调度Fiber更新
/** 
 scheduleUpdateOnFiber这个方法主要负责调度对某个Fiber节点的更新。其主要流程是:
1. 调用markUpdateFromFiberToRoot找到需要更新的Fiber节点到根节点的路径
2. 获取根节点对应的FiberRoot对象root 
3. 调用renderRoot以root为起点重新渲染这条路径 
4. 在renderRoot内部,会调用workLoop构建更新后的Fiber子树 
5. 构建完成后,会调用commitRoot提交更新
*/
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	// fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

//标记Fiber更新路径到根节点
/**
markUpdateFromFiberToRoot这个方法主要是找到一个Fiber节点到根节点的路径。
它会从传入的Fiber节点开始,一直向上回溯到根节点。它不会实际标记这条路径上的Fiber节点。
举个例子,如果我们有这样的Fiber树:
- RootFiber
- - ChildFiber1
- - - GrandChildFiber1
- - ChildFiber2
- - - GrandChildFiber2
如果我们调用markUpdateFromFiberToRoot(GrandChildFiber2),它会找到以下路径:
- GrandChildFiber2
- - ChildFiber2
- - RootFiber
最后它会返回根Fiber节点RootFiber。
所以这个方法主要找到了触发更新的Fiber一直到根Fiber的路径。它不会标记路径上的Fiber节点。真正的标记会发生在随后的渲染过程中。
这个方法的主要目的是找出根节点,以便可以从根节点开始重新渲染这条路径。

在这个方法的实现中,并没有真正的“标记”路径上的Fiber节点。它只是简单的向上回溯找到根节点。
这个方法的名字markUpdateFromFiberToRoot可能会有些误导。它主要的目的就是找出根节点,以便之后调用renderRoot重新渲染这条路径。
实际上的“标记”是在renderRoot中实现的。renderRoot会从workInProgress开始重新构建这条路径上的所有Fiber节点,在这个过程中,这些Fiber节点都会被标记为需要更新。
所以,整个更新过程是:
1. 调用markUpdateFromFiberToRoot找出根节点
2. 调用renderRoot以根节点为起点重新构建更新路径
3. 在构建过程中,更新路径上的所有Fiber节点都被标记为需要更新
4. 完成更新构建后,调用commitRoot提交更新
所以,严格来说,markUpdateFromFiberToRoot本身并不真正做标记工作,它只是找到了需要更新的路径起点,真正的标记发生在后续的渲染过程中。
 */
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
/**
enderRoot这个方法主要负责渲染根Fiber。其主要流程是:
1. 调用prepareFreshStack准备执行根Fiber,将其设置为workInProgress
2. 进入工作循环,通过调用workLoop不断执行工作单元,构建Fiber树
3. workLoop会在所有工作单元执行完毕后退出循环
4. 获取当前Fiber树构建的结果,存储在finishedWork中
5. 将finishedWork结果提交,通过调用commitRoot
root代表根Fiber节点对应的FiberRoot对象。它存储了根Fiber及其子树的相关信息。
const finishedWork = root.current.alternate;
root.finishedWork = finishedWork;
这两行代码获取Fiber构建产生的最终结果finishedWork,并存储在FiberRoot对象中。
- root.current对应旧的Fiber树
- root.current.alternate对应新构建的Fiber树
- 将新构建的Fiber树结果赋值给finishedWork
commitRoot(root); 是提交更新的方法。它会将finishedWork代表的新Fiber树设置为current,完成更新提交。
 */
function renderRoot(root: FiberRootNode) {
	//初始化,准备执行根Fiber
	prepareFreshStack(root);

	do {
		try {
			workLoop(); //执行调度循环
			break; //跳出循环
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null; //重置workInProgress
		}
	} while (true); //一直循环,知道跳出

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// wip fiberNode树 树中的flags
	commitRoot(root);
}

//调度循环,不断获取下一个工作单元执行
/**
workLoop这个方法主要负责调度循环,不断执行工作单元。其主要流程是:
1. 获取当前工作单元workInProgress
2. 如果workInProgress不为空,调用performUnitOfWork执行当前工作单元
3. 在performUnitOfWork中,会通过beginWork获取下一个工作单元,设置为workInProgress
4. 重复步骤2和3,不断执行工作单元,直到workInProgress为空
5. workInProgress为空后退出循环
所以,这个方法会不断获取当前要执行的工作单元,调用performUnitOfWork执行,并获取下一个工作单元,如此反复,直到所有工作单元执行完毕。
举例来说,工作单元可以是一个Fiber节点及其子树。这个循环会一直执行Fiber节点的工作单元,并找到下一个Fiber的工作单元执行,最终遍历完成整个Fiber树。
它的主要目的是通过这个循环机制,执行React中的所有工作单元/任务,实现更新调度。
 */
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress); //执行工作单元
	}
}

//执行一个工作单元
/** 
performUnitOfWork这个方法主要负责执行一个工作单元(一个Fiber节点)。其主要流程是:
1. 调用beginWork获取下一个要执行的Fiber节点,存储在next中
2. 如果next为null,说明该分支执行完毕,调用completeUnitOfWork完成工作单元
3. 否则,将next设置为workInProgress,继续执行
举个例子,如果当前workInProgress是Fiber树中某个中间节点,beginWork可能会返回其子节点或兄弟节点中的第一个节点作为next。
这时会继续执行next对应的工作单元。
如果beginWork返回null,说明该分支已经执行完毕,需要回溯到父节点。
所以,这个方法会从当前workInProgress开始,
通过调用beginWork遍历其子树或兄弟树,执行每个Fiber节点的工作单元。
fiber.memoizedProps = fiber.pendingProps;
这行代码的作用是将当前Fiber的pendingProps同步到memoizedProps。
pendingProps存储的是即将更新的props,memoizedProps存储的是当前已提交的props。
所以这行代码实现了 pendingProps -> memoizedProps 的同步,代表当前工作单元使用的props已经更新完毕,可以提交。 
*/
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
/** 
completeUnitOfWork这个方法主要负责完成一个工作单元的执行。其主要流程是:
1. 执行completeWork完成当前Fiber节点的工作
2. 获取当前Fiber的兄弟Fiber节点sibling
3. 如果sibling存在,说明还有兄弟节点需要执行,将其设置为workInProgress继续执行
4. 否则,向上回溯,将当前Fiber的父节点设置为workInProgress,继续回溯执行
5. 重复 step 1-4,直到workInProgress为null,说明所有工作执行完毕

举例来说,假设我们有这样的Fiber树:
- A 
- - B
- - - C 
- - - - D
- - - E
- - F
当执行到D节点时,C的兄弟节点E会被设置为workInProgress,继续执行E。当E执行完毕,由于没有兄弟节点,会向上回溯到父节点B,将B设置为workInProgress,依此类推,直到全部执行完毕。
所以,这个方法会从当前已完成的工作单元开始,尽量向兄弟方向执行,如果没有兄弟可以执行了,则会向上回溯,执行父节点的工作单元。
fiber是当前已完成工作单元对应的Fiber节点。
node = node.return; //向上回溯 
workInProgress = node;
这两行代码实现了向上回溯并设置要执行的下一工作单元。node首先回溯到父Fiber,然后父Fiber被设置为当前要执行的workInProgress。
总结:
- completeUnitOfWork负责完成当前工作单元,并找出下一工作单元执行
- 它尽量先向兄弟方向查找可执行工作单元
- 如果没有兄弟可执行,则向上回溯找到父节点并设置为workInProgress
- 它会一直重复这个过程,直到所有workInProgress已执行完毕 
 */
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
