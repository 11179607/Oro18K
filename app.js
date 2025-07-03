let expenses = [];
let inventory = {};
let history = [];
let currentUser = null;

function saveData() {
  if (!currentUser) return;
  localStorage.setItem(`inventory_${currentUser.username}`, JSON.stringify(inventory));
  localStorage.setItem(`history_${currentUser.username}`, JSON.stringify(history));
}

function loadData() {
  if (!currentUser) return;
  const savedInventory = localStorage.getItem(`inventory_${currentUser.username}`);
  const savedHistory = localStorage.getItem(`history_${currentUser.username}`);
  inventory = savedInventory ? JSON.parse(savedInventory) : {};
  history = savedHistory ? JSON.parse(savedHistory) : [];
  updateInventoryTable();
  updateHistoryLog();
}

function login() {
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role").value;
  if (username) {
    currentUser = { username, role };
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    if (role === "lector") {
      document.getElementById("addSection").style.display = "none";
      document.getElementById("sellSection").style.display = "none";
      document.getElementById("restockSection").style.display = "none";
    }
    loadData();
    loadExpenses();
  }
}

function logout() {
  currentUser = null;
  inventory = {};
  history = [];
  document.getElementById("appSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("username").value = "";
}

function updateInventoryTable() {
  const tableBody = document.querySelector("#inventoryTable tbody");
  const search = document.getElementById("searchInput").value.toLowerCase();
  tableBody.innerHTML = "";

  for (let ref in inventory) {
    const { name, category, price, qty } = inventory[ref];
    if (
      ref.toLowerCase().includes(search) ||
      name.toLowerCase().includes(search)
    ) {
      const rowClass = qty < 5 ? "low-stock" : "";
      const row = `
        <tr class="${rowClass}">
          <td>${ref}</td>
          <td>${name}</td>
          <td>${category}</td>
          <td>$${price.toFixed(2)}</td>
          <td>${qty}</td>
        </tr>`;
      tableBody.innerHTML += row;
    }
  }
}

function updateHistoryLog() {
  const log = document.getElementById("historyLog");
  log.innerHTML = "";
  history.slice().reverse().forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `[${entry.time}] ${entry.action}`;
    log.appendChild(li);
  });
}

function addProduct() {
  const ref = document.getElementById("newProductRef").value.trim();
  const name = document.getElementById("newProductName").value.trim();
  const category = document.getElementById("newProductCategory").value.trim();
  const price = parseFloat(document.getElementById("newProductPrice").value);
  const qty = parseInt(document.getElementById("newProductQty").value);

  if (ref && name && category && !isNaN(price) && !isNaN(qty)) {
    if (inventory[ref]) {
      alert("Esta referencia ya existe.");
    } else {
      inventory[ref] = { name, category, price, qty };
      history.push({
        time: new Date().toLocaleString(),
        action: `Agregado: ${name} (${qty}) a $${price.toFixed(2)} [Ref: ${ref}]`,
      });
      saveData();
      updateInventoryTable();
      updateHistoryLog();
      document.getElementById("newProductRef").value = "";
      document.getElementById("newProductName").value = "";
      document.getElementById("newProductCategory").value = "";
      document.getElementById("newProductPrice").value = "";
      document.getElementById("newProductQty").value = "";
    }
  }
}

