/* ============================================================
   BINGO TEXIER - FRONTEND BINGO GRATIS (EMBUDO COMPLETO)
   Archivo: bingo_gratis_front.js
   Funciones: Inyección de UI, Control de Anuncios, Selección de Cartón
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(iniciarMotorGratis, 1500);
});

// --- VARIABLES GLOBALES DEL MÓDULO ---
let adsDisponibles = [];
let misionesCompletadas = {};
let creditosGratis = 0;
let seleccionCartonGratis = new Set();
let timerAnuncio = null;
let tiempoRestante = 0;
let anuncioActivo = null;

const ANIMALES_GRATIS = {
    1:{n:"Carnero",i:"\u{1F40F}"}, 2:{n:"Toro",i:"\u{1F402}"}, 3:{n:"Ciempiés",i:"\u{1F41B}"}, 4:{n:"Alacrán",i:"\u{1F982}"}, 5:{n:"León",i:"\u{1F981}"},
    6:{n:"Rana",i:"\u{1F438}"}, 7:{n:"Perico",i:"\u{1F99C}"}, 8:{n:"Ratón",i:"\u{1F401}"}, 9:{n:"Águila",i:"\u{1F985}"}, 10:{n:"Tigre",i:"\u{1F405}"},
    11:{n:"Gato",i:"\u{1F408}"}, 12:{n:"Caballo",i:"\u{1F40E}"}, 13:{n:"Mono",i:"\u{1F412}"}, 14:{n:"Paloma",i:"\u{1F54A}"}, 15:{n:"Zorro",i:"\u{1F98A}"},
    16:{n:"Oso",i:"\u{1F43B}"}, 17:{n:"Pavo",i:"\u{1F983}"}, 18:{n:"Burro",i:"\u{1F434}"}, 19:{n:"Chivo",i:"\u{1F410}"}, 20:{n:"Cochino",i:"\u{1F416}"},
    21:{n:"Gallo",i:"\u{1F413}"}, 22:{n:"Camello",i:"\u{1F42A}"}, 23:{n:"Cebra",i:"\u{1F993}"}, 24:{n:"Iguana",i:"\u{1F98E}"}, 25:{n:"Gallina",i:"\u{1F414}"}
};

function iniciarMotorGratis() {
    if (typeof firebase === 'undefined' || !auth.currentUser) {
        setTimeout(iniciarMotorGratis, 1000);
        return;
    }

    inyectarBotonesYVistas();
    escucharControlTorneo();
    escucharAnunciosYCreditos();
    configurarAntiTrampas();
}

function inyectarBotonesYVistas() {
    // 1. INYECTAR BOTÓN EN EL GRID PRINCIPAL (Mismo tamaño que Estelar)
    const gameSelector = document.getElementById('game-selector');
    if (gameSelector && !document.getElementById('btn-bingo-gratis-menu')) {
        const btnGratis = document.createElement('button');
        btnGratis.id = 'btn-bingo-gratis-menu';
        btnGratis.className = "bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4 rounded-xl shadow-lg transform transition hover:scale-105 relative overflow-hidden";
        btnGratis.onclick = () => abrirSeccionGratis();
        btnGratis.innerHTML = `
            <span class="absolute top-0 right-0 bg-yellow-400 text-red-900 text-[9px] font-black px-2 py-1 rounded-bl-lg animate-pulse">GRATIS</span>
            <i class="fas fa-gift text-3xl mb-2"></i><br><span class="font-bold">BINGO GRATIS</span>
        `;
        gameSelector.appendChild(btnGratis);
    }

    // 2. INYECTAR SECCIÓN COMPLETA DE BINGO GRATIS
    const containerWrapper = document.querySelector('.container-wrapper');
    if (containerWrapper && !document.getElementById('section-bingo-gratis')) {
        const sectionGratis = document.createElement('div');
        sectionGratis.id = 'section-bingo-gratis';
        sectionGratis.style.display = 'none';
        
        sectionGratis.innerHTML = `
            <button onclick="cerrarSeccionGratis()" class="mb-2 text-xs text-gray-500 font-bold"><i class="fas fa-arrow-left mr-1"></i> Menú Principal</button>
            
            <div class="bg-gradient-to-r from-emerald-500 to-green-700 text-white p-4 rounded-xl mb-4 shadow-lg text-center border-2 border-white ring-2 ring-emerald-300">
                <h2 class="text-2xl font-black uppercase tracking-widest mb-1">SORTEO GRATUITO</h2>
                <div class="bg-white/20 rounded-lg p-2 inline-block">
                    <p class="text-xs font-bold uppercase">Premios a Repartir:</p>
                    <p class="font-black text-lg text-yellow-300">1er Lugar: $100</p>
                    <p class="font-bold text-sm text-green-100">2do Lugar: $5</p>
                </div>
            </div>

            <div id="misiones-gratis-area" class="p-4 bg-gray-100 rounded-xl shadow-inner border border-gray-300 mb-4">
                <h3 class="text-lg font-black text-gray-700 mb-1 text-center"><i class="fas fa-play-circle text-red-500 mr-1"></i> Misiones Disponibles</h3>
                <p class="text-xs text-gray-500 mb-4 text-center font-bold">Cumple las misiones para liberar cartones.</p>
                <div id="lista-misiones-ui" class="space-y-3">
                    <p class="text-center text-xs text-gray-400 italic">Buscando misiones...</p>
                </div>
            </div>

            <div id="area-canje-creditos" class="hidden mb-4 p-4 bg-white rounded-xl shadow-lg border-2 border-emerald-500 text-center">
                <h3 class="font-black text-emerald-700 mb-1 text-lg">¡Tienes <span id="contador-creditos-ui">0</span> Cartones Libres!</h3>
                <p class="text-xs text-gray-600 mb-3 font-bold">Selecciona tus números para el sorteo de hoy.</p>
                <button onclick="iniciarArmadoGratis()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse transition transform active:scale-95 text-lg">
                    <i class="fas fa-ticket-alt mr-2"></i> ARMAR CARTÓN AHORA
                </button>
            </div>

            <div id="area-armado-carton" class="hidden mt-3 p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-xl">
                <div class="bg-emerald-100 p-2 rounded-lg text-center mb-3">
                    <h4 class="font-black text-emerald-800 text-sm">CARTÓN GRATUITO</h4>
                    <p class="text-[10px] text-emerald-600 font-bold uppercase">Elige 15 Animales</p>
                </div>
                <div class="flex justify-between items-center mb-2 border-b pb-2">
                    <h4 class="font-bold text-gray-700">Tus Números:</h4>
                    <span id="contador-seleccion-gratis" class="text-sm font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">0/15</span>
                </div>
                
                <div id="grid-seleccion-gratis" class="grid grid-cols-5 gap-1 mt-2"></div>
                
                <div class="flex gap-2 mt-4">
                    <button onclick="llenarAzarGratis()" class="flex-1 bg-purple-500 text-white font-bold py-3 rounded-lg text-xs shadow hover:bg-purple-600 transition"><i class="fas fa-random mr-1"></i> Al Azar</button>
                    <button id="btn-confirmar-gratis" onclick="guardarCartonGratuito()" class="flex-1 bg-green-500 text-white font-black py-3 rounded-lg text-xs shadow opacity-50 cursor-not-allowed transition" disabled><i class="fas fa-check mr-1"></i> LISTO</button>
                </div>
            </div>
        `;
        containerWrapper.appendChild(sectionGratis);
    }

    // 3. INYECTAR MODAL DEL ANUNCIO ESTRICTO
    if(!document.getElementById('modal-anuncio-estricto')) {
        const modalHtml = `
            <div id="modal-anuncio-estricto" class="fixed inset-0 bg-black z-[99999] hidden flex-col justify-between">
                <div class="p-3 bg-gray-900 flex justify-between items-center text-white border-b border-gray-700">
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400 px-2 py-1 rounded">Patrocinado</span>
                    <button onclick="abandonarAnuncio()" class="text-gray-400 hover:text-white font-bold text-xs"><i class="fas fa-times mr-1"></i> Cerrar (Pierdes premio)</button>
                </div>
                
                <div id="contenedor-media-anuncio" class="flex-1 flex justify-center items-center bg-black relative overflow-hidden w-full h-full">
                </div>
                
                <div class="p-4 bg-gray-900 border-t border-gray-700">
                    <button id="btn-reclamar-anuncio" onclick="reclamarRecompensaAnuncio()" class="w-full bg-gray-700 text-gray-400 font-black py-4 rounded-xl cursor-not-allowed transition text-sm tracking-widest uppercase" disabled>
                        <i class="fas fa-lock mr-2"></i> ESPERA <span id="timer-anuncio-txt" class="mx-1 text-white">15</span> SEG...
                    </button>
                </div>

                <div id="alerta-trampa-anuncio" class="absolute inset-0 bg-red-600/95 hidden flex-col justify-center items-center text-white z-50">
                    <i class="fas fa-exclamation-triangle text-6xl mb-4 animate-bounce"></i>
                    <h2 class="text-3xl font-black mb-2 uppercase text-center">\u00A1Video Pausado!</h2>
                    <p class="text-center font-bold text-sm mb-6 px-8">No puedes cambiar de pestaña ni minimizar la aplicación. Debes ver el anuncio completo para ganar el cartón.</p>
                    <button onclick="reanudarAnuncio()" class="bg-white text-red-700 font-black px-8 py-3 rounded-xl shadow-lg uppercase tracking-wide active:scale-95 transition">Entendido, continuar</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

// --- LOGICA DE NAVEGACION ---
function abrirSeccionGratis() {
    ['section-bingo', 'section-animalitos'].forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.classList.add('hidden'); el.style.display = 'none'; }
    });
    
    // Ocultar Game Selector principal
    const gs = document.getElementById('game-selector');
    if(gs) gs.classList.add('hidden');
    
    // Ocultar Módulo Racha (Subir sección)
    const racha = document.getElementById('racha-module-container');
    if(racha) racha.classList.add('hidden');

    const mainBtn = document.getElementById('main-live-btn');
    if(mainBtn) mainBtn.style.display = 'none';

    const sec = document.getElementById('section-bingo-gratis');
    sec.classList.remove('hidden'); 
    sec.style.display = 'block';
}

function cerrarSeccionGratis() {
    location.reload(); 
}

// --- OCULTAR TORNEO SEGÚN ADMIN ---
function escucharControlTorneo() {
    db.ref('config/bingo_gratis/show_torneo').on('value', snap => {
        const mostrar = snap.val() || false;
        const botones = document.querySelectorAll('button[onclick="switchMode(\\\'animalitos\\\')"]');
        botones.forEach(btn => {
            if(btn.innerHTML.includes('TORNEOS')) {
                btn.style.display = mostrar ? 'block' : 'none';
            }
        });
    });
}

// --- CONTROL DE ANUNCIOS Y CRÉDITOS ---
function escucharAnunciosYCreditos() {
    const uid = auth.currentUser.uid;

    // Escuchar misiones completadas
    db.ref(`users/${uid}/misiones_completadas`).on('value', snapC => {
        misionesCompletadas = snapC.val() || {};
        renderizarListaMisiones();
    });

    // Escuchar créditos
    db.ref(`users/${uid}/creditos_bingo_gratis`).on('value', snap => {
        creditosGratis = snap.val() || 0;
        const areaCanje = document.getElementById('area-canje-creditos');
        const contadorUi = document.getElementById('contador-creditos-ui');
        
        if(creditosGratis > 0) {
            areaCanje.classList.remove('hidden');
            contadorUi.textContent = creditosGratis;
        } else {
            areaCanje.classList.add('hidden');
            document.getElementById('area-armado-carton').classList.add('hidden');
        }
    });

    // Escuchar misiones disponibles
    db.ref('config/bingo_gratis/ads').on('value', snap => {
        adsDisponibles = [];
        if(snap.exists()) {
            snap.forEach(child => {
                const ad = child.val();
                if(ad.active) adsDisponibles.push({ id: child.key, ...ad });
            });
        }
        renderizarListaMisiones();
    });
}

function renderizarListaMisiones() {
    const container = document.getElementById('lista-misiones-ui');
    if (!container) return;
    container.innerHTML = '';

    if(adsDisponibles.length === 0) {
        container.innerHTML = '<p class="text-center text-xs text-gray-400 font-bold py-4">Misiones pausadas temporalmente.</p>';
        return;
    }

    adsDisponibles.forEach(ad => {
        let icon = 'fa-play-circle text-blue-500';
        if(ad.type === 'tiktok') icon = 'fa-tiktok text-black';
        if(ad.type === 'youtube') icon = 'fa-youtube text-red-600';
        if(ad.type === 'popup') icon = 'fa-image text-purple-600';

        const isCompleted = !!misionesCompletadas[ad.id];

        const div = document.createElement('div');
        div.className = `p-3 rounded-lg border shadow-sm flex justify-between items-center ${isCompleted ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-white border-emerald-200'}`;
        
        const btnHtml = isCompleted 
            ? `<button disabled class="bg-gray-400 text-white font-bold py-2 px-3 rounded-lg text-[10px] shadow-inner cursor-not-allowed"><i class="fas fa-check mr-1"></i> LISTO</button>`
            : `<button onclick="abrirAnuncio('${ad.id}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow transition active:scale-95">VER</button>`;

        div.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fab ${icon} text-2xl ${isCompleted ? 'grayscale opacity-50' : ''}"></i>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm leading-tight ${isCompleted ? 'line-through text-gray-500' : ''}">${ad.title}</h4>
                    <p class="text-[10px] text-green-600 font-black uppercase tracking-widest mt-0.5">+${ad.reward} CARTÓN GRATIS</p>
                </div>
            </div>
            ${btnHtml}
        `;
        container.appendChild(div);
    });
}

// --- REPRODUCTOR ESTRICTO DE ANUNCIOS ---
function formatearUrlEmbed(url, type) {
    if (!url) return "";
    let embedUrl = url;
    
    if (type === 'youtube' && !url.includes('embed')) {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&playsinline=1`;
    } else if (type === 'tiktok' && !url.includes('embed')) {
        const videoId = url.split('/video/')[1]?.split('?')[0];
        if (videoId) embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
    }
    return embedUrl;
}

window.abrirAnuncio = (adId) => {
    anuncioActivo = adsDisponibles.find(a => a.id === adId);
    if(!anuncioActivo) return;

    tiempoRestante = anuncioActivo.timer || 15;
    
    const modal = document.getElementById('modal-anuncio-estricto');
    const container = document.getElementById('contenedor-media-anuncio');
    const btn = document.getElementById('btn-reclamar-anuncio');

    // Resetear Botón
    btn.disabled = true;
    btn.className = "w-full bg-gray-700 text-gray-400 font-black py-4 rounded-xl cursor-not-allowed transition text-sm tracking-widest uppercase";
    btn.innerHTML = `<i class="fas fa-lock mr-2"></i> ESPERA <span id="timer-anuncio-txt" class="mx-1 text-white">${tiempoRestante}</span> SEG...`;

    // Inyectar Media con Iframe formateado
    container.innerHTML = '';
    if(anuncioActivo.type === 'popup') {
        container.innerHTML = `
            <div class="w-full h-full flex flex-col justify-center items-center relative">
                <img src="${anuncioActivo.media_url}" class="max-w-full max-h-[80vh] object-contain relative z-10">
                <div class="absolute inset-0 z-20 cursor-not-allowed"></div>
            </div>
        `;
    } else {
        const embedUrl = formatearUrlEmbed(anuncioActivo.media_url, anuncioActivo.type);
        container.innerHTML = `
            <iframe src="${embedUrl}" class="w-full h-full border-0 pointer-events-none" allow="autoplay; encrypted-media; fullscreen" playsinline allowfullscreen></iframe>
            <div class="absolute inset-0 z-20 cursor-not-allowed bg-transparent"></div>
        `;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    iniciarTemporizadorAnuncio();
};

function iniciarTemporizadorAnuncio() {
    if(timerAnuncio) clearInterval(timerAnuncio);
    
    timerAnuncio = setInterval(() => {
        tiempoRestante--;
        const txt = document.getElementById('timer-anuncio-txt');
        if(txt) txt.textContent = tiempoRestante;

        if(tiempoRestante <= 0) {
            clearInterval(timerAnuncio);
            const btn = document.getElementById('btn-reclamar-anuncio');
            btn.disabled = false;
            btn.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.8)] transition active:scale-95 text-lg tracking-widest uppercase animate-pulse";
            btn.innerHTML = `<i class="fas fa-gift mr-2"></i> RECLAMAR CARTÓN`;
        }
    }, 1000);
}

window.reclamarRecompensaAnuncio = async () => {
    const btn = document.getElementById('btn-reclamar-anuncio');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';

    try {
        const uid = auth.currentUser.uid;
        
        // Sumar créditos y marcar como completada
        const updates = {};
        const newCredits = creditosGratis + anuncioActivo.reward;
        updates[`users/${uid}/creditos_bingo_gratis`] = newCredits;
        updates[`users/${uid}/misiones_completadas/${anuncioActivo.id}`] = true;
        
        await db.ref().update(updates);
        
        document.getElementById('modal-anuncio-estricto').classList.add('hidden');
        document.getElementById('modal-anuncio-estricto').style.display = 'none';
        document.getElementById('contenedor-media-anuncio').innerHTML = '';
        
        // Scroll hacia el área de canje
        setTimeout(() => {
            document.getElementById('area-canje-creditos').scrollIntoView({ behavior: 'smooth' });
        }, 500);

    } catch (error) {
        alert("Error al reclamar recompensa: " + error.message);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-gift mr-2"></i> REINTENTAR`;
    }
};

window.abandonarAnuncio = () => {
    if(confirm("\u26A0\uFE0F Si cierras ahora perderás el cartón gratis. ¿Seguro?")) {
        clearInterval(timerAnuncio);
        document.getElementById('modal-anuncio-estricto').classList.add('hidden');
        document.getElementById('modal-anuncio-estricto').style.display = 'none';
        document.getElementById('contenedor-media-anuncio').innerHTML = '';
    }
};

// --- ANTI TRAMPA ---
function configurarAntiTrampas() {
    document.addEventListener("visibilitychange", () => {
        const modal = document.getElementById('modal-anuncio-estricto');
        if (modal && modal.style.display === 'flex' && document.hidden) {
            clearInterval(timerAnuncio);
            document.getElementById('alerta-trampa-anuncio').style.display = 'flex';
        }
    });
}

window.reanudarAnuncio = () => {
    document.getElementById('alerta-trampa-anuncio').style.display = 'none';
    if(tiempoRestante > 0) {
        iniciarTemporizadorAnuncio();
    }
};

// --- ÁREA DE SELECCIÓN DE CARTÓN (CLON ESTELAR) ---
window.iniciarArmadoGratis = () => {
    document.getElementById('misiones-gratis-area').classList.add('hidden');
    document.getElementById('area-canje-creditos').classList.add('hidden');
    
    const areaArmado = document.getElementById('area-armado-carton');
    areaArmado.classList.remove('hidden');
    
    seleccionCartonGratis.clear();
    renderizarGridAnimalesGratis();
};

function renderizarGridAnimalesGratis() {
    const grid = document.getElementById('grid-seleccion-gratis');
    grid.innerHTML = '';
    document.getElementById('contador-seleccion-gratis').textContent = `${seleccionCartonGratis.size}/15`;
    
    const btnConfirm = document.getElementById('btn-confirmar-gratis');
    btnConfirm.disabled = seleccionCartonGratis.size !== 15;
    if(seleccionCartonGratis.size === 15) {
        btnConfirm.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        btnConfirm.classList.add('opacity-50', 'cursor-not-allowed');
    }

    for (let i = 1; i <= 25; i++) {
        const a = ANIMALES_GRATIS[i];
        const btn = document.createElement('div');
        
        btn.className = `border-2 border-gray-200 bg-gray-50 rounded-lg py-2 flex flex-col items-center justify-center cursor-pointer transition ${seleccionCartonGratis.has(i) ? 'bg-emerald-500 border-emerald-600 text-white shadow-inner transform scale-95' : 'text-gray-700 hover:bg-gray-100'}`;
        btn.innerHTML = `<span class="text-2xl leading-none mb-1 emoji-font">${a.i}</span><span class="text-[10px] font-black">${i}</span>`;
        
        btn.onclick = () => {
            if (seleccionCartonGratis.has(i)) {
                seleccionCartonGratis.delete(i);
            } else if (seleccionCartonGratis.size < 15) {
                seleccionCartonGratis.add(i);
            }
            renderizarGridAnimalesGratis();
        };
        grid.appendChild(btn);
    }
}

window.llenarAzarGratis = () => {
    seleccionCartonGratis.clear();
    const arr = Array.from({length: 25}, (_, i) => i + 1);
    arr.sort(() => Math.random() - 0.5).slice(0, 15).forEach(n => seleccionCartonGratis.add(n));
    renderizarGridAnimalesGratis();
};

window.guardarCartonGratuito = async () => {
    if(seleccionCartonGratis.size !== 15) return;
    
    const btn = document.getElementById('btn-confirmar-gratis');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> REGISTRANDO...';

    try {
        const uid = auth.currentUser.uid;
        
        // Validar fecha del sorteo desde Firebase
        const statusSnap = await db.ref('config/bingo_gratis/draw_status').once('value');
        const drawData = statusSnap.val();
        
        if(!drawData || drawData.status !== 'open') {
            throw new Error("El sorteo gratuito no está abierto en este momento.");
        }
        
        const fechaSorteo = drawData.date;
        const numerosArr = Array.from(seleccionCartonGratis).sort((a,b) => a - b);
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

        // 1. Descontar 1 crédito
        await db.ref(`users/${uid}/creditos_bingo_gratis`).transaction(c => {
            if ((c || 0) <= 0) return; 
            return c - 1;
        });

        // 2. Guardar en el NODO INDEPENDIENTE
        await db.ref('bingo_aprobados_gratis').push({
            id: randomId,
            uid: uid,
            date: fechaSorteo,
            numbers: numerosArr,
            phone: auth.currentUser.phoneNumber || 'Sin Tlf',
            status: 'APROBADO',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        // 3. Modal de Elección (Igual a Estelar)
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '\u00A1Cart\u00F3n Registrado!',
                html: `Tu ID de cart\u00F3n es <b>#${randomId}</b><br><br>\u00BFQu\u00E9 deseas hacer ahora?`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#374151',
                confirmButtonText: 'Ir a la Sala en Vivo',
                cancelButtonText: 'Quedarme aqu\u00ED',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'sala_sorteo.html';
                } else {
                    window.location.reload();
                }
            });
        } else {
            // Fallback si SweetAlert no carga
            alert(`¡Cartón Registrado! ID: #${randomId}`);
            window.location.href = 'sala_sorteo.html';
        }

    } catch (error) {
        alert("Error al procesar: " + error.message);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-check mr-1"></i> REINTENTAR`;
    }
};
