// 1. Configuración global
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbzD6TzxDFY71ilBDGfecAHp7mFM7fqr08tZ9ojyHfB92LYBaaMMIPpmxnjhkRtmjd5dRQ/exec";

async function login(event) {
    event.preventDefault(); // Evita que la página se recargue
    
    // 2. Captura de elementos (Corregidos los nombres de los ID)
    const loginForm = document.getElementById("loginForm");
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();
    const msgElement = document.getElementById("msg");
    const btn = document.querySelector(".btn");

    // 3. Validación inicial
    if (!usuario || !password) {
        msgElement.innerText = "Por favor, llena todos los campos.";
        msgElement.style.color = "#FF4B4B";
        return;
    }

    // 4. Feedback visual de carga
    msgElement.innerText = "Verificando credenciales...";
    msgElement.style.color = "#fff"; 
    btn.disabled = true;
    btn.innerText = "Cargando...";

    try {
        // 5. Petición al servidor (Google Apps Script)
        const response = await fetch(URL_SCRIPT, {
            method: "POST",
            body: JSON.stringify({ usuario: usuario, contraseña: password })
        });

        const data = await response.json();

        if (data.ok) {
            // ÉXITO: Usuario encontrado
            msgElement.style.color = "#00FF00";
            msgElement.innerText = "¡Bienvenido/a, " + data.nombre + "!";
            
            localStorage.setItem("usuario_rol", data.rol);
            localStorage.setItem("usuario_nombre", data.nombre);

            // 6. Redirección por roles
            setTimeout(() => {
                const rol = (data.rol || "").toUpperCase().trim(); 

                if (rol === "ADMINISTRADOR") {
                    window.location.href = "./administrador.html";
                } else if (rol === "TECNICO") {
                    window.location.href = "./tecnico.html";
                } else if (rol === "AUXILIAR") {
                    window.location.href = "./auxiliar.html";
                } else {
                    msgElement.innerText = "Error: Rol desconocido (" + rol + ")";
                    msgElement.style.color = "#FF4B4B";
                    btn.disabled = false;
                    btn.innerText = "Entrar";
                }
            }, 1500);

        } else {
            // ERROR: Credenciales incorrectas
            msgElement.innerText = data.mensaje || "Usuario o contraseña incorrectos.";
            msgElement.style.color = "#FF4B4B";
            btn.disabled = false;
            btn.innerText = "Entrar";
        }

    } catch (error) {
        // ERROR: Problema de conexión o servidor
        console.error("Error:", error);
        msgElement.innerText = "Error de conexión. Intenta de nuevo.";
        msgElement.style.color = "#FF4B4B";
        btn.disabled = false;
        btn.innerText = "Entrar";
    }
}

// ----------------------------------------------------
// LÓGICA PARA SUBIR IMAGEN Y PONERLA DE FONDO
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const bgUpload = document.getElementById("bgUpload");
    
    // Al cargar la página, revisa si hay un fondo guardado
    const savedBg = localStorage.getItem("customBackground");
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
    }

    // Evento cuando seleccionas una nueva imagen
    bgUpload.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                // Cambia el fondo
                document.body.style.backgroundImage = `url('${imageUrl}')`;
                // Guarda la imagen en localStorage para que no se borre al recargar
                localStorage.setItem("customBackground", imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });
});