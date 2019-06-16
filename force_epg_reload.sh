#!/bin/bash
DB_DIR=$HOME/.kodi/userdata/Database

printf "TV adatbazis torles... "
rm $DB_DIR/Epg*.db $DB_DIR/TV*.db
echo kesz

printf "kodi ujrainditas... "
service mediacenter restart
echo kesz

WAIT_TIME=10
printf "varunk $WAIT_TIME masodpercet... "
sleep $WAIT_TIME
echo kesz

echo "a friss adatbazis ellenorzese"
ls -hal $DB_DIR/Epg*.db $DB_DIR/TV*.db
