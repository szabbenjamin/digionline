# DIGI online servlet

**A programról**

Ez egy servlet, illetve lejátszótól független kiegészítő ami a hivatalos http://onlineplayer.digi.hu weboldalon elérhető tv csatornák megnyitását teszi lehetővé külső alkalmazások számára. 

Szükséges hozzá már meglévő digionline hozzáférés, melyet abban az esetben regisztrálhatsz a digi ügyfélkapuján keresztül, ha rendelkezel kábeltévé és internet előfizetéssel is. E program működéséhez nem szükséges digi hálózat és EU-n belül bárhonnan nézhető.

Egy előfizetéshez jelenleg max három digionline account regisztrálható, a servlet egyszerre csak egy accountot kezel, így egyidőben egy servlet egyetlen lejátszót képes kiszolgálni.

E program indításakor legenerál egy m3u és egy xml fájlt - az előbbiben a teljes csatornalista az utóbbiban 5 napra elölre elektronikus programujság (EPG) található, melyet képes lejátszani a VLC, de teljes műsorújsággal együtt a KODI is.

Kodi-n az IPTV Simple Client-et kell beállítani, majd bekapcsolni - miután a servlet elindult a háttérben megnyithatóvá válnak a digionline rendszerében elérhető csatornák HD minőségben.

Fontos tudni, hogy e program nem hivatalos kiadás, működéséért garanciát nem vállalok.

Tisztelettel megkérlek, ha hibát találtál vagy ha csak nem értesz valamit vegyél fel github-on issue-t és segítünk!

**Frissítések**

v1.0.12

- Passhash bevezetése. Részletek: https://github.com/szabbenjamin/digionline/wiki/Passhash-%C3%A9s-jelsz%C3%B3-haszn%C3%A1lata

Köszi a közreműködést bela333-nak! https://github.com/bela333

v1.0.11

- Bizonyos esetekben való bejelentkezési problémák javítása
- Naplózási rendszer finomhangolása

v1.0.10
- EPG javítások
- epg-fix: "ez is érdekelheti" HTML section kiszűrése a műsorújság generálásakor
- az időzóna korrekció refaktorálása

Köszönöm a közreműködést Siroki Istvánnak! :) https://github.com/istvans

v1.0.9
- History channel versus Viasat History epg javítás

v1.0.8
- MTV Europe műsorújság javítása

v1.0.7
- Tartalmazza az elektronikus programújság (EPG) azon javítását amikor egy-egy csatornán más csatorna műsorai jelentek meg tévesen
- Raspberry pi és egyéb vékonyklienseken az EPG betöltése közben fellépő lassulás kiküszöbölésre került
- EPG műsorok eltolódási javítása (további infók lent)
- update.sh bevezetése, melynek futtatásával nullázódik az epg cache és a legújabb digionline programverzió kerül letöltésre (további infók lent)

v1.0.6

- A közszolgálati csatornák indítási problémáinak javítása

v1.0.5

- DIGIFILM -> FILMNOW átállás EPG-ben való átvezetése

v1.0.4

 - Teljes telepítő melléklet OSMC rendszerre

v1.0.3

- 12 percenként megállásra hibajavítás
- TVHeadend támogatás 
- Program indításának gyorsítása az által, hogy az EPG újratöltése 2 naponta történik és nem minden indításkor
- Minőség beállítására új struktúrájú config.js fájl
- Program stabilitás javítása

v0.9.3

- Lejátszáshoz működő url betöltése
- Képminőség beállítása
- Automata képminőség beállítás
- EPG, csatornalista http kiszolgálás

**Frissítés a legújabb verzióra**

Állj a projekt mappájába, például: 

`cd /home/osmc/digionline`

`git pull origin master`

**Saját update.sh használata**

A v1.0.7-es verzióban megtalálható egy update.sh fájl, mely futtatásával az epg alaphelyzetbe áll, illetve a program is felfrissül a legújabb verzióra.

Előfordulhat, hogy ezt az updatert egyszeri alkalommal futtathatóvá kell tenned:

`chmod +x update.sh`

Ezután használható a projekt mappájában:

`./update.sh`

**EPG eltolódás tudnivalók**

Az IPTV client alkalmazásban szükséges az aktuális időzónádnak megfelelően beállítani a megfelelő óraeltolódást.

Ezt itt találod:

`Kiegészítők > Saját kiegészítők > PVR ügyfelek > PVR IPTV Simple Client > Beállítás > EPG beállítások > EPG időeltolás (óra)`

...a nyári időszámításban értelemszerűen 2.00-re kell állítani.

_Ha hibát találsz githubon vegyél fel rá issue-t!_

**Telepítés raspberry pi-re OSMC-vel**

Töltsd le és telepítsd a raspberry pi-re az OSMC médialejátszót - ez egy rPI-re való Kodi verzió.

Jelentkezz be ssh-n.

`sudo su`

`wget https://raw.githubusercontent.com/szabbenjamin/digionline/master/osmc_installer.sh && bash osmc_installer.sh`

Mindezt videón: https://www.youtube.com/watch?v=Fp03feTzXWg

Enjoy!

**Telepítés linux rendszerekre**

Szükséged lesz node v7 vagy feletti futtatókönyezetre.

`git clone https://github.com/szabbenjamin/digionline/
`

`cd digionline/engine
`

`npm install
`

`cp config.sample.js config.js
`

`nano config.js # bejelentkezési adatokat ide
`

`npm start
`

Olvasd a wiki-t: https://github.com/szabbenjamin/digionline/wiki

**Visszajelzés, támogatás**

Ha hibát találtál vedd fel a kapcsolatot velem, vagy vegyél fel hibajegyet itt, github-on.

Ha pedig úgy érzed meghívnál egy sörre én nem ellenkezem. :) 

Paypal, kapcsolatfelvétel: szabbenjamin #kukac gmail #pont com



Jó szórakozást!
