let total = 0;
let descuento5Activo = false;
let carrito = [];
let recibido = 0;
let menuOriginal = "";
let billetesRecibidos = [];
const CLAVE_HISTORIAL = "incluirteCafeHistorial";
let historial = [];
let totalDia = 0;

function cargarHistorialGuardado() {
    try {
        const guardado = localStorage.getItem(CLAVE_HISTORIAL);
        historial = guardado ? JSON.parse(guardado) : [];
        if (!Array.isArray(historial)) historial = [];
    } catch (e) {
        historial = [];
    }

    totalDia = historial.reduce((suma, venta) => suma + Number(venta.total || 0), 0);
    actualizarHistorial();
}

function persistirHistorial() {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
}

let metodoPago = "";

function actualizarBilletes() {
    const contenedor = document.getElementById("bandeja-billetes");
    contenedor.innerHTML = "";

    billetesRecibidos.forEach((b, index) => {
        const div = document.createElement("div");
        div.className = "billete-item";

        div.innerHTML = `
            <img src="${b.img}" alt="billete">

            <div class="borrar-btn" onclick="eliminarBillete(${index})">
    ✖
</div>
        `;

        contenedor.appendChild(div);
    });
}

function actualizar() {
    const subtotal = carrito.reduce((suma, p) => suma + Number(p.precio || 0), 0);
    total = descuento5Activo ? Math.round(subtotal * 0.95) : subtotal;

    document.getElementById("total").textContent =
    formatearDinero(total);

    const botonDescuento = document.getElementById("btn-descuento5");
    if (botonDescuento) {
        botonDescuento.classList.toggle("activo", descuento5Activo);
        botonDescuento.textContent = descuento5Activo ? "- 5% APLICADO" : "- 5%";
    }
    
    let lista = document.getElementById("lista-carrito");
    lista.innerHTML = "";

    carrito.forEach((p, index) => {

    let div = document.createElement("div");
    div.className = "item-carrito";

    div.innerHTML = `

    <div class="borrar-btn" onclick="eliminarProducto(${index})">
        ✖
    </div>

    ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : `<div class="foto-placeholder carrito-placeholder">FOTO ACÁ</div>`}

    <p>${p.nombre}</p>

    <p>$${formatearDinero(p.precio)}</p>
`;

    lista.appendChild(div);
});

}

function eliminarBillete(index) {
    recibido -= billetesRecibidos[index].valor;

    billetesRecibidos.splice(index, 1);

    actualizarBilletes();

    document.getElementById("recibido").textContent =
        "TOTAL RECIBIDO: $" +
formatearDinero(recibido);
}

function agregar(nombre, precio, imagen) {

    total += precio;

    carrito.push({
        nombre,
        precio,
        imagen
    });

    actualizar();
}

function restar(nombre, precio) {
    let i = carrito.findIndex(p => p.nombre === nombre);
    if (i !== -1) {
        carrito.splice(i, 1);
        total -= precio;
        actualizar();
    }
}

function alternarDescuento5() {
    if (carrito.length === 0) return;
    descuento5Activo = !descuento5Activo;
    actualizar();
}

function cobrar() {

    document.getElementById("modal-pago").style.display = "flex";
}

function eliminarProducto(index) {

    total -= carrito[index].precio;

    carrito.splice(index, 1);

    actualizar();
}

function cerrarModal() {

    document.getElementById("modal-pago").style.display = "none";

    document.querySelector(".modal-contenido").innerHTML =
        menuOriginal;
}

