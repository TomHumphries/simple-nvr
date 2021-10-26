myyear=$(date -d "-21 days" +"%Y")
mymonth=$(date -d "-21 days" +"%m")
myday=$(date -d "-21 days" +"%d")

echo "path = /$myyear/$mymonth/$myday"

for d in /media/pi/ExternalHDD/*/; do
    folder="$d$myyear/$mymonth/$myday"
    if [ -d "$folder" ] ; then
        echo "$folder found"
        rm -r $folder
    else
        echo "$folder does not exist"
    fi
done