import typescript from '@rollup/plugin-typescript';

const INPUT = ['src/index.ts'];

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
	plugins: [
		typescript({
			declaration: true,
			declarationDir: 'lib',
			include: ['src/**/*'],
			exclude: ['**/*.{test,spec}.{ts,js}']
		})
	]
};

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
	plugins: [
		typescript({
			declaration: false,
			include: ['src/**/*'],
			exclude: ['**/*.{test,spec}.{ts,js}']
		})
	]
};

export default [ESM_CONFIG, CJS_CONFIG];
