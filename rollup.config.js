var rollup = require( 'rollup' );
var nodeResolve = require('rollup-plugin-node-resolve');
var commonJS = require('rollup-plugin-commonjs');
var closure = require('google-closure-compiler-js');
var argv = require('yargs').argv;
require('core-js')

//simple closure compiler wrapper for rollup
function closureCompilerPlugin(options = {}){
  return {
    transformBundle(bundle){
      const compilation = Object.assign({}, options, {
        jsCode: options.jsCode ? options.jsCode.concat({ src: bundle }) : [{ src: bundle }]
      });
	  console.log('closure compiler optimizing...');
      const transformed = closure.compile(compilation);
	  console.log('closure compiler optimizing complete');
	  return { code: transformed.compiledCode, map: transformed.sourceMap };
    }
  }
}

var writeIIFE = fileName => bundle => bundle.write({format: 'iife', dest: fileName, moduleName: 'inbox'});

//rollup plugins
var plugins = [
	nodeResolve({ module: true }),
  commonJS()
]

//only do closure in prod mode (slow!)
if(argv.prod){
  plugins.push(closureCompilerPlugin({ compilationLevel: 'SIMPLE' }));
}

//build the AOT package
var buildAOT = rollup.rollup({
	entry: './built/main.js',
	plugins: plugins
})
.then(writeIIFE('./release/weather-app.js'))
.then(() => console.log('built angular2'))
.catch(err => console.log(err));
