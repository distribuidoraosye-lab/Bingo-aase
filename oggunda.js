/* ============================================================
   BINGO TEXIER - MÓDULO BINGO GRATIS (FRONTEND INDEPENDIENTE)
   Archivo: bingo_gratis_front.js
   Nuevos Nodos: config/bingo_gratis, bingo_aprobados_gratis
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Esperamos un poco a que la app principal cargue para no chocar
    setTimeout(initBingoGratis, 1000);
});

let adTimerInterval = null;
let currentAdTimeLeft = 0;

function initBingoGratis() {
    console.log("Inicializando Módulo Bingo Gratis...");

    // --- A. INYECCIÓN DEL BOTÓN EN EL MENÚ PRINCIPAL ---
    const gameSelector = document.getElementById('game-selector');
    if (gameSelector) {
        // Creamos el botón de Bingo Gratis
        const btnGratis = document.createElement('button');
        btnGratis.id = 'btn-bingo-gratis-menu';
        btnGratis.className = "w-full mb-4 bg-gradient-to-br from-green-500 to-emerald-700 text-white p-4 rounded-xl shadow-lg transform transition hover:scale-105 relative overflow-hidden border-b-4 border-green-800";
        btnGratis.onclick = () => switchModeGratis('bingo-gratis');
        btnGratis.innerHTML = `
            <span class="absolute top-0 right-0 bg-yellow-400 text-red-900 text-[10px] font-black px-3 py-1 rounded-bl-lg animate-pulse">JUEGA GRATIS</span>
            <div class="flex items-center justify-center gap-3">
                <i class="fas fa-gift text-4xl mb-1"></i>
                <div class="text-left">
                    <span class="font-black text-xl tracking-wide block leading-tight">BINGO GRATIS</span>
                    <span class="text-xs font-bold text-green-200">Ve un anuncio y gana cartones</span>
                </div>
            </div>
        `;
        
        // Insertamos el botón justo ANTES del grid donde están el Estelar y Torneo
        gameSelector.parentNode.insertBefore(btnGratis, gameSelector);

        // --- B. CONTROL REMOTO DEL TORNEO EXPRESS ---
        // El botón del torneo es el segundo dentro de game-selector
        const btnTorneo = gameSelector.children[1]; 
        
        if(btnTorneo) {
            btnTorneo.style.display = 'none'; // Oculto por defecto
            
            // Escuchamos el nuevo nodo para saber si el Admin activó el torneo
            db.ref('config/bingo_gratis/show_torneo').on('value', snap => {
                const showTorneo = snap.val();
                if(showTorneo === true) {
                    btnTorneo.style.display = 'block'; // Lo mostramos abajo
                } else {
                    btnTorneo.style.display = 'none';  // Lo mantenemos oculto
                }
            });
        }
    }

    // --- C. INYECCIÓN DE LA SECCIÓN DEL BINGO GRATIS EN EL HTML ---
    const containerWrapper = document.querySelector('.container-wrapper');
    if (containerWrapper) {
        const sectionGratis = document.createElement('div');
        sectionGratis.id = 'section-bingo-gratis';
        sectionGratis.className = 'hidden';
        sectionGratis.style.display = 'none';
        
        // Aquí construimos el panel "clon" del Estelar pero enfocado en anuncios
        sectionGratis.innerHTML = `
            <button onclick="location.reload()" class="mb-2 text-xs text-gray-500"><i class="fas fa-arrow-left"></i> Menú Principal</button>
            
            <div class="bg-gradient-to-r from-green-500 to-emerald-700 text-white font-black text-center p-3 rounded-xl mb-4 shadow-lg border-2 border-white ring-2 ring-green-300">
                <i class="fas fa-gift text-xl mr-2"></i>BINGO GRATIS - JUEGA SIN SALDO
            </div>

            <div id="misiones-gratis-area" class="p-4 bg-gray-100 rounded-xl shadow-inner border border-gray-300 mb-4 text-center">
                <h3 class="text-xl font-bold text-gray-700 mb-2">Gana Cartones Gratis</h3>
                <p class="text-xs text-gray-600 mb-4">Completa estas acciones para liberar tus cartones para el próximo sorteo gratuito.</p>
                
                <div id="lista-anuncios-activos" class="space-y-3">
                    <p class="text-sm text-gray-500 italic"><i class="fas fa-spinner fa-spin"></i> Buscando anuncios disponibles...</p>
                </div>
            </div>

            <div id="canje-carton-area" class="hidden p-4 bg-white rounded-xl shadow border-2 border-green-500 mb-4 text-center">
                <h3 class="font-bold text-green-700 mb-2"><i class="fas fa-ticket-alt"></i> Tienes Cartones Disponibles!</h3>
                <p class="text-xs text-gray-600 mb-3">Has completado los anuncios. Reclama tus números ahora.</p>
                <button onclick="iniciarSeleccionGratis()" class="w-full py-3 bg-green-500 text-white font-black rounded-lg shadow-lg hover:bg-green-600 transition animate-pulse">
                    ARMAR CARTÓN GRATIS
                </button>
            </div>
            
            <div id="chat-flow-gratis-area" class="hidden mb-4"></div>
        `;
        
        containerWrapper.appendChild(sectionGratis);
    }

    // --- D. INYECCIÓN DEL MODAL DE VIDEO ESTRICTO ---
    const modalHtml = `
        <div id="modal-anuncio-estricto" class="fixed inset-0 bg-black z-[9999] hidden flex-col">
            <div class="p-3 bg-gray-900 flex justify-between items-center text-white border-b border-gray-700">
                <span class="text-xs font-bold uppercase tracking-widest text-gray-400">Patrocinado</span>
                <button onclick="abandonarAnuncio()" class="text-red-500 hover:text-red-400 font-bold text-sm"><i class="fas fa-times mr-1"></i> Cerrar (Pierdes recompensa)</button>
            </div>
            <div id="video-container" class="flex-1 flex justify-center items-center bg-black relative">
                </div>
            <div class="p-4 bg-gray-900 border-t border-gray-700">
                <button id="btn-reclamar-recompensa" class="w-full bg-gray-600 text-gray-300 font-bold py-3 rounded-xl cursor-not-allowed transition flex justify-center items-center" disabled>
                    <i class="fas fa-lock mr-2"></i> ESPERA <span id="ad-timer-text" class="ml-1 mr-1">15</span> SEGUNDOS...
                </button>
            </div>
            
            <div id="trampa-alert" class="absolute inset-0 bg-red-600/90 hidden flex-col justify-center items-center text-white z-50">
                <i class="fas fa-exclamation-triangle text-5xl mb-4"></i>
                <h2 class="text-2xl font-black mb-2">¡VIDEO PAUSADO!</h2>
                <p class="text-center font-bold text-sm mb-4 px-6">Debes mantener esta pantalla abierta para ganar tu cartón.</p>
                <button onclick="document.getElementById('trampa-alert').style.display='none'" class="bg-white text-red-600 font-bold px-6 py-2 rounded-lg">ENTENDIDO</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // --- E. SISTEMA ANTI-TRAMPA (Visibility API) ---
    // Si el usuario cambia de pestaña, el video/temporizador se pausa obligatoriamente
    document.addEventListener("visibilitychange", () => {
        const modal = document.getElementById('modal-anuncio-estricto');
        if (modal && !modal.classList.contains('hidden')) {
            if (document.hidden) {
                // Salió de la pestaña -> Pausar tiempo y mostrar advertencia
                document.getElementById('trampa-alert').style.display = 'flex';
                // Aquí en el futuro pausaremos el iframe de youtube/tiktok mediante API
            }
        }
    });
}

// Función para navegar a esta nueva sección sin romper las demás
window.switchModeGratis = (mode) => {
    // Ocultamos las secciones originales
    const sections = ['section-bingo', 'section-animalitos', 'section-bingo-gratis'];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if(el) { el.classList.add('hidden'); el.style.display = 'none'; }
    });
    
    // Ocultamos selectores del menú
    const gs = document.getElementById('game-selector');
    if(gs) gs.classList.add('hidden');
    const bbg = document.getElementById('btn-bingo-gratis-menu');
    if(bbg) bbg.style.display = 'none';
    const btnL = document.getElementById('main-live-btn');
    if(btnL) btnL.style.display = 'block';

    // Mostramos la nuestra
    const target = document.getElementById('section-' + mode);
    if(target) { target.classList.remove('hidden'); target.style.display = 'block'; }
    
    // Iniciar escucha de anuncios activos desde Firebase
    cargarAnunciosDesdeFirebase();
};

// ==========================================
// MÁS FUNCIONES (Lógica de base de datos) IRÁN AQUÍ
// ==========================================
function cargarAnunciosDesdeFirebase() {
    // Esta función leerá los anuncios configurados en el nuevo Admin
    // Lo programaremos en el siguiente paso.
}

function abandonarAnuncio() {
    if(confirm("Si cierras el anuncio ahora, perderás el cartón gratis. ¿Estás seguro?")) {
        document.getElementById('modal-anuncio-estricto').classList.add('hidden');
        document.getElementById('modal-anuncio-estricto').style.display = 'none';
        // Resetear timers
    }
}
