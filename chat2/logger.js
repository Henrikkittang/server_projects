const fs = require('fs');


class Logger{
    constructor(options={}){
        this.options = {
            printDebug: options.printDebug || false,
            printMode: options.printMode || false,
            fileWrite: options.fileWrite || true,
            rootDirectory: options.rootDirectory || './logs'
        };
    }

    _writeFile(message){
        const date = new Date();
       
        const month = date.toString().substring(4, 7);
        const day = date.toString().substring(7, 10);
        const timeString = date.toString().substring(16, 24);
        const rootDir = this.options.rootDirectory;

        const path = `${rootDir}/${month}/${day}.log`;
        const data = `${timeString} - ${message} \n`;
        if(!fs.existsSync(`${rootDir}/${month}`))
            fs.mkdirSync(`${rootDir}/${month}`);
        if(!fs.existsSync(`${rootDir}/${month}/${day}.log`))
            fs.writeFileSync(`${rootDir}/${month}/${day}.log`, '');

        fs.appendFile(path, data, (err) => {});
    }

    _applyOptions(message){
        if(this.options.printMode)
            console.log(message);
        if(this.options.fileWrite)
            this._writeFile(message);
    }

    debug(message){
        const data = 'Debug: ' + message;
        if(this.options.printDebug)
            console.log(data);
    }   
    info(message){
        const data = 'Info: ' + message
        this._applyOptions(data);
    }
    warning(message){
        const data = 'Warning: ' + message
        this._applyOptions(data);
    }
    error(message){
        const data = 'Error: ' + message
        this._applyOptions(data);
    }
}

module.exports = Logger;





