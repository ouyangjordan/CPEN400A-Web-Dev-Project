// Require dependencies
const path = require('path');
const express = require('express');
const StoreDB = require('StoreDB');
const bodyParser = require('body-parser');

// Declare application parameters
const PORT = process.env.PORT || 3000;
const STATIC_ROOT = path.resolve(__dirname, './public');

const db = new StoreDB('mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb', 'cpen400a-bookstore');

// Defining CORS middleware to enable CORS.
// (should really be using "express-cors",
// but this function is provided to show what is really going on when we say "we enable CORS")
function cors(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT");
  	next();
}

// Instantiate an express.js application
const app = express();

// Configure the app to use a bunch of middlewares
app.use(express.json());							// handles JSON payload
app.use(express.urlencoded({ extended : true }));	// handles URL encoded payload
app.use(cors);										// Enable CORS
app.use(bodyParser);

app.use('/', express.static(STATIC_ROOT));			// Serve STATIC_ROOT at URL "/" as a static resource

// Configure '/products' endpoint
app.get('/products', (req, res) => {
	const queryParams = req.query;
	db.getProducts(queryParams)
		.then( products => res.json(products))
		.catch( err => {
			res.status(500);
			res.errmsg('Could not fetch products from the DB');
		});
});

// Start listening on TCP port
app.listen(PORT, function(){
    console.log('Express.js server started, listening on PORT '+PORT);
});