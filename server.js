const express = require("express");
const server = express();
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 4000;

server.use(require('./app/middlewares/cors.middleware'));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));

server.use(express.static(__dirname + '/client'));

server.use('/api', require('./app/routes/search.route'));

server.get('/:page', function(req,res) {
    const config = require('./common/route.config');
    const file = config[req.params.page];

    if (file){
        return res.sendFile(path.join(__dirname+`/client/${file}.html`));
    }
    return res.redirect('/NotFound');
});

server.listen(PORT, () => {
    console.log("Server is currently listening to requests on ", PORT);
});