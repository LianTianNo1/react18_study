// 检查环境是否支持Symbol,如果支持则使用Symbol.for创建唯一的symbol
// 否则 fallback 到一个数值常量
const supportSymbol = typeof Symbol === 'function' && Symbol.for;

/* 1. 使用Symbol可以创建全局唯一的值,不会与其它代码产生命名冲突
2. 即使在未来版本中改变了fallback的magic number,之前的代码逻辑不会变,因为它们使用的还是Symbol.for创建的symbol值。
3. 对环境没有Symbol支持的情况作了polyfill,保证在任何环境下都有一个唯一的值REPLACEMENT_ELEMENT_TYPE 
所以这段代码实现了一个跨环境的、唯一的值REACT_ELEMENT_TYPE。 */

// 定义REACT_ELEMENT_TYPE, 这是react element的类型标识
// 如果支持Symbol, 则使用Symbol.for创建,否则使用0xeac7这个magic number
export const REACT_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element') // 使用Symbol.for创建symbol
	: 0xeac7; // fallback到magic number
