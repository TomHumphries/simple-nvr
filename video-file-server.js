const express = require('express');
const path = require('path');
const fs = require('fs');

var router = express.Router();

const storage = require('./storage.json');

router.get('/api/*.mp4', (req, res, next) => {
    // const location = req.params.location;
    // const year = req.params.year;
    // const month = req.params.month;
    // const day = req.params.day;
    // const filename = req.params.filename;
    const parts = `${req.params['0']}.mp4`.split('/').filter(x => x.length > 0);


    // https://stackoverflow.com/a/24977085/10159640
    var filepath = path.join(storage.rootpath, ...parts);
    fs.stat(filepath, function (err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log('file not found', err);
                // 404 Error if file not found
                return res.status(404).send();
            }
            console.log('file stat error', err);
            return res.send(err);
        }
        var range = req.headers.range;
        if (!range) {
            // 416 Wrong range
            console.log('no req range header')
            return res.status(416).send();
        }
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;

        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
        });

        var stream = fs.createReadStream(filepath, { start: start, end: end })
            .on("open", function () {
                stream.pipe(res);
            }).on("error", function (err) {
                console.log('stream error', err)
                res.send(err);
            });
    });
})

module.exports = router;