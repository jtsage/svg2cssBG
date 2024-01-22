/*                 ___              ____   _____ 
 *                |__ \            |  _ \ / ____|
 *  _____   ____ _   ) |___ ___ ___| |_) | |  __ 
 * / __\ \ / / _` | / // __/ __/ __|  _ <| | |_ |
 * \__ \\ V / (_| |/ /| (__\__ \__ \ |_) | |__| |
 * |___/ \_/ \__, |____\___|___/___/____/ \_____|
 *            __/ |       (c) 2023 JTSage        
 *           |___/ CSS background-image from SVG 
 */
//   Main Library

const fs              = require('node:fs')
const path            = require('node:path')
const { optimize }    = require('svgo')

const defaultCSSHead = [
	'display: inline-block;',
	'content: "";',
	'vertical-align: -.125em;',
	'background-repeat: no-repeat;',
	'height: 1em;',
	'width: 1em;',
]

const defaultHTML = {
	foot  : () => '</body></html>',
	head  : (cssFileContents) => [
		'<!doctype html><html lang="en"><head>',
		'<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
		`<style>${cssFileContents.join('\n')}</style>`,
		'<title>Icon Sample Sheet</title>',
		'</head><body><h1 style="text-align: center">Icon Sample Sheet</h1>'
	].join('\n'),
	line  : (iconPrefix, iconClass) => `<div style="text-align: center; display: inline-block; width: 9.5%;"><i style="font-size: 3em" class="${iconPrefix} ${iconClass}"></i><br>${iconClass}</div>`,
	scale : (iconPrefix, iconClass) => [
		'<div style="text-align: center">',
		...[...new Array(14).keys()].map((x) => `<div style="font-size: ${1 + x * 0.5}em; display: inline-block;"><i class="${iconPrefix} ${iconClass}"></i></div>`),
		'</div>'
	].join(''),
}

const makeCSS = (inputFolder, {
	cssSeparator              = '-',
	customBaseCSS             = '',
	customHTML                = null,
	iconPrefix                = 'ico',
	makeSampleSheet           = false,
	preferScaleIcon           = false,
	usePrefixClass            = false,           // e.g. class="ico ico-name"
	useWildCardClass          = true,            // e.g. class="ico-name"
} = {}) => {
	const outputObject = {
		cssFile       : [],
		errors        : [],
		htmlFile      : [],
		iconList      : [],
		svgCleanFiles : [],
	}
	const cssInEach    = !usePrefixClass && !useWildCardClass
	const headCSS      = customBaseCSS.length !== 0 ? customBaseCSS : defaultCSSHead.join(' ')
	const eachItemCSS  = cssInEach ? headCSS : ''

	if ( typeof inputFolder !== 'string' || inputFolder.length === 0 || ! fs.existsSync(inputFolder) ) {
		throw new Error('Invalid input folder supplied')
	}

	const inputFiles   = fs.readdirSync(inputFolder, { withFileTypes : true })
		.filter((x) => path.extname(x.name).toLowerCase() === '.svg')
		.map((x) => path.join(inputFolder, x.name))

	if ( inputFiles.length === 0 ) {
		throw new TypeError('No input files found')
	}

	outputObject.cssFile.push(
		usePrefixClass ? `${iconPrefix}::before { ${headCSS} }` : '',
		useWildCardClass ? `[class^="${iconPrefix}${cssSeparator}"]::before, [class*=" ${iconPrefix}${cssSeparator}"]::before { ${headCSS} }` : ''
	)

	for ( const thisSVGFile of inputFiles ) {
		const thisFileName  = path.basename(thisSVGFile)
		const thisIconName  = thisFileName.replace(/\.[Ss][Vv][Gg]/, '').replaceAll(/[^\dA-Za-z]/g, cssSeparator)
		const thisClassName = `${iconPrefix}${cssSeparator}${thisIconName}`
		
		try {
			const oldSVGData = fs.readFileSync(thisSVGFile, { encoding : 'utf8' })
			const result     = optimize(oldSVGData, {
				path      : path.join(thisSVGFile),
				multipass : true,
				plugins   : [{
					name   : 'preset-default',
					params : { overrides : { removeViewBox : false } },
				}],
			})

			outputObject.iconList.push(thisIconName)

			outputObject.svgCleanFiles.push({
				'filename' : thisFileName,
				'data'     : result.data,
			})

			outputObject.cssFile.push(
				`.${thisClassName}::before { ${eachItemCSS} background-image: url("data:image/svg+xml,${result.data.replaceAll('"', '\'').replaceAll('#', '%23')}"); }`
			)

			if ( makeSampleSheet ) {
				outputObject.htmlFile.push(
					(typeof customHTML?.line === 'function' ? customHTML : defaultHTML).line(iconPrefix, thisClassName)
				)
			}
		} catch (err) {
			outputObject.errors.push({
				'filename' : thisFileName,
				'error'    : err,
			})
		}
	}

	const scaleIcon = preferScaleIcon && Object.hasOwn(outputObject.iconList, preferScaleIcon) ?
		preferScaleIcon :
		outputObject.iconList[Math.floor(Math.random() * (outputObject.iconList.length-1))]

	if (makeSampleSheet) {
		outputObject.htmlFile.unshift(
			(typeof customHTML?.head === 'function' ? customHTML : defaultHTML).head(outputObject.cssFile),
			(typeof customHTML?.scale === 'function' ? customHTML : defaultHTML).scale(iconPrefix, `${iconPrefix}${cssSeparator}${scaleIcon}`)
		)
		outputObject.htmlFile.push(
			(typeof customHTML?.foot === 'function' ? customHTML : defaultHTML).foot()
		)
	}

	return {
		cssFile       : outputObject.cssFile.join('\n'),
		errors        : outputObject.errors,
		htmlFile      : outputObject.htmlFile.join('\n'),
		iconList      : outputObject.iconList,
		svgCleanFiles : outputObject.svgCleanFiles,
	}
}

module.exports.makeCSS = makeCSS