function sellProduct() {
  const ref = document.getElementById("sellProductRef").value.trim();
  const qty = parseInt(document.getElementById("sellProductQty").value);
  const client = document.getElementById("clientName").value.trim();

  if (!inventory[ref]) {
    alert("Referencia no encontrada.");
    return;
  }

  if (isNaN(qty) || qty <= 0) {
    alert("Cantidad inválida.");
    return;
  }

  if (inventory[ref].qty < qty) {
    alert("Stock insuficiente.");
    return;
  }

  if (!client) {
    alert("Por favor ingresa el nombre del cliente.");
    return;
  }

  inventory[ref].qty -= qty;
  const unitPrice = inventory[ref].price;
  const subtotal = qty * unitPrice;
  const product = inventory[ref].name;

  history.push({
    time: new Date().toLocaleString(),
    action: `Venta: ${qty} de ${product} a ${client} por $${subtotal.toFixed(2)} [Ref: ${ref}]`,
  });

  saveData();
  updateInventoryTable();
  updateHistoryLog();

  const factura = `
    <html>
      <head>
        <title>Factura</title>
        <style>
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 40px;
            background: url('WhatsApp Image 2025-07-01 at 15.59.33.jpeg') no-repeat center center;
            background-size: cover;
            color: #4e342e;
          }
          .factura-box {
            background-color: rgba(255, 255, 255, 0.92);
            padding: 30px;
            border-radius: 16px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            border: 2px solid #d4af37;
          }
          h2 {
            color: #b8860b;
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.8em;
          }
          p {
            margin: 10px 0;
            font-size: 1.1em;
          }
          .label {
            font-weight: bold;
            color: #6d4c41;
          }
          .total {
            font-size: 1.3em;
            font-weight: bold;
            color: #c2185b;
            margin-top: 20px;
          }
          .gracias {
            text-align: center;
            font-size: 1.2em;
            color: #b8860b;
            font-weight: bold;
            margin-top: 30px;
            letter-spacing: 1px;
            text-shadow: 1px 1px 4px #fff, 0 0 8px #d4af37;
          }
        </style>
      </head>
      <body>
        <div class="factura-box">
          <h2>💎Factura de Venta-Destello de Oro 18K💎</h2>
          <p><span class="label">Cliente:</span> ${client}</p>
          <p><span class="label">Producto:</span> ${product}</p>
          <p><span class="label">Cantidad:</span> ${qty}</p>
          <p><span class="label">Precio unitario:</span> $${unitPrice.toFixed(2)}</p>
          <p class="total">Total: $${subtotal.toFixed(2)}</p>
          <p><span class="label">Fecha:</span> ${new Date().toLocaleString()}</p>
          <p class="gracias">✨ MUCHAS GRACIAS POR SU COMPRA ✨</p>
        </div>
        <script>window.print()</script>
      </body>
    </html>
  `;

  const facturaWindow = window.open("", "_blank");
  facturaWindow.document.write(factura);
  facturaWindow.document.close();

  document.getElementById("sellProductRef").value = "";
  document.getElementById("sellProductQty").value = "";
  document.getElementById("clientName").value = "";
}

function restockProduct() {
  const ref = document.getElementById("restockProductRef").value.trim();
  const qty = parseInt(document.getElementById("restockProductQty").value);

  if (inventory[ref] && qty > 0) {
    inventory[ref].qty += qty;
    history.push({
      time: new Date().toLocaleString(),
      action: `Surtido: ${qty} unidades a ${inventory[ref].name} [Ref: ${ref}]`,
    });
    saveData();
    updateInventoryTable();
    updateHistoryLog();
    document.getElementById("restockProductRef").value = "";
    document.getElementById("restockProductQty").value = "";
  } else {
    alert("Referencia inválida.");
  }
}

document.get

function saveExpenses() {
  if (!currentUser) return;
  localStorage.setItem(`expenses_${currentUser.username}`, JSON.stringify(expenses));
}

function loadExpenses() {
  if (!currentUser) return;
  const saved = localStorage.getItem(`expenses_${currentUser.username}`);
  expenses = saved ? JSON.parse(saved) : [];
  updateExpenseLog();
}

function addExpense() {
  const desc = document.getElementById("expenseDescription").value.trim();
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  if (!desc || isNaN(amount) || amount <= 0) {
    alert("Por favor ingresa una descripción y un valor válido.");
    return;
  }

  expenses.push({
    time: new Date().toLocaleString(),
    description: desc,
    amount: amount
  });

  saveExpenses();
  updateExpenseLog();

  document.getElementById("expenseDescription").value = "";
  document.getElementById("expenseAmount").value = "";
}

function updateExpenseLog() {
  const log = document.getElementById("expenseLog");
  const totalDisplay = document.getElementById("totalExpenses");
  log.innerHTML = "";

  let total = 0;
  expenses.slice().reverse().forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `[${entry.time}] ${entry.description} - $${entry.amount.toFixed(2)}`;
    log.appendChild(li);
    total += entry.amount;
  });

  totalDisplay.textContent = `Total de gastos: $${total.toFixed(2)}`;
}
document.getElementById("searchInput").addEventListener("input", updateInventoryTable);