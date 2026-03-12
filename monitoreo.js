// AQUI VA LA MISMA URL DE TU GOOGLE APPS SCRIPT
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbzD6TzxDFY71ilBDGfecAHp7mFM7fqr08tZ9ojyHfB92LYBaaMMIPpmxnjhkRtmjd5dRQ/exec";

document.addEventListener("DOMContentLoaded", () => {
    cargarMonitoreo();
});

async function cargarMonitoreo() {
    const galeria = document.getElementById("galeriaSucursales");

    try {
        // Usamos la misma acción que en asistencia porque nos trae toda la pestaña "Registros"
        const response = await fetch(URL_SCRIPT, {
            method: "POST",
            body: JSON.stringify({ action: "obtener_asistencia" })
        });
        const result = await response.json();

        if (result.ok) {
            renderizarGaleria(result.datos);
        } else {
            galeria.innerHTML = `<p class="text-danger w-100 text-center fw-bold">Error: ${result.error}</p>`;
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        galeria.innerHTML = `<p class="text-danger w-100 text-center fw-bold">Fallo de conexión al cargar las fotos.</p>`;
    }
}

function renderizarGaleria(registros) {
    const galeria = document.getElementById("galeriaSucursales");
    galeria.innerHTML = ""; // Limpiamos el letrero de "cargando"

    // Filtramos SOLO los que son "Visita" (porque la jornada no tiene sucursal asociada de la misma manera)
    // registros = [Fecha, Usuario, Tipo, Sucursal, Inicio, Fin, Tiempo, Foto]
    let visitas = registros.filter(reg => reg[2] === "Visita");

    // Invertimos el arreglo para que las visitas más nuevas salgan primero arriba
    visitas = visitas.reverse();

    if (visitas.length === 0) {
        galeria.innerHTML = `<p class="text-center w-100 text-muted mt-4">Aún no hay fotografías de visitas registradas.</p>`;
        return;
    }

    visitas.forEach(visita => {
        const fecha = visita[0];
        const usuario = visita[1];
        const sucursal = visita[3];
        const horaFin = visita[5]; // Hora en que terminó la visita
        const tiempo = visita[6]; // Cuánto duró
        const linkDrive = visita[7]; // El link original

        // Convertir el enlace de Drive a un enlace visible para la etiqueta <img>
        const linkImagenDirecta = convertirLinkDrive(linkDrive);

        const tarjetaHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm border-0 formal-style">
                    <div style="height: 200px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;">
                        <img src="${linkImagenDirecta}" class="card-img-top" alt="Evidencia ${sucursal}" 
                             style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;"
                             onerror="this.src='https://via.placeholder.com/400x200?text=Foto+no+disponible'">
                    </div>
                    
                    <div class="card-body">
                        <h5 class="card-title fw-bold" style="color: var(--negro);">${sucursal}</h5>
                        <hr>
                        <p class="card-text mb-1"><i class="bi bi-person-badge text-secondary me-2"></i><strong>Realizado por:</strong> ${usuario}</p>
                        <p class="card-text mb-1"><i class="bi bi-calendar-check text-secondary me-2"></i><strong>Fecha:</strong> ${fecha}</p>
                        <p class="card-text mb-1"><i class="bi bi-clock text-secondary me-2"></i><strong>Término:</strong> ${horaFin}</p>
                        <p class="card-text mb-3"><i class="bi bi-stopwatch text-secondary me-2"></i><strong>Duración:</strong> ${tiempo}</p>
                        
                        <a href="${linkDrive}" target="_blank" class="btn btn-formal-outline w-100 btn-sm">
                            <i class="bi bi-arrows-fullscreen me-1"></i> Ver en grande
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        galeria.innerHTML += tarjetaHTML;
    });
}

// Función auxiliar para forzar a Drive a mostrarnos la foto en la galería
function convertirLinkDrive(url) {
    if (!url) return "";
    // Extrae el ID del archivo del link clásico de Drive
    const match = url.match(/\/file\/d\/(.*?)\//);
    if (match && match[1]) {
        // Lo convierte en un enlace de visualización directa
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
}

function cerrarSesion() {
    if (confirm("¿Seguro que deseas salir del panel de administrador?")) {
        localStorage.clear();
        window.location.href = "../index.html"; 
    }
}