
const express = require('express');
const fileUpload = require('express-fileupload');
const git_update = require('kittang.git_update');

const app = express();
const server = app.listen(8000, () => {console.log('listening at port 8000')});
app.use(express.static('public'));
app.use(express.json({limit: '10mb'}));

git_update.enableAuotmaticUpdate('https://github.com/Henrikkittang/server_projects');

app.post('/file', (request, response) =>{
    console.log('Got data');
    response.json(request.body);
});