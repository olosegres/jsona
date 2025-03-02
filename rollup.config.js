import typescript from '@rollup/plugin-typescript'

/** @type {import('rollup').RollupOptions} */
const ESM_CONFIG = {
	input: 'src/index.ts',
	output: {
		file: 'lib/index.js',
		format: 'esm',
		sourcemap: true
	},
	plugins: [
		typescript({
			compilerOptions: {declaration: true, noEmit: false},
            include: ['src/**/*'],
			exclude: ['**/*.{test,spec}.{ts,js}']
		})
	]
}

/** @type {import('rollup').RollupOptions} */
const CJS_CONFIG = {
	input: 'src/index.ts',
	output: {
		file: 'lib/index.cjs',
		format: 'commonjs',
        exports: 'named',
		sourcemap: true
	},
	plugins: [
		typescript({
			compilerOptions: {declaration: true, noEmit: false},
            include: ['src/**/*'],
			exclude: ['**/*.{test,spec}.{ts,js}']
		})
	]
}

export default [
	ESM_CONFIG,
	CJS_CONFIG
]
