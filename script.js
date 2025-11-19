const products = [
    { id: 1, name: 'Truffle Risotto', price: 45.0 },
    { id: 2, name: 'Wagyu Steak', price: 120.0 },
    { id: 3, name: 'Lobster Thermidor', price: 95.0 },
    { id: 4, name: 'Foie Gras', price: 60.0 },
    { id: 5, name: 'Caviar Platter', price: 150.0 },
    { id: 6, name: 'Gold Leaf Dessert', price: 80.0 },
    { id: 7, name: 'Vintage Wine Glass', price: 200.0 }
];

const cart = {};

function renderProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <span>${product.name} <span style=\"color:#ffd700;font-weight:600;\">$${product.price.toFixed(2)}</span></span>
            <button onclick=\"addToCart(${product.id})\">Add</button>
        `;
        productList.appendChild(div);
    });
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    Object.keys(cart).forEach(id => {
        const product = products.find(p => p.id == id);
        const quantity = cart[id];
        total += product.price * quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${product.name} <span style='color:#ffd700;'>x ${quantity}</span></span>
            <span style='color:#ffd700;'>$${(product.price * quantity).toFixed(2)}</span>
            <button onclick=\"removeFromCart(${product.id})\">Remove</button>
        `;
        cartItems.appendChild(div);
    });
    document.getElementById('cart-total').textContent = `Total: $${total.toFixed(2)}`;
    document.getElementById('checkout-btn').disabled = total === 0;
}

window.addToCart = function(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
}

window.removeFromCart = function(id) {
    if (cart[id]) {
        cart[id]--;
        if (cart[id] === 0) delete cart[id];
        renderCart();
    }
}

document.getElementById('checkout-btn').onclick = function() {
    if (Object.keys(cart).length === 0) return;
    alert('Thank you for reserving your luxury table at 7 Star Hotel!');
    for (let id in cart) delete cart[id];
    renderCart();
}

renderProducts();
renderCart();
