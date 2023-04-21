// 导入工具函数
import { getPackageJSON, resolvePkgPath, getBaseRollupPlugins } from './utils';
// 导入生成package.json的rollup插件
import generatePackageJson from 'rollup-plugin-generate-package-json';

// 获取react包信息
const { name } = getPackageJSON('react');
const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);

// 获取基本rollup插件
const basePlugins = getBaseRollupPlugins();

// 定义rollup配置
export default [
	// 入口index.ts,输出umd模块格式,并生成package.json
	{
		input: `${pkgPath}/index.ts`,
		output: {
			file: `${pkgDistPath}/index.js`,
			name: 'index.js',
			format: 'umd'
		},
		plugins: [
			...basePlugins,
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				// 定义内容为一些必要的，更改main：index.js
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					main: 'index.js'
				})
			})
		]
	},
	// 入口src/jsx.ts
	// 分别打包为jsx-dev-runtime.js和jsx-runtime.js,umd格式
	{
		input: `${pkgPath}/src/jsx.ts`,
		// 打包为jsx-dev-runtime.js jsx-runtime.js
		output: [
			{
				file: `${pkgDistPath}/jsx-dev-runtime.js`,
				name: 'jsx-dev-runtime.js',
				format: 'umd'
			},
			{
				file: `${pkgDistPath}/jsx-runtime.js`,
				name: 'jsx-runtime.js',
				format: 'umd'
			}
		],
		plugins: basePlugins
	}
];
