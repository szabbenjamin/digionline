# DIGI online servlet

**A programról**

Ez egy servlet, illetve lejátszótól független kiegészítő ami a hivatalos http://onlineplayer.digi.hu weboldalon elérhető tv csatornák megnyitását teszi lehetővé külső alkalmazások számára. 

Szükséges hozzá már meglévő digionline hozzáférés, melyet abban az esetben regisztrálhatsz a digi ügyfélkapuján keresztül, ha rendelkezel kábeltévé és internet előfizetéssel is. E program működéséhez nem szükséges digi hálózat, de legjobb tudomásom szerint csak magyar ip címről működik.

Egy előfizetéshez jelenleg max három digionline account regisztrálható, a servlet egyszerre csak egy accountot kezel, így egyidőben egy servlet egyetlen lejátszót képes kiszolgálni.

E program indításakor legenerál egy m3u és egy xml fájlt - az előbbiben a teljes csatornalista az utóbbiban 5 napra elölre elektronikus programujság (EPG) található, melyet képes lejátszani a VLC, de teljes műsorújsággal együtt a KODI is.

Kodi-n az IPTV Simple Client-et kell beállítani, majd bekapcsolni - miután a servlet elindult a háttérben megnyithatóvá válnak a digionline rendszerében elérhető csatornák HD minőségben.

Fontos tudni, hogy e program nem hivatalos kiadás, működéséért garanciát nem vállalok.

**Frissítések**

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
