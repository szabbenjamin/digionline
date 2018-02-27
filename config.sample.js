const config = {
    preUrl: 'http://localhost:1234',
    USERDATA: {
        email: '',
        pass: ''
    },
    // a legjobb stream kiválasztása. Instabil, de szükséges lehet az olyan programok számára, mint a tvheadend
    findBestUrl: false,
    // a leggyengébb minőségű stream kiválasztása. Hatása megegyezik a findBestUrl-el
    findLowestStream: false,
    // közepes minőségű stream keresése. Hatása megegyezik a findBestUrl-el
    findMediumStream: true
};

module.exports = config;
