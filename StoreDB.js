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
		const minPrice = !queryParams.minPrice ? 0: Number(queryParams.minPrice);
		const maxPrice = !queryParams.maxPrice ? Number.MAX_SAFE_INTEGER: Number(queryParams.maxPrice);
		const category = !queryParams.category ? new RegExp('.*'): queryParams.category;

		return new Promise((resolve, reject) => {
			db.collection("products").find(
				{
					$and:
						[
							{price: {$gte: minPrice}},
							{price: {$lte: maxPrice}},
							{category: {$regex: category}}
						]
				}
			).toArray(
				(err, result) => {
					if(err)
						reject(err);
					else {
						let jsonObj = {};
						for (let i = 0 ; i < result.length; i++) {
							jsonObj[result[i]._id] = result[i];
						}
						resolve(jsonObj);
					}
				});
		});
	})
};

StoreDB.prototype.addOrder = function(order){
	return this.connected.then(function(db){
		return new Promise((resolve, reject) => {
			db.collection("orders").insertOne(order, (err, res) => {
				if (err)
					reject(err);
				else {
					const bulkUpdate = db.collection("products").initializeUnorderedBulkOp();

					for (const item in order.cart) {
						if(order.cart.hasOwnProperty(item))
							bulkUpdate.find({
								_id: item
							}).updateOne({
								$inc: {quantity: -order.cart[item]}
							});
					}
					bulkUpdate.execute((err, _) => {
						if (err)
							reject(err);
						else {
							resolve(res.ops[0]);
						}
					});
				}
			})
		});
	})
};

module.exports = StoreDB;