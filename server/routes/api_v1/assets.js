/**
 * See index.js for routing to this point.
 * This route handles requests regarding user animation assets.
 */

const ScenarioModel = require('../../models/ScenarioModel');
const AssetModel = require('../../models/AssetModel');

module.exports = function (options) {
    const express = require('express');
    const router = express.Router();

    const util = require('../../common/util');
    const { publish } = require('../../common/publish');
    const { fork } = require('child_process');

    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');
    const fileupload = require('express-fileupload');
    const sanitize = require('sanitize-filename');

    const assetTypes = util.assetTypes;

    // express-fileupload middleware to handle asset uploads.
    router.use(fileupload({
        limits: { fileSize: options.max_upload_mb * 1024 * 1024 },
        safeFileNames: true,
        preserveExtension: true,
        abortOnLimit: true,
        limitHandler: (req, res) => {
            res.status(413).json(util.failure(
                `Uploaded file too large. Assets must be less than ${options.max_upload_mb}MiB.`,
            ));
        },
        createParentPath: true,
        useTempFiles: true,
        tempFileDir: os.tmpdir()
    }));

    /**
     * Get a listing of the user's data assets.
     * @return [File names.]
     */
    router.get('/', async (req, res) => {
        const uid = req.session.user.id;

        try {
            const assets = {};

            const obj = await AssetModel.find({
                $or: [{ owner: uid }, { public: true }]
            });
            const list = obj.map(asset => ({
                ...asset.meta,
                isMine: asset.owner._id.toString() === uid,
            }));

            const assetList = list.map(asset => asset.id);

            list.forEach(asset => assets[asset.id] = asset);

            res.status(200).json(util.success('Asset listings returned.',
                {
                    assetList,
                    assets,
                    assetTypeSpecs: assetTypes.spec,
                    assetTypes: assetTypes.types
                }));
        } catch (err) {
            console.log(err);
            res.status(500).json(util.failure('There was an error reading the user\'s assets', err));
        }
    });

    /**
     * Upload a file.
     * @param upload FormData object.
     * @return Filename
     */
    router.post('/', async (req, res) => {
        const uid = req.session.user.id;
        const user_data_dir = util.userDir(options, uid);

        if (options.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }

        const permissions = await util.userPermissions(uid);
        if (!permissions.permitUploads) {
            res.status(400).json(util.failure('User does not have permission to upload.'));
            return;
        }



        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).json(util.failure('No file was uploaded.'));

        } else if (!Object.keys(assetTypes.spec)
            .some((el) => el === req.body.type)) {

            res.status(400).json(util.failure(
                'Invalid asset type.',
                req.body.type
            ));

        } else if (req.body.type.match(/clip|actor/)
            && path.extname(req.files.file.name) !== '.js') {

            res.status(400).json(util.failure('Clips and assets must have a JavaScript file extension.'));

        } else if (req.body.type.match(/foreground|background|cache/)
            && (!path.extname(req.files.file.name).match(/.*\.(png|bmp|jpg|jpeg)$/))) {

            res.status(400).json(util.failure(
                'Foreground and background images must have a PNG or JPEG file extension.',
                null
            ));

        } else {
            /* FIXME: Renaming disabled until simulation compatible.
            let name = req.body.name.length > 0
                ? req.body.name + path.extname(req.files.file.name)
                : req.files.file.name;
            */
            const name = sanitize(req.files.file.name).replace(/[\s,;]+/g, '_');
            const filepath = path.join(user_data_dir, req.body.type, name);

            if (fs.pathExistsSync(filepath)) {
                res.status(400).json(util.failure('An asset with the specified name already exists.'));
                return;
            }

            try {
                await req.files.file.mv(filepath);

                // Insert avatar customization variables into CreateJS assets.
                if (path.extname(filepath) === '.js')
                    publish(filepath);

                const asset = new AssetModel({
                    owner: uid,
                    path: path.join(req.body.type, name),
                    name: name.replace(/\..*?$/, ''),
                    type: req.body.type,
                    description: req.body.description,
                    public: req.body.public,
                    readOnly: req.body.readOnly,
                });

                await asset.save();

                // Generate a thumbnail for the asset in the background.
                fork('common/thumbnail', [
                    path.resolve(filepath),
                    path.resolve(path.join(user_data_dir, 'thumbnails', `${asset._id}.jpg`))
                ]);

                res.status(200).json(util.success('Asset uploaded.', {
                    ...asset.meta,
                    isMine: asset.owner._id.toString() === uid
                }));
            } catch (err) {
                if (fs.pathExistsSync(filepath))
                    fs.removeSync(filepath);

                res.status(500).json(
                    util.failure('Error uploading the asset. If it is still visible, delete it and try again.', err)
                );
            }
        }
    });

    /**
     * Fetch an asset's thumbnail, if it exists.
     */
    router.get('/:asset_id/thumbnail', async (req, res) => {
        try {
            const asset_id = req.params.asset_id;
            const asset = await AssetModel.findOne({ _id: asset_id });
            const user_data_dir = util.userDir(
                options,
                asset.owner.toString()
            );
            const thumbnail = path.resolve(path.join(user_data_dir, 'thumbnails', `${asset_id}.jpg`));

            if (!fs.pathExistsSync(thumbnail))
                throw Error('The specified path does not exist.');

            res.sendFile(thumbnail);
        } catch (err) {
            res.status(404).json(util.failure('The requested thumbnail image could not be found.', err));
        }
    });

    /**
     * Find references to an asset (for safe deletion).
     */
    router.get('/:asset_id/references', async (req, res) => {
        const uid = req.session.user.id;
        const asset_id = req.params.asset_id;

        try {
            const scenarios = await ScenarioModel.find({
                owner: uid
            });

            const matches = scenarios.filter(scenario =>
                Object.entries((scenario.scenes)).map(([id, scene]) =>
                    scene.props
                        ? [ scene.props.actor,
                            scene.props.clip,
                            scene.props.foreground,
                            scene.props.background
                        ]
                            .map(x => x ? x.id : '')
                            .includes(asset_id) : false).some(y => y));

            matches.map(x => ({
                id: x._id,
                name: x.name,
                description: x.description,
                survey: x.survey,
                created: x.created,
                modified: x.modified
            }));

            res.json(util.success('Returned scenarios that reference the asset.', matches));
        } catch (err) {
            res.status(500).json(util.failure('References to the asset could not be checked.', err));
        }
    });

    /**
     * Delete a file. Asset ID is base64 encoded path.
     */
    router.delete('/:asset_id', async (req, res) => {
        const uid = req.session.user.id;
        const user_data_dir = util.userDir(options, uid);
        const asset_id = req.params.asset_id;
        const thumbnail = path.join(user_data_dir, 'thumbnails', `${asset_id}.jpg`);

        if (options.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }

        try {
            const asset = await AssetModel.findOne({
                _id: asset_id,
                owner: uid
            });

            if (fs.pathExistsSync(path.join(user_data_dir, asset.path)))
                fs.unlinkSync(path.join(user_data_dir, asset.path));

            if (fs.pathExistsSync(thumbnail))
                await fs.unlinkSync(thumbnail);

            await asset.remove();

            res.status(200).json(util.success('Asset deleted successfully.'));
        } catch (err) {
            console.log(err);
            res.status(500).json(util.failure('The asset could not be deleted.', err));
        }
    });

    return router;
};
