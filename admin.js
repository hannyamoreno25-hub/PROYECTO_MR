// AQUI VA LA URL DE TU GOOGLE APPS SCRIPT
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxnIctK44qvwN5Txw3949jS5d5YOHzcXYShSCXE4VRNyKujfBlMXn1Ayj4mgs31oFSOXw/exec"; 

// 1. DICCIONARIO DE ZONAS Y SUCURSALES (Para el primer formulario)
const sucursalesPorZona = {
    "Zona C": ["IZK ROMA", "SR INSUGENTES", "SR PÑOLANCO","SR SANTA FE","IZK REFORMA","IZK MIRAMONTES","IZK MITIKA","SR PATIO","SR PLAZA INN"],
    "Zona D": ["SR AMERICAS","IZK TEPEYAC","SR CONDESA RESTAURANTE","SR CONDESA DELIVERY","IZK DEL VALLE","OFICINAS AT&LA","SR TLANEPANTLA","SR BUENAVISTA","IZK OCEANIA","SR COSMPOLI"],
    "Zona E": ["IZK COMISARIATO","MARIA GARNACHA","IZK INTERLOMAS","IZK ARCOS BOSQUES","IZK PEDEGRAL","IZK PALMAS","SR CUERNAVACA","IZK PUEBLA","IZK PACHUCA","IZK QUERETARO"],
    "Carpinterias": ["TODAS LAS SUCURSALES"],
    "Zona F": ["SR VILLA HERMOSA"," IZK AKROPOLIS MERIDA","IZK LA ISLA MERIDA","SR GALERIAS MERIDA"]
};

// 2. FUNCIÓN PARA LLENAR EL SELECT DE SUCURSALES SEGÚN LA ZONA
function filtrarSucursalesPorZona() {
    const zona = document.getElementById("asigZona").value;
    const selectUnidades = document.getElementById("asigUnidades");
    
    // Limpiar opciones actuales
    selectUnidades.innerHTML = '<option value="" disabled selected>Selecciona una sucursal...</option>';
    
    if (zona && sucursalesPorZona[zona]) {
        sucursalesPorZona[zona].forEach(sucursal => {
            const opcion = document.createElement("option");
            opcion.value = sucursal;
            opcion.textContent = sucursal;
            selectUnidades.appendChild(opcion);
        });
    }
}

// 3. GUARDAR ASIGNACIÓN TÉCNICA EN GOOGLE SHEETS
async function ejecutarAsignacion(e) {
    e.preventDefault();
    
    const zona = document.getElementById("asigZona").value;
    const tecnico = document.getElementById("asigTecnico").value.trim();
    const sucursal = document.getElementById("asigUnidades").value;

    if (!zona || !tecnico || !sucursal) {
        alert("Por favor, llena todos los campos de asignación.");
        return;
    }

    const payload = {
        action: "registrar_asignacion",
        zona: zona,
        tecnico: tecnico,
        sucursal: sucursal
    };

    try {
        const response = await fetch(URL_SCRIPT, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if(result.ok) {
            alert("¡Asignación guardada con éxito!");
            // Mostrar en la tablita temporalmente (lo ideal es que al recargar jale de Google Sheets)
            document.getElementById("listaAsignacionesSheet").innerHTML += `
                <tr>
                    <td>${zona}</td>
                    <td>${tecnico}</td>
                    <td>1</td>
                    <td>${sucursal}</td>
                    <td><span class="badge bg-success">Activo</span></td>
                </tr>
            `;
            // Limpiar campos
            document.getElementById("asigTecnico").value = "";
        } else {
            alert("Error al guardar: " + result.error);
        }
    } catch (error) {
        alert("Fallo de conexión.");
        console.error(error);
    }
}

// 4. DAR DE ALTA UN NUEVO USUARIO EN GOOGLE SHEETS (Pestaña "Usuarios")
async function ejecutarAltaUsuario() {
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();
    const nombre = document.getElementById("adminNombreCompleto").value.trim();
    const rol = document.getElementById("adminRol").value;
    const foto = document.getElementById("adminFotoURL").value.trim() || "N/A";
    const btnAlta = document.getElementById("btnAlta");

    if (!user || !pass || !nombre) {
        alert("Por favor llena Usuario, Contraseña y Nombre.");
        return;
    }

    btnAlta.disabled = true;
    btnAlta.innerText = "GUARDANDO...";

    const payload = {
        action: "registrar_usuario",
        usuario: user,
        password: pass,
        nombre: nombre,
        rol: rol,
        foto: foto
    };

    try {
        const response = await fetch(URL_SCRIPT, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.ok) {
            alert(`¡Usuario ${nombre} creado exitosamente! Ya puede iniciar sesión.`);
            
            // Agregar visualmente a la tabla del acordeón
            document.getElementById("listaUsuariosPersiana").innerHTML += `
                <tr>
                    <td><i class="bi bi-person-bounding-box fs-4"></i></td>
                    <td>${user}</td>
                    <td>${nombre}</td>
                    <td><span class="badge bg-dark">${rol}</span></td>
                    <td><span class="text-success fw-bold">Activo</span></td>
                </tr>
            `;
            
            // Limpiar formulario
            document.getElementById("adminUser").value = "";
            document.getElementById("adminPass").value = "";
            document.getElementById("adminNombreCompleto").value = "";
            document.getElementById("adminFotoURL").value = "";
        } else {
            alert("Error del servidor: " + result.error);
        }
    } catch (error) {
        alert("Error de conexión al guardar el usuario.");
        console.error(error);
    }
    
    btnAlta.disabled = false;
    btnAlta.innerText = "DAR DE ALTA EN GOOGLE SHEETS";
}

// 5. CERRAR SESIÓN
function cerrarSesion() {
    if (confirm("¿Seguro que deseas salir del panel de administrador?")) {
        localStorage.clear();
        window.location.href = "../loig/index.html"; 
    }
}