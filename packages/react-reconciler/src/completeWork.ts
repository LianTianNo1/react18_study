//completeWork.ts
import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags } from './fiberFlags';
import { HostRoot, HostText, HostComponent } from './workTags';

/**
 * 完成Fiber节点的工作。
 * 它会根据Fiber节点的类型,执行DOM构建、插入DOM树和属性传递等工作。
 *
 *- wip:代表工作进行中的Fiber节点,即当前正在处理的Fiber节点
 *- wip.pendingProps:代表wip节点更新后的props
 *- wip.alternate:代表wip节点的备用Fiber节点,在重新渲染时会指向上一次渲染的Fiber节点
 *- wip.tag:代表wip节点的类型,HostComponent、HostText、HostRoot等
 *- wip.stateNode:保存Fiber节点对应的DOM节点实例
 *- instance: 构建出的DOM节点实例
 *- createInstance:根据Fiber节点类型构建DOM节点实例
 *- createTextInstance:构建文本节点实例
 *- completeWork会根据Fiber节点类型调用createInstance或createTextInstance构建DOM节点实例instance,然后将instance赋值给wip.stateNode,作为Fiber节点对应的DOM节点实例。
 *
 *completeWork对不同类型的Fiber节点处理不同,主要原因是:
 *- HostComponent:代表DOM节点,需要构建DOM元素并插入到DOM树,并传递属性
 *- HostText:代表文本节点,需要构建文本节点并插入到DOM树,并传递属性
 *- HostRoot:代表根Fiber节点,需要传递属性,不需要构建DOM
 *
 *只有HostComponent类型的Fiber节点对应的DOM节点是可插入子DOM的容器节点,所以只有HostComponent需要执行appendAllChildren插入子DOM。
 *而其他类型的Fiber节点:
 *- HostText:对应的是文本节点,文本节点不能插入子DOM,所以不需要执行appendAllChildren
 *- HostRoot:作为根节点,其子DOM已经在其他地方插入,所以也不需要执行appendAllChildren
 * */
export const completeWork = (wip: FiberNode) => {
	// 递归中的归

	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// 1. 构建DOM
				const instance = createInstance(wip.type, newProps);
				// 2. 将DOM插入到DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// 1. 构建DOM
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;

		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip);
			}
			break;
	}
};

/**
 * 将Fiber节点的所有子代插入到DOM树中。
 * 它会递归地遍历Fiber节点的子树,
 * 并将HostComponent和HostText类型的Fiber节点对应的DOM插入到父DOM中。
 *
 * 在appendAllChildren中:
 * - wip.child:代表wip Fiber节点的子Fiber节点
 * - node:用于遍历wip的子树,node会从wip.child开始,一直向下遍历到叶子节点
 * 所以,它会做以下工作:
 * 1. 从wip.child开始遍历wip的子树
 * 2. 如果node是HostComponent或HostText类型,代表是一个DOM节点或文本节点,则将其DOM节点插入到parent中(因为只有这两种类型的Fiber节点有对应的DOM节点)
 * 3. 否则,如果node有子节点,则将node.child赋值给node,并继续遍历node的子树
 * 4. 如果遍历到了wip节点,代表已经遍历完wip的子树,可以返回
 * 5. 否则,如果node没有兄弟节点,需要向上回溯。当回溯到wip节点或根节点时,可以返回
 * 6. 否则,将node设置为其兄弟节点,继续遍历
 * 所以,它通过递归地遍历wip的子树,将每个HostComponent和HostText类型Fiber节点对应的DOM节点插入到parent中,实现整棵子树的DOM插入。
 * */
function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;

	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 这是用于建立Fiber节点之间的关联。它将node的子Fiber节点node.child的return指针指向node,表示node.child节点的父节点是node。
			// 这样,通过return指针就可以在Fiber树中自下向上遍历。
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		// 在node没有兄弟节点需要向上回溯时
		while (node.sibling === null) {
			/** 这是在node没有兄弟节点时,用于向上回溯的判断。   
          它表示:
          - 如果node.return为null,代表已经回溯到了根节点,可以返回 
          - 如果node.return为wip,代表已经回溯到了wip节点,代表wip的子树已经遍历完毕,可以返回 
      */
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		/**
      这是用于在向上回溯的过程中,建立node的兄弟节点和父节点之间的关联。
      当node需要向上回溯时,它会将node的兄弟节点node.sibling的return指针指向和node相同的父节点,然后将node设置为其兄弟节点。
      这样,就可以继续沿着兄弟节点遍历,而且node的兄弟节点的return指针也同时建立了与父节点的关联。
     */
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

/**
 * 向上递归传递Fiber节点的flags和subtreeFlags。
 * 它会从Fiber节点的子代开始,
 * 向上递归地将每个Fiber节点的flags和全部子树的flags相加,
 * 并赋值给父Fiber节点,
 * 此过程一直递归到根Fiber节点。
 *
 *1. 收集子节点的 flag,并汇总到父节点的 subtreeFlags 上。
 *2. 设置 child.return 为父节点 wip,这是为了之后可以通过 return 向上遍历 Fiber 树。
 *3. 遍历 sibling 节点,重复上面的逻辑。
 *最后,将所有子孙节点的 flag 汇总到 wip.subtreeFlags 上,用于之后的调度和渲染。
 * */
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
