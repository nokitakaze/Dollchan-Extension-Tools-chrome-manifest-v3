/* global require */

const browserify   = require('browserify');
const { spawn }    = require('child_process');
const gulp         = require('gulp');
const newfile      = require('gulp-file');
const headerfooter = require('gulp-headerfooter');
const replace      = require('gulp-replace');
const clone = require('gulp-clone');
const merge = require('merge-stream');
const streamify    = require('gulp-streamify');
const strip        = require('gulp-strip-comments');
const tap          = require('gulp-tap');
const source       = require('vinyl-source-stream');
const { deleteAsync } = require('del');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const watchedPaths = [
	'src/modules/*',
	'src/es5-polyfills.js',
	'Dollchan_Extension_Tools.meta.js'
];

// Updates commit version in Wrap.js module
gulp.task('updatecommit', cb => {
	let stdout, stderr;
	const git = spawn('git', ['rev-parse', 'HEAD']);
	git.stdout.on('data', data => (stdout = String(data)));
	git.stderr.on('data', data => (stderr = String(data)));
	git.on('close', code => {
		if(code !== 0) {
			throw new Error(`Git error:\n${ stdout ? `${ stdout }\n` : '' }${ stderr }`);
		}
		gulp.src('src/modules/Wrap.js')
			.pipe(replace(/^const commit = '[^']*';$/m, `const commit = '${ stdout.trim().substr(0, 7) }';`))
			.pipe(gulp.dest('src/modules'))
			.on('end', cb);
	});
});

// Makes es6-script from module files
gulp.task('make:es6', gulp.series('updatecommit', () =>
	gulp.src('src/modules/Wrap.js').pipe(tap(wrapFile => {
		let count = 0;
		let str = wrapFile.contents.toString();
		const arr = str.match(/\/\* ==\[ .*? \]== \*\//g);
		for(let i = 0, len = arr.length - 1; i < len; ++i) {
			gulp.src(`src/modules/${ arr[i].replace(/\/\* ==\[ | \]== \*\//g, '') }`)
				.pipe(tap(moduleFile => {
					str = str.replace(arr[i], moduleFile.contents.toString());
					if(++count === len) {
						newfile('src/Dollchan_Extension_Tools.es6.user.js', `\r\n${ str }`)
							.pipe(streamify(headerfooter.header('Dollchan_Extension_Tools.meta.js')))
							.pipe(gulp.dest('.'));
					}
				}));
		}
	}))
));

// Copy es6 script from src/ to extension/ folder
gulp.task('copyext', () => {
	const src = gulp
		.src('src/Dollchan_Extension_Tools.es6.user.js')
		// вырезаем блоки, помеченные как EXCLUDED_FROM_EXTENSION
		.pipe(replace(/\s+\/\/ <EXCLUDED_FROM_EXTENSION>[\s\S]*?<\/EXCLUDED_FROM_EXTENSION>/g, ''));

	// Ветка для extension/v2
	const v2 = src
		.pipe(clone())
		.pipe(replace(
			/const DOLLCHAN_IMPORT_MODE = '[\w\d/_-]*?';/g,
			'const DOLLCHAN_IMPORT_MODE = \'extension/v2\';'
		))
		.pipe(gulp.dest('extension/v2'));

	// Ветка для extension/v3
	const v3 = src
		.pipe(clone())
		.pipe(replace(
			/const DOLLCHAN_IMPORT_MODE = '[\w\d/_-]*?';/g,
			'const DOLLCHAN_IMPORT_MODE = \'extension/v3\';'
		))
		.pipe(gulp.dest('extension/v3'));

	return merge(v2, v3);
});

// Makes es5-script from es6-script
gulp.task('make:es5', gulp.series(
	'make:es6',
	() => browserify(['src/es5-polyfills.js', 'src/Dollchan_Extension_Tools.es6.user.js'])
		.transform('babelify', { presets: ['@babel/preset-env'] })
		.bundle()
		.pipe(source('Dollchan_Extension_Tools.user.js'))
		.pipe(replace(
			/DOLLCHAN_IMPORT_MODE = '[\w\d/_-]*?';/g,
			'DOLLCHAN_IMPORT_MODE = \'user_js\';'
		))
		.pipe(streamify(strip()))
		.pipe(streamify(headerfooter(
			'/* eslint-disable */\n(function deMainFuncOuter(localData) {\n',
			'})(null);')))
		.pipe(streamify(headerfooter.header('Dollchan_Extension_Tools.meta.js')))
		.pipe(gulp.dest('.')),
	'copyext'
));

gulp.task('make:compile_injections', (cb) => {
	try {
		const srcPath = path.resolve('src/modules/CodeInjections.js');
		const outPath = path.resolve('extension/v3/compiled_scripts.js');
		const code = fs.readFileSync(srcPath, 'utf8');

		// Изолированная песочница: никаких require/процессов/etc.
		const sandbox = { WORLD_CODE_INJECTIONS: undefined };
		vm.createContext(sandbox);
		vm.runInContext(code, sandbox, { filename: 'CodeInjections.js' });

		const map = sandbox.WORLD_CODE_INJECTIONS || {};
		const keys = Object.keys(map);

		let out = '/* eslint-disable */\n';
		out += 'export const compiledScripts = [];\n\n';

		for(const k of keys) {
			// Текст кода как есть, без экранирования — он попадает внутрь лямбды
			out += `compiledScripts[${JSON.stringify(k)}] = () => {\n${map[k]}\n};\n\n`;
		}

		fs.mkdirSync(path.dirname(outPath), { recursive: true });
		fs.writeFileSync(outPath, out, 'utf8');
		cb();
	} catch(err) {
		cb(err);
	}
});

// the MAKE itself
gulp.task('make', gulp.series('make:es5', 'make:compile_injections'));

// Split es6-script into separate module files
gulp.task('make:modules', () => gulp.src('src/Dollchan_Extension_Tools.es6.user.js').pipe(tap(file => {
	const arr = file.contents.toString().split('// ==/UserScript==\r\n\r\n')[1].split('/* ==[ ');
	let wrapStr = `${ arr[0].slice(0, -2) }\r\n`;
	for(let i = 1, len = arr.length; i < len; ++i) {
		let str = arr[i];
		if(i !== len - 1) {
			str = str.slice(0, -2); // Remove last \r\n
			wrapStr += `/* ==[ ${ str.split(' ]==')[0] } ]== */\r\n`;
		} else {
			wrapStr += `/* ==[ ${ str }`;
			break;
		}
		const fileName = str.slice(0, str.indexOf(' ]'));
		newfile(`src/modules/${ fileName }`, `/* ==[ ${ str }`).pipe(gulp.dest('.'));
	}
	newfile('src/modules/Wrap.js', wrapStr).pipe(gulp.dest('.'));
})));

// Waits for changes in watchedPaths files, then makes es5 and es6-scripts
gulp.task('watch', () => gulp.watch(watchedPaths, gulp.series('make')));
gulp.task('default', gulp.parallel('make', 'watch'));

// Удаляет сборочные артефакты
gulp.task('clean', () => deleteAsync([
	'./extension/v2/Dollchan_Extension_Tools.es6.user.js',
	'./extension/v3/Dollchan_Extension_Tools.es6.user.js',
	'./Dollchan_Extension_Tools.user.js',
	'./src/Dollchan_Extension_Tools.es6.user.js',
	'./extension/v3/compiled_scripts.js',
]));
