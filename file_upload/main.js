
const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const server = app.listen(8000, () => {console.log('listening at port 8000')});
app.use(express.static('public'));
app.use(express.json({limit: '10mb'}));

app.post('/file', (request, response) =>{
    console.log('Got data');
    response.json(request.body);
});