const menuData = [
    {id: 1, name: "炸雞套餐", price: 150},
    {id: 2, name: "牛肉漢堡", price: 120},
    {id: 3, name: "蔬菜沙拉", price: 90},
    {id: 4, name: "可樂", price: 30},
    {id: 5, name: "薯條", price: 50},
    {id: 6, name: "冰淇淋", price: 70}
];

const menuList = document.getElementById('menuList');
const orderItems = document.getElementById('orderItems');
const orderTotal = document.getElementById('orderTotal');
const payBtn = document.getElementById('payBtn');
const paymentMethodSelect = document.getElementById('paymentMethod');
const orderSection = document.getElementById('orderSection');
const finishPage = document.getElementById('finishPage');
const finishSummary = document.getElementById('finishSummary');
const backBtn = document.getElementById('backBtn');

let order = [];
let currentStatusIndex = 0;
let statusInterval = null;

function renderMenu() {
  menuList.innerHTML = '';
  menuData.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('menu-item');
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>價格：$${item.price}</p>
      <button onclick="addToOrder(${item.id})">加入訂單</button>
    `;
    menuList.appendChild(div);
  });
}

function addToOrder(id) {
  const item = menuData.find(i => i.id === id);
  order.push(item);
  renderOrder();
  payBtn.disabled = !(order.length > 0 && paymentMethodSelect.value);
  alert(item.name + " 已下單");
  updateOrderStatus('下訂單');
}

function renderOrder() {
  orderItems.innerHTML = '';
  let total = 0;
  order.forEach((item, idx) => {
    total += item.price;
    const li = document.createElement('li');
    li.textContent = `${item.name} - $${item.price} `;
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '刪除';
    removeBtn.onclick = () => {
      order.splice(idx, 1);
      renderOrder();
      payBtn.disabled = !(order.length > 0 && paymentMethodSelect.value);
    };
    li.appendChild(removeBtn);
    orderItems.appendChild(li);
  });
  orderTotal.textContent = `總計：$${total}`;
}

payBtn.addEventListener('click', () => {
  if(order.length === 0) return;
  const paymentMethod = paymentMethodSelect.value;
  if(!paymentMethod) {
    alert('請先選擇付款方式');
    return;
  }
  payBtn.disabled = true;
  paymentMethodSelect.disabled = true;
  updateOrderStatus('準備中');
  startAutoProgress(paymentMethod);
});

function startAutoProgress(paymentMethod) {
  const statuses = ['準備中', '配送中', '完成'];
  let idx = 0;
  if(statusInterval) clearInterval(statusInterval);
  statusInterval = setInterval(() => {
    idx++;
    if(idx < statuses.length) {
      updateOrderStatus(statuses[idx]);
      if(statuses[idx] === '完成') {
        clearInterval(statusInterval);
        setTimeout(() => {
          showFinishPage(paymentMethod);
        }, 3000);
      }
    }
  }, 5000);
}

function showFinishPage(paymentMethod) {
  const items = order.map(i => i.name).join(", ");
  const total = order.reduce((sum, i) => sum + i.price, 0);
  finishSummary.textContent = `您訂購了：${items}。付款方式：${paymentMethod}。總金額：$${total}。`;
  orderSection.style.display = 'none';
  finishPage.style.display = 'block';
  order = [];
  renderOrder();
  paymentMethodSelect.value = "";
  paymentMethodSelect.disabled = false;
  payBtn.disabled = true;
}

backBtn.addEventListener('click', () => {
  finishPage.style.display = 'none';
  orderSection.style.display = 'block';
  updateOrderStatus('下訂單');
  payBtn.disabled = !(order.length > 0 && paymentMethodSelect.value);
});

paymentMethodSelect.addEventListener('change', () => {
  payBtn.disabled = !(order.length > 0 && paymentMethodSelect.value);
});

const ctx = document.getElementById('orderStatusChart').getContext('2d');
const statuses = ['下訂單', '已付款', '準備中', '配送中', '完成'];

const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: statuses,
    datasets: [{
      label: '訂單狀態',
      data: statuses.map((_, i) => i === currentStatusIndex ? 1 : 0),
      backgroundColor: 'rgba(255, 111, 97, 0.8)'
    }]
  },
  options: {
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, max: 1 },
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { display: false }
    },
    animation: {
      duration: 500
    }
  }
});

function updateOrderStatus(status) {
  const idx = statuses.indexOf(status);
  if(idx >= 0) {
    currentStatusIndex = idx;
    chart.data.datasets[0].data = statuses.map((_, i) => i === idx ? 1 : 0);
    chart.update();
  }
}

renderMenu();
updateOrderStatus('下訂單');
