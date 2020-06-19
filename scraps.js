
/*     try {
        fs.mkdirSync(options.config.data_dir + obj._id);

        for (const filename of fs.readdirSync('data_templates/scenario/'))
            fs.copyFileSync('data_templates/scenario/' + filename, options.config.data_dir + obj._id + '/' + filename);

        res.json(scenario_id);
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({ 'error': e.message });
    } */

    module.exports = {Scenario}
