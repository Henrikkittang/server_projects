const fs = require('fs');


class Database {
    constructor(dir) {
        this.filename = 'databases/' + dir + '.json'
        const rawData = fs.readFileSync(this.filename, 'utf8');
        this.mainObject = JSON.parse(rawData);
    }
    save(){
        const string = JSON.stringify(this.mainObject);
        fs.writeFileSync(this.filename, string, 'utf8', ()=>{});
    }
    getMain(){
        return this.mainObject;
    }
    find(key){
        try{return this.mainObject[key]}
        catch(err){return null}
    }
    exists(key){
        return this.find(key) != null;
    }
    write(key, value){
        this.mainObject[key] = value;
    }
    pushArray(key, value){
        this.mainObject[key].push(value);
    }
    removeArray(key, value){
        const index = this.mainObject[key].indexOf(value);
        this.mainObject[key].splice(index, 1);
    }
    new(key, obj){
        this.mainObject[`${key}`] = obj;
    }
    increment(key, amount){
        this.mainObject[key] += amount;
    }
}

module.exports = Database;