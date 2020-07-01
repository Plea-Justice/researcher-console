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
            
            // FIXME: Duplicate asset names possible.
            // Also do not return extension. Separate arrays best rather than ID lookups.
            clips.map(name => (assets[name] = {'name': name, 'type': 'clips'}));
            actors.map(name => (assets[name] = {'name': name, 'type': 'actors'}));
            fgs.map(name => (assets[name] = {'name': name, 'type': 'foregrounds'}));
            bgs.map(name => (assets[name] = {'name': name, 'type': 'backgrounds'}));

            let assetList = Array.prototype.concat(clips, actors, fgs, bgs);
            res.status(200).json({
                success: true,
                message: 'Asset list returned.',
                return: {assetList, assets}
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'There was an error reading from the asset data directory.',
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
        let file = req.params.filename;
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);
        
        fs.unlink(`${options.config.data_dir}/${req.session.user_id}/${file}`, (err)=>{
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