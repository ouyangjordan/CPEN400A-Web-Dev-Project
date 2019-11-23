/*
* Constructor function for creating a store object
* Store object will keep track of the items in the store and the items in the cart
*/
function Store(serverUrl){
  this.serverUrl = serverUrl;
  this.stock = {};
  this.cart = {};
  this.onUpdate = null;
}


Store.prototype.checkOut = function(onFinish){
    const self = this;
    this.syncWithServer(function(delta){

        let messageToPost = "";

        if(delta){
        for (const property in delta) {
            if(delta.hasOwnProperty(property)){
                if(delta[property].price && delta[property].price !== 0){
                    //Here we update the prices of our items in stock
                    let newPrice = store.stock[property].price;
                    let oldPrice = (newPrice - delta[property].price).toString();

                    store.stock[property].price = store.stock[property].price + delta[property].price; //Here we update the price
                    //of our items in stock

                    //If the price changed we update that in our alert
                    messageToPost = messageToPost + "Price of " + property + " changed from " + oldPrice + " to "  +  newPrice + "\n";
                }

                if(!delta[property].quantity && delta[property].quantity !== 0){

                    //var previousStock = store.stock[property].quantity;
                    //var newStock = (previousStock + delta[property].quantity).toString();

                    let newStock = store.stock[property].quantity;
                    let previousStock = (newStock - delta[property].quantity).toString();

                    messageToPost = messageToPost + "Quantity of " + property + " changed from " + previousStock + 
                    " to " + newStock + "\n";

                    //store.stock[property].quantity = store.stock[property].quantity + delta[property].quantity;
                    //We update the quantity of items 
                }
            }
        }


        //case where there was no change in stock
        //Calculate the total price of the items in the cart
        let totalPrice = 0;
        if(messageToPost === ""){
            for (const property in store.cart){

                //store.cart[property] gives the quantity of the items in the cart
                if(store.cart.hasOwnProperty(property))
                    totalPrice = totalPrice + (store.cart[property] * store.stock[property].price);
            }
            messageToPost = "The total amount due is $" + totalPrice.toString();


        }
        const order = {
            client_id: 1000 * Math.random(),
            cart: self.cart,
            total: totalPrice,
        };

        ajaxPost(
            `${self.serverUrl}/checkout`,
            order,
            (items) => {
                alert(`Checkout successful for the items \n ${items}`);
                self.cart = {};
                self.onUpdate();
            },
            (err) => {
                alert(`Error: ${err} Checkout unsuccessful. Please Try again...`);
            })
        } 
    });

    if(onFinish) onFinish();//This calls the callback function

};

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
        alert(`${store.stock[itemName].label} is out of stock. Sorry!`); //This line is causing test failures
    }

    this.onUpdate(itemName);
};

Store.prototype.removeItemFromCart = function(itemName) {

    //reset inactive time when performing any action

    inactiveTime = 0;
    if(this.cart[itemName]){
        this.cart[itemName]--;
        if(this.cart[itemName] === 0) delete this.cart[itemName];
        this.stock[itemName].quantity++;
    }
    else{
        alert(`${store.stock[itemName].label} is not in your cart. Did you mean to add it?`)
    }

    this.onUpdate(itemName);
};

let store = new Store('http://localhost:3000');


store.onUpdate = function (itemName) {

    if(!itemName){
        renderProductList(document.getElementById('productView'), store);
    }
    else{
        renderProduct(document.getElementById(`product-${itemName}`), store, itemName);
        renderCart(document.getElementById('modal-content'), store);
    }

    renderMenu(document.getElementById('menuView'), store);
};

Store.prototype.syncWithServer = function(onSync){
    let delta = {};
    let that = this;

    ajaxGet(`${this.serverUrl}/products`,

    function (newProducts) {
        delta = computeDelta(newProducts, store);
        updateStock(newProducts, store);

        that.onUpdate();
        if(onSync)onSync(delta);
    },

    function () {
        alert('Error syncWithServer')
    });

};


let displayed = [];

$(document).ready(function(){
    store.syncWithServer(deltaFunc)
});

const deltaFunc = function (delta) {
    displayed = Object.keys(delta);
    //Todo make sure this is right
    renderProductList(document.getElementById('productView'), store);
};

// Update Stock with consideration of the current items in the cart
function updateStock(newProducts, storeInstance) {
    storeInstance.stock = JSON.parse(JSON.stringify(newProducts));
    const items = Object.keys(storeInstance.stock);

    //check if any item in the cart and adjust
    for(const item of items){
        if(Object.entries(storeInstance.cart).length !== 0 && storeInstance.cart.hasOwnProperty(item))
            storeInstance.stock[`${item}`].quantity = storeInstance.stock[`${item}`].quantity - storeInstance.cart[`${item}`];
    }
}

