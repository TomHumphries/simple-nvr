const express = require('express');
const path = require('path');
const fs = require('fs');

var router = express.Router();

const storage = require('./storage.json');

router.get('/api/*.:ext', (req, res, next) => {
    // const location = req.params.location;
    // const year = req.params.year;
    // const month = req.params.month;
    // const day = req.params.day;
    // const filename = req.params.filename;
    const ext = req.params.ext;
    const parts = `${req.params['0']}.${ext}`.split('/').filter(x => x.length > 0);


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

        var videoSize = stats.size;

        // Parse Range
        // Example: "bytes=32324-"
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        // Create headers
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": `video/${ext}`,
        };
        
        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);

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