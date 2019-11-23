// Require dependencies
const path = require('path');
const express = require('express');
const StoreDB = require("./StoreDB");

// Declare application parameters
const PORT = process.env.PORT || 3000;
const STATIC_ROOT = path.resolve(__dirname, './public');

const db = StoreDB('mongodb://127.0.0.1:27017', 'cpen400a-bookstore');

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

app.use('/', express.static(STATIC_ROOT));			// Serve STATIC_ROOT at URL "/" as a static resource

// Configure '/products' endpoint
app.get('/products', (req, res) => {
	db.getProducts(req.query)
		.then( products => {
			res.json(products);
		})
		.catch( err => {
			res.status(500);
			res.send(`${err}`);
		});
});

app.post('/checkout', (req, res) => {
	const order = req.body;
	console.log(order);

	if(!order.cart || typeof order.total !== 'number' || typeof order.client_id !== 'string'){
		res.status(500).send('The order does not have expected fields with right types');
	}

	db.addOrder(order)
		.then( id => res.json(id))
		.catch( err => {
			res.status(500).send('Could not post the order');
		});
});

// Start listening on TCP port
app.listen(PORT, function(){
    console.log('Express.js server started, listening on PORT '+PORT);
});