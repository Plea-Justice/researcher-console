/**
 * See index.js for routing to this point.
 * This route handles requests regarding user animation assets.
 */

module.exports = function (options) {
    var express = require('express');
    var router = express.Router();

    var fs = require('fs');
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
    router.get('/', (req, res) => {
        fs.readdir(`${options.config.data_dir}/${req.session.user_id}`, (err, obj)=>{
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'There was an error reading from the asset data directory.',
                    return: err
                });
            else
                res.status(200).json({
                    success: true,
                    message: 'Asset list returned.',
                    return: obj
                });
        });
    });

    /**
     * Upload a file.
     * @param upload FormData object.
     * @return Filename
     */
    router.post('/', (req, res) => {
        if (!req.files || Object.keys(req.files).length === 0)
            res.status(400).json({
                success: false,
                message: 'No file was uploaded.',
                return: null
            });
        else
            req.files.upload.mv(`${options.config.data_dir}/${req.session.user_id}/${req.files.upload.name}`, (err)=>{
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

    return router;
};