function pagarEfectivo() {

metodoPago = "EFECTIVO";

    recibido = 0;

    document.querySelector(".modal-contenido").innerHTML = `

        <h2>EFECTIVO</h2>

        <p><strong>TOTAL:</strong> $${formatoPesos(total)}</p>

        <p><strong>¿QUÉ BILLETES TE DIERON?</strong></p>

        <div class="billetes">

            <img src="https://images3.cgb.fr/images/billets/b97/b97_3808a.jpg"
                 onclick="agregarBillete(100, 'https://images3.cgb.fr/images/billets/b97/b97_3808a.jpg')">

            <img src="https://images3.cgb.fr/images/billets/b91/b91_6875a.jpg"
                 onclick="agregarBillete(200, 'https://images3.cgb.fr/images/billets/b91/b91_6875a.jpg')">

            <img src="https://banknotenews.com/wp-content/uploads/2016/07/Argentina_BCRA_500_pesos_2016.06.30_B421a_P365_A_00000101_f-1536x632.jpg"
                 onclick="agregarBillete(500, 'https://banknotenews.com/wp-content/uploads/2016/07/Argentina_BCRA_500_pesos_2016.06.30_B421a_P365_A_00000101_f-1536x632.jpg')">


            <img src="https://images3.cgb.fr/images/billets/b87/b87_0586a.jpg"
                 onclick="agregarBillete(1000, 'https://images3.cgb.fr/images/billets/b87/b87_0586a.jpg')">

            <img src="https://storage.lacapitalmdp.com/2023/05/billete-2000pesos.jpg"
                 onclick="agregarBillete(2000, 'https://storage.lacapitalmdp.com/2023/05/billete-2000pesos.jpg')">

            <img src="https://platform.keesingtechnologies.com/wp-content/uploads/2024/05/AR083R.jpg"
                 onclick="agregarBillete(10000, 'https://platform.keesingtechnologies.com/wp-content/uploads/2024/05/AR083R.jpg')">

            <img src="https://buenosairesherald.com/wp-content/uploads/2024/11/20000_pesos_bill_banknote_billete_Alberdi.jpg"
                 onclick="agregarBillete(20000, 'https://buenosairesherald.com/wp-content/uploads/2024/11/20000_pesos_bill_banknote_billete_Alberdi.jpg')">

        </div>

       <h3 id="recibido">
    TOTAL RECIBIDO: $0
</h3>

<h3 id="vuelto">
</h3>

<div id="bandeja-billetes"></div>
<button onclick="calcularVuelto()">
    COBRAR
</button>

<button onclick="cerrarModal()">
    VOLVER
</button>

    `;
}

function pagarTransferencia() {

metodoPago = "TRANSFERENCIA";

    document.querySelector(".modal-contenido").innerHTML = `

        <h2>TRANSFERENCIA</h2>

        <p><strong>TOTAL:</strong> $${formatoPesos(total)}</p>

        <p><strong>ALIAS:</strong></p>

        <p class="alias">incluirte.cafe</p>

        <button onclick="confirmarPago()">
            PAGÓ
        </button>

        <button onclick="cerrarModal()">
            VOLVER
        </button>

    `;
}

function confirmarPago() {

guardarVenta();

    total = 0;

    carrito = [];
    descuento5Activo = false;

    actualizar();

    cerrarModal();
}


function calcularVuelto() {

    let vuelto = recibido - total;

    if (vuelto < 0) {

        document.getElementById("vuelto").textContent =
            "FALTAN $" +
formatearDinero(Math.abs(vuelto));

        return;
    }

    document.getElementById("vuelto").innerHTML = `

        VUELTO: $${formatearDinero(vuelto)}
        <br><br>

        <button onclick="finalizarCompra()">
            PAGÓ
        </button>
    `;
}

function finalizarCompra() {

guardarVenta();

    total = 0;

    carrito = [];

    recibido = 0;

    billetesRecibidos = []; // 👈 ESTE ES EL FIX

    actualizar();

    cerrarModal();
}

window.onload = function() {

    menuOriginal =
        document.querySelector(".modal-contenido").innerHTML;

    cargarHistorialGuardado();
}

function mover(valor) {
    document.getElementById("productos").scrollBy({
        left: valor,
        behavior: "smooth"
    });
}

function agregarBillete(valor, img) {

    recibido += valor;

    billetesRecibidos.push({ valor, img });

    actualizarBilletes();

    document.getElementById("recibido").textContent =
        "TOTAL RECIBIDO: $" +
formatearDinero(recibido);
}

const slider = document.getElementById("productos");

let presionado = false;
let inicioX;
let scrollInicial;

slider.addEventListener("mousedown", (e) => {
    presionado = true;

    slider.style.cursor = "grabbing";

    inicioX = e.pageX - slider.offsetLeft;

    scrollInicial = slider.scrollLeft;
});

slider.addEventListener("mouseleave", () => {
    presionado = false;

    slider.style.cursor = "grab";
});

slider.addEventListener("mouseup", () => {
    presionado = false;

    slider.style.cursor = "grab";
});

slider.addEventListener("mousemove", (e) => {

    if (!presionado) return;

    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;

    const mover = (x - inicioX) * 2;

    slider.scrollLeft = scrollInicial - mover;
});

function pantallaCompleta() {

    const boton =
        document.querySelector(".fullscreen-btn");

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

        boton.style.display = "none";
    }
}

