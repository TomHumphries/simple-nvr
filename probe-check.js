const childProcess = require("child_process");
module.exports.probeSuccess = (filename) => {
    return new Promise((resolve, reject) => {
        let ffmpegProcess;
        try {
            console.log(`*** Spawing ffmpeg process ***`, filename);
            ffmpegProcess = childProcess.spawn("ffprobe", ["-hide_banner", filename]);
    
            ffmpegProcess.stdout.on('data', (data) => {
                console.log('[STDOUT]', filename, data.toString());
            });
    
            ffmpegProcess.stderr.on('data', (data) => {
                console.log('[STDERR]', filename, data.toString());
            });
    
            ffmpegProcess.on('exit', (code) => {
                console.log('[EXIT]', filename, `code ${code}`);
                if (code == 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
            
            ffmpegProcess.on('error', (err) => {
                console.log(`[ERROR]`, filename, err);
            });
    
        } catch (error) {
            console.log('probe error', filename, error);
            if (ffmpegProcess) ffmpegProcess.kill();
            reject(error);
        }
    })
}