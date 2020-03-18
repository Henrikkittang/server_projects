const fs = require('fs');


class Database {
    constructor(dir) {
        this.filename = dir + '.json'
        const rawData = fs.readFileSync(this.filename, 'utf8');
        this.mainObject = JSON.parse(rawData);
    }
    save(){
        const string = JSON.stringify(this.mainObject);
        fs.writeFileSync(this.filename, string, 'utf8', ()=>{});
    }
    find(key){
        try{return this.mainObject[key]}
        catch(err){return null}
    }
    write(key, property, value){
        this.mainObject[key][`${property}`] = value;
    }
    pushArray(key, property, value){
        this.mainObject[key][`${property}`].push(value);
    }
    removeArray(key, property, value){
        const index = this.mainObject[key][`${property}`].indexOf(value);
        this.mainObject[key][`${property}`].splice(index, 1);
    }
    new(key, obj){
        this.mainObject[`${key}`] = obj;
    }
    increment(key, property, amount){
        this.mainObject[key][`${property}`] += amount;
    }
}

module.exports = Database;