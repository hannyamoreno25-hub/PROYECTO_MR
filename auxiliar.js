// AQUI VA LA URL DE TU GOOGLE APPS SCRIPT
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbzD6TzxDFY71ilBDGfecAHp7mFM7fqr08tZ9ojyHfB92LYBaaMMIPpmxnjhkRtmjd5dRQ/exec"; 

let timerJornadaInterval, timerVisitaInterval;
let segundosJornada = 0, segundosVisita = 0;
let fotoJornadaB64 = "", fotoVisitaB64 = "";

// ==========================================
// 1. INICIALIZAR CÁMARAS Y DATOS AL CARGAR
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    // 1.1 Mostrar usuario
    const usuarioNombre = localStorage.getItem('usuario_nombre') || 'Auxiliar Desconocido';
    const nombreTags = ['userNameDisplay', 'userJornada', 'userVisita'];
    nombreTags.forEach(id => {
        if (document.getElementById(id)) document.getElementById(id).innerText = usuarioNombre;
    });

    // 1.2 Encender las cámaras
    try {
        const videoJornada = document.getElementById('videoJornada');
        const videoVisita = document.getElementById('videoVisita');

        if (videoJornada || videoVisita) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            if (videoJornada) {
                videoJornada.srcObject = stream;
                videoJornada.play();
            }
            if (videoVisita) {
                videoVisita.srcObject = stream;
                videoVisita.play();
            }
        }
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
    }
});

// ==========================================
// 2. LÓGICA DE FOTOS Y CÁMARA
// ==========================================
function tomarFoto(idVideo, idCanvas, idFoto) {
    const video = document.getElementById(idVideo);
    const canvas = document.getElementById(idCanvas);
    const foto = document.getElementById(idFoto);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); 
    foto.src = dataUrl;
    
    video.style.display = 'none'; 
    foto.style.display = 'block'; 

    return dataUrl;
}

// ==========================================
// 3. JORNADA
// ==========================================
function iniciarJornada() {
    fotoJornadaB64 = tomarFoto('videoJornada', 'canvasJornada', 'fotoJornada');
    
    document.getElementById('horaInicioJornada').innerText = new Date().toLocaleTimeString();
    document.getElementById('statusJornada').innerText = "EN JORNADA";
    document.getElementById('statusJornada').className = "badge bg-success";
    
    document.getElementById('btnIniJornada').disabled = true;
    document.getElementById('btnFinJornada').disabled = false;

    segundosJornada = 0;
    timerJornadaInterval = setInterval(() => {
        segundosJornada++;
        document.getElementById('timerJornada').innerText = formatearTiempo(segundosJornada);
    }, 1000);
}

async function finalizarJornada() {
    clearInterval(timerJornadaInterval);
    const horaFin = new Date().toLocaleTimeString();
    document.getElementById('horaFinJornada').innerText = horaFin;
    document.getElementById('statusJornada').innerText = "ENVIANDO DATOS...";
    document.getElementById('btnFinJornada').disabled = true;

    await enviarAGoogle({
        tipo: "Jornada",
        sucursal: "N/A",
        horaInicio: document.getElementById('horaInicioJornada').innerText,
        horaFin: horaFin,
        tiempo: document.getElementById('timerJornada').innerText,
        fotoB64: fotoJornadaB64.split(',')[1] 
    });

    document.getElementById('statusJornada').innerText = "FINALIZADA Y ENVIADA";
    document.getElementById('statusJornada').className = "badge bg-primary";
}

// ==========================================
// 4. VISITAS
// ==========================================
function iniciarVisita() {
    const selector = document.getElementById('sucursalSelect');
    if (!selector.value) return alert("Selecciona una sucursal primero.");

    fotoVisitaB64 = tomarFoto('videoVisita', 'canvasVisita', 'fotoVisita');
    
    document.getElementById('sucursalElegida').innerText = selector.value;
    document.getElementById('statusVisita').innerText = "VISITA EN CURSO";
    document.getElementById('statusVisita').className = "badge bg-success";
    
    selector.disabled = true;
    document.getElementById('btnIniVisita').disabled = true;
    document.getElementById('btnFinVisita').disabled = false;

    segundosVisita = 0;
    timerVisitaInterval = setInterval(() => {
        segundosVisita++;
        document.getElementById('timerVisita').innerText = formatearTiempo(segundosVisita);
    }, 1000);
}

async function finalizarVisita() {
    clearInterval(timerVisitaInterval);
    document.getElementById('statusVisita').innerText = "ENVIANDO DATOS...";
    document.getElementById('btnFinVisita').disabled = true;

    await enviarAGoogle({
        tipo: "Visita",
        sucursal: document.getElementById('sucursalElegida').innerText,
        horaInicio: "N/A",
        horaFin: new Date().toLocaleTimeString(),
        tiempo: document.getElementById('timerVisita').innerText,
        fotoB64: fotoVisitaB64.split(',')[1]
    });

    document.getElementById('statusVisita').innerText = "VISITA ENVIADA";
    document.getElementById('statusVisita').className = "badge bg-primary";
    document.getElementById('sucursalSelect').disabled = false;
}

// ==========================================
// 5. ENVÍO A GOOGLE SHEETS
// ==========================================
async function enviarAGoogle(datos) {
    const payload = {
        action: "registrar_actividad",
        usuario: localStorage.getItem('usuario_nombre') || 'Auxiliar Desconocido',
        fecha: new Date().toLocaleDateString(),
        ...datos
    };

    try {
        const response = await fetch(URL_SCRIPT, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if(!result.ok) {
            alert("Error de Google: " + result.error);
            console.error("Detalle del error:", result.error);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Fallo de conexión. Revisa la consola (F12).");
    }
}

// ==========================================
// 6. UTILIDADES GENERALES
// ==========================================
function formatearTiempo(total) {
    const hrs = Math.floor(total / 3600).toString().padStart(2, '0');
    const min = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const seg = (total % 60).toString().padStart(2, '0');
    return `${hrs}:${min}:${seg}`;
}

function borrarDatos(tipo) {
    if (confirm(`¿Borrar y reiniciar la vista de ${tipo}?`)) {
        location.reload(); 
    }
}

function cerrarSesion() {
    if (confirm("¿Cerrar sesión?")) {
        localStorage.removeItem('usuario_rol');
        localStorage.removeItem('usuario_nombre');
        window.location.href = "../index.html"; 
    }
}