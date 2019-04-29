#!/bin/bash

sudo -v
if [ $? -ne 0 ]; then
    echo "Nincs meg a szukseges sudo hozzaferes!" >&2
    exit 1
fi

echo "DIGIOnline servlet telepito (v2) indul...";

sudo apt-get update
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs npm
sudo npm install typescript -g

DIGI_DIR=/home/osmc/digionline
ASK_ADD_REMOTE=false
if [ ! -d $DIGI_DIR ]; then
    git clone https://github.com/szabbenjamin/digionline
else
    ASK_ADD_REMOTE=true
fi
cd $DIGI_DIR

if $ASK_ADD_REMOTE; then # fejleszto tamogatas
    ADD_REMOTE_CMD="git remote add upstream https://github.com/szabbenjamin/digionline.git"
    echo "'$ADD_REMOTE_CMD'"
    read -rep "Vegrehajtsuk? (i/n) " ANSWER
    if [[ ${ANSWER,,} =~ ^i$ ]]; then
        $ADD_REMOTE_CMD
        echo "Kesz"
    else
        echo "OK. Kihagyjuk ezt a lepest."
    fi
fi

echo "Service elokeszites..."
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

npm install
sudo touch epg.xml

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

printf "Forditas... "
tsc main.ts
echo kesz

printf "Service indul... "
sudo cp digionline.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl restart digionline
sudo systemctl enable digionline
echo kesz

