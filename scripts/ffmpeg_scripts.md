Record audio and video. This doesn't work though since the audio stream isn't mp4 compatable.
```
ffmpeg -hide_banner -y -loglevel warning -i rtsp://192.168.1.222:554/11 -acodec copy -vcodec copy output.mp4
```

Record audio and video by re-encoding the audio to be mp4 compatable.
```
ffmpeg -hide_banner -i rtsp://192.168.1.222:554/11 -acodec aac -vcodec copy output.mp4
```

Record just the video
```
ffmpeg -hide_banner -i rtsp://192.168.1.222:554/11 -map 0:v -vcodec copy output.mp4
```

Converting a video to h265
```
ffmpeg -i "C:\Projects\NVR\2020-09-29T21 10 00.mp4" -vcodec libx265 -crf 28 C:\Projects\NVR\outfile.mp4
```

Merge script
```
node concat "/media/pi/ExternalHDD1/back/2020/10/05"
```