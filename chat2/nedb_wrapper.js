const OriginalDatastore = require('nedb');

class Datastore{
    constructor(options){
        this.database = new OriginalDatastore(options);
    }

    load(){
        return new Promise((resolve, reject) => {
            this.database.loadDatabase((err) => {
                err ? reject(err) : resolve();
            });
        });
    }

    insert(document){
        return new Promise((resolve, reject) => {
            this.database.insert(document, (err, doc) => {
                err ? reject(err) : resolve(doc);
            });
        });
    }

    findOne(query){
        return new Promise((resolve, reject) => {
            this.database.findOne(query, (err, doc) => {
                err ? reject(err) : resolve(doc);
            });
        });
    }

    find(query){
        return new Promise((resolve, reject) => {
            this.database.find(query, (err, doc) => {
                err ? reject(err) : resolve(doc);
            });
        });
    }

    update(query, _update, options={}){
        return new Promise((resolve, reject) => {
            this.database.update(query, _update, options, (err, doc) => {
                err ? reject(err) : resolve(doc);
            });
        });
    }

    remove(query, options={}){
        return new Promise((resolve, reject) => {
            this.database.remove(query, options, (err, doc) => {
                err ? reject(err) : resolve(doc);
            });
        });
    }
}

module.exports = Datastore;