function guardarVenta() {

    const ahora = new Date();

    const hora =
        ahora.getHours().toString().padStart(2, "0")
        + ":" +
        ahora.getMinutes().toString().padStart(2, "0");

    const fecha = ahora.toLocaleDateString("es-AR");
    const productos = carrito.map(p => ({ nombre: p.nombre, precio: p.precio }));

    historial.push({
        fecha: fecha,
        hora: hora,
        total: total,
        metodo: metodoPago,
        productos: productos
    });

    totalDia += total;
    persistirHistorial();
    actualizarHistorial();
}

function resumirProductos(productos) {
    if (!Array.isArray(productos) || productos.length === 0) return "";

    const cantidades = {};
    const orden = [];

    productos.forEach(p => {
        const nombre = String(p.nombre || "PRODUCTO").trim().toUpperCase();
        if (!cantidades[nombre]) {
            cantidades[nombre] = 0;
            orden.push(nombre);
        }
        cantidades[nombre]++;
    });

    return orden.map(nombre =>
        cantidades[nombre] > 1 ? `${cantidades[nombre]} ${nombre}` : nombre
    ).join(" - ");
}

function actualizarHistorial() {

    const lista = document.getElementById("lista-historial");
    lista.innerHTML = "";

    let fechaAnterior = null;

    historial.forEach(v => {
        const fechaVenta = v.fecha || new Date().toLocaleDateString("es-AR");

        if (fechaVenta !== fechaAnterior) {
            const fechaTitulo = document.createElement("h3");
            fechaTitulo.className = "fecha-historial";
            fechaTitulo.textContent = `FECHA: ${fechaVenta}`;
            lista.appendChild(fechaTitulo);
            fechaAnterior = fechaVenta;
        }

        const item = document.createElement("p");
        const productos = resumirProductos(v.productos);
        item.textContent = `${v.hora}: $${formatearDinero(Number(v.total || 0))}${productos ? " " + productos : ""}`;
        lista.appendChild(item);
    });

    document.getElementById("total-dia").textContent =
        "TOTAL DEL DÍA: $" + formatearDinero(totalDia);
}

document.addEventListener("fullscreenchange", () => {

    const boton = document.querySelector(".fullscreen-btn");

    if (!document.fullscreenElement) {
        boton.style.display = "block";
    }
});

function borrarHistorial() {
    if (!confirm("¿SEGURO QUE QUERÉS BORRAR TODO EL HISTORIAL DE VENTAS?")) return;

    historial = [];
    totalDia = 0;
    persistirHistorial();
    actualizarHistorial();
}

function abrirHistorial() {
    actualizarHistorial();
    document.getElementById("modal-historial").style.display = "flex";
}

function cerrarHistorial() {
    document.getElementById("modal-historial").style.display = "none";
}

function descargarHistorial() {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("INCLUIRTE Y CAFÉ", 105, 20, { align: "center" });

    pdf.setFontSize(16);
    pdf.text("Historial de ventas", 105, 30, { align: "center" });

    let y = 45;
    let fechaAnterior = null;

    historial.forEach((venta) => {
        const fechaVenta = venta.fecha || new Date().toLocaleDateString("es-AR");

        if (fechaVenta !== fechaAnterior) {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(`FECHA: ${fechaVenta}`, 20, y);
            y += 9;
            fechaAnterior = fechaVenta;
        }

        const productos = resumirProductos(venta.productos);
        const linea = `${venta.hora}: $${formatearDinero(Number(venta.total || 0))}${productos ? " " + productos : ""}`;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const lineas = pdf.splitTextToSize(linea, 170);

        if (y + (lineas.length * 6) > 280) {
            pdf.addPage();
            y = 20;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(`FECHA: ${fechaVenta}`, 20, y);
            y += 9;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
        }

        pdf.text(lineas, 20, y);
        y += lineas.length * 6 + 3;
    });

    if (historial.length === 0) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text("NO HAY VENTAS REGISTRADAS.", 20, y);
    }

    const fechaArchivo = new Date().toLocaleDateString("es-AR").replaceAll("/", "-");
    pdf.save(`historial_incluirte_y_cafe_${fechaArchivo}.pdf`);
}

function formatearDinero(numero) {
    return numero.toLocaleString("es-AR");
}

function formatoPesos(numero) {
    return numero.toLocaleString("es-AR");
}
