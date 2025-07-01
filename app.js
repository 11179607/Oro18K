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
  }
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

  if (inventory[ref] && qty > 0 && inventory[ref].qty >= qty) {
    inventory[ref].qty -= qty;
    const total = qty * inventory[ref].price;
    const product = inventory[ref].name;

    history.push({
      time: new Date().toLocaleString(),
      action: `Venta: ${qty} de ${product} a ${client} por $${total.toFixed(2)} [Ref: ${ref}]`,
    });

    saveData();
    updateInventoryTable();
    updateHistoryLog();

    const factura = `
      <html>
        <head><title>Factura</title></head>
        <body>
          <h2>Factura de Venta</h2>
          <p><strong>Cliente:</strong> ${client}</p>
          <p><strong>Producto:</strong> ${product}</p>
          <p><strong>Cantidad:</strong> ${qty}</p>
          <p><strong>Precio unitario:</strong> $${inventory[ref].price.toFixed(2)}</p>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
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
  } else {
    alert("Referencia inválida o stock insuficiente.");
  }
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

document.getElementById("searchInput").addEventListener("input", updateInventoryTable);
function logout() {
  currentUser = null;
  inventory = {};
  history = [];
  document.getElementById("appSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("username").value = "";
}