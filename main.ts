import Digionline from "./lib/digionline";
import Webconnect from "./lib/webconnect";

class Main {
    constructor() {
        this.init();
    }

    public init() {
        const digi = new Digionline(() => {
            const server = new Webconnect();
            server.setDigi(digi);
            server.listen();
        });
    }

}

new Main();
