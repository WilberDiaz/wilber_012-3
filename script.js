document.addEventListener("DOMContentLoaded", () => {

    const productsContainer = document.getElementById("productsContainer");
    const searchInput = document.getElementById("searchInput");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const cartCount = document.getElementById("cartCount");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalSpan = document.getElementById("cartTotal");

    let vehiclesData = [];
    let cart = [];

    /* ===================== CARGAR VEHÍCULOS ===================== */
    async function loadVehicles() {
        try {
            const res = await fetch("https://raw.githubusercontent.com/JUANCITOPENA/Pagina_Vehiculos_Ventas/refs/heads/main/vehiculos.json");
            vehiclesData = await res.json();
            displayVehicles(vehiclesData);
        } catch (err) {
            productsContainer.innerHTML = "<p>Error al cargar los vehículos</p>";
        } finally {
            loadingSpinner.style.display = "none";
        }
    }

    /* ===================== MOSTRAR VEHÍCULOS ===================== */
    function displayVehicles(data) {
        productsContainer.innerHTML = "";

        data.forEach(vehicle => {
            const card = document.createElement("div");
            card.className = "col-md-4 col-sm-6 mb-4";

            card.innerHTML = `
                <div class="card h-100">
                    <img src="${vehicle.imagen}" class="card-img-top" loading="lazy">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                        <p class="card-text">${vehicle.categoria}</p>
                        <p><strong>${vehicle.precio_venta.toLocaleString()} USD</strong></p>

                        <button class="btn btn-primary mt-auto viewDetailsBtn" data-codigo="${vehicle.codigo}">
                            Ver Detalles
                        </button>
                    </div>
                </div>
            `;

            productsContainer.appendChild(card);
        });
    }

    /* ===================== DELEGACIÓN DE EVENTOS ===================== */
    productsContainer.addEventListener("click", e => {
        if (e.target.classList.contains("viewDetailsBtn")) {
            const codigo = parseInt(e.target.dataset.codigo);
            const vehicle = vehiclesData.find(v => v.codigo === codigo);
            openDetailsModal(vehicle);
        }
    });

    /* ===================== MODAL DETALLES ===================== */
    function openDetailsModal(vehicle) {
        document.getElementById("detailsImage").src = vehicle.imagen;

        const list = document.getElementById("detailsList");
        list.innerHTML = `
            <li class="list-group-item"><strong>Marca:</strong> ${vehicle.marca}</li>
            <li class="list-group-item"><strong>Modelo:</strong> ${vehicle.modelo}</li>
            <li class="list-group-item"><strong>Categoría:</strong> ${vehicle.categoria}</li>
            <li class="list-group-item"><strong>Precio:</strong> ${vehicle.precio_venta.toLocaleString()} USD</li>
        `;

        const addBtn = document.getElementById("detailsAddCartBtn");
        addBtn.onclick = () => showQuantityModal(vehicle);

        new bootstrap.Modal("#detailsModal").show();
    }

    /* ===================== MODAL CANTIDAD ===================== */
    function showQuantityModal(vehicle) {
        const quantityInput = document.getElementById("quantityInput");
        quantityInput.value = 1;

        const addBtn = document.getElementById("addToCartBtn");

        addBtn.onclick = () => {
            const quantity = parseInt(quantityInput.value);

            if (quantity > 0) {
                addItemToCart(vehicle, quantity);
                bootstrap.Modal.getInstance(document.getElementById("quantityModal")).hide();
            }
        };

        new bootstrap.Modal("#quantityModal").show();
    }

    /* ===================== AÑADIR AL CARRITO ===================== */
    function addItemToCart(vehicle, quantity) {
        const existing = cart.find(item => item.codigo === vehicle.codigo);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                codigo: vehicle.codigo,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                precio: vehicle.precio_venta,
                imagen: vehicle.imagen,
                quantity
            });
        }

        updateCartUI();
    }

    /* ===================== ACTUALIZAR CARRITO ===================== */
    function updateCartUI() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        cart.forEach(item => {
            const subtotal = item.precio * item.quantity;
            total += subtotal;

            const p = document.createElement("p");
            p.innerHTML = `
                <img src="${item.imagen}" width="80"> 
                <strong>${item.marca} ${item.modelo}</strong> —
                Cant: ${item.quantity} —
                Subtotal: ${subtotal.toLocaleString()} USD
            `;
            cartItemsContainer.appendChild(p);
        });

        cartTotalSpan.textContent = total.toLocaleString();
        cartCount.textContent = cart.reduce((acc, i) => acc + i.quantity, 0);
    }

    /* ===================== PROCESAR PAGO ===================== */
    document.getElementById("checkoutBtn").onclick = () => {
        new bootstrap.Modal("#paymentModal").show();
    };

    document.getElementById("processPaymentBtn").onclick = () => {
        generateInvoice();
        alert("Pago procesado con éxito.");

        cart = [];
        updateCartUI();

        bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide();
        bootstrap.Modal.getInstance(document.getElementById("cartModal")).hide();
    };

    /* ===================== GENERAR FACTURA PDF ===================== */
    function generateInvoice() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.text("Factura - Garage Online", 10, 10);

        let y = 20;

        cart.forEach(item => {
            pdf.text(`${item.marca} ${item.modelo} - Cant: ${item.quantity} - Subtotal: ${(item.precio * item.quantity).toLocaleString()} USD`, 10, y);
            y += 10;
        });

        pdf.text(`TOTAL: ${cartTotalSpan.textContent} USD`, 10, y + 10);

        pdf.save("Factura_GarageOnline.pdf");
    }

    /* ===================== BUSCADOR ===================== */
    searchInput.addEventListener("input", () => {
        const text = searchInput.value.toLowerCase();
        const filtered = vehiclesData.filter(v =>
            v.marca.toLowerCase().includes(text) ||
            v.modelo.toLowerCase().includes(text) ||
            v.categoria.toLowerCase().includes(text)
        );
        displayVehicles(filtered);
    });

    loadVehicles();
});
