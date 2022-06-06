# DIGI online servlet

**A programról**

Ez egy servlet, illetve lejátszótól független kiegészítő ami a hivatalos http://digionline.hu weboldalon elérhető tv csatornák megnyitását teszi lehetővé külső alkalmazások számára. 

Szükséges hozzá már meglévő hozzáférés, melyet abban az esetben regisztrálhatsz a digi ügyfélkapuján keresztül, ha rendelkezel már kábeltévé és internet előfizetéssel is. E program működéséhez nem szükséges digi hálózat és EU-n belül bárhonnan nézhető.

Egy előfizetéshez jelenleg max három digionline account regisztrálható, a servlet egyszerre csak egy accountot kezel, így egyidőben egy servlet egyetlen lejátszót képes kiszolgálni.

E program indításakor legenerál egy m3u és egy xml fájlt - az előbbiben a teljes csatornalista az utóbbiban 5 napra előre elektronikus programujság (EPG) található, melyet képes lejátszani a VLC, de teljes műsorújsággal együtt a KODI is. Mielőtt megkérdeznéd, igen, kell ennek az alkalmazásnak folyamatosan futnia amikor tévézel és nem, nem elég az m3u és az xml fájlt "csak valahova átmásolni".

Miközben ez az alkalmazás fut Kodi-n az IPTV Simple Client-et kell beállítani, majd bekapcsolni - miután a servlet elindult a háttérben megnyithatóvá válnak a digionline rendszerében elérhető csatornák HD minőségben.

_Fontos tudni, hogy e program nem hivatalos kiadás, működéséért garanciát nem vállalok._

