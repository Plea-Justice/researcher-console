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
                return: null
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

            await fs.mkdirp(path.join(user_data_dir, 'clips'));
            await fs.mkdirp(path.join(user_data_dir, 'actors'));
            await fs.mkdirp(path.join(user_data_dir, 'foregrounds'));
            await fs.mkdirp(path.join(user_data_dir, 'backgrounds'));

            let clips = await fs.readdir(path.join(user_data_dir, 'clips'));
            let actors =  await fs.readdir(path.join(user_data_dir, 'actors'));
            let fgs =  await fs.readdir(path.join(user_data_dir, 'foregrounds'));
            let bgs =  await fs.readdir(path.join(user_data_dir, 'backgrounds'));
            
            clips.map(name => (assets[`clips/${name}`] = 
                {'name': name.slice(0, name.lastIndexOf('.')), 'type': 'clips'}));
            actors.map(name => (assets[`actors/${name}`] = 
                {'name': name.slice(0, name.lastIndexOf('.')), 'type': 'actors'}));
            fgs.map(name => (assets[`foregrounds/${name}`] = 
                {'name': name.slice(0, name.lastIndexOf('.')), 'type': 'foregrounds'}));
            bgs.map(name => (assets[`backgrounds/${name}`] = 
                {'name': name.slice(0, name.lastIndexOf('.')), 'type': 'backgrounds'}));

            clips = clips.map(name => `clips/${name}`);
            actors = actors.map(name => `actors/${name}`);
            fgs = fgs.map(name => `foregrounds/${name}`);
            bgs = bgs.map(name => `backgrounds/${name}`);

            let assetList = Array.prototype.concat(clips, actors, fgs, bgs);
            let assetTypes = ['clips', 'actors', 'foregrounds', 'backgrounds'];
            res.status(200).json({
                success: true,
                message: 'Asset list returned.',
                return: {assetList, assets, assetTypes}
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'There was an error reading the user\'s assets.',
                return: err
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
                return: null
            });
        else if (!req.body.type ||  !(
            req.body.type === 'clips' ||
            req.body.type === 'actors' ||
            req.body.type === 'foregrounds' ||
            req.body.type === 'backgrounds'
        ))
            res.status(400).json({
                success: false,
                message: 'Invalid asset type.',
                return: null
            });
        else if ((req.body.type === 'clips' || req.body.type === 'actors') && 
            !req.files.upload.name.endsWith('.js'))
            res.status(400).json({
                success: false,
                message: 'Clips and assets must have a JavaScript file extension.',
                return: null
            });
        else if ((req.body.type === 'foregrounds' || req.body.type === 'backgrounds') && 
            !(req.files.upload.name.endsWith('.png') || req.files.upload.name.endsWith('.jpg')))
            res.status(400).json({
                success: false,
                message: 'Foreground and background images must have a PNG or JPEG file extension.',
                return: null
            });
        else 
            req.files.upload.mv(path.join(user_data_dir, `${req.body.type}/${req.files.upload.name}`), (err)=>{
                if (err)
                    res.status(500).json({
                        success: false,
                        message: 'Error adding file to user data directory.',
                        return: err
                    });
                else res.status(200).json({
                    success: true,
                    message: 'Asset uploaded.',
                    return: req.files.upload.name
                });
            });
    });

    /**
     * Delete a file.
     */
    router.delete('/:filename', (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);
        
        fs.unlink(path.join(user_data_dir, req.params.filename), (err)=>{
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'Error deleting asset.',
                    return: err
                });
            else res.status(200).json({
                success: true,
                message: 'Asset deleted.',
                return: null
            });
        });
    });

    return router;
};