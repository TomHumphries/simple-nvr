Record audio and video. This doesn't work though since the audio stream isn't mkv compatable.
```
ffmpeg -hide_banner -y -loglevel warning -i rtsp://192.168.1.222:554/11 -acodec copy -vcodec copy output.mkv
```

Record audio and video by re-encoding the audio to be mkv compatable.
```
ffmpeg -hide_banner -i rtsp://192.168.1.222:554/11 -acodec aac -vcodec copy output.mkv
```

Record just the video
```
ffmpeg -hide_banner -i rtsp://192.168.1.222:554/11 -map 0:v -vcodec copy output.mkv
```

Converting a video to h265
```
ffmpeg -i "C:\Projects\NVR\2020-09-29T21 10 00.mkv" -vcodec libx265 -crf 28 C:\Projects\NVR\outfile.mkv
```

Merge script
```
node concat "/media/pi/ExternalHDD1/back/2020/10/05"
```

This allows playback while recording  
```
ffmpeg -hide_banner -i rtsp://192.168.1.203:554/11 -vcodec copy C:\Users\tomhu\output.h264
```
The `movflags` flag tells the stream to stick the moovatom at the start of the stream, but it doesn't seem to be needed
```
ffmpeg -hide_banner -i rtsp://192.168.1.203:554/11 -vcodec copy -movflags +faststart C:\Users\tomhu\output.h264
```


## H264
This is not supported by browsers
```
ffmpeg -hide_banner -i rtsp://192.168.1.222:554/11 -vcodec copy /home/pi/Videos/output.h264

ffmpeg -f concat -safe 0 -i myfiles.txt -c copy outputs.mkv
```


## Camera video ffmpeg 
```
ffmpeg -hide_banner -y -loglevel warning -rtsp_transport tcp -use_wallclock_as_timestamps 1 -i rtsp://192.168.1.203:554/11 -vcodec copy -f segment -reset_timestamps 1 -segment_time 300 -segment_format mkv -segment_atclocktime 1 -strftime 1 "%Y-%m-%dT%H %M %S%z.mkv"
```