Tisztelettel megkérlek, ha hibát találtál vagy ha csak nem értesz valamit vegyél fel github-on [hibajegyet](https://github.com/szabbenjamin/digionline/issues/new) vagy kérdezz [Telegram](https://t.me/szabbenjamin_digionline_servlet) csatornánkon és segítünk!

**Ajánlott, tesztelt környezet**

- [OSMC](https://osmc.tv/download/), azaz KODI variáns Raspberry Pi-re

_Legutoljára tesztelt hivatalos verzió: Kodi 18.5_



**Hogyan telepítsem Raspberry Pi OSMC rendszerre?**

* Töltsd le és telepítsd a raspberry pi-re az OSMC médialejátszót.

* Jelentkezz be ssh-n.

* Raspberry pi 1-2-3 verziók esetén:

`sudo su`

`wget -N https://raw.githubusercontent.com/szabbenjamin/digionline/master/osmc_installer.sh && bash osmc_installer.sh`

* Raspberry pi 4 esetén:

`sudo su`

`wget -N https://raw.githubusercontent.com/szabbenjamin/digionline/master/raspi4_osmc_installer.sh && bash raspi4_osmc_installer.sh`
 
A telepítő automatikusan letölti, telepíti a futtatókörnyezetet, megkér a felhasználónév, jelszó megadására, frissíti a telepített verziót, majd újraindul

* Újraindulást követően várj kb 5-10 percet míg a háttérben az elektronikus programújságot (EPG) első alkalommal betölti

* PVR bővítmények között Simple IPTV client beállításait nyisd meg, fájlszinten tallózd be a channels_IPTV.m3u8 és epg.xml fájlokat

* Szükség esetén korrigálj az epg időeltolódásán

* Mentsd a beállításokat és engedélyezd a plugint, ekkor kapnod kell értesítést arról, hogy talált a KODI csatornákat

Enjoy!

_Az alkalmazás karbantartása az én időmbe és részben saját anyagi ráfordításomba is kerül így ha gondolod van lehetőséget támogatni a projektet: https://paypal.me/dicsportal_

**Telepítés egyéb linuxos rendszerekre**

Telepítési segédlet Ubuntu 18.04 rendszerre: [Wiki](https://github.com/szabbenjamin/digionline/wiki/Telep%C3%ADt%C3%A9s-Ubuntu-18.04-rendszerre)

**Frissítések**

V2.2.11

- EPG update [#70](https://github.com/szabbenjamin/digionline/issues/70)


V2.2.10

- Hosszabb tétlenség esetén munkamenet fenntartása, munkamenet lejárata esetén gyorsabb bejelentkezés. [Részletek](https://github.com/szabbenjamin/digionline/issues/66)

V2.2.9

- Raspberry Pi 4-el kompatibilis OSMC verzió támogatásának bevezetése. 

Az eddigi osmc_installer.sh a régi, "klasszik" raspi-kra való, a raspi4_osmc_installer.sh pedig a Raspberry Pi 4-en és 400-ason futtatható OSMC-t támogatja. Az eltérés az új telepítőben azért van szükség mivel a régebbi, elavult hardverek nem támogatják az új node futtatókörnyzetet, az új hardver pedig a régieket.

V2.2.8

- config.ts átvezetése config.json fájlba. Ezentúl nem szükséges config fájl módosítgatását követően npm test-et futtatni. Ezenkívül egy öntesztben program indításakor az alkalmazás leteszteli a config.json fájlt. A változtatás a dockerfájlba is átvezetésre került. *Erre a verzióra való frissítés esetén szükséges a config.json fájlt kitölteni!*

- OSMC installer kisebb hibajavítás

V2.2.5

- műsorújság frissítése

- Választható "mai", illetve "heti" műsorújság a config.ts fájlban. Kisebb, lassabb gép esetén a mai célszerűbb mivel így kevesebb adatot kell letölteni és feldolgozni az EPG generálásakor. Korábbi verziókról frissítés esetén alapértelmezett a "heti" beállítás. Módosításhoz másold át az epg-n belüli type sort a frissített config.sample.ts fájlból!

V2.2.4

- Docker konfig frissítése (köszi [Balint Kardos](balint@cardos.hu))
- OSMC installer frissítése (köszi [NH3CL](neutrino@poison-hosting.com))

V2.2.3

A feature-ökért köszönet [cSuwwi](github@dromax.hu)!

- user agent update + minden digi/epg musor betoltesnel hasznalja
- az epg file sorrendje alapjan tolti be a kodi csatornakat, nem abc sorrendben. szukseg szerint modosithato, az uj csatornak elore fognak kerulni
- a kiwi tvbol tv2 kids lett, valtozott a csatorna szama is, epg fix

V2.2.2

- package.json csomag verziók frissítése
- osmc installer frissítése (köszi [NH3CL](neutrino@poison-hosting.com))
- régi logfájlok törlése (köszi [cSuwwi](github@dromax.hu))
- műsorújság frissítése (köszi [cSuwwi](github@dromax.hu))

V2.2.1

- Epg xml generálás javítása. [Részletek](https://github.com/szabbenjamin/digionline/issues/29)

V2.2.0

Stabilitással és új funkciókkal kapcsolatos kiadás

- channels.csv generálása, hogy ha szükséged van rá olvashatóbb, feldolgozhatóbb csatornalistát kapj

- Kezelje le a program ha egy digionline rendszerében nem létező csatornát akarok lekérni és az eredeti oldal 404-et dob

- Elérhető fájlok/források URL-je a könnyebb kezdéshez, illetve eligazodáshoz konzolon indításkor

- Mivel változott a digionline csatornák ID-ja (számozása), így akik nem a dinamikusan frissülő IPTV m3u8 fájlt használják hanem például tvheadend-et azoknak készült egy fordító, hogy a régi ID-t meghívva annak megfelelő új párjára kerüljön átfordításra. A régi-új párokat a helpers/pairs.json fájl tartalmazza.

V2.1.4

- Biztonsági javítások

V2.1.3

- A Digi rendszerében fellépő SSL hibára ideiglenes javítás. [Részletek](https://github.com/szabbenjamin/digionline/issues/25)

V2.1.2

Stabilitással kapcsolatos javítások

- Abban az esetben ha a digitől nem érkezik (pedig kellene) a kívánt (pl hq minőségű) stream akkor az elérhető legjobb minőségűre vált át az app és jelez logban adáshibát

V2.1.1

- Hibajavítás, okosabb telepítő visszavonása

- Legújabb KODI-val való linuxon együtt-nem-működés javítása

V2.1.0

Köszönet a közreműködésért [istvans](https://github.com/istvans) -nak! Az okosabb telepítő miatt megkapta egyből a 2.1-es minor update jelzőt.

 - Dockerfile
 
 - Okosabb telepítő
 
 - Kategóriák név szerinti betöltése
 
 - Stabilitási problémák javítása

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

OSMC-n a `force_epg_reload.sh` futtatásával ki lehet kenyszeriteni a beállítás életbelépését.

_Ha hibát találsz githubon vegyél fel rá issue-t!_

**Visszajelzés, támogatás**

Sokat segítesz abban, hogy ha hibát találtál, észrevételed van felveszed a kapcsolatot velünk Telegram-on vagy kiírsz github issue-t!

Telegram csoportunk elérhetősége: [https://t.me/szabbenjamin_digionline_servlet](https://t.me/szabbenjamin_digionline_servlet)

Ha támogatni szeretnéd a munkámat (vagy meg szeretnél hívni egy sörre) paypal-on van erre lehetőséged: [https://paypal.me/dicsportal](https://paypal.me/dicsportal)




Jó szórakozást!
