/**
 * See index.js for routing to this point.
 * This route handles requests regarding user animation assets.
 */

module.exports = function (options) {
    var express = require('express');
    var router = express.Router();

    var fs = require('fs-extra');
    var path = require('path');
    var fileupload = require('express-fileupload');
    var sanitize = require('sanitize-filename');

    const atob = (src) => Buffer.from(src, 'base64').toString('binary');
    const btoa = (src) => Buffer.from(src, 'binary').toString('base64');

    const assetTypes = ['clips', 'actors', 'foregrounds', 'backgrounds'];
    
    // express-fileupload middleware to handle asset uploads.
    router.use(fileupload({
        limits: { fileSize: options.config.max_upload_mb * 1024 * 1024},
        safeFileNames: true,
        preserveExtension: true,
        abortOnLimit: true,
        limitHandler: (req, res, next)=>{
            res.status(413).json({
                success: false,
                message: `Uploaded file too large. Assets must be less than ${options.config.max_upload_mb}MiB.`,
                result: null
            });
            next();
        },
        createParentPath: true,
        // useTempFiles: true,
        // tempFileDir: '/tmp'
    }));

    /**
     * Get a listing of the user's data assets.
     * @return [File names.]
     */
    router.get('/', async (req, res) => {
        try {
            let assets = {};
            let user_data_dir = path.join(options.config.data_dir, req.session.user_id);

            await Promise.all(assetTypes.map(type => fs.mkdirp(path.join(user_data_dir, type))));

            let list = 
                await Promise.all(assetTypes.map(type => fs.readdir(path.join(user_data_dir, type))));

            assetTypes.forEach((type, i) => 
                list[i] = list[i]
                    .map(name => path.parse(`${type}/${name}`))
                    .map(p => ({...p, 'id': btoa(path.format(p))})));
            
            list = Array.prototype.concat(...list);
            list.forEach(p => assets[p.id] = {'id': p.id, 'name': p.name, 'type': p.dir, 'thumbnail': null});

            let assetList = list.map(p => p.id);

            res.status(200).json({
                success: true,
                message: 'Asset listings returned.',
                result: {assetList, assets, assetTypes}
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                success: false,
                message: 'There was an error reading the user\'s assets.',
                result: err
            });
        }
    });

    /**
     * Upload a file.
     * @param upload FormData object.
     * @return Filename
     */
    router.post('/', (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);

        if (!req.files || Object.keys(req.files).length === 0)
            res.status(400).json({
                success: false,
                message: 'No file was uploaded.',
                result: null
            });
        else if (!assetTypes.some((el) => el === req.body.type))
            res.status(400).json({
                success: false,
                message: `Asset type does not match one of ${assetTypes}.`,
                result: req.body.type
            });
        else if ((req.body.type === 'clips' || req.body.type === 'actors') && 
            path.extname(req.files.file.name) !== '.js')
            res.status(400).json({
                success: false,
                message: 'Clips and assets must have a JavaScript file extension.',
                result: null
            });
        else if ((req.body.type === 'foregrounds' || req.body.type === 'backgrounds') && 
            (path.extname(req.files.file.name) !== '.png' && path.extname(req.files.file.name) !== '.jpg'))
            res.status(400).json({
                success: false,
                message: 'Foreground and background images must have a PNG or JPEG file extension.',
                result: null
            });
        else {
            let filepath = path.join(req.body.type, sanitize(req.files.file.name).replace(/[\s,;]+/g, '_'));
            req.files.file.mv(path.join(user_data_dir, filepath), (err)=>{
                if (err)
                    res.status(500).json({
                        success: false,
                        message: 'Error adding file to user data directory.',
                        result: err
                    });
                else res.status(200).json({
                    success: true,
                    message: 'Asset uploaded.',
                    result: btoa(filepath)
                });
            });
        }
    });

    /**
     * Delete a file. Asset ID is base64 encoded path.
     */
    router.delete('/:asset_id', async (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);        
        let asset = path.parse(atob(req.params.asset_id));

        asset.dir = sanitize(asset.dir);
        asset.base = sanitize(asset.base);

        if (!assetTypes.some((el) => el === asset.dir)) 
            res.status(400).json({
                success: false,
                message: 'Illegal asset identifier.',
                result: null
            });
        else {
            try {
                await fs.unlink(path.join(user_data_dir, path.format(asset)));
                res.status(200).json({
                    success: true,
                    message: 'Asset deleted successfully.',
                    result: null
                });
            } catch (err) {
                res.status(500).json({
                    success: false,
                    message: 'The asset could not be deleted.',
                    result: null
                });
            }
        }
    });

    return router;
};