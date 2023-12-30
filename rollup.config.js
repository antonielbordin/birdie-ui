import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import postcss from "rollup-plugin-postcss"
import pkg from './package.json'

const production = !process.env.ROLLUP_WATCH;

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: './svelte.js',
	output: [
		{ file: pkg.module, 'format': 'es', name },
		{ file: pkg.main, 'format': 'umd', name }
	],
	plugins: [
		svelte({
		  dev: !production,
			emitCss: true,
			hydratable: true
		}),
		postcss(),
		resolve()
	]
};