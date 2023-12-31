import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
// import css from 'rollup-plugin-css-porter'
// import autoPreprocess from 'svelte-preprocess'

import pkg from './package.json'

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: './svelte.js',
	output: [
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name }
	],
	plugins: [
		svelte({
		  // preprocess: autoPreprocess()
			customElement: true
		}),
		resolve(),
		// css({
    //   raw: 'dist/birdie-ui.css',
    //   minified: 'dist/birdie-ui.min.css',
    // }),
	]
};