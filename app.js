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
    posicion: document.getElementById('posicion').value,
    comentario: "" // Inicia sin comentario
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
    // Lógica visual del globito de comentarios
    let tieneNota = prod.comentario && prod.comentario.trim() !== "";
    let icono = tieneNota ? "📌" : "📎";
    let claseGlobo = tieneNota ? "btn-comentario btn-con-nota" : "btn-comentario";
    let tituloTooltip = tieneNota ? prod.comentario : "Agregar nota";

    // ✨ TRUCO SIMPLE: Dar vuelta la fecha en una sola línea
    let fechaArgentina = prod.fecha_descarga ? prod.fecha_descarga.split('-').reverse().join('/') : "";

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${prod.orden}</strong></td>
      <td>${prod.factura}</td>
      <td>${prod.contenedor}</td>
      <td><strong>${prod.cantidad_ikd}</strong></td>
      <td>${prod.modelo}</td>
      <td>${prod.bl_no}</td>
      <td>${prod.buque}</td>
      <td>${fechaArgentina}</td> <!-- Acá ponemos la fecha ya dada vuelta -->
      <td>${prod.deposito}</td>
      <td>${prod.posicion}</td>
      <td style="text-align: center;">
        <button class="${claseGlobo}" title="${tituloTooltip}" onclick="abrirModalComentario(${index})">${icono}</button>
      </td>
      <td>
        <button class="btn-edit" onclick="prepararEdicion(${index})" title="Editar">✏️</button>
        <button style="background-color: #10b981; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-weight: 600; margin: 0 4px;" onclick="registrarEgreso(${index})" title="Restar Stock">📤</button>
        <button class="btn-delete" onclick="eliminarProducto(${index})" title="Eliminar">🗑️</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
  
  // Obliga a re-aplicar el filtro de búsqueda si había texto escrito. 
  filtrarTabla();
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
  // Guardamos el comentario viejo para no perderlo al editar
  const comentarioExistente = inventario[index].comentario || "";

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
    posicion: document.getElementById('edit-posicion').value,
    comentario: comentarioExistente
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


// ==========================================
// 6. FUNCIONES DE COMENTARIOS / NOTAS
// ==========================================

let indiceComentarioActual = -1;

function abrirModalComentario(index) {
  const prod = inventario[index];
  indiceComentarioActual = index;
  
  // Cambia el título para saber a qué orden pertenece
  document.getElementById('modal-titulo').innerText = "Nota - Orden: " + prod.orden;
  // Carga el comentario guardado o deja en blanco
  document.getElementById('texto-comentario').value = prod.comentario || ""; 
  
  // Muestra el modal
  document.getElementById('modal-comentario').style.display = 'flex';
}

function cerrarModalComentario() {
  document.getElementById('modal-comentario').style.display = 'none';
}

function guardarComentario() {
  const nuevoComentario = document.getElementById('texto-comentario').value;
  
  // Guardamos la nota en el producto y actualizamos el localStorage
  inventario[indiceComentarioActual].comentario = nuevoComentario;
  guardarEnLocalStorage();
  
  cerrarModalComentario();
  
  // Volvemos a renderizar la tabla para que cambie el ícono
  renderizarTabla(); 
}

// ==========================================
// 7. FUNCIONES DE EXCEL (IMPORTAR / EXPORTAR)
// ==========================================

// EXPORTAR: Convierte la tabla en un archivo .xlsx
function exportarExcel() {
  if (inventario.length === 0) {
    alert("El inventario está vacío. No hay nada para exportar.");
    return;
  }
  
  // Convertimos el array de inventario a formato de hoja de cálculo
  const hojaDeTrabajo = XLSX.utils.json_to_sheet(inventario);
  
  // Creamos un libro de Excel y le agregamos la hoja
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaDeTrabajo, "Stock Actual");
  
  // Descargamos el archivo
  XLSX.writeFile(libro, "Stock_Gilera.xlsx");
}

