// ==========================================
// 1. VARIABLES GLOBALES Y CARGA INICIAL
// ==========================================

let inventario = JSON.parse(localStorage.getItem('deposito_gilera_data')) || [
{
    orden: "GILAR122",
    factura: "1129001",
    contenedor: "MSCU881203",
    cantidad_ikd: "200",
    modelo: "Smash 110",
    bl_no: "MAEU009182",
    buque: "Express Star",
    fecha_descarga: "2026-07-20",
    deposito: "Depósito 1",
    posicion: "A-12"
  }
];

let movimientos = JSON.parse(localStorage.getItem('deposito_gilera_movimientos')) || [];

window.onload = function() {
  renderizarTabla();
  renderizarHistorial();
  
  // Cargar preferencia de modo oscuro
  if (localStorage.getItem('modo_oscuro') === 'true') {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('btn-modo-oscuro');
    // Actualiza el texto del botón si existe en la página actual
    if(btn) btn.innerText = '☀️ Claro';
  }
};

function guardarEnLocalStorage() {
  localStorage.setItem('deposito_gilera_data', JSON.stringify(inventario));
}


// ==========================================
// 2. FUNCIONES DE NAVEGACIÓN Y EDICIÓN
// ==========================================

// Ocultar o mostrar el formulario de edición dentro de stock.html
function ocultarEdicion() {
  const secEdicion = document.getElementById('sec-edicion');
  const secInventario = document.getElementById('sec-inventario');
  if(secEdicion) secEdicion.classList.add('hidden');
  if(secInventario) secInventario.classList.remove('hidden');
}


// ==========================================
// 3. FUNCIONES DEL INVENTARIO (CREAR, LEER, EDITAR, ELIMINAR)
// ==========================================

// Guardar un nuevo contenedor (desde agregar.html)
function guardarNuevoProducto(e) {
  e.preventDefault();

  const nuevo = {
    orden: document.getElementById('orden').value,
    factura: document.getElementById('factura').value,
    contenedor: document.getElementById('contenedor').value,
    cantidad_ikd: document.getElementById('cantidad_ikd').value,
    modelo: document.getElementById('modelo').value,
    bl_no: document.getElementById('bl_no').value,
    buque: document.getElementById('buque').value,
    fecha_descarga: document.getElementById('fecha_descarga').value,
    deposito: document.getElementById('deposito').value,
    posicion: document.getElementById('posicion').value
  };

  inventario.push(nuevo);
  guardarEnLocalStorage();
  document.getElementById('form-crear').reset();
  
  alert("✅ ¡Registro guardado con éxito!");
  window.location.href = "stock.html"; // Redirige automáticamente al stock
}

