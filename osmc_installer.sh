#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Futtasd root modban. Ird be: sudo su"
  exit
fi

echo "DIGIOnline v2 servlet telepito indul...";

sleep 2;

apt-get update;
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get install -y nodejs git
apt-get install -y npm
npm install typescript -g

git clone https://github.com/szabbenjamin/digionline
cd digionline

echo "#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd /home/osmc/digionline
npm start" > digionline.sh
chmod +x digionline.sh

npm install
cp config.sample.ts config.ts
touch epg.xml
echo "Kerlek add meg bejelentkezesi adataidat... (Egy pillanat es nyilik a szerkeszto. Mentes: CTRL+X)"
sleep 5
nano config.ts
mkdir log
echo "[Unit]
Description=digionline servlet app

[Service]
ExecStart=/home/osmc/digionline/digionline.sh
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/home/osmc/digionline

[Install]
WantedBy=multi-user.target" > digionline.service

tsc main.ts
cp digionline.service /etc/systemd/system
systemctl start digionline
systemctl enable digionline
apt-get update
apt-get upgrade

echo "A telepítő lefutott, újraindítás 10 mp múlva";
sleep 10
reboot

