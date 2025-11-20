// Shared data for menu
// Start with curated items, then auto-generate up to 200 items
const products = [
  { id: 1, name: 'Sushi Omakase', price: 120.00 },
  { id: 2, name: 'Tonkotsu Ramen', price: 18.00 },
  { id: 3, name: 'Tempura Mori', price: 32.00 },
  { id: 4, name: 'Sashimi Platter', price: 65.00 },
  { id: 5, name: 'Kobe Wagyu (small)', price: 98.00 },
  { id: 6, name: 'Matcha Tiramisu', price: 12.00 },
  { id: 7, name: 'Sake Flight', price: 40.00 }
];

// generate additional items until we have 200 items total
for (let i = products.length + 1; i <= 200; i++) {
  // price varies between 6 and 150
  const price = (Math.random() * 144 + 6).toFixed(2);
  products.push({ id: i, name: `Shan Special ${i}`, price: Number(price) });
}

// Bill state (persisted in localStorage)
const BILL_KEY = 'shan_bill_v1';
let bill = loadBill();
const META_KEY = 'shan_bill_meta_v1';
let meta = loadMeta();

function saveBill() {
  try { localStorage.setItem(BILL_KEY, JSON.stringify(bill)); } catch (e) { /* ignore */ }
}

function saveMeta() {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch(e) {}
}

function loadMeta(){
  try { const raw = localStorage.getItem(META_KEY); return raw?JSON.parse(raw):{ name:'', mobile:'' }; } catch(e){ return { name:'', mobile:'' }; }
}

function loadBill() {
  try {
    const raw = localStorage.getItem(BILL_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) { return {}; }
}

function renderMenuList() {
  const menuList = document.getElementById('menu-list');
  if (!menuList) return;
  menuList.innerHTML = '';
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    item.innerHTML = `
      <div>
        <div class="fw-bold">${p.name}</div>
        <div class="text-muted small">$${p.price.toFixed(2)}</div>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <input type="number" min="0" value="0" class="form-control quantity" style="width:90px" data-id="${p.id}">
        <button class="btn btn-sm btn-outline-primary add-btn" data-id="${p.id}">Add</button>
      </div>
    `;
    menuList.appendChild(item);
  });

  // attach handlers
  document.querySelectorAll('.add-btn').forEach(btn => btn.addEventListener('click', (e)=>{
    const id = e.currentTarget.dataset.id;
    const input = document.querySelector(`.quantity[data-id='${id}']`);
    const qty = Number(input.value) || 0;
    if (qty > 0) addToBill(Number(id), qty);
    input.value = 0;
  }));
}

function addToBill(id, qty){
  bill[id] = (bill[id] || 0) + qty;
  saveBill();
  updateBillUI();
}

function removeFromBill(id){
  delete bill[id];
  saveBill();
  updateBillUI();
}

function clearBill(){
  for(const k in bill) delete bill[k];
  saveBill();
  updateBillUI();
}

function updateBillUI(){
  const container = document.getElementById('bill-items');
  const totalEl = document.getElementById('bill-total');
  const subtotalEl = document.getElementById('bill-subtotal');
  const taxEl = document.getElementById('bill-tax');
  const serviceEl = document.getElementById('bill-service');
  const checkout = document.getElementById('checkout');
  if (!container || !totalEl || !subtotalEl) return;
  container.innerHTML = '';
  let subtotal = 0;
  Object.keys(bill).forEach(id => {
    const product = products.find(p => p.id == id);
    const qty = bill[id];
    const lineTotal = product.price * qty;
    subtotal += lineTotal;

    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center mb-2 bill-line';
    div.innerHTML = `
      <div class="flex-grow-1"> 
        <div class="fw-bold small">${product.name}</div>
        <div class="text-muted small">$${product.price.toFixed(2)} each</div>
      </div>
      <div class="text-end ms-3">
        <div class="d-flex align-items-center gap-2">
          <button class='btn btn-sm btn-outline-secondary minus' data-id='${id}'>−</button>
          <span class='mx-1'>${qty}</span>
          <button class='btn btn-sm btn-outline-secondary plus' data-id='${id}'>+</button>
        </div>
        <div class='small mt-1'>$${lineTotal.toFixed(2)} <button class='btn btn-sm btn-link text-danger remove-line' data-id='${id}'>Remove</button></div>
      </div>
    `;
    container.appendChild(div);
  });

  // calculations
  const tax = subtotal * 0.10; // 10% tax
  const service = subtotal * 0.05; // 5% service
  const grand = subtotal + tax + service;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  serviceEl.textContent = `$${service.toFixed(2)}`;
  totalEl.textContent = `$${grand.toFixed(2)}`;
  if (checkout) checkout.disabled = grand === 0;

  // attach handlers for remove and qty buttons
  document.querySelectorAll('.remove-line').forEach(b => b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    removeFromBill(Number(id));
  }));
  document.querySelectorAll('.minus').forEach(b => b.addEventListener('click', e=>{
    const id = Number(e.currentTarget.dataset.id);
    if (bill[id] > 1) bill[id]--;
    else delete bill[id];
    saveBill();
    updateBillUI();
  }));
  document.querySelectorAll('.plus').forEach(b => b.addEventListener('click', e=>{
    const id = Number(e.currentTarget.dataset.id);
    bill[id] = (bill[id] || 0) + 1;
    saveBill();
    updateBillUI();
  }));
}

// init behavior for pages
document.addEventListener('DOMContentLoaded', ()=>{
  renderMenuList();
  updateBillUI();

  // save products map to localStorage so invoice page can lookup names/prices
  try{
    const map = {};
    products.forEach(p => map[p.id] = p);
    localStorage.setItem('shan_products_v1', JSON.stringify(map));
  }catch(e){}

  // header / card buttons
  const clearBtns = document.querySelectorAll('#clear-btn');
  clearBtns.forEach(b => b.addEventListener('click', clearBill));

  const checkout = document.getElementById('checkout');
  if (checkout) checkout.addEventListener('click', ()=>{
    alert('Thank you — your order has been placed!');
    clearBill();
  });

  const printBtn = document.getElementById('print-invoice');
  if (printBtn) printBtn.addEventListener('click', ()=>{
    // save meta and open invoice page in new tab/window
    try{
      const nameInput = document.getElementById('customer-name');
      const mobileInput = document.getElementById('customer-mobile');
      if (nameInput) meta.name = nameInput.value || '';
      if (mobileInput) meta.mobile = mobileInput.value || '';
      saveMeta();
    }catch(e){}
    window.open('bill.html', '_blank');
  });

  // prefill customer meta inputs if present
  try{
    const nameInput = document.getElementById('customer-name');
    const mobileInput = document.getElementById('customer-mobile');
    if (nameInput) { nameInput.value = meta.name || ''; nameInput.addEventListener('input', ()=>{ meta.name = nameInput.value; saveMeta(); }); }
    if (mobileInput) { mobileInput.value = meta.mobile || ''; mobileInput.addEventListener('input', ()=>{ meta.mobile = mobileInput.value; saveMeta(); }); }
  }catch(e){}
});
