const express = require('express');
const app = express();

const port = 3001;

// initialise the cameras
const cameras = require('./camera.js');
const cameraConfigs = require('./cameras.json');

app.get('/', (req, res, next) => {
    res.send(`${cameraConfigs.length} camera configuration(s) loaded`);
})

app.listen(port, () => {
    console.log(`*** NVR running on port ${port} ***`);
})

cameras.initCameras();