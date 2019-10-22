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

let store = new Store(products);

store.onUpdate = function (itemName) {
    renderProduct(document.getElementById(`product-${itemName}`), store, itemName);
    renderCart(document.getElementById('modal-content'), store);
}


function showCart(cart) {

    //reset inactive time when performing any action
    inactiveTime = 0;

    document.getElementById("modal").style.visibility = "visible";

    renderCart(document.getElementById("modal-content"), store);
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

//takes a li and replaces it with the newly created li
function renderProduct(container, storeInstance, itemName){
    const li = document.createElement('li');
    li.id = `product-${itemName}`;

    const img = document.createElement('img');
    const price = document.createElement('span');
    const text = document.createElement('span');

    if(storeInstance.stock[itemName].quantity > 0){
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

//makes a ul element and creates li for each product in stock
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

function renderCart(container, storeInstance) {
    const modalContent = document.createElement("div");
    modalContent.id = "modal-content";

    //set properties for the new modalContent
    modalContent.style.backgroundColor = "#fefefe";
    modalContent.style.margin = "15% auto";
    modalContent.style.padding = "20px";
    modalContent.style.border = "1px solid #888";
    modalContent.style.width = "40%";

    for (let key in storeInstance.cart) {

        const cartItem = document.createElement("span");

        cartItem.innerText = `${key}  :  ${storeInstance.cart[key]}    `;
        modalContent.appendChild(cartItem);

        const increaseQuantity = document.createElement("button");
        increaseQuantity.innerText = "+";

        increaseQuantity.onclick = function(){
            storeInstance.addItemToCart(`${key}`);
        }

        modalContent.appendChild(increaseQuantity);

        const decreaseQuantity = document.createElement("button");
        decreaseQuantity.innerText = "-";

        decreaseQuantity.onclick = function(){
            storeInstance.removeItemFromCart(`${key}`);
        }

        modalContent.appendChild(decreaseQuantity);

        const breakTag = document.createElement("br");
        modalContent.appendChild(breakTag);
    }

    const hideCartButton = document.createElement("button");
    hideCartButton.innerText = "Hide Cart";
    hideCartButton.id = "btn-hide-cart";
    hideCartButton.onclick = function(){
        hideCart();
    }

    modalContent.appendChild(hideCartButton);

    container.replaceWith(modalContent);
}

function hideCart(){
    document.getElementById("modal").style.visibility="hidden";
}

//Listener for key press
document.addEventListener('keydown', closeModal);

function closeModal(e) {
  if (e.code == 'Escape') {
    hideCart();
  }
}




