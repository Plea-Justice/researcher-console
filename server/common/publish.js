#!/bin/env node
/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

/**
 * publish.js
 *
 * Use this script with Node.js. This script modifies JavaScript exported by
 * Adobe Animate so that it may work with the simulation.
 */

const fs = require('fs');
const path = require('path');

let option = false;
let force = false;
let copy = false;

// From researcher-console/server/common/util.js.
function multipleReplace(string, replacements) {
    for (const [regex, newstr] of replacements)
        string = string.replace(regex, newstr);
    return string;
}

const colorSlotDefaults = ['Eye', '', '', 'Hair', 'Outfit', 'Skin'];

/**
 * Prepare an Animate asset for use with the simulation by inserting variables.
 *
 * Modified assets will expect a window.assetPalettes to be defined. May throw
 * errors on unsuccessful read/write, if the asset has already been run through
 * the function, or if the extension of the file is not '.js'. The passed file
 * will be overwritten.
 *
 * @param {String} input The path to the input file.
 */
function publish(input) {

    const file = path.parse(input);
    const filepath = path.format(file);

    if (file.ext !== '.js') throw Error('File must be of type \'.js\'.');

    // Check if file has already been published.
    let data = fs.readFileSync(filepath, { encoding: 'utf-8' });
    if (!force && (data.startsWith('// Published.') || data.endsWith('// Published.'))) {

        if (require.main === module) {
            throw Error('File already marked as published.');
        } else {
            console.log('File already marked as published.');
            return;
        }
    }

    // Make a backup copy of the original file.
    if (copy)
        fs.copyFileSync(filepath, `${file.name}.orig${file.ext}`);

    const replacements = [
        [/"#ACAC3(\d)"/gm, 'window.assetPalettes[$1].colors[5]'],
        [/"#AC9C3(\d)"/gm, 'window.assetPalettes[$1].colorsDark[5]'],
        [/"#AC3C3(\d)"/gm, 'window.assetPalettes[$1].colors[3]'],
        [/"#3C3CA(\d)"/gm, 'window.assetPalettes[$1].colors[0]'],
        [/"#AC3CA(\d)"/gm, 'window.assetPalettes[$1].colors[4]'],
        [/"#AC2CA(\d)"/gm, 'window.assetPalettes[$1].colorsDark[4]'],

        // TODO: Assign all colors slot names instead (color1, color2, etc.)
        [/"#3CAC3(\d)"/gm, 'window.assetPalettes[$1].colors[1]'],
        [/"#3CACA(\d)"/gm, 'window.assetPalettes[$1].colors[2]'],

        // Customizable features (hair, eyes, etc).
        [/(slot(\d)figure(\d)([a-z]+?)(?<!accessory)(\d)[\s\S]*?)(^.*addTween)/gm,
            '$1if (window.assetPalettes[$2].features.$4 === $5)$6'
        ],

        // Base layers and accessories.
        // The accessory layer number is not actually used in selection. The
        // figure number determines whether the accessory layer is shown or not.
        [/(slot(\d)figure(\d)[a-z\d]+?\s[\s\S]*?)(^.*addTween)/gm,
            '$1if (window.assetPalettes[$2].features.figure === $3)$4'
        ],

        // Any additional custom layers. Toggle directly on/off with a list.
        [/(slot(\d)(?!(figure|accessory))([a-z]+?$)[\s\S]*?)(^.*addTween)/gm,
            '$1if (window.assetPalettes[$2].toggle.includes("$4"))$5'
        ],

        // Any additional custom layers. Toggle by number.
        [/(slot(\d)(?!(figure|accessory))([a-z]+?)(\d)$[\s\S]*?)(^.*addTween)/gm,
            '$1if (window.assetPalettes[$2].numbered["$4"] === $5)$6'
        ],

        // Reference to cache directory for bitmap cached assets.
        [/"images\//g, '"assets/cache/'],

        // Lookup table to retrieve the composition ID from the filename.
        [/^}\)\(createjs = createjs\|\|{}, AdobeAn = AdobeAn\|\|{}\);$/gm,
            `\nFILE_TO_ID = window.FILE_TO_ID || {}; FILE_TO_ID["${file.name}"] = lib.properties.id;\n$&`
        ]
    ];

    data = multipleReplace(data, replacements);

    // Mark file as published and write.
    data += '\n// Published.';
    fs.writeFileSync(filepath, data);

    // Count up customizable layers and colors.
    const colorable
        = [...(new Set(data.match(/assetPalettes\[\d\].colors\[\d\]/gm))).values()]
            .map(str => str.match(/\[(?<slot>\d)\].colors\[(?<color>.*?)\]/))
            .map(match => ({
                name: `Color ${match.groups.color} (${colorSlotDefaults[match.groups.color]})`,
                slot: Number(match.groups.slot),
                type: 'color',
                color: Number(match.groups.color)
            }));

    let switchable
        = [...(new Set(data.match(/assetPalettes\[\d\].features.[a-z]+? === \d/gm))).values()]
            .map(str => str.match(/\[(?<slot>\d)\].features.(?<feature>[a-z]+?) === (?<num>\d)/))
            .map(match => ({
                name: `${match.groups.feature}`,
                slot: Number(match.groups.slot),
                type: 'feature',
                num: Number(match.groups.num)
            }))
            .reduce((acc, cur) => {
                acc[cur.name + cur.slot] = {
                    ...cur,
                    range: Math.max(
                        cur.num,
                        acc[cur.name + cur.slot]?.range || 0
                    )
                };
                return acc;
            }, {});

    switchable = Object.values(switchable).map(x => ({
        name: x.name,
        slot: x.slot,
        type: x.type,
        range: x.range + 1
    }));

    const toggleable
        = (data.match(/assetPalettes\[\d\].toggle.includes\(".*?"\)/gm) || [])
            .map(str => str.match(/\[(?<slot>\d)\].*?includes\("(?<layer>.*?)"/))
            .map(match => ({
                name: match.groups.layer,
                slot: Number(match.groups.slot),
                type: 'toggle',
                layer: match.groups.layer
            }));

    let numbered
        = (data.match(/assetPalettes\[\d\].numbered\[.*?\] === \d/gm) || [])
            .map(str => str.match(/\[(?<slot>\d)\].numbered\["(?<layer>.*?)"\] === (?<num>\d)/))
            .map(match => ({
                name: match.groups.layer,
                slot: Number(match.groups.slot),
                type: 'numbered',
                layer: match.groups.layer,
                num: match.groups.num
            }))
            .reduce((acc, cur) => {
                acc[cur.name + cur.slot] = {
                    ...cur,
                    range: Math.max(
                        cur.num,
                        acc[cur.name + cur.slot]?.range || 0
                    )
                };
                return acc;
            }, {});

    numbered = Object.values(numbered).map(x => ({
        name: x.name,
        slot: x.slot,
        type: x.type,
        layer: x.layer,
        range: x.range + 1
    }));



    return [].concat(colorable, switchable, toggleable, numbered);
}

if (require.main === module) {
    try {
        // Parse arguments.
        if (process.argv.length < 3) throw Error('No file specified.');

        if (process.argv[2].startsWith('-')) {
            option = true;
            if (process.argv[2].includes('f')) force = true;
            if (process.argv[2].includes('c')) copy = true;
            if (process.argv.length < 4) throw Error('Option specified with no file.');
        }

        const result = publish(process.argv[option ? 3 : 2]);

        console.log('\033[33mPublished!\033[m');
        console.log('Customizables:', result);
    } catch(err) {
        console.log('\033[31m' + `\nError: ${err.message}` + '\033[m\n');
        console.log('Usage:    node publish.js <options> <filename>\n');
        console.log('Options:  -fc');
        console.log('           f   Force publishing if file has already been published.');
        console.log('           c   Make a backup copy of the original file.');
        process.exit(1);
    }
}

module.exports = { publish };
