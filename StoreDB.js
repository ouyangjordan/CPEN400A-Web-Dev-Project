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
				if (err) reject(err);
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
		// TODO: Implement functionality
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
		// TODO: Implement functionality
	})
};

module.exports = StoreDB;