/*
* Constructor function for creating a store object
* Store object will keep track of the items in the store and the items in the cart
*/
function Store(serverUrl){
  this.serverUrl = serverUrl;
  this.stock = {};
  this.cart = {};
  this.onUpdate = null;
  this.syncWithServer = null;
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
        alert(`${products[itemName].label} is not in your cart. Did you mean to add it?`)
    }

    this.onUpdate(itemName);
};

let store = new Store('https://cpen400a-bookstore.herokuapp.com/');

store.onUpdate = function (itemName) {
    if(!itemName){
        renderProductList(document.getElementById('productView'), store);
    }
    else{
        renderProduct(document.getElementById(`product-${itemName}`), store, itemName);
        renderCart(document.getElementById('modal-content'), store);
    }
};

store.syncWithServer = function (onSync) {
    let newProducts = ajaxGet(`${this.serverUrl}/products`,
        function () {
            alert('success')
        },
        function () {
            alert('error')
        });

    if(newProducts)
        computedelta(store, newProducts);
};

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
function ajaxGet(url, onSuccess, onError) {
    $.ajax({
        url: url,
        type: 'GET',
        data: {
            format: 'json'
        },
        tryCount : 0,
        retryLimit : 3,
        error: function(xhr, textStatus, err) {
            if (textStatus === 'timeout' || xhr.status === 500) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    console.log(`${this.tryCount} call to the server failed. Trying again ...`);
                    $.ajax(this);
                }
            }
            else {
                //handle error
                onError(err);
            }
        },
        success: function(data) {
            console.log(`Request successful. Calling the onSuccess method with the data`);
            console.log(data);
            onSuccess(data);
        }
    });
}

ajaxGet("https://cpen400a-bookstore.herokuapp.com/products",
    function () {
        alert('SUCCESSS')
    },
    function () {
        alert('ERROR')
    });




