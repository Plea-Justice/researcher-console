// Run as child process.
// Arguments are path to asset, output image path.

async function thumbnail (inPath, outPath) {
    const fs = require('fs-extra');
    const path = require('path');
    const { GenThumbnail, DataURLToImage } = require('animate-canvas-thumbnail');

    fs.ensureDirSync(path.dirname(outPath));

    let res = await GenThumbnail(inPath, {
        exec:
        // Define default color palette for thumbnails globally.
        `window.avatarPalette = {
            skinA: "#FFCC99",
            skinB: "#F49E50",
            hairA: "#663300",
            hairB: "#FF00FF",
            eyeA: "#663300",
            eyeB: "#FF00FF",
            outfitA: "#E5CCFF",
            outfitB: "#70618D",
            eyes: 0,
            hair: 0,
            figure: 0
        };`,
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

