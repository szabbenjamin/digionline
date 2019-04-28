#!/bin/bash

DIGI_DIR=/home/osmc/digionline
if [ ! -d $DIGI_DIR ]; then
    echo "A digionline mappa nem talalhato" >&2
    exit 1
fi

echo "DIGIOnline servlet telepito (v2) indul...";

sudo apt-get update
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs npm
sudo npm install typescript -g

cd $DIGI_DIR

git remote add upstream https://github.com/szabbenjamin/digionline.git

DIGI_LOG=/var/log/digionline.log
cat > digionline.sh <<EOL
#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd $DIGI_DIR
DIGI_LOG=$DIGI_LOG
mv $DIGI_LOG ${DIGI_LOG}.1
echo "Log: $DIGI_LOG"
npm start >$DIGI_LOG 2>&1
EOL
chmod +x digionline.sh

npm install
touch epg.xml

if [ ! -f config.ts ]; then
    cp config.sample.ts config.ts
    echo "Add meg bejelentkezesi adataidat..."
    sleep 5
    if [[ -z "$EDITOR" ]]; then
        EDITOR=nano
    fi
    $EDITOR config.ts
else
    echo "OK. A meglevo config-ot hasznaljuk"
fi

cat > digionline.service <<EOL
[Unit]
Description=digionline servlet app

[Service]
ExecStart=$DIGI_DIR/digionline.sh
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=$DIGI_DIR

[Install]
WantedBy=multi-user.target
EOL

printf "forditas... "
tsc main.ts
echo kesz

sudo cp digionline.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl start digionline
sudo systemctl enable digionline

