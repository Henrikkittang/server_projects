
const fetch = require('node-fetch');
let apiKey;

function parseParams(params){
    let string = '';
    Object.keys(params).forEach(key =>{
        string += `&${key}=${params[key]}`;
    });
    return string;
}

async function returnResult(endpoint, params){
    const parsedParams = parseParams(params) + `&key=${apiKey}`;
    const url = 'https://sandbox-api.brewerydb.com/v2' + endpoint + parsedParams
    const response = await fetch(url);
    const json = await response.json();
    return json;
}


class main {
    constructor(key) {
        apiKey = key;
        this.beer = new beer();
        this.brewery = new brewery();
    }
}

class beer {
    constructor() {}
    
    getById(id, params={}){
        const ids = [].concat(id || []);
        const endpoint = `/beers/?ids=${ids}`;
        return returnResult(endpoint, params);
    }
    
    find(name, params={}){
        const endpoint = `/search?q=${name}&type=beer`;
        return returnResult(endpoint, params);
    }
}

class brewery {
    constructor() {}
    
    getByCoors(latlon, params={}){
        const endpoint = `/search/geo/point/?lat=${latlon[0]}&lng=${latlon[1]}`
        return returnResult(endpoint, params);
    }
}

module.exports = main;