const fs = require('fs');


class Database {
    constructor(dir) {
        this.filename = dir + '.json'
        const rawData = fs.readFileSync(this.filename, 'utf8');
        this.mainObject = JSON.parse(rawData);
        
        const test = 34
    }
    save(){
        const string = JSON.stringify(this.mainObject);
        fs.writeFileSync(this.filename, string, 'utf8', ()=>{});
    }
    find(key){
        return this.mainObject[key] || undefined;
    }
    write(key, property, value){
        this.mainObject[key][`${property}`] = value;
    }
    new(key, obj){
        this.mainObject[key] = obj;
    }
    delete(key){
        delete this.mainObject[key];
    }
    all(){
        return this.mainObject;
    }
}

module.exports = Database;