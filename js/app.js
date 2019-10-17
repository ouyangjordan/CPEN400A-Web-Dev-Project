/* global variable named products and then assign it an associative array (i.e. an object) that will store information about the products */
let products = {
    "Box1": {
        "label" : "Transparent Box",
        "imageUrl" : "images/Box1.png",
        "price" :  10,
        "quantity" : 5
    },
    "Box2": {
        "label" : "Colored Box",
        "imageUrl" : "images/Box2.png",
        "price" :  5,
        "quantity" : 5
    },
    "Clothes1": {
        "label" : "Women's flared dress red",
        "imageUrl" : "images/Clothes1.png",
        "price" :  20,
        "quantity" : 5
    },
    "Clothes2": {
        "label" : "Ladies T-Shirt",
        "imageUrl" : "images/Clothes2.png",
        "price" :  30,
        "quantity" : 5
    },
    "Jeans": {
        "label" : "Denim Jeans",
        "imageUrl" : "images/Jeans.png",
        "price" :  50,
        "quantity" : 5
    },
    "Keyboard": {
        "label" : "Gaming Keyboard",
        "imageUrl" : "images/Keyboard.png",
        "price" :  20,
        "quantity" : 5
    },
    "Mice": {
        "label" : "Gaming Mice",
        "imageUrl" : "images/Mice.png",
        "price" :  20,
        "quantity" : 5
    },
    "PC1": {
        "label" : "Gaming PC",
        "imageUrl" : "images/PC1.png",
        "price" :  350,
        "quantity" : 5
    },
    "Tent": {
        "label" : "Camping Tent",
        "imageUrl" : "images/Tent.png",
        "price" :  100,
        "quantity" : 5
    },

    "KeyboardCombo": {
        "label" : "Keyboard Combo",
        "imageUrl" : "images/KeyboardCombo.png",
        "price" :  40,
        "quantity" : 5
    },
    "PC2": {
        "label" : "Gaming PC 2",
        "imageUrl" : "images/PC2.png",
        "price" :  400,
        "quantity" : 5
    },
    "PC3": {
        "label" : "Gaming PC 3",
        "imageUrl" : "images/PC3.png",
        "price" :  300,
        "quantity" : 5
    }
};

/*
* Constructor function for creating a store object
* Store object will keep track of the items in the store and the items in the cart
*/
function Store(initialStock){

  let store = Object.create(Store.prototype)
    store.stock = initialStock;
    store.cart = {};
    store.onUpdate = null;
    return store;
}

Store.prototype.addItemToCart = function(itemName){

    //reset inactive time when performing any action

    inactiveTime = 0;

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

    this.onUpdate(itemName);
}

Store.prototype.removeItemFromCart = function(itemName) {

    //reset inactive time when performing any action

    inactiveTime = 0;

    if(this.cart[itemName]){
        this.cart[itemName]--;
        if(this.cart[itemName] === 0) delete this.cart[itemName];
        this.stock[itemName].quantity++;
    }
    else{
        alert(`${products[itemName].label} is not in your cart. Did you mean to add it?`)
    }

    this.onUpdate(itemName);
}

/* Create a global variable named store */
let store = new Store(products);

store.onUpdate = function (itemName) {
    renderProduct(document.getElementById(`product-${itemName}`), store, itemName);
}

/* Implement a function with the signature showCart(cart), which invokes an alert to display the contents of the given cart object */
function showCart(cart) {

    //reset inactive time when performing any action

    inactiveTime = 0;

    let res = [];
    for (let key in cart) {
        if (cart.hasOwnProperty(key))
            res.push(`${key} : ${cart[key]}`);
    }
    if(res.length === 0)
        alert("Your cart is currently empty!");
    else
        alert(`Your cart currently has the following items:\n${res.join('\n')}`);
}

/* Create global variable to keeping track of inactiveTime */
let inactiveTime = 0;

/*Function to increment timer when inactive*/

function timerIncrement() {
    inactiveTime = inactiveTime + 1;
    if (inactiveTime > 30*60) { // 30 seconds of inactivity


        alert("Hey there! Are you still planning to buy something?");
        //On ok of alert reset timer
        inactiveTime = 0;
    }
}
/*Run inactive function every second*/
setInterval(timerIncrement,1000);