// computes delta + initializes stock when its empty or null
function computeDelta(newProducts, storeInstance) {
    let delta = {};
    const items = Object.keys(newProducts);
    // if stock is empty
    if(Object.entries(storeInstance.stock).length === 0){
        // deep clone the newProducts to delta and stock
        storeInstance.stock = JSON.parse(JSON.stringify(newProducts));
        for(const item of items){
            delta[`${item}`] = {price: newProducts[item].price, quantity: newProducts[item].quantity
                ,label: newProducts[item].label };
        }
    }
    else {
        for(const item of items){

            delta[`${item}`] = { label: newProducts[item].label};

            //only show updated price if there is an updated price
            if(newProducts[item].price !== storeInstance.stock[item].price){
                delta[`${item}`] = { price: newProducts[item].price - storeInstance.stock[item].price};
            }
            //quantity of items = storeInstance.stock[item].quantity + storeInstance.cart[item]

            if(storeInstance.cart[item] > newProducts[item].quantity){

                delta[`${item}`] = {quantity: newProducts[item].quantity - (storeInstance.stock[item].quantity + storeInstance.cart[item])};

                storeInstance.cart[item] = newProducts[item].quantity;
                storeInstance.stock[item] = 0;
            } else if ((storeInstance.stock[item].quantity + storeInstance.cart[item]) !== newProducts[item].quantity){

                delta[`${item}`] = {quantity: newProducts[item].quantity - (storeInstance.stock[item].quantity + storeInstance.cart[item])};
          
                //case where there is no items in the cart
                if(!storeInstance.cart[item]){
                    delta[`${item}`] = {quantity: newProducts[item].quantity - (storeInstance.stock[item].quantity)};
                }
            }
            
            /*
            delta[`${item}`] = { price: newProducts[item].price - storeInstance.stock[item].price,
                quantity: newProducts[item].quantity - storeInstance.stock[item].quantity ,
            label: newProducts[item].label };*/
        }
    }
    return delta;
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
    ul.id = "productView";
    container.replaceWith(ul);
    ul.style.width = "80%";
    ul.style.columnCount = "3";
    ul.style.cssFloat = "right";
    ul.lineHeight = "28px";
    ul.fontSize = "large";

    for(const item of displayed){
        const li = document.createElement('li');
        ul.appendChild(li);
        renderProduct(li, storeInstance, item);
    }
}

renderProductList(document.getElementById("productView"), store);

function renderCart(container, storeInstance) {

    
    modalContent = document.createElement("div");
    modalContent.id = "modal-content";

    //set properties for the new modalContent
    modalContent.style.backgroundColor = "#fefefe";
    modalContent.style.margin = "15% auto";
    modalContent.style.padding = "20px";
    modalContent.style.border = "1px solid #888";
    modalContent.style.width = "40%";

    let totalPrice = 0;

    for (let key in storeInstance.cart) {

        const cartItem = document.createElement("span");

        cartItem.innerText = `${key}  :  ${storeInstance.cart[key]}    `;
        modalContent.appendChild(cartItem);

        const increaseQuantity = document.createElement("button");
        increaseQuantity.innerText = "+";

        increaseQuantity.onclick = function(){
            storeInstance.addItemToCart(`${key}`);
        };

        modalContent.appendChild(increaseQuantity);

        const decreaseQuantity = document.createElement("button");
        decreaseQuantity.innerText = "-";

        decreaseQuantity.onclick = function(){
            storeInstance.removeItemFromCart(`${key}`);
        };

        modalContent.appendChild(decreaseQuantity);

        const price = document.createElement('span');
        price.textContent = `price:$${storeInstance.cart[key] * storeInstance.stock[key].price}`;

        totalPrice += storeInstance.cart[key] * storeInstance.stock[key].price;
        modalContent.appendChild(price);

        const breakTag = document.createElement("br");
        modalContent.appendChild(breakTag);
    }

    const totalPriceDiv = document.createElement('div');
    totalPriceDiv.textContent = `Total Price: ${totalPrice}`;

    const hideCartButton = document.createElement("button");
    hideCartButton.innerText = "Hide Cart";
    hideCartButton.id = "btn-hide-cart";
    hideCartButton.onclick = function(){
        hideCart();
    };

    modalContent.appendChild(hideCartButton);
    modalContent.appendChild(totalPriceDiv);
    

    const checkOutButton = document.createElement("button");
    checkOutButton.id = "btn-check-out";
    checkOutButton.innerText = "Check Out";

    checkOutButton.addEventListener('click', function(){
        this.disabled = true;
        store.checkOut(function(){
            document.getElementById("btn-check-out").disabled = false;
        });

    });


    modalContent.appendChild(checkOutButton);
    container.innerHTML = '';
    container.appendChild(modalContent);

    //This now works compared with the previous 
}


function hideCart(){
    document.getElementById("modal").style.visibility="hidden";
}

//Listener for key press
document.addEventListener('keydown', closeModal);

function closeModal(e) {
  if (e.code === 'Escape') {
    hideCart();
  }
}


/*
1. try to get the data by calling the url
2. on success call the onSuccess function
3. on failure (timeout/500) try three times
3. if still failure call onError function
4. On success, Convert the response payload into a JavaScript object and then pass it as the argument.
This is the only argument onSuccess takes
 */

