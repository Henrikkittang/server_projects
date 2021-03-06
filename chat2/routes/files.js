
module.exports = (app) => {
    
    app.get('/index.js' , (request, response) => response.sendFile('/public/index.js' , {root: __dirname + '/..'}));
    app.get('/style.css', (request, response) => response.sendFile('/public/style.css', {root: __dirname + '/..'}));
    app.get('/login.js' , (request, response) => response.sendFile('/public/login.js' , {root: __dirname + '/..'}));

}
