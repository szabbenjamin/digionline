import * as fs from 'fs';
import Log from "./log";

class FileHandler {
    public static readFile (filename : string) : string {
        return fs.readFileSync(filename).toString();
    }

    public static readJsonFile (filename : string) : object {
        const filecontent = FileHandler.readFile(filename);
        return JSON.parse(filecontent);
    }

    public static writeFile (filename : string, input : string) : void {
        if (typeof input !== 'string') {
            Log.write('Input type is invalid');
            Log.write(filename, input);
            throw new Error('Input type is invalid' + input);
        }
        fs.writeFileSync(filename, input);
    }

    public static appendFile (filename : string, input : string) : void {
        if (typeof input !== 'string') {
            Log.write('Input type is invalid');
            Log.write(filename, input);
            throw new Error('Input type is invalid' + input);
        }
        fs.appendFile(filename, input + '\r\n', () => {});
    }

    public static writeJsonFile (filename : string, input : object) : void {
        if (typeof input !== 'object') {
            Log.write('Input type is invalid');
            Log.write(filename, input);
            throw new Error('Input type is invalid' + input);
        }
        FileHandler.writeFile(filename, JSON.stringify(input));
    }
}

export default FileHandler;
