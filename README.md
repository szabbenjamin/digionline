# DIGI online servlet

**A programról**

Ez egy servlet, illetve lejátszótól független kiegészítő ami a hivatalos http://onlineplayer.digi.hu weboldalon elérhető tv csatornák megnyitását teszi lehetővé külső alkalmazások számára. 

Szükséges hozzá már meglévő digionline hozzáférés, melyet abban az esetben regisztrálhatsz a digi ügyfélkapuján keresztül, ha rendelkezel kábeltévé és internet előfizetéssel is. E program működéséhez nem szükséges digi hálózat, de legjobb tudomásom szerint csak magyar ip címről működik.

Egy előfizetéshez jelenleg max három digionline account regisztrálható, a servlet egyszerre csak egy accountot kezel, így egyidőben egy servlet egyetlen lejátszót képes kiszolgálni.

E program indításakor legenerál egy m3u és egy xml fájlt - az előbbiben a teljes csatornalista az utóbbiban 5 napra elölre elektronikus programujság (EPG) található, melyet képes lejátszani a VLC, de teljes műsorújsággal együtt a KODI is.

Kodi-n az IPTV Simple Client-et kell beállítani, majd bekapcsolni - miután a servlet elindult a háttérben megnyithatóvá válnak a digionline rendszerében elérhető csatornák HD minőségben.

Fontos tudni, hogy e program nem hivatalos kiadás, működéséért garanciát nem vállalok.

**Telepítés linux rendszerekre**

Telepítsd a nodejs v7 vagy annál nagyobb futtatókörnyezetet a saját linux rendszeredre: https://nodejs.org/en/download/package-manager/

Állj arra a mappára ahova a servletet telepíteni szeretnéd, majd:

`git clone https://github.com/szabbenjamin/digionline`

`cd digionline`

`cp config.sample.js config.js`

`nano config.js`

Itt töltsd ki a bejelentkezési adataidat, illetve azt az url-t, amin a servlet a hálózatodon elérhető lesz.

Ezután:

`cd engine`

`npm install`

`npm start`


Ekkor elindul a csatornalista és az EPG betöltése - ez eltarthat néhány percig is.

Ha az epg.xml újraírva információt látod nyisd meg a Kodit, engedélyezd a már telepített bővítmények között az IPTV PVR ügyfelet, majd az általános beállítások fülön állítsd be a generálódott channels.m3u fájlt, az EPG beállítások fülön pedig a generált epg.xml fájlt.

Ezután indítsd újra a Kodit, ha kell a beállításokban engedélyezd az IPTV PVR simple client-et, mint PVR ügyfelet és a betöltődött csatornalistában próbálj elindítani egy tv csatornát.

Hibás működés esetén figyeld a log.log fájl tartalmát:

`tail -f log.log`

Ha szeretnéd szolgáltatásként felvenni systemctl-be akkor az alábbit tedd:

`nano /etc/systemd/system/digionline.service`

```bash
[Unit]
Description=Digionline tv servlet app
[Service]
ExecStart=/home/osmc/digionline/engine/start.sh
WorkingDirectory=/home/osmc/digionline/engine/
[Install]
WantedBy=multi-user.target
```
```
systemctl enable digionline
systemctl start digionline
```


Ha hibát találtál vedd fel a kapcsolatot velem facebookon, vagy vegyél fel hibajegyet itt, github-on.

Ha pedig úgy érzed meghívnál egy sörre én nem ellenkezem. :) 

Paypal, kapcsolatfelvétel: szabbenjamin #kukac gmail #pont com



Jó szórakozást!
