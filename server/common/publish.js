#!/bin/env node
/**
 * publish.js
 * 
 * Use this script with Node.js. This script modifies JavaScript exported by Adobe Animate
 * so that it may work with the simulation.
 */

const fs = require('fs');
const path = require('path');

let figures = 2;
let palettables = {
    '#666600': 'eyeA',
    '#663300': 'hairA',
    '#FFCC99': 'skinA',
    '#F49E50': 'skinB',
    '#E5CCFF': 'outfitA',
    '#70618D': 'outfitB'
};


const force = false;
const nocopy = true;
const cachedir = false;


function publish(filepath) {
    try {
        let file = path.parse(filepath);

        if (file.ext !== '.js') throw Error('File must be of type \'.js\'.');

        // Check if file has already been published.
        let data = fs.readFileSync(filepath, { encoding: 'utf-8' });
        if (!force && (data.startsWith('// Published.') || data.endsWith('// Published.')))
            return;

        // Make a backup copy of the original file.
        if (!nocopy)
            fs.copyFileSync(filepath, `${file.name}.orig${file.ext}`);

        // Define a local reference to avatarPalette.
        data = data.replace(
            /^\/\/ stage content:\n.*function\(mode,startPosition,loop.*\).*$/gm,
            '$&\nthis.assetPalette = avatarPalette;\n'
        );

        // Replace special colors with references to avatar palette colors.
        for (const color in palettables) {
            data = data.replace(
                RegExp(`graphics\\.f\\("${color}"\\)\\.s\\(\\)`, 'gm'),
                `graphics.f(this.assetPalette.${palettables[color]}).s()`
            );
        }

        // Add toggling if-statement to avatar figure layers.
        for (let i = 0; i < figures; ++i) {
            const figure = `figure${i}`;

            data = data.replace(
                RegExp(`(\\/\\/ ${figure}avatar(.|\\n)*?)(^.*addTween)`, 'gm'),
                `$1if (this.assetPalette.figure == ${i})$3`
            );

            data = data.replace(
                RegExp(`(\\/\\/ ${figure}hair(\\d)(.|\\n)*?)(^.*addTween)`, 'gm'),
                `$1if (this.assetPalette.figure == ${i} && this.assetPalette.hair == $2)$4`
            );

            data = data.replace(
                RegExp(`(\\/\\/ ${figure}eyes(\\d)(.|\\n)*?)(^.*addTween)`, 'gm'),
                `$1if (this.assetPalette.figure == ${i} && this.assetPalette.eyes == $2)$4`
            );

            // Fix for separate glasses layer on figures. Supports accessory layers on figure.
            data = data.replace(
                RegExp(`(\\/\\/ ${figure}accessory\\d(.|\\n)*?)(^.*addTween)`, 'gm'),
                `$1if (this.assetPalette.figure == ${i})$3`
            );
        }

        // Replace references to cached bitmap images/ directory with assets/cached.
        if (!cachedir)
            data = data.replace(
                /"images\//g,
                '"assets/cache/'
            );

        // Insert a lookup table entry so the composition ID may be found later.
        data = data.replace(
            /^}\)\(createjs = createjs\|\|{}, AdobeAn = AdobeAn\|\|{}\);$/gm,
            `\nFILE_TO_ID = window.FILE_TO_ID || {}; FILE_TO_ID["${file.name}"] = lib.properties.id;\n$&`
        );

        // Mark file as published and write.
        data += '\n// Published.';
        fs.writeFileSync(filepath, data);
    } catch (err) {
        console.log('publish: Could not publish.');
        console.log(err);
        throw(err);
    }
}
module.exports = { publish };