#!/bin/bash

echo "DIGIOnline servlet telepito (v0.1) indul...";

sleep 2;

apt-get update;
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs git
git clone https://github.com/szabbenjamin/digionline
cd digionline/engine

echo "#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
git pull origin master
cd /home/osmc/digionline/engine
npm start" > tv_servlet.sh
chmod +x tv_servlet.sh

npm install
cd ..
cp config.sample.js config.js
echo "Add meg bejelentkezesi adataidat..."
sleep 5
nano config.js
echo "[Unit]
Description=Ittott.tv servlet app

[Service]
ExecStart=/home/osmc/digionline/engine/tv_servlet.sh
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/home/osmc/digionline/engine

[Install]
WantedBy=multi-user.target" > digionline.service

cp digionline.service /etc/systemd/system
systemctl start digionline
systemctl enable digionline

echo "deb http://apt.osmc.tv krypton main" >> /etc/apt/sources.list
apt-get update
apt-get -y dist-upgrade && reboot
