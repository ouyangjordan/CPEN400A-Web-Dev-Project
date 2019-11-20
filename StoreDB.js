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
				useNewUrlParser: true,
				useUnifiedTopology: true
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
	return this.connected.then( db => {
		const minPrice = queryParams.minPrice;
		const maxPrice = queryParams.maxPrice;
		const category = queryParams.category;

		return new Promise((resolve, reject) => {
			db.collection("products").find(
				{
					$or:
						[
							{minPrice: {$gte: minPrice}},
							{maxPrice: {$lte: maxPrice}},
							{category: {$eq: category}}
						]
				}
			).toArray(
				(err, data) => {
					if(err)
						reject(err);
					else {
						let jsonObj = {};
						for (let i = 0 ; i < data.length; i++) {
							jsonObj[data[i]._id] = data[i];
						}
						resolve(jsonObj);
					}
				});
		});
	})
};

StoreDB.prototype.addOrder = function(order){
	return this.connected.then(function(db){
		let retId = null;
		return new Promise((resolve, reject) => {
			db.collections("orders").insert(order, (objectToInsert, err) =>{
				if(err) throw new Error('Could not insert the order in the DB. Please try again...');
				retId = objectToInsert._id;
			});

			const keys = Object.keys(order.cart);

			let products = db.product.find ({_id : { $in: keys} });

			products = JSON.parse(products);
			console.log(products);

			for(let p in products){
				if(products.hasOwnProperty(p)){
					const key = p._id;
					p[quantity] -= order.cart[key];
					db.product.update ({_id: key}, p);
				}
			}

			if(!retId)
				reject('error');
			resolve(retId);
		});
	})
};

module.exports = StoreDB;