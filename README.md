# svg2cssBG
                    ___              ____   _____ 
                   |__ \            |  _ \ / ____|
     _____   ____ _   ) |___ ___ ___| |_) | |  __ 
    / __\ \ / / _` | / // __/ __/ __|  _ <| | |_ |
    \__ \\ V / (_| |/ /| (__\__ \__ \ |_) | |__| |
    |___/ \_/ \__, |____\___|___/___/____/ \_____|
               __/ |       (c) 2023 JTSage        
              |___/ CSS background-image from SVG 

## What is this?

This will take a folder of SVG files, compress/simplify them, and create CSS classes for each using the background-image property.

## How Do I Use the output

`<i class="iconClass-original-svg-filename></i>`

You can do whatever you want to style the element.

## Install

`yarn add svg2cssbg`

or

`npm install svg2cssbg`

## Usage - Command Line

There is a very, very simple command line script included.

`# node svg2cssbg <folder> <icon prefix>`

No other options are supported for the CLI, use it programmatically.

## Usage - As a Module

```js
const { makeCSS } = require('svg2cssbg')

const options = {
    // Defaults shown

    // Separator for css class names - all non-valid characters are converted to this.
    // Additionally, input file names are normalized to lower case first.
    cssSeparator              = '-',

    // This is custom base CSS, used for all generated icons using the method(s) below
    // Default looks like this:
    // selector {
    //   display: inline-block;
    //   content: "";
    //   vertical-align: -.125em;
    //   background-repeat: no-repeat;
    //   height: 1em;
    //   width: 1em;
    //}
    customBaseCSS             = '',

    // This is an object of functions to generate the very simple HTML sample sheet.
    // See below for more
    customHTML                = null,

    // You can set which icon will be using the the scale demonstration line of
    // the HTML sample sheet here, or it's randomly chosen
    preferScaleIcon           = false,

    // Prefix for all classes. In this case <i class="ico ico-something"></i>
    iconPrefix                = 'ico',

    // Generate a simple sample sheet of all icons
    makeSampleSheet           = false,

    // Use a prefix (double) class common entry.
    // With this, icons need to be called like <i class="ico ico-something"></li>
    usePrefixClass            = false,
    
    // Use a wildcard class common entry
    // With this, icons need can be called like <i class="ico-something"></li>
    useWildCardClass          = true,

    // If *both* usePrefixClass and useWildCardClass are off, you
    // can call icons like <i class="ico-something"></li>, as the common CSS is
    // included in each definition.  This leads to a much larger CSS file.
}

const results = makeCSS(inputFolder, options)
```

### Results Structure

```js
const results = {
    cssFile       : 'string of CSS',

    errors        : ['array', 'of', 'SVG', 'optimization', 'errors'],

    htmlFile      : 'string of HTML sample sheet',

    iconList      : ['array', 'of', 'icon', 'names', 'without', 'prefix'],

    svgCleanFiles : [ // Array of objects
        { filename : 'original SVG filename', data : 'optimized SVG source' }
    ],
}
```

### HTML generator functions
```js
// All functions must return a string.
const customHTML = {
    // Closes the HTML file
    foot  : () => {},

    // Opens the HTML file.
    //   cssFileContents :: cssFile *string* (enclose in <style> probably)
    head  : (cssFileContents) => {},

    // Called per-icon.
    //   iconPrefix :: the cssPrefix
    //   iconClass :: the *full* icon class name
    line  : (iconPrefix, iconClass) => {},

    // Makes a scaling sample line before the giant list of icons.
    // Called once with either "options.preferScaleIcon" or a random choice.
    //   iconPrefix :: the cssPrefix
    //   iconClass :: the *full* icon class name
    scale : (iconPrefix, iconClass) => {},
}

```

## FAQ

- Should I use this with multi-color SVG icons/sprites?
  - Yes. That is the best case for it
- Should I use this for single color SVG when I want color choice on the icon/sprite?
  - No. Probably a web font is better. This doesn't do that. It also uses the pre-supplied color strings, so it might respect `currentColor`, but I'm not sure.
- Can I...?
  - If it's not in the usage options above, no, probably not by default, no.