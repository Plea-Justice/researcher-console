// Run this script as a child process with two arguments.
// node thumbnail.js [asset path] [output path]

// Code to be executed in the browser before loading the asset for thumbnail generation.
const to_execute = `
    /*
     * Default colors for thumbnails of customizable assets.
     */

    // Compatability for assets published using the original script.
    // This provided customization only for the avatar.
    // TODO: This can be removed in the near future.
    window.avatarPalette = {
        eyes:       0,
        hair:       0,
        figure:     0,
        skinA:      "FFCC99",
        skinB:      "#F49E50",
        hairA:      "#663300",
        hairB:      "#FF00FF",
        eyeA:       "#663300",
        eyeB:       "#FF00FF",
        outfitA:    "#E5CCFF",
        outfitB:    "#70618D"
    };

    // New dynamic assetPalettes for customizable actors.
    window.assetPalettes = [
        {   // Slot 0 - Avatar defaults.
            features: {
                eyes:   0,
                hair:   0,
                figure: 0
            },
            colors: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            },
            colorsDark: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            }
        },
        {   // Slot 1 - Judge defaults.
            features: {
                eyes:   0,
                hair:   0,
                figure: 0
            },
            colors: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            },
            colorsDark: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            }
        },
        {   // Slot 2 - Defense attorney defaults.
            features: {
                eyes:   0,
                hair:   0,
                figure: 0
            },
            colors: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            },
            colorsDark: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            }
        },
        {   // Slot 3 - Prosecutor defaults.
            features: {
                eyes:   0,
                hair:   0,
                figure: 0
            },
            colors: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            },
            colorsDark: {
                0:     "#663300",
                3:     "#663300",
                4:     "#E5CCFF",
                5:     "#FFCC99"
            }
        }
    ];
`;

// Arguments are path to asset, output image path.
async function thumbnail (inPath, outPath) {
    const fs = require('fs-extra');
    const path = require('path');
    const { GenThumbnail, DataURLToImage } = require('animate-canvas-thumbnail');

    fs.ensureDirSync(path.dirname(outPath));

    const res = await GenThumbnail(inPath, {
        exec: to_execute,
        imageQuality: 0.9,
        width: 400,
        height: 225,
        scale: 0.208
    });
    DataURLToImage(res, outPath);
}



if (process.argv.length != 4) {
    Error('inPath and outPath arguments not specified.');
    process.exit();
}

thumbnail(process.argv[2], process.argv[3])
    .catch(err => {
        console.log(err.message);
    })
    .finally(()=>{
        process.exit();
    });