//TODO conditional buttons
function renderProduct(container, storeInstance, itemName){
    const li = document.createElement('li');
    li.id = `product-${itemName}`;

    const img = document.createElement('img');
    const price = document.createElement('span');
    const text = document.createElement('span');

    if(storeInstance.stock[itemName].quantity > 0){
        console.log(storeInstance.stock[itemName].quantity);
        const addBtn = document.createElement('button');
        addBtn.className = "btn-add";
        addBtn.innerText="Add to Cart";
        addBtn.addEventListener('click', () => {storeInstance.addItemToCart(itemName)});
        li.appendChild(addBtn);
    }

    if(storeInstance.cart[itemName]){
        const rmvBtn = document.createElement('button');
        rmvBtn.className = "btn-remove";
        rmvBtn.innerText="Remove from Cart";
        rmvBtn.addEventListener('click', () => {storeInstance.removeItemFromCart(itemName)});
        li.appendChild(rmvBtn);
    }

    li.className = "product";
    text.innerText = itemName;
    price.innerText = '$' + storeInstance.stock[itemName].price;
    price.className = "price";
    img.className = "items";
    img.src = storeInstance.stock[itemName].imageUrl;

    li.appendChild(img);
    li.appendChild(text);
    li.appendChild(price);

    container.replaceWith(li);
}

function renderProductList(container, storeInstance){
    const ul = document.createElement('ul');
    container.replaceWith(ul);
    ul.style.width = "80%";
    ul.style.columnCount = "3";
    ul.style.cssFloat = "right";
    ul.lineHeight = "28px";
    ul.fontSize = "large";

    for(let item in storeInstance.stock){
        const li = document.createElement('li');
        ul.appendChild(li);
        renderProduct(li, storeInstance, item);
    }
}

renderProductList(document.getElementById("productView"), store);

/*
function renderCart(){
    renderCart (document.getElementById("modal"), store);
}*/

//removed container

function renderCart(container, storeInstance){
    //Do we even have to use the container selector?

    var modalContent = document.getElementById("modal-content");

    var cartItems;

    var breakTag;

    var increaseQuantity;

    var decreaseQuantity;


    //let res = [];
    for (let key in storeInstance.cart) {
        if (storeInstance.cart.hasOwnProperty(key)){

            //cartItems = document.createTextNode(`${key} : ${storeInstance.cart[key]}`);

            cartItems = document.createElement("span");

            cartItems.innerHTML = key + " Quantity: " + storeInstance.cart[key];
            modalContent.appendChild(cartItems);

            increaseQuantity = document.createElement("button");
            increaseQuantity.innerText = "+";
            increaseQuantity.onclick = function(){
                storeInstance.addItemToCart(`${key}`);
                //Is this recursion needed?
                cleanCartUI();
                renderCart(container,storeInstance);
            } 

            modalContent.appendChild(increaseQuantity);

            decreaseQuantity = document.createElement("button");
            decreaseQuantity.innerText = "-";
            decreaseQuantity.onclick = function(){
                storeInstance.removeItemFromCart(`${key}`);

                 //Delete everything in the cart like hideCart()
                 //Is this recursion needed?
                 cleanCartUI();
                renderCart(container,storeInstance);
            } 

            modalContent.appendChild(decreaseQuantity);



            breakTag = document.createElement("br");
            modalContent.appendChild(breakTag);
            //console.log(`${key} : ${storeInstance.cart[key]}` + "<br/>");
        }
    }

    document.getElementById("modal").style.visibility="visible";

}

function hideCart(){

    //Delete all the children here before hiding
    document.getElementById("modal").style.visibility="hidden";
    cleanCartUI();

}

//Function to update CartUI
function cleanCartUI(){

    document.getElementById("modal-content").innerHTML = "";

    var hideCartButton = document.createElement("button");
    hideCartButton.innerText = "Hide Cart";
    hideCartButton.id = "btn-hide-cart";
    hideCartButton.onclick = function(){
                hideCart();
            } 

    document.getElementById("modal-content").appendChild(hideCartButton);

}

//Listener for key press
document.addEventListener('keydown', closeModal);

function closeModal(e) {
  if (e.code == 'Escape') { 
    hideCart();
  }
}




