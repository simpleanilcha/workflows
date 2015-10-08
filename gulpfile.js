var gulp = require ('gulp'),
	gutil = require ('gulp-util'),
	coffee = require ('gulp-coffee'),
	concat = require ('gulp-concat'),
	browserify = require ('gulp-browserify'),
	compass = require('gulp-compass'),
	connect = require ('gulp-connect'),
	gulpif = require ('gulp-if'),
	uglify = require ('gulp-uglify')
	minifyHTML = require ('gulp-minify-html');

gulp.task ('log', function(){
	gutil.log('Workflows are awesome');
});

// variables
var env,
	coffeeSources,
	jsSources,
	sassSources,
	htmlSources,
	jsonSources,
	outputDir,
	sassStyle;

env = process.env.NODE_ENV || 'development';
if(env==='development'){
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
}
else{
	outputDir = 'builds/production/';
	sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/tagline.coffee'];
jsSources = [
	'components/scripts/rclick.js',
	'components/scripts/pixgrid.js',
	'components/scripts/tagline.js',
	'components/scripts/template.js'
	];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + '*.json'];

gulp.task('coffee', function(){
	gulp.src(coffeeSources)
	.pipe(coffee({bare: true})
		.on('error', gutil.log))
	.pipe(gulp.dest('components/scripts'));
});

gulp.task('js', function(){
	gulp.src(jsSources)
	.pipe(concat('script.js'))
	.pipe(browserify())
	.pipe(gulpif(env === 'production', uglify()))
	.pipe(gulp.dest(outputDir + 'js'))
	.pipe(connect.reload());
});

gulp.task('compass', function(){
	gulp.src(sassSources)
	.pipe(compass({
		sass: 'components/sass',
		images: outputDir + 'images',
		style: sassStyle
	})
	.on('error', gutil.log))
	.pipe(gulp.dest(outputDir + 'css'))
	.pipe(connect.reload());
});

// watch task
gulp.task('watch', function(){
	gulp.watch(coffeeSources, ['coffee']);
	gulp.watch(jsSources, ['js']);
	gulp.watch('components/sass/*.scss', ['compass']);
	gulp.watch('builds/development/*.html', ['html']);
	gulp.watch(jsonSources, ['json']);
});

// livereload task
gulp.task('connect', function(){
	connect.server({
		root: outputDir,
		livereload: true
	});
});

gulp.task('html', function(){
	gulp.src('builds/development/*.html')
	.pipe(gulpif(env === 'production', minifyHTML()))
	.pipe(gulpif(env === 'production', gulp.dest(outputDir)))
	.pipe(connect.reload())
});

gulp.task('json', function(){
	gulp.src(jsonSources)
	.pipe(connect.reload())
});

// default task
gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'connect', 'watch']);