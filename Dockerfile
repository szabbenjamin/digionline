FROM node:10.15.3-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Create config.ts from the sample
RUN cp config.sample.ts config.ts && \
# Replace empty email with environment variable EMAIL
    sed -i "s/email: ''/email: process.env.EMAIL/" config.ts && \
# Replace empty email with environment variable PASSWORD
    sed -i "s/password: ''/password: process.env.PASSWORD/" config.ts && \
# Install production only dependencies  
    npm install --only=production && \
# Install typescript for conversion
    npm install -g typescript && \
# Convert typescript source to javascript
    npx tsc main.ts && \
# Remove typescript
    npm uninstall -g typescript && \
# Create epg.xml
    touch epg.xml

EXPOSE 9999
CMD [ "npm", "start" ]

# Build docker image: 
#   sudo docker build -t digionline https://github.com/szabbenjamin/digionline.git
# Create and run docker container: 
#   sudo docker run -d -p 9999:9999 --restart unless-stopped --env EMAIL=a@b.hu --env PASSWORD=jelszo --name container-digionline digionline
# Kodi PVR IPTV Simple Client addon 
#   TV channel list: http://localhost:9999/channels_IPTV.m3u8
#   TV EPG source: http://localhost:9999/epg.xml