// IMPORTAR: Lee un archivo .xlsx y lo carga al sistema
function importarExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    // Leemos el archivo Excel
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Agarramos la primera pestaña (hoja) del Excel
    const nombrePrimeraHoja = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[nombrePrimeraHoja];
    
    // Lo convertimos a formato JSON para que Javascript lo entienda
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    if (excelData.length === 0) {
      alert("❌ El Excel parece estar vacío.");
      return;
    }

    // --- TRADUCTOR DE FECHAS DE EXCEL ---
    function arreglarFecha(valor) {
      if (!valor) return "";
      // Si Excel lo manda como número (ej. 45120)
      if (typeof valor === 'number') {
        // Fórmula para pasar de fecha Excel a fecha normal
        const fecha = new Date(Math.round((valor - 25569) * 86400 * 1000));
        // Ajustamos la zona horaria para que no se atrase un día
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
        
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`; // Formato exacto que necesita la web
      }
      // Si ya era un texto, lo deja como está
      return valor;
    }
    // ------------------------------------

    // Mapeamos los datos por si las columnas del Excel están en mayúsculas
    const nuevosRegistros = excelData.map(fila => ({
      orden: fila.orden || fila.Orden || "",
      factura: fila.factura || fila.Factura || "",
      contenedor: fila.contenedor || fila.Contenedor || "",
      cantidad_ikd: fila.cantidad_ikd || fila.Cantidad || fila['Cant. IKD'] || 0,
      modelo: fila.modelo || fila.Modelo || "",
      bl_no: fila.bl_no || fila['B/L NO.'] || fila.BL || "",
      buque: fila.buque || fila.Buque || "",
      
      // ACÁ APLICAMOS EL TRADUCTOR A LA FECHA:
      fecha_descarga: arreglarFecha(fila.fecha_descarga || fila['Fecha de Descarga'] || fila.Fecha || ""),
      
      deposito: fila.deposito || fila.Deposito || fila.Depósito || "",
      posicion: fila.posicion || fila.Posicion || fila.Posición || "",
      comentario: fila.comentario || fila.Notas || fila.Comentario || ""
    }));

    // Le preguntamos al usuario qué quiere hacer con los datos
    const reemplazar = confirm("📂 Excel detectado.\n\n¿Querés REEMPLAZAR todo el stock actual con este Excel?\n\n[Aceptar] = Borra lo viejo y deja solo lo del Excel\n[Cancelar] = Suma lo del Excel al stock que ya tenés cargado");
    
    if (reemplazar) {
      inventario = nuevosRegistros;
    } else {
      inventario = inventario.concat(nuevosRegistros);
    }

    guardarEnLocalStorage();
    renderizarTabla();
    
    document.getElementById('file-import').value = "";
    alert(`✅ ¡Éxito! Se cargaron ${nuevosRegistros.length} contenedores desde el Excel.`);
  };
  
  reader.readAsArrayBuffer(file);
}

// EXPORTAR HISTORIAL
function exportarExcelHistorial() {
  if (movimientos.length === 0) {
    alert("El historial está vacío. No hay nada para exportar.");
    return;
  }
  
  const hojaDeTrabajo = XLSX.utils.json_to_sheet(movimientos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaDeTrabajo, "Historial de Salidas");
  XLSX.writeFile(libro, "Historial_Gilera.xlsx");
}

// IMPORTAR HISTORIAL
function importarExcelHistorial(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    if (excelData.length === 0) {
      alert("❌ El Excel parece estar vacío.");
      return;
    }

    const nuevosMovimientos = excelData.map(fila => ({
      fecha: fila.fecha || fila.Fecha || "",
      modelo: fila.modelo || fila.Modelo || "",
      orden: fila.orden || fila.Orden || "",
      factura: fila.factura || fila.Factura || "",
      cantidad: fila.cantidad || fila.Cantidad || 0,
      destino: fila.destino || fila.Destino || ""
    }));

    const reemplazar = confirm("📂 Excel detectado.\n\n¿Querés REEMPLAZAR todo el historial con este Excel?\n\n[Aceptar] = Borra lo viejo y deja solo lo del Excel\n[Cancelar] = Suma lo del Excel al historial actual");
    
    if (reemplazar) {
      movimientos = nuevosMovimientos;
    } else {
      movimientos = movimientos.concat(nuevosMovimientos);
    }

    // Guardamos en la memoria del historial
    localStorage.setItem('deposito_gilera_movimientos', JSON.stringify(movimientos));
    renderizarHistorial();
    
    document.getElementById('file-import-historial').value = "";
    alert(`✅ ¡Éxito! Se cargaron ${nuevosMovimientos.length} movimientos desde el Excel.`);
  };
  
  reader.readAsArrayBuffer(file);
}
