const express = require('express');
const cookieParser = require('cookie-parser');
const fileRoutes = require('./routes/files.js');
//const bodyParser = require('body-parser');

const app = express();
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// The service port defaults to 3000 or is read from the program arguments
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// Text to display for the service name
const serviceName = process.argv.length > 3 ? process.argv[3] : 'file-browser-web-app';

// Serve up the static content
app.use(express.static(__dirname + '/public'));

// Provide the version of the application
app.get('/config', (req, res) => {
	res.send({ version: '20231018.1456.54', name: serviceName });
});

fileRoutes.fileRoutes(app);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
