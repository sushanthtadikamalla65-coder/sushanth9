const products = [
  { id: 1, name: 'Sushi Omakase', price: 120.0 },
  { id: 2, name: 'Tonkotsu Ramen', price: 18.0 },
  { id: 3, name: 'Tempura Mori (assorted)', price: 32.0 },
  { id: 4, name: 'Sashimi Platter', price: 65.0 },
  { id: 5, name: 'Kobe Wagyu (small)', price: 98.0 },
  { id: 6, name: 'Matcha Tiramisu', price: 12.0 },
  { id: 7, name: 'Sake Flight', price: 40.0 }
];

const cart = {};

function renderProducts(){
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <span>${product.name} <span class="price">$${product.price.toFixed(2)}</span></span>
      <button onclick="addToCart(${product.id})">Order</button>
    `;
    productList.appendChild(div);
  });
}

function renderCart(){
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
      <span>${product.name} x ${quantity}</span>
      <span class="price">$${(product.price * quantity).toFixed(2)}</span>
      <button onclick="removeFromCart(${product.id})">Remove</button>
    `;
    cartItems.appendChild(div);
  });
  document.getElementById('cart-total').textContent = `Total: $${total.toFixed(2)}`;
  document.getElementById('checkout-btn').disabled = total === 0;
}

window.addToCart = function(id){
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

window.removeFromCart = function(id){
  if(cart[id]){
    cart[id]--;
    if(cart[id] === 0) delete cart[id];
    renderCart();
  }
}

document.getElementById('checkout-btn').onclick = function(){
  if(Object.keys(cart).length === 0) return;
  alert('ありがとうございます — Thank you! Your order at Shan Cuisine is confirmed.');
  for(let id in cart) delete cart[id];
  renderCart();
}

renderProducts();
renderCart();

// Hero overlay animation: add 'show' class after load
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.hero-overlay');
  if (overlay) {
    // small timeout to allow image to paint then animate
    setTimeout(() => overlay.classList.add('show'), 250);
  }
});
