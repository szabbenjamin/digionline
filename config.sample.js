const config = {
    preUrl: 'http://localhost:1234',
    USERDATA: {
        email: '',
        /**
         * FIGYELEM! A config.js USERDATA *pass* VAGY *passhash* adatát állítsd csak be, tehát vagy egyiket vagy a másikat.
         * A pass a titkosítatlan, a passhash md5-tel titkosított jelszó, döntsd el melyiket szeretnéd tárolni!
         * Amelyiket nem szeretnéd tárolni egyszerűen csak hagyd üresen.
         */
        pass: '',
        passhash: ''
    },

    /**
     * lq - alacsony minőség
     * mq - közepes minőség
     * hq - magas minőség
     */
    preferredQuality: 'hq'
};

module.exports = config;
