const MongoClient = require('mongodb').MongoClient;	// require the mongodb driver

/**
 * Uses mongodb v3.1.9 - [API Documentation](http://mongodb.github.io/node-mongodb-native/3.1/api/)
 * StoreDB wraps a mongoDB connection to provide a higher-level abstraction layer
 * for manipulating the objects in our bookstore app.
 */
function StoreDB(mongoUrl, dbName){
	if (!(this instanceof StoreDB)) return new StoreDB(mongoUrl, dbName);
	this.connected = new Promise(function(resolve, reject){
		MongoClient.connect(
			mongoUrl,
			{
				useNewUrlParser: true
			},
			function(err, client){

				if (err) {
					console.log(err);
					reject(err);
				}
				else {
					console.log('[MongoClient] Connected to '+mongoUrl+'/'+dbName);
					resolve(client.db(dbName));
				}
			}
		)
	});
}

StoreDB.prototype.getProducts = function(queryParams){
	return this.connected.then(function(db){
		const minPrice = queryParams.minPrice;
		const maxPrice = queryParams.maxPrice;
		const category = queryParams.category;

		const data = db.find( { minPrice: { $gte: minPrice },
								maxPrice: { $lte: maxPrice },
								category: { $eq: category }	}
							);

		return new Promise((resolve, reject) => {
			if (data){
				const products = {};
				data.forEach( (obj) => {
					products.push(obj);
				});
				resolve(products);
			}
			else
				reject('No Such Product found');
		});
	})
};

StoreDB.prototype.addOrder = function(order){
	return this.connected.then(function(db){
		let retId = null;
		db.orders.insert(order, (objectToInsert, err) =>{
			if(err) throw new Error('Could not insert the order in the DB. Please try again...');
			retId = objectToInsert._id;
		});

		const keys = Object.keys(order.cart);

		let products = db.product.find ({_id : { $in: keys} });

		products = JSON.parse(products);

		for(let p in products){
			if(products.hasOwnProperty(p)){
				const key = p._id;
				p[quantity] -= order.cart[key];
				db.product.update ({_id: key}, p);
			}
		}

		return new Promise((resolve, reject) => {
			if(!retId)
				reject('error');
			resolve(retId);
		});
	})
};

module.exports = StoreDB;