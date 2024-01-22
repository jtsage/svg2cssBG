/* ______ _____  _____  _____ _____                    
*  |  ___/  ___|/ __  \/ __  \_   _|                   
*  | |_  \ `--. `' / /'`' / /' | |  ___ ___  _ __  ___ 
*  |  _|  `--. \  / /    / /   | | / __/ _ \| '_ \/ __|
*  | |   /\__/ /./ /___./ /____| || (_| (_) | | | \__ \
*  \_|   \____/ \_____/\_____/\___/\___\___/|_| |_|___/
*    Farming Simulator HUD Fill Icons - SVG Edition
*/
// Main Entry Point for Build

const path        = require('node:path')
const buildTools  = require('./lib/buildTools.js')
const log         = buildTools.cLog
const { program } = require('commander')
const packJSON    = require('./package.json')


/*
if ( outputFolder !== null && (writeCSSFile || writeHTMLFile || writeOptimizedSVG) ) {
		if ( ! fs.existsSync(outputFolder) && ( createOutputPath || createOutputPathRecursive ) ) {
			fs.mkdirSync(outputFolder, { recursive : createOutputPathRecursive })
		} else {
			fs.statSync(outputFolder)
		}

		if ( writeCSSFile ) {
			fs.writeFileSync(path.join(outputFolder, cssFileName), outputObject.cssFile.join('\n'))
		}

		if ( writeHTMLFile ) {
			fs.writeFileSync(path.join(outputFolder, 'sampleSheet.html'), outputObject.htmlFile.join('\n'))
		}

		if ( writeOptimizedSVG ) {
			const svgPath = path.join(outputFolder, 'svg')
			if ( ! fs.existsSync(svgPath) ) { fs.mkdirSync(svgPath) }

			for ( const thisOutFile of outputObject.svgCleanFiles ) {
				fs.writeFileSync(path.join(svgPath, thisOutFile.filename), thisOutFile.data)
			}
		}
	}
	*/
program
	.name('buildIcons')
	.description('Build Icon Files from SVG originals')
	.version(packJSON.version)
	.addCommand(makeCleanCommand())
	.addCommand(makeBuildCommand(), { isDefault : true })

program.parse()

function makeCleanCommand() {
	const clean = new program.Command('clean')
	clean
		.description('Clean output folder')
		.action(() => { buildTools.cleanAll() })

	return clean
}

function makeBuildCommand() {
	const build = new program.Command('build')
	build
		.description('Build Icon Files')
		.argument('[folder]',   'Source Files Folder')
		.option('--no-svg',     'Do not write optimized SVG files')
		.option('--no-css',     'Do not write CSS+SVG files')
		.action((folder, options) => {
			const thisSVGPath = folder ?? path.join(__dirname, 'svg_original')
			const fileList    = buildTools.getSVGInput(thisSVGPath)
			const svgCSS      = []
			const svgHTML     = []
			const svgLIST     = []

			if ( fileList.len === 0 ) {
				program.outputHelp()
				log(['error', 'No files found'], true)
				process.exit(1)
			}
			
			if ( options.svg )   { log(buildTools.prepDist('SVG')) }
			if ( options.css )   {
				log(buildTools.prepDist('CSS'))
				svgCSS.push(buildTools.webSVGHead())
			}
			
			for ( const thisFile of fileList.list ) { //.slice(0, 2) ) {
				const thisSVGLoader = buildTools.writeSVG(thisFile, options.svg, fileList.len)
				const thisSVG       = thisSVGLoader.data
			
				log(thisSVGLoader.log)
			
				if ( thisSVG === null ) { continue }
				
				if ( options.css ) {
					const svgWEB = buildTools.webSVG(thisFile, thisSVG)
					svgCSS.push(svgWEB.css)
					svgHTML.push(svgWEB.html)
					svgLIST.push(svgWEB.name)
				}
			}
			if ( options.css ) {
				log(buildTools.writeWebSVG(svgCSS, svgHTML))
			}
			buildTools.copyAssets(svgLIST)
		})
	return build
}