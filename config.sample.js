const config = {
    preUrl: 'http://localhost:1234',
    USERDATA: {
        email: '',
        pass: ''
    },
    // a legjobb stream kiválasztása. Instabil, de szükséges lehet az olyan programok számára, mint a tvheadend
    findBestUrl: false
};

module.exports = config;