// Dibujar la tabla principal de stock (en stock.html)
function renderizarTabla() {
  const tbody = document.getElementById('tabla-body');
  if (!tbody) return; // Si no estamos en stock.html, no hace nada

  tbody.innerHTML = '';

  inventario.forEach((prod, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${prod.orden}</strong></td>
      <td>${prod.factura}</td>
      <td>${prod.contenedor}</td>
      <td><strong>${prod.cantidad_ikd}</strong></td>
      <td>${prod.modelo}</td>
      <td>${prod.bl_no}</td>
      <td>${prod.buque}</td>
      <td>${prod.fecha_descarga}</td>
      <td>${prod.deposito}</td>
      <td>${prod.posicion}</td>
      <td>
        <button class="btn-edit" onclick="prepararEdicion(${index})" title="Editar">✏️</button>
        <button style="background-color: #10b981; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-weight: 600; margin: 0 4px;" onclick="registrarEgreso(${index})" title="Restar Stock">📤</button>
        <button class="btn-delete" onclick="eliminarProducto(${index})" title="Eliminar">🗑️</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// Preparar el formulario de edición (en stock.html)
function prepararEdicion(index) {
  const prod = inventario[index];

  document.getElementById('edit-index').value = index;
  document.getElementById('edit-orden').value = prod.orden;
  document.getElementById('edit-factura').value = prod.factura;
  document.getElementById('edit-contenedor').value = prod.contenedor;
  document.getElementById('edit-cantidad_ikd').value = prod.cantidad_ikd;
  document.getElementById('edit-modelo').value = prod.modelo;
  document.getElementById('edit-bl_no').value = prod.bl_no;
  document.getElementById('edit-buque').value = prod.buque;
  document.getElementById('edit-fecha_descarga').value = prod.fecha_descarga;
  document.getElementById('edit-deposito').value = prod.deposito;
  document.getElementById('edit-posicion').value = prod.posicion;

  // Mostramos el formulario de edición y ocultamos la tabla temporalmente
  document.getElementById('sec-edicion').classList.remove('hidden');
  document.getElementById('sec-inventario').classList.add('hidden');
}

// Guardar los cambios de la edición
function actualizarProducto(e) {
  e.preventDefault();
  const index = document.getElementById('edit-index').value;

  inventario[index] = {
    orden: document.getElementById('edit-orden').value,
    factura: document.getElementById('edit-factura').value,
    contenedor: document.getElementById('edit-contenedor').value,
    cantidad_ikd: document.getElementById('edit-cantidad_ikd').value,
    modelo: document.getElementById('edit-modelo').value,
    bl_no: document.getElementById('edit-bl_no').value,
    buque: document.getElementById('edit-buque').value,
    fecha_descarga: document.getElementById('edit-fecha_descarga').value,
    deposito: document.getElementById('edit-deposito').value,
    posicion: document.getElementById('edit-posicion').value
  };

  guardarEnLocalStorage();
  renderizarTabla();
  ocultarEdicion();
}

// Eliminar un registro completo
function eliminarProducto(index) {
  if (confirm('¿Estás seguro de que deseas eliminar este registro por completo?')) {
    inventario.splice(index, 1);
    guardarEnLocalStorage();
    renderizarTabla();
  }
}

// Buscador de la tabla de inventario
function filtrarTabla() {
  const inputBusqueda = document.getElementById('input-busqueda');
  if (!inputBusqueda) return;

  const textoBusqueda = inputBusqueda.value.toLowerCase();
  const filas = document.querySelectorAll('#tabla-body tr');

  filas.forEach(fila => {
    const contenidoFila = fila.innerText.toLowerCase();
    if (contenidoFila.includes(textoBusqueda)) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
}


// ==========================================
// 4. FUNCIONES DE EGRESO Y HISTORIAL
// ==========================================

function registrarEgreso(index) {
  const prod = inventario[index];
  let cantidadActual = parseInt(prod.cantidad_ikd);
  
  if (cantidadActual === 0) {
    alert('Este contenedor ya no tiene stock disponible.');
    return;
  }

  let cantidadRetirar = prompt(`¿Cuántas unidades de ${prod.modelo} vas a retirar?\n(Stock disponible: ${cantidadActual})`);

  if (cantidadRetirar && !isNaN(cantidadRetirar) && parseInt(cantidadRetirar) > 0) {
    cantidadRetirar = parseInt(cantidadRetirar);
    
    if (cantidadRetirar <= cantidadActual) {
      
      // Nueva lógica de destinos incluyendo Cierre de Lote
      let opcionDestino = prompt(`¿A dónde se envían estas ${cantidadRetirar} unidades?\n1 - Producción\n2 - Sucursal Puma\n3 - Cierre de Lote`);
      
      let destinoFinal = "";
      if (opcionDestino === "1") destinoFinal = "Producción";
      else if (opcionDestino === "2") destinoFinal = "Sucursal Puma";
      else if (opcionDestino === "3") destinoFinal = "Cierre de Lote";
      else {
        alert("❌ Operación cancelada: Destino inválido (debes ingresar 1, 2 o 3).");
        return; 
      }

      inventario[index].cantidad_ikd = cantidadActual - cantidadRetirar;
      guardarEnLocalStorage();
      renderizarTabla();

      const fechaActual = new Date().toLocaleString('es-AR'); 
      const nuevoMovimiento = {
        fecha: fechaActual,
        modelo: prod.modelo,
        orden: prod.orden,
        factura: prod.factura,
        cantidad: cantidadRetirar,
        destino: destinoFinal
      };

      movimientos.push(nuevoMovimiento);
      localStorage.setItem('deposito_gilera_movimientos', JSON.stringify(movimientos));
      
      alert(`✅ ¡Listo! Se descontaron ${cantidadRetirar} unidades enviadas a ${destinoFinal}.`);
      
    } else {
      alert(`❌ Error: No hay suficiente stock. (Intentaste sacar ${cantidadRetirar} y hay ${cantidadActual})`);
    }
  }
}

// Dibuja la tabla del historial de salidas (en historial.html)
function renderizarHistorial() {
  const tbody = document.getElementById('tabla-historial');
  if(!tbody) return; // Si no estamos en historial.html, no hace nada
  
  tbody.innerHTML = '';

  const movimientosInvertidos = [...movimientos].reverse();

  movimientosInvertidos.forEach(mov => {
    const fila = document.createElement('tr');
    // Le sacamos el color de letra forzado al span para que se adapte al modo oscuro
    fila.innerHTML = `
      <td>${mov.fecha}</td>
      <td><strong>${mov.modelo}</strong></td>
      <td>${mov.orden || '-'}</td>
      <td>${mov.factura || '-'}</td>
      <td style="color: #ef4444; font-weight: bold;">- ${mov.cantidad}</td>
      <td><span style="background-color: transparent; padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">${mov.destino}</span></td>
    `;
    tbody.appendChild(fila);
  });
}

// Buscador para el historial
function filtrarHistorial() {
  const inputBusqueda = document.getElementById('input-busqueda-historial');
  if (!inputBusqueda) return;

  const textoBusqueda = inputBusqueda.value.toLowerCase();
  const filas = document.querySelectorAll('#tabla-historial tr');

  filas.forEach(fila => {
    const contenidoFila = fila.innerText.toLowerCase();
    if (contenidoFila.includes(textoBusqueda)) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
}

// ==========================================
// 5. MODO OSCURO
// ==========================================

function toggleModoOscuro() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  
  const esOscuro = body.classList.contains('dark-mode');
  localStorage.setItem('modo_oscuro', esOscuro);
  
  const btn = document.getElementById('btn-modo-oscuro');
  if(btn) btn.innerText = esOscuro ? '☀️ Claro' : '🌙 Oscuro';
}