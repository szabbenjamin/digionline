import FileHandler from "./file";

class Log {
    public static write (...input) : void {
        const today = new Date();
        const isoDateString = today.toISOString().substring(0, 10);

        console.log((new Date()).toString(), input);
        FileHandler.appendFile(`log/${isoDateString}.log`, `${(new Date()).toString()} # ${JSON.stringify(input)}`);
    }

    public static error (...input) : void {
        Log.write(`################# FATAL ERROR #############`);
        Log.write(...input);
        setTimeout(() => {
            process.exit();
        }, 2000);
    }
}

export default Log;
