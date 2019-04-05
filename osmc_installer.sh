#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Futtasd root modban. Ird be: sudo su"
  exit
fi

echo "DIGIOnline servlet telepito (v2) indul...";

sleep 2;

apt-get update;
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get install -y nodejs git
apt-get install -y npm
npm install typescript -g

#git clone https://github.com/szabbenjamin/digionline
git clone --branch testing_v2 https://github.com/szabbenjamin/digionline #tesztidőszakra
cd digionline

echo "#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd /home/osmc/digionline
npm start" > digionline.sh
chmod +x digionline.sh

npm install
cp config.sample.ts config.ts
touch epg.xml
echo "Add meg bejelentkezesi adataidat..."
sleep 5
nano config.ts
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

echo "deb http://apt.osmc.tv krypton main" >> /etc/apt/sources.list
apt-get update
apt-get -y dist-upgrade && reboot
