/* global variable named products and then assign it an associative array (i.e. an object) that will store information about the products */
let products = {
    "Box1": {
        "label" : "Transparent Box",
        "imageUrl" : "images/Box1_$10.png",
        "price" :  10,
        "quantity" : 5
    },
    "Box2": {
        "label" : "Colored Box",
        "imageUrl" : "images/Box2_$5.png",
        "price" :  5,
        "quantity" : 5
    },
    "Clothes1": {
        "label" : "Women's flared dress red",
        "imageUrl" : "images/Clothes1_$20.png",
        "price" :  20,
        "quantity" : 5
    },
    "Clothes2": {
        "label" : "Ladies T-Shirt",
        "imageUrl" : "images/Clothes2_$30.png",
        "price" :  30,
        "quantity" : 5
    },
    "Jeans": {
        "label" : "Denim Jeans",
        "imageUrl" : "images/Jeans_$50.png",
        "price" :  50,
        "quantity" : 5
    },
    "Keyboard": {
        "label" : "Gaming Keyboard",
        "imageUrl" : "images/Keyboard_$20.png",
        "price" :  20,
        "quantity" : 5
    },
    "Mice": {
        "label" : "Gaming Mice",
        "imageUrl" : "images/Mice_$20.png",
        "price" :  20,
        "quantity" : 5
    },
    "PC1": {
        "label" : "Gaming PC",
        "imageUrl" : "images/PC1_$350.png",
        "price" :  350,
        "quantity" : 5
    },
    "Tent": {
        "label" : "Camping Tent",
        "imageUrl" : "images/Tent_$100.png",
        "price" :  100,
        "quantity" : 5
    }
};

/*
* Constructor function for creating a store object
* Store object will keep track of the items in the store and the items in the cart
*/
const Store = function (initialStock){
    this.stock = initialStock;
    this.cart = {};
    this.addItemToCart = (itemName) => {
        if(this.stock[itemName].quantity > 0)
        {
            if(this.cart[itemName])
                this.cart[itemName]++;
            else
                this.cart[itemName] = 1;
            this.stock[itemName].quantity--;
        }
        else
        {
            alert(`${products[itemName].label} is out of stock. Sorry!`);
        }
    }
    this.removeItemFromCart = (itemName) => {
        if(this.cart[itemName]){
            this.cart[itemName]--;
            if(this.cart[itemName] === 0) delete this.cart[itemName];
            this.stock[itemName].quantity++;
        }
        else{
            alert(`${products[itemName].label} is not in your cart. Did you mean to add it?`)
        }
    }
}

/* Create a global variable named store */
let store = new Store(products);

/* Implement a function with the signature showCart(cart), which invokes an alert to display the contents of the given cart object */
function showCart(cart) {
    let res = [];
    for (let key in cart) {
        if (cart.hasOwnProperty(key))
            res.push(`${key} : ${cart[key]}`);
    }
    if(res.length === 0)
        alert("Your cart is currently empty!")
    else
        alert(`Your cart currently has the following items:\n${res.join('\n')}`);
}