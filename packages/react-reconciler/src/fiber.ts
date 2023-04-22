//fiber.ts
import { Props, Key, Ref } from 'shared/ReactTypes';
//导入Props, Key, Ref类型
import { WorkTag } from './workTags';
//导入WorkTag类型
import { Flags, NoFlags } from './fiberFlags';
//导入Flags和NoFlags类型

//定义Fiber节点
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
	//fiber的备用节点
	alternate: FiberNode | null;
	// fiber的状态标志操作 增加/删除/移动
	flags: Flags;

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

		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
	}
}