//var tryCount = 0;
//var retryLimit = 3;
function ajaxGet(url, onSuccess, onError) {
    $.ajax({
        url: url,
        timeout: 3000,
        type: 'GET',
        tryCount : 0,
        retryLimit : 3,
        data: {
            format: 'json'
        },
        error: function(xhr, textStatus, err) {
            if (textStatus === 'timeout' || xhr.status === 500) {
                this.tryCount++;
                if (this.tryCount < this.retryLimit) {
                    //try again
                    console.log(this.url);
                    console.log(`${this.tryCount} call to the server failed. Trying again ...`);
                    $.ajax(this);
                } else {
                    //Call erorr function after 3 tries and reset tryCount
                    onError(err);
                    this.tryCount = 0;
                }
            }
        },
        success: function(data) {
            console.log(`Request successful. Calling the onSuccess method with the data`);
            this.tryCount = 0;
            onSuccess(data);
        }
    });
}

function ajaxPost(url, data, onSuccess, onError){
    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(data),
        contentType:'application/json; charset=utf-8',
        error: function(xhr, textStatus, err) {
            if (textStatus === 'timeout' || xhr.status !== 200) {
                onError(err);
            }
        },
        success: function(data) {
            const jsonData = JSON.parse(data);
            onSuccess(jsonData);
        }
    });
}

Store.prototype.queryProducts = function(query, callback){
    let self = this;
    let queryString = Object.keys(query).reduce(function(acc, key){
        return acc + (query[key] ? ((acc ? '&':'') + key + '=' + query[key]) : '');
    }, '');
    ajaxGet(this.serverUrl+"/products?"+queryString,
        function(products){
            Object.keys(products)
                .forEach(function(itemName){
                    var rem = products[itemName].quantity - (self.cart[itemName] || 0);
                    if (rem >= 0){
                        self.stock[itemName].quantity = rem;
                    }
                    else {
                        self.stock[itemName].quantity = 0;
                        self.cart[itemName] = products[itemName].quantity;
                        if (self.cart[itemName] === 0) delete self.cart[itemName];
                    }

                    self.stock[itemName] = Object.assign(self.stock[itemName], {
                        price: products[itemName].price,
                        label: products[itemName].label,
                        imageUrl: products[itemName].imageUrl
                    });
                });
            self.onUpdate();
            callback(null, products);
        },
        function(error){
            callback(error);
        }
    )
};

/*
window.onload = function(){
    

    let checkoutButton = document.createElement('button'); 

    checkoutButton.onclick = function(){
        showCart();
    }

    document.getElementById('menuView').appendChild(checkoutButton);

}

*/

function renderMenu(container, storeInstance){



    while (container.lastChild) container.removeChild(container.lastChild);

    let checkoutButton = document.createElement('button'); 
    checkoutButton.innerText = "View Cart";

    checkoutButton.onclick = function(){
        showCart();
    };

    document.getElementById('menuView').appendChild(checkoutButton);

    
    if (!container._filters) {
        container._filters = {
            minPrice: null,
            maxPrice: null,
            category: ''
        };
        container._refresh = function(){
            storeInstance.queryProducts(container._filters, function(err, products){
                if (err){
                    alert('Error occurred trying to query products');
                    console.log(err);
                }
                else {
                    displayed = Object.keys(products);
                    renderProductList(document.getElementById('productView'), storeInstance);
                }
            });
        }
    }






    let box = document.createElement('div'); container.appendChild(box);
    box.id = 'price-filter';
    let input = document.createElement('input'); box.appendChild(input);
    input.type = 'number';
    input.value = container._filters.minPrice;
    input.min = 0;
    input.placeholder = 'Min Price';
    input.addEventListener('blur', function(event){
        container._filters.minPrice = event.target.value;
        container._refresh();
    });



    input = document.createElement('input'); box.appendChild(input);
    input.type = 'number';
    input.value = container._filters.maxPrice;
    input.min = 0;
    input.placeholder = 'Max Price';
    input.addEventListener('blur', function(event){
        container._filters.maxPrice = event.target.value;
        container._refresh();
    });



    let list = document.createElement('ul'); container.appendChild(list);
    list.id = 'menu';
    let listItem = document.createElement('li'); list.appendChild(listItem);
    listItem.className = 'menuItem' + (container._filters.category === '' ? ' active': '');
    listItem.appendChild(document.createTextNode('All Items'));
    listItem.addEventListener('click', function(event){
        container._filters.category = '';
        container._refresh()
    });


    let CATEGORIES = [ 'Clothing', 'Technology', 'Office', 'Outdoor' ];
    for (let i in CATEGORIES){
        let listItem = document.createElement('li'); list.appendChild(listItem);
        listItem.className = 'menuItem' + (container._filters.category === CATEGORIES[i] ? ' active': '');
        listItem.appendChild(document.createTextNode(CATEGORIES[i]));
        listItem.addEventListener('click', (function(i){
            return function(event){
                container._filters.category = CATEGORIES[i];
                container._refresh();
            }
        })(i));
    }
}
