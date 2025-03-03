import typescript from '@rollup/plugin-typescript'

const PLUGINS = [
	typescript({
		compilerOptions: {declaration: true, noEmit: false},
		include: ['src/**/*'],
		exclude: ['**/*.{test,spec}.{ts,js}']
	})
]

const INPUT = ['src/index.ts']

/** @type {import('rollup').RollupOptions} */
const ESM_CONFIG = {
	input: INPUT,
	output: {
		dir: 'lib',
		entryFileNames: '[name].js',
		preserveModules: true,
		preserveModulesRoot: 'src',
		format: 'esm',
		sourcemap: true
	},
	plugins: PLUGINS
}

/** @type {import('rollup').RollupOptions} */
const CJS_CONFIG = {
	input: INPUT,
	output: {
		dir: 'lib',
		entryFileNames: '[name].cjs',
		preserveModules: true,
		preserveModulesRoot: 'src',
		format: 'commonjs',
		exports: 'named',
		sourcemap: true
	},
	plugins: PLUGINS
}

export default [
	ESM_CONFIG,
	CJS_CONFIG
]
