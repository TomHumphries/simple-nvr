const childProcess = require("child_process");
const spawn = require('child_process').spawn;
var args = process.argv.slice(2);
const directory = args[0];


function runProbe(filePath) {
    return new Promise((resolve, reject) => {
        var params = [];
        params.push('-show_streams', '-print_format', 'json', filePath);
    
        var info;
        var stderr;
    
        var ffprobe = spawn('ffprobe', params);
        ffprobe.once('close', function (code) {
            if (!code) {
                resolve(info);
            } else {
                var err = stderr.split('\n').filter(Boolean).pop();
                reject(new Error(err));
            }
        });
    
        ffprobe.stderr.on('stderr', (data) => {
            stderr = data.toString();
            console.log('stderr', data.toString());
        });
    
        ffprobe.stdout.on('data', (data) => {
            console.log('stdout', data.toString());
        })
            // .pipe(JSONStream.parse())
            // .once('data', function (data) {
            //     info = data;
            // });
    })
}

function probeFile(filepath) {
    return new Promise((resolve, reject) => {
        console.log(`probing ${filepath}`);

        const args = [
            "-hide_banner",
            `${filepath}`
        ]

        let ffmpegProcess = childProcess.spawn("ffprobe", args, {
            detached: false,
            stdio: "inherit"
        });

        ffmpegProcess.on("exit", (code, signal) => {
            console.log(`ffmpeg exited`, code, signal);
        });

        ffmpegProcess.on("close", (code, signal) => {
            console.log(`ffmpeg closed`, code, signal);
            resolve();
        });

        ffmpegProcess.on("message", message => {
            console.log(`ffmpeg message`, message);
        });

        ffmpegProcess.on("error", error => {
            console.log(`ffmpeg error`, error);
        });

        ffmpegProcess.stdout.on('data', (data) => {
            console.log('data', data);
        })
    })
}


runProbe(directory).then((data) => {
    console.log('complete', data)
}).catch((err) => {
    console.log('error', err);
})

// probeFile(directory).then(() => {
//     console.log('complete')
// }).catch((err) => {
//     console.log(err);
// })