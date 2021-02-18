const fetch = require('node-fetch');

class BeerDatabase{
    constructor(key) {
        this.apiKey = key;
    }

    parseParams(params){
        let string = '';
        Object.keys(params).forEach(key => string += `&${key}=${params[key]}` );
        return string;
    }

    async returnResult(endpoint, params){
        const parsedParams = this.parseParams(params) + `&key=${this.apiKey}`;
        const url = 'https://sandbox-api.brewerydb.com/v2' + endpoint + parsedParams
        const response = await fetch(url);
        return await response.json();
    }
}

class Beer extends BeerDatabase{
    constructor(apiKey) {
        super(apiKey);
    }
    
    getById(id, params={}){
        const ids = [].concat(id || []);
        const endpoint = `/beers/?ids=${ids}`;
        return this.returnResult(endpoint, params);
    }
    
    find(name, params={}){
        const endpoint = `/search?q=${name}&type=beer`;
        return this.returnResult(endpoint, params);
    }
}

class Brewery extends BeerDatabase{
    constructor(apiKey) {
        super(apiKey);
    }

    getByCoors(latlon, params={}){
        const endpoint = `/search/geo/point/?lat=${latlon[0]}&lng=${latlon[1]}`
        return this.returnResult(endpoint, params);
    }
}

module.exports = {Beer, Brewery};

