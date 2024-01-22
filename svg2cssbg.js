/*                 ___              ____   _____ 
 *                |__ \            |  _ \ / ____|
 *  _____   ____ _   ) |___ ___ ___| |_) | |  __ 
 * / __\ \ / / _` | / // __/ __/ __|  _ <| | |_ |
 * \__ \\ V / (_| |/ /| (__\__ \__ \ |_) | |__| |
 * |___/ \_/ \__, |____\___|___/___/____/ \_____|
 *            __/ |       (c) 2023 JTSage        
 *           |___/ CSS background-image from SVG 
 */
//   VERY! Simple Console Program

if ( process.argv.length < 4 ) {
	console.log('Usage :: node svg2cssbg [source folder] [icon prefix/css file name]')
}

const fs          = require('node:fs')
const path        = require('node:path')
const { makeCSS } = require('./lib/svg2cssbg_lib.js')

const inputFolder = process.argv[2]
const cssPrefix   = process.argv[3]

if ( cssPrefix.indexOf('.') !== -1 ) { throw new Error('Icon prefix cannot contain a dot')}
if ( cssPrefix.indexOf(' ') !== -1 ) { throw new Error('Icon prefix cannot contain any spaces')}

const cssFile = path.join(process.cwd(), `${cssPrefix}.css`)
const results = makeCSS(inputFolder, {
	iconPrefix : cssPrefix,
})

console.log(`Writing SVG files to ${path.basename(cssFile)}`)

fs.writeFileSync(cssFile, results.cssFile)
