// 导入path和fs模块
import path from 'path';
import fs from 'fs';

// 导入rollup插件
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

/** 定义包路径和dist路径 */
const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

/** 返回包路径或dist路径 */
export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
}

/** 读取package.json */
export function getPackageJSON(pkgName) {
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(str);
}

/** 获取基本的rollup插件 */
export function getBaseRollupPlugins({
	alias = {
		__DEV__: true
	},
	typescript = {}
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
