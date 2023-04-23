//beginWork.ts
import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';

// 递归中的递阶段
/** 
根据传入的wip(work in progress) fiber节点的tag,执行对应逻辑来完成wip节点的工作。
它会:
- 如果wip节点是HostRoot,调用updateHostRoot方法进行状态更新和子代调和
- 如果wip节点是HostComponent,调用updateHostComponent方法进行子代调和 
- 如果wip节点是HostText,直接返回null
- 否则会在开发环境下警告未实现的类型
wip代表工作进行中的fiber节点。在调和阶段,通过beginWork 我们会递归地遍历Fiber树,每个wip节点代表我们当前工作进行中的那个Fiber节点。
所以,beginWork方法的主要职责是,根据wip节点的类型,执行对应逻辑来 “工作” 于这个wip节点,完成它该完成的任务。
这主要包括两类任务:
1. 状态更新:如对于HostRoot类型的wip节点,会从它的updateQueue中获得更新并更新状态
2. 子代调和:对于HostRoot和HostComponent类型的wip节点,会调用reconcileChildren方法调和子代
而对于HostText类型的wip节点,由于它无状态无子代,所以beginWork直接返回null。

总结
beginWork方法会根据wip节点的类型,来为这个节点执行状态更新或者子代调和等工作,进而在整棵Fiber树上完成协调的工作。
它接受wip作为当前工作进行的Fiber节点,根据wip.tag的值来判断对应逻辑,这使得Fiber reconciler可以在调和阶段清晰地处理不同类型的Fiber节点。
通过递归调用beginWork,Fiber可以逐级遍历整棵Fiber树,为每个wip节点完成对应的工作,最终达成调和的目的。
所以,beginWork作为reconciliation的一个核心方法

beginWork其主要职责是:
根据wip节点的类型为其执行对应的工作(状态更新、子代调和等),以完成整棵Fiber树的调和过程。
它以wip作为当前工作进行的Fiber节点,并根据wip.tag来判断应执行的逻辑,这使得Fiber可以清晰地处理不同类型的Fiber节点。
*/
export const beginWork = (wip: FiberNode) => {
	// 根据wip节点的tag判断并执行对应逻辑
	switch (wip.tag) {
		//如果是HostRoot节点,执行updateHostRoot进行状态更新和子代调和
		case HostRoot:
			return updateHostRoot(wip);

		//如果是HostComponent节点,执行updateHostComponent进行子代调和
		case HostComponent:
			return updateHostComponent(wip);

		//如果是HostText节点,则无需做任何操作直接返回null
		case HostText:
			return null;

		//如果节点类型未实现,则会在开发环境有警告
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
			break;
	}

	//默认返回null
	return null;
};

/** 
用于HostRoot类型fiber节点的状态更新和子代调和。
updateHostRoot方法的主要职责是:
对HostRoot类型的wip节点进行状态更新和子代调和。
它会:
1. 从wip.memoizedState(代表Fiber节点的状态,在HostRoot节点中为根节点总状态)获得旧状态,从wip.updateQueue获得pending的更新
2. 调用processUpdateQueue方法处理更新,得到新状态,更新wip.memoizedState
3. 将wip.memoizedState(新状态)赋值给nextChildren(视新状态为“子节点),nextChildren:在HostRoot节点中,nextChildren被赋值为wip的新状态,所以它代表最新的根节点状态
4. 调用reconcileChildren方法调和子代,会根据nextChildren(新的根状态)来调和子Fiber节点
5. 返回wip的子节点,是为了beginWork方法继续递归遍历Fiber树

可以看出,对HostRoot类型的Fiber节点来说,它的子节点实际上是它的状态。我们通过更新状态和根据新状态调和子代,来完成对HostRoot节点及其子树的调和工作。
所以updateHostRoot的主要职责是对HostRoot类型的wip节点进行状态更新和子代调和
它将HostRoot节点的状态更新工作及子代调和工作融合在一起,通过更新状态并以新状态调和子代的方式,完成对HostRoot子树的调和。
这体现出Fiber在树结构和状态更新两方面都提供一致的调和方案,真正将“渲染”和“状态”结合了起来。
*/
function updateHostRoot(wip: FiberNode) {
	//获得wip节点的memoizedState作为旧状态
	const baseState = wip.memoizedState;

	//获得wip节点的updateQueue
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;

	//获得updateQueue上 pending的更新
	const pending = updateQueue.shared.pending;

	//将updateQueue上pending的更新置为null
	updateQueue.shared.pending = null;

	//执行过程更新队列的过程,得到新状态
	const { memoizedState } = processUpdateQueue(baseState, pending);

	//更新wip节点的memoizedState为新状态
	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;

	//执行子代调和
	reconcileChildren(wip, nextChildren);

	//返回wip的子节点
	return wip.child;
}

/** 用于HostComponent类型fiber节点的子代调和。
updateHostComponent只负责子代调和,会从pendingProps中得到最新props,并以其子节点调和子代
可以看出,updateHostComponent的工作更简单,它只根据HostComponent类型Fiber节点的最新props来调和子代。
而updateHostRoot除子代调和外,还要负责状态更新,它会从memoizedState和updateQueue中获得状态更新,更新memoizedState,并以更新后的状态来调和子代。

- pendingProps:代表Fiber节点更新后的props
- nextProps:从pendingProps中得到最新的props
- nextChildren:从最新props nextProps中获取子节点children
- 调用reconcileChildren调和子代:会根据nextChildren来调和子Fiber节点
- 返回wip.child:以供beginWork继续遍历Fiber树
*/
function updateHostComponent(wip: FiberNode) {
	//获得wip节点的pendingProps作为新props
	const nextProps = wip.pendingProps;

	//获得新props上的children
	const nextChildren = nextProps.children;

	//执行子代调和
	reconcileChildren(wip, nextChildren);

	//返回wip的子节点
	return wip.child;
}

/** 
执行子代的调和工作,根据fiber节点是否有alternate属性来判断是更新调和还是初次渲染调和,并调用对应的方法。
reconcileChildren方法的主要职责是:执行子代的调和工作。
它会根据传入的Fiber节点wip是否有alternate属性来判断是执行首次渲染调和还是更新调和,并调用对应的方法。
- 如果wip有alternate,则执行更新调和reconcileChildFibers
- 如果wip没有alternate,则执行首次渲染调和mountChildFibers
这里,alternate代表Fiber节点的备用节点。当Fiber节点在重新渲染时,它的 alternate属性会指向上一次渲染的Fiber节点。
所以,reconcileChildren方法会根据wip是否有alternate来判断是首次渲染还是重新渲染,并调用对应的子代调和方法:
- 如果有alternate,说明不是第一次渲染,调用reconcileChildFibers进行更新调和
- 如果没有alternate,说明是第一次渲染,调用mountChildFibers进行首次渲染调和
举个例子:
在初次渲染<div>时:
- wip(工作进行中的Fiber节点)没有alternate属性
- 所以会执行mountChildFibers进行首次渲染调和,以wip调整子Fiber节点
在<div>重新渲染时:
- wip(工作进行中的Fiber节点)会有一个alternate属性,指向上一次渲染的Fiber节点
- 所以会执行reconcileChildFibers进行更新调和,以wip和其alternate的子Fiber节点进行调和 
*/
function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	//获得wip的alternate节点
	const current = wip.alternate;

	if (current !== null) {
		//如果wip有alternate,说明是更新,执行更新调和
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		//如果wip没有alternate,说明是初次渲染,执行初次渲染调和
		wip.child = mountChildFibers(wip, null, children);
	}
}
