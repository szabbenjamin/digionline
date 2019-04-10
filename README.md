# DIGI online servlet

**A programról**

Ez egy servlet, illetve lejátszótól független kiegészítő ami a hivatalos http://digionline.hu weboldalon elérhető tv csatornák megnyitását teszi lehetővé külső alkalmazások számára. 

Szükséges hozzá már meglévő hozzáférés, melyet abban az esetben regisztrálhatsz a digi ügyfélkapuján keresztül, ha rendelkezel már kábeltévé és internet előfizetéssel is. E program működéséhez nem szükséges digi hálózat és EU-n belül bárhonnan nézhető.

Egy előfizetéshez jelenleg max három digionline account regisztrálható, a servlet egyszerre csak egy accountot kezel, így egyidőben egy servlet egyetlen lejátszót képes kiszolgálni.

E program indításakor legenerál egy m3u és egy xml fájlt - az előbbiben a teljes csatornalista az utóbbiban 5 napra előre elektronikus programujság (EPG) található, melyet képes lejátszani a VLC, de teljes műsorújsággal együtt a KODI is.

Kodi-n az IPTV Simple Client-et kell beállítani, majd bekapcsolni - miután a servlet elindult a háttérben megnyithatóvá válnak a digionline rendszerében elérhető csatornák HD minőségben.

Fontos tudni, hogy e program nem hivatalos kiadás, működéséért garanciát nem vállalok.

Tisztelettel megkérlek, ha hibát találtál vagy ha csak nem értesz valamit vegyél fel github-on issue-t vagy kérdezz [Telegram](https://t.me/szabbenjamin_digionline) csatornánkon és segítünk!

**Telepítés Raspberry Pi OSMC rendszerre**

Töltsd le és telepítsd a raspberry pi-re az OSMC médialejátszót - ez egy rPI-re való Kodi verzió.

Jelentkezz be ssh-n.

`sudo su`

`wget https://raw.githubusercontent.com/szabbenjamin/digionline/master/osmc_installer.sh && bash osmc_installer.sh`

**Telepítés egyéb linuxos rendszerekre**

Kezd itt: [Wiki](https://github.com/szabbenjamin/digionline/wiki/V2-how:to:linux)

**Frissítések**

V2.0.0

- Közel teljes refaktorálás a digionline.hu alapú rendszerére. A program használata, a konfiguráció, a működés teljes egészében megváltozott. Részletekért kérlek látogasd meg a [wiki](https://github.com/szabbenjamin/digionline/wiki/V2-how:to)-t

A korábbi, már kifutott v1-es rendszer frissítéseinek listája [itt](https://github.com/szabbenjamin/digionline/wiki/V1-changelog) található.

**Tudnivalók az alkalmazás frissítéséről**

A v1.x.x kezdetű főverzióban a régi onlineplayer.digi.hu oldalra való hivatkozás, a digi rendszerének/backendnek megváltoztatása és az alkalmazás kódjának elavultsága tette szükségessé, hogy új főverzió készüljön. E főverzió semmilyen mértékben nem kompatibilis a korábbival, így újratelepítés szükséges annak beállításához. Alább összeszedtem az átállással kapcsolatos legfontosabb tudnivalókat.

 - [Frissítés a v1-ről az új v2-es verzióra](https://github.com/szabbenjamin/digionline/wiki/V2-how:to-%C3%A1t%C3%A1ll%C3%A1s)
 
 - [Átállás tesztről a főverzióra](https://github.com/szabbenjamin/digionline/wiki/V2-how:to-%C3%A1t%C3%A1ll%C3%A1s-a-teszt-verzi%C3%B3r%C3%B3l)

 - [Visszaállítás v2-ről v1-re](https://github.com/szabbenjamin/digionline/wiki/V2-how:to-downgrade)

**EPG eltolódás tudnivalók**

Az IPTV client alkalmazásban szükséges az aktuális időzónádnak megfelelően beállítani a megfelelő óraeltolódást.

Ezt itt találod:

`Kiegészítők > Saját kiegészítők > PVR ügyfelek > PVR IPTV Simple Client > Beállítás > EPG beállítások > EPG időeltolás (óra)`

...a nyári időszámításban értelemszerűen 2.00-re kell állítani.

_Ha hibát találsz githubon vegyél fel rá issue-t!_

**Visszajelzés, támogatás**

Sokat segítesz abban, hogy ha hibát találtál, észrevételed van felveszed a kapcsolatot velünk Telegram-on vagy kiírsz github issue-t!

Telegram csoportunk elérhetősége: [https://t.me/szabbenjamin_digionline](https://t.me/szabbenjamin_digionline)

Ha támogatni szeretnéd a munkámat (vagy meg szeretnél hívni egy sörre) paypal-on van erre lehetőséged: [https://paypal.me/dicsportal](https://paypal.me/dicsportal)




Jó szórakozást!
