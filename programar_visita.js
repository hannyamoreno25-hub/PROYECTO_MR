// Asegúrate de poner TU enlace correcto aquí
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxnIctK44qvwN5Txw3949jS5d5YOHzcXYShSCXE4VRNyKujfBlMXn1Ayj4mgs31oFSOXw/exec";

// Cargar datos al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    const usuarioNombre = localStorage.getItem('usuario_nombre') || 'Usuario Desconocido';
    document.getElementById('userNameDisplay').innerText = usuarioNombre;
    
    actualizarTablaVisitas();
});

// Función principal para agendar
async function agendarVisita(event) {
    event.preventDefault(); // Evita que la página se recargue

    const trabajador = document.getElementById('tipoTrabajador').value;
    const sucursal = document.getElementById('sucursalDestino').value;
    const fecha = document.getElementById('fechaVisita').value;
    const hora = document.getElementById('horaVisita').value;
    const btnGuardar = document.getElementById('btnGuardarVisita');
    const msg = document.getElementById('msgAgenda');

    btnGuardar.disabled = true;
    btnGuardar.innerText = "GUARDANDO...";
    msg.innerText = "";

    const nuevaVisita = {
        action: "agendar_visita", // Esto le dirá a Google qué hacer
        quienRegistra: localStorage.getItem('usuario_nombre') || 'Desconocido',
        trabajador: trabajador,
        sucursal: sucursal,
        fecha: fecha,
        hora: hora,
        estado: 'PENDIENTE'
    };

    try {
        // Enviar a Google Sheets
        const response = await fetch(URL_SCRIPT, {
            method: "POST",
            body: JSON.stringify(nuevaVisita)
        });
        const result = await response.json();

        if(result.ok) {
            msg.style.color = "green";
            msg.innerText = "¡Visita programada exitosamente en la nube!";
            
            // Guardar localmente para mostrar en la tabla rápido
            let visitasGuardadas = JSON.parse(localStorage.getItem('registroVisitas')) || [];
            visitasGuardadas.push(nuevaVisita);
            localStorage.setItem('registroVisitas', JSON.stringify(visitasGuardadas));
            
            document.getElementById('formAgenda').reset();
            actualizarTablaVisitas();
        } else {
            msg.style.color = "red";
            msg.innerText = "Error de Google: " + result.error;
        }
    } catch (error) {
        msg.style.color = "red";
        msg.innerText = "Error de conexión. Revisa tu internet.";
        console.error(error);
    }

    btnGuardar.disabled = false;
    btnGuardar.innerText = "GUARDAR EN AGENDA";
}

// Actualizar la tablita visual
function actualizarTablaVisitas() {
    const tablaBody = document.getElementById('tablaVisitasBody');
    let visitasGuardadas = JSON.parse(localStorage.getItem('registroVisitas')) || [];
    
    tablaBody.innerHTML = '';

    visitasGuardadas.forEach((visita) => {
        const fila = `
            <tr>
                <td>${visita.trabajador}</td>
                <td>${visita.sucursal}</td>
                <td>${visita.fecha}</td>
                <td>${visita.hora}</td>
                <td><span class="badge bg-warning text-dark">${visita.estado}</span></td>
            </tr>
        `;
        tablaBody.innerHTML += fila;
    });
}

function cerrarSesion() {
    if (confirm("¿Cerrar sesión?")) {
        localStorage.clear();
        window.location.href = "../loig/index.html"; 
    }
}