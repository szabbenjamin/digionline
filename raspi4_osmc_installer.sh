#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Futtasd root modban. Ird be: sudo su"
  exit
fi

echo "Digionline raspi4 servlet telepito indul...";

# OS update
apt-get update && apt upgrade -y;

# Node keretrendszer betöltése
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs git

# Forrás letöltése
git clone https://github.com/szabbenjamin/digionline &&
cd digionline;

# Csomagok telepítése, konfig felkészítése, build
npm i &&
cp config.sample.json config.json &&
touch epg.xml &&
npm run build &&
echo "Kerlek add meg bejelentkezesi adataidat... (Egy pillanat es nyilik a szerkeszto. Mentes: CTRL+X)";
sleep 5;

# Személyi profil kitöltése
nano config.json;

# log mappa
mkdir log;

# Futtatható fájl létrehozása
echo "#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd /home/osmc/digionline
npm start" > /home/osmc/digionline/digionline.sh

# Szolgáltatás létrehozása
echo "[Unit]
Description=digionline servlet app

[Service]
ExecStart=bash /home/osmc/digionline/digionline.sh
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/home/osmc/digionline

[Install]
WantedBy=multi-user.target" > /home/osmc/digionline/digionline.service

# Copy systemd-be
cp digionline.service /etc/systemd/system

# Szolgáltatás indítása, engedélyezése
systemctl start digionline &&
systemctl enable digionline

# Telepítés vége, indítsd újra
echo "";
echo "##########################################";
echo "A telepítő lefutott, újraindítás szükséges";
read -p "Akarod most újraindítani a rendszert? [I/N]" -n 1 -r
echo
if [[ $REPLY =~ ^[Ii]$ ]]
then
    shutdown -r now
else
	echo "Újraindítás később"
fi
