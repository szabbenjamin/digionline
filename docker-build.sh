# Build docker image: 
   sudo docker build -t digionline https://github.com/szabbenjamin/digionline.git
# Create and run docker container: 
   sudo docker run -d -p 9999:9999 --restart unless-stopped --env DOMAIN=valami.local --env EMAIL=a@b.hu --env PASSWORD=jelszo --name container-digionline digionline
# Kodi PVR IPTV Simple Client addon 
#   TV channel list: http://localhost:9999/channels_IPTV.m3u8
#   TV EPG source: http://localhost:9999/epg.xml
