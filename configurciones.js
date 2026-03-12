// En tu configuraciones.js
async function guardarConfiguracion(event) {
    if(event) event.preventDefault(); // Evita recargas
    
    const fileInput = document.getElementById('inputFoto');
    const btn = document.querySelector('.btn-formal-black');
    
    if (fileInput.files.length === 0) {
        alert("Por favor, selecciona una imagen primero.");
        return;
    }

    // Efecto visual de carga
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Subiendo...`;
    btn.disabled = true;

    // Simulación de red
    setTimeout(() => {
        alert("¡Perfil actualizado correctamente!");
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }, 2000);
}