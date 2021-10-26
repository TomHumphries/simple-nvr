# Simple Network Video Recorder  in Node.js
This is a simple Network Video Recorder (NVR) that is designed to run on cheap hardware, such as a Raspberry Pi with a hard drive. 24/7 video streams from network cameras are saved, and the recorded files are browsable from a basic web interface.

![Camera locations](/images/camera-locations.png)

The project is deliberately bare-bones, and configuration is done through `.json` files.

The camera video streams are saved in 5 minute files (to prevent long periods of video loss should a file become corrupted). At 01:00 UTC, the video files for the previous day are concatinated into a single 24 hour file, and the 5 minute video files are deleted.

`ffmpeg` is used to connect to the camera streams and save the video feeds.


## Set up & configuration
To get started, the following steps must be taken:
1. Install [ffmpeg](https://ffmpeg.org/).
2. Choose where you want video files to be saved, and update the `rootpath` directory in the `/storage.json` configuration file.
3. Add camera names and RTSP addresses to the `/cameras.json` configuation file.
4. Run the `nvr.js` server. e.g. using [PM2](https://pm2.keymetrics.io/) with: 
```
pm2 start nvr.js --name nvr
```

The `nvr.js` server will record the videos in 5 minute clips, and combine them at 01:00 UTC every day into a 24 hour video file.
Running `nvr-browser.js` will start a webserver at `http://localhost:3000` that will enable you to browser the folder structure and view video files (see example image below)

![Video example](/images/video-example.png)

If you just want to record video without the browser, you can choose to only run `nvr.js`.

---

## Notes about the code and methods used
**Extra details about the implementation and ffmpeg configuration**

### MP4 vs MKV
`mkv` files seem to be more resistent to corruption. When unplugging the camera while an `mp4` file is being written to, the file is un-openable. When recording to an `mkv` file and the camera is unplugged, the files can be played and data is available until nearly the point of unplugging. `mkv` files can be played in the browser in the latest version of Chrome (as of October 2021). 

### Connecting to camera streams
Using a wireless connection for the cameras appears to work well, and the video feeds very rarely drop connections (usually <60 seconds a day). However using a wireless connection for the Raspberry Pi 3b+ causes many video connection drops, often several minutes a day. For this reason **it is recommended to use a wired network connection for the Raspberry Pi / base station**.

#### TCP vs UDP
UDP was tested for the `ffmpeg` streams, and although it resulted in fewer warning errors from `ffmpeg`, the video files were often corrupted with the video frames being incorrectly ordered when played back, and some files not opening at all. TCP connections do not seem to suffer from this problem. Many `ffmpeg` settings variations (e.g. the buffer size) were used to try to mitigate the UPD corruption problem, but none worked reliably.

### Detecting stream errors
Several methods of detecting when a video feed fails have been tried. Attempting to detect dropped streams by the error events raised by `ffmpeg` gave inconsistent results, and occasionally resulted in either: 
1. The feed not restarting
2. Multiple streams from the same camera

Multiple streams causes further problems, as one or more of the streams creates corrupted files that are difficult to detect programatically.

The best results are achieved with a filewatcher script. The filewatcher looks for constant changes to the raw file that is being streamed to, and when the file is not changed for a set period of time it is assumed that the stream connection has failed. The `ffmpeg` stream is then killed (if it still exists), and the stream is recreated.

### Saving the streams
The streams are saved in 5 minute segments at "regular" 5 minute intervals (i.e. at 00:00:00, 00:05:00, 00:10:00, etc.). The naming configuration offered by `ffmpeg` allows for some customisation of the filenames, but we change the filenames to a "friendlier" UTC-like format of:
```
yyyy-mm-ddThh mm ss.mkv
``` 
This allows easy identification of the file time as a human, and the filename is also easily parsable back to a UTC time. 

#### Saving location

![Camera locations](/images/folders.png)

The file that the stream is currently being written to is located in a `raw` folder. The `ffmpeg` configured datetime pattern does not seem to parse correctly according to `ISO8601` on Windows, with the lower case `z` parsing to a descriptor like `GMT Summer Time` instead of `+0100`. This causes problems with the default `Date()` parsing which the code automatically accounts for on Windows machines.
```
/camera-name/raw/%Y-%m-%dT%H %M %S%z.mkv
```
A file watcher looks for when multiple files exist in the `raw` directory, and moves all but the newest file to the camera's day directory (below), renaming it at the same time.
```
/camera-name/year/month/day/yyyy-mm-ddThh mm ss.mkv
```

### Detecting corrupted video files
Very occasionally a video file becomes corrupted, and causes the concatination script to crash. To avoid this, each video file is scanned before the concatination script runs with `ffprobe`. Corrupted files are _not_ deleted in case they contain important (but corrupted) footage, and fixing the files may be possible.

### Hardware & Cameras
Each camera on a Raspberry Pi 3b+ writing to an external HDD seems to use ~9% CPU.

![CPU use](/images/cpu-use.png)

Two _ieGeek_ cameras bought on Amazon run well when paired with a Raspberry Pi 3+. I suspect the Pi could easily handle more than 2 cameras given the CPU consumption.
