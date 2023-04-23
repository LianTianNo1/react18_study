import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ReactElementType } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './fiber';
import { Placement } from './fiberFlags';
import { HostText } from './workTags';

function ChildReconciler(shouldTrackEffects: boolean) {
	//根据传入的shouldTrackEffects参数决定是否要为fiber节点设置Placement flag

	// 根据element创建fiber节点,并设置return指针指向returnFiber
	/** reconcileSingleElement方法的职责是根据传入的React元素(element)创建一个Fiber节点(fiber)。
        它会:
        1. 通过createFiberFromElement调用创建Fiber节点
        2. 为这个Fiber节点设置return指针,指向returnFiber
        3. 返回创建的Fiber节点
        这里的returnFiber是这个Fiber节点的父级Fiber节点。在Fiber树中,每个Fiber节点都有一个return指针,指向它的父级Fiber节点。
        所以,这个方法会根据React元素创建一个Fiber节点,并正确设置它在Fiber树中的位置,通过return指针将它连接到父级上。
        
        举个例子:
        jsx
        function Parent() {
          return <Child /> 
        }

        function Child() {
          return <div />
        }
        当我们调用reconcileSingleElement({ element: <Child /> }, parentFiber),它会:
        1. 通过createFiberFromElement创建Child组件的Fiber节点childFiber
        2. 设置childFiber.return = parentFiber,将childFiber连接到父级parentFiber上
        3. 返回childFiber
        所以,通过这个方法,我们使用React元素(<Child />)创建了Fiber节点(childFiber),并正确地将它连接到Fiber树中,使其成为parentFiber的子代。
        这就是reconcileSingleElement方法的主要职责 - 使用React元素创建Fiber节点,并将它连接到Fiber树中。
 	*/
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 创建fiber节点
		const fiber = createFiberFromElement(element);

		// 为fiber设置return指针指向returnFiber
		fiber.return = returnFiber;

		//返回创建好的fiber节点
		return fiber;
	}

	// 创建HostText类型的fiber节点,并设置return指针指向returnFiber
	/** 
        不使用createFiberFromElement创建Fiber节点,因为它要创建的是一个HostText类型的Fiber节点,而不是Element类型的。
        createFiberFromElement方法是专门用于根据React元素创建Fiber节点的。而对于字符串或数字类型的子节点,我们需要创建HostText类型的Fiber节点。
        所以reconcileSingleTextNode方法会:
        1. 直接使用new FiberNode(HostText, { content })创建一个HostText类型的Fiber节点
        2. 为这个Fiber节点设置return指针,指向returnFiber
        3. 返回创建的Fiber节点
        它不需要调用createFiberFromElement,因为createFiberFromElement是专用于处理React元素的,而这里我们要创建的是一个代表文本的HostText类型Fiber节点。
        所以,总结来说,reconcileSingleTextNode需要自己创建HostText类型的Fiber节点,而不使用createFiberFromElement,因为:
        1. createFiberFromElement的职责是根据React元素创建Fiber节点,而这里我们要创建的是代表文本的HostText类型Fiber节点
        2. HostText类型的Fiber节点的properties是{ content }而不是element.props,所以需要自己设置
        3. 我们要设置的fiberTag是HostText,而不是FunctionComponent/HostComponent等
        所以,reconcileSingleTextNode自己创建HostText类型的Fiber节点,这与createFiberFromElement的职责是不同的。createFiberFromElement只专注于根据React元素创建Fiber节点,这里我们要创建HostText类型的Fiber节点,所以需要自己实现创建逻辑。
    */
	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		//创建HostText类型fiber节点
		const fiber = new FiberNode(HostText, { content }, null);

		//为fiber设置return指针指向returnFiber
		fiber.return = returnFiber;

		//返回创建好的fiber节点
		return fiber;
	}

	//如果shouldTrackEffects为true,则为fiber节点设置Placement flag
	/** 
        placeSingleChild方法的职责是:
        如果shouldTrackEffects为true,并且fiber.alternate为null,则为fiber节点设置Placement effect tag。
        这里的fiber.alternate为null表示这是一个初始渲染中的Fiber节点,而不是更新中的Fiber节点。
        所以这个方法会在初始渲染中设置Placement effect tag,以便在渲染完成后调用生命周期方法。
        fiber.flags |= Placement中的|=操作是按位或并赋值操作。
        它的作用是为fiber.flags添加Placement effect tag。因为fiber.flags可能已经存在其他effect tag,我们需要使用|=来保留原有的effect tag,并添加Placement effect tag。
        举个例子,如果原来fiber.flags = 1(代表hasEffect1 effect tag),则:
        fiber.flags |= 2
        等价于:
        fiber.flags = fiber.flags | 2
             = 1 | 2
             = 3
        所以,总结 placeSingleChild 方法的职责:
        - 如果在初始渲染(fiber.alternate === null)并且要追踪副作用(shouldTrackEffects === true),则
        - 为Fiber节点的fiber.flags添加Placement effect tag,以便在渲染完成后执行Placement相关生命周期方法。
        - 它使用|=操作来添加Placement effect tag,以保留Fiber节点已有的其他effect tag。
        所以这个方法的主要目的是在符合条件时为Fiber节点添加Placement effect tag,以完整地追踪副作用并在适当时机调用生命周期方法。
        fiber.alternate === null判断这是一个初始渲染的Fiber节点且未复用旧的Fiber节点,这是添加Placement effect tag的前提。
        shouldTrackEffects === true判断是否要追踪副作用及调用生命周期方法。
        两者同时满足时才会为Fiber节点添加Placement effect tag。
    */
	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		//返回fiber节点
		return fiber;
	}

	/** 
    这个闭包函数reconcileChildFibers的职责是:
    根据新的子节点newChild的类型,调用不同的方法来创建对应的Fiber节点,并可能设置Placement effect tag。
    它会:
    - 如果newChild是React元素或Fragment,调用reconcileSingleElement创建Fiber节点
    - 如果newChild是字符串或数字,调用reconcileSingleTextNode创建HostText类型的Fiber节点
    - 否则警告未实现的类型
    - 在满足条件时,调用placeSingleChild为创建的Fiber节点设置Placement effect tag
    */
	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		//判断新子节点的类型,如果是React元素或者Fragment,则执行reconcileSingleElement函数创建fiber
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					//通过调用placeSingleChild来决定是否要设置Placement flag
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				//如果新子节点类型未实现,则在开发环境下会有警告
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
					break;
			}
		}

		//如果新子节点是文本节点,则执行reconcileSingleTextNode创建fiber节点
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		//如果新子节点类型未实现,则在开发环境下会有警告

		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild);
		}

		//如果都不满足,则返回null
		return null;
	};
}

/**
- reconcileChildFibers(true) 会在满足条件时设置Placement effect tag,以追踪副作用
- mountChildFibers(false) 不会设置Placement effect tag,不追踪副作用
我们需要追踪副作用的情况是,在初次渲染时,需要在组件被挂载/插入后执行生命周期方法(如componentDidMount)。
而不需要追踪副作用的情况是,在更新组件时,不需要在更新完成后再重复执行生命周期方法。
所以可以这么理解:
- 初次渲染时使用reconcileChildFibers(true)
- 更新组件时使用mountChildFibers(false)
前者会在满足条件时设置Placement effect tag,以追踪初次渲染的副作用,而后者不会设置,以避免重复追踪更新中的副作用。
所以,通过传入不同的shouldTrackEffects,我们可以在不同的渲染场景下选择是否追踪副作用,这使得Fiber在reconciliation中可以更加清晰地分别处理初渲染和更新
*/
export const reconcileChildFibers = ChildReconciler(true);

export const mountChildFibers = ChildReconciler(false);
