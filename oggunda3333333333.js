/* ============================================================
   BINGO TEXIER - FRONTEND BINGO GRATIS (EMBUDO COMPLETO)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(iniciarMotorGratis, 1500);
});

// Inyección de la API de YouTube si no existe
if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// --- VARIABLES GLOBALES DEL MÓDULO ---
let adsDisponibles = [];
let misionesCompletadas = {};
let creditosGratis = 0;
let seleccionCartonGratis = new Set();
let timerAnuncio = null;
let tiempoRestante = 0;
let anuncioActivo = null;
let ytAdPlayer = null;
let hostedVideoPlayer = null; // Variable para el reproductor de hosting externo

// Emojis en formato Unicode (regla de base de datos)
const ANIMALES_GRATIS = {
    1:{n:"Carnero",i:"\u{1F40F}"}, 2:{n:"Toro",i:"\u{1F402}"}, 3:{n:"Ciempi\u00E9s",i:"\u{1F41B}"}, 4:{n:"Alacr\u00E1n",i:"\u{1F982}"}, 5:{n:"Le\u00F3n",i:"\u{1F981}"},
    6:{n:"Rana",i:"\u{1F438}"}, 7:{n:"Perico",i:"\u{1F99C}"}, 8:{n:"Rat\u00F3n",i:"\u{1F401}"}, 9:{n:"\u00C1guila",i:"\u{1F985}"}, 10:{n:"Tigre",i:"\u{1F405}"},
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

    const containerWrapper = document.querySelector('.container-wrapper');
    if (containerWrapper && !document.getElementById('section-bingo-gratis')) {
        const sectionGratis = document.createElement('div');
        sectionGratis.id = 'section-bingo-gratis';
        sectionGratis.style.display = 'none';
        
        sectionGratis.innerHTML = `
            <button onclick="cerrarSeccionGratis()" class="mb-2 text-xs text-gray-500 font-bold"><i class="fas fa-arrow-left mr-1"></i> Men\u00FA Principal</button>
            
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
                <h3 class="font-black text-emerald-700 mb-1 text-lg">\u00A1Tienes <span id="contador-creditos-ui">0</span> Cartones Libres!</h3>
                <p class="text-xs text-gray-600 mb-3 font-bold">Selecciona tus n\u00FAmeros para el sorteo de hoy.</p>
                <button onclick="iniciarArmadoGratis()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse transition transform active:scale-95 text-lg">
                    <i class="fas fa-ticket-alt mr-2"></i> ARMAR CART\u00D3N AHORA
                </button>
            </div>

            <div id="area-armado-carton" class="hidden mt-3 p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-xl">
                <div class="bg-emerald-100 p-2 rounded-lg text-center mb-3">
                    <h4 class="font-black text-emerald-800 text-sm">CART\u00D3N GRATUITO</h4>
                    <p class="text-[10px] text-emerald-600 font-bold uppercase">Elige 15 Animales</p>
                </div>
                <div class="flex justify-between items-center mb-2 border-b pb-2">
                    <h4 class="font-bold text-gray-700">Tus N\u00FAmeros:</h4>
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

    if(!document.getElementById('modal-anuncio-estricto')) {
        const modalHtml = `
            <div id="modal-anuncio-estricto" class="fixed inset-0 bg-black z-[99999] hidden flex-col justify-between">
                <div class="p-3 bg-gray-900 flex justify-between items-center text-white border-b border-gray-700 z-50">
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400 px-2 py-1 rounded">Misi\u00F3n Patrocinada</span>
                    <button onclick="abandonarAnuncio()" class="text-red-400 hover:text-red-300 font-bold text-xs"><i class="fas fa-times mr-1"></i> Cerrar (Pierdes premio)</button>
                </div>
                
                <div class="flex-1 relative flex items-center justify-center bg-black/95 p-4 overflow-hidden">
                    <div id="contenedor-media-anuncio" class="w-full flex justify-center items-center relative h-full"></div>
                    
                    <div id="overlay-play-anuncio" class="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center hidden">
                        <button id="btn-forzar-play" class="bg-red-600 hover:bg-red-500 text-white font-black py-4 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse text-sm sm:text-lg tracking-widest uppercase flex items-center transition transform active:scale-95">
                            <i id="icono-forzar-play" class="fas fa-play mr-3 text-2xl"></i> <span id="txt-btn-forzar-play">DALE PLAY PARA INICIAR</span>
                        </button>
                        <p id="txt-pausa-advertencia" class="text-yellow-400 font-bold mt-4 text-sm hidden uppercase">Contador Pausado - Reproduce para continuar</p>
                    </div>
                </div>
                
                <div class="p-4 bg-gray-900 border-t border-gray-700 z-50">
                    <button id="btn-reclamar-anuncio" onclick="reclamarRecompensaAnuncio()" class="w-full bg-gray-700 text-gray-400 font-black py-4 rounded-xl cursor-not-allowed transition text-sm tracking-widest uppercase" disabled>
                        <i class="fas fa-lock mr-2"></i> ESPERA <span id="timer-anuncio-txt" class="mx-1 text-white">15</span> SEG...
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

function abrirSeccionGratis() {
    ['section-bingo', 'section-animalitos'].forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.classList.add('hidden'); el.style.display = 'none'; }
    });
    
    document.getElementById('racha-module-container')?.classList.add('hidden');
    document.getElementById('game-selector')?.classList.add('hidden');
    document.getElementById('main-live-btn')?.classList.add('hidden');

    const sec = document.getElementById('section-bingo-gratis');
    sec.classList.remove('hidden'); 
    sec.style.display = 'block';
}

function cerrarSeccionGratis() {
    location.reload(); 
}

function escucharControlTorneo() {
    db.ref('config/bingo_gratis/show_torneo').on('value', snap => {
        const mostrar = snap.val() || false;
        const botones = document.querySelectorAll('button[onclick="switchMode(\\\'animalitos\\\')"]');
        botones.forEach(btn => {
            if(btn.innerHTML.includes('TORNEOS')) btn.style.display = mostrar ? 'block' : 'none';
        });
    });
}

function escucharAnunciosYCreditos() {
    const uid = auth.currentUser.uid;

    db.ref(`users/${uid}/misiones_completadas`).on('value', snapC => {
        misionesCompletadas = snapC.val() || {};
        renderizarListaMisiones();
    });

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
        // Iconografía dinámica
        let icon = 'fa-play-circle text-blue-500';
        if(ad.type === 'tiktok') icon = 'fa-tiktok text-black';
        else if(ad.type === 'youtube' || ad.type === 'hosted_video') icon = 'fa-youtube text-red-600';
        else if(ad.type === 'whatsapp') icon = 'fa-whatsapp text-green-500';
        else if(ad.type === 'instagram') icon = 'fa-instagram text-pink-600 bg-clip-text';
        else if(ad.type === 'facebook') icon = 'fa-facebook text-blue-600';
        else if(ad.type === 'telegram') icon = 'fa-telegram text-blue-400';
        else if(ad.type === 'popup') icon = 'fa-external-link-alt text-purple-600';

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
                    <p class="text-[10px] text-green-600 font-black uppercase tracking-widest mt-0.5">+${ad.reward} CART\u00D3N GRATIS</p>
                </div>
            </div>
            ${btnHtml}
        `;
        container.appendChild(div);
    });
}

// --- LOGICA DE PARSEO Y REPRODUCTORES ESTRICTOS ---
function parseYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return match && match[1].length === 11 ? match[1] : null;
}

function parseTikTokId(url) {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
}

window.abrirAnuncio = (adId) => {
    anuncioActivo = adsDisponibles.find(a => a.id === adId);
    if(!anuncioActivo) return;

    tiempoRestante = anuncioActivo.timer || 15;
    
    const modal = document.getElementById('modal-anuncio-estricto');
    const container = document.getElementById('contenedor-media-anuncio');
    const btnReclamar = document.getElementById('btn-reclamar-anuncio');
    const overlayPlay = document.getElementById('overlay-play-anuncio');
    const btnForzarPlay = document.getElementById('btn-forzar-play');
    const txtPausa = document.getElementById('txt-pausa-advertencia');
    const iconoPlay = document.getElementById('icono-forzar-play');

    // Resetear Botón de Reclamo
    btnReclamar.disabled = true;
    btnReclamar.className = "w-full bg-gray-700 text-gray-400 font-black py-4 rounded-xl cursor-not-allowed transition text-sm tracking-widest uppercase";
    btnReclamar.innerHTML = `<i class="fas fa-lock mr-2"></i> ESPERA <span id="timer-anuncio-txt" class="mx-1 text-white">${tiempoRestante}</span> SEG...`;

    // Resetear Contenedor
    container.innerHTML = '';
    overlayPlay.classList.remove('hidden');
    txtPausa.classList.add('hidden');
    iconoPlay.className = "fas fa-play mr-3 text-2xl"; // Default icon
    
    // Limpieza de reproductores
    if(ytAdPlayer) { ytAdPlayer.destroy(); ytAdPlayer = null; }
    if(hostedVideoPlayer) { 
        hostedVideoPlayer.pause(); 
        hostedVideoPlayer.removeAttribute('src'); 
        hostedVideoPlayer.load(); 
        hostedVideoPlayer = null; 
    }

    const socialMissionTypes = ['popup', 'whatsapp', 'instagram', 'facebook', 'telegram'];

    if (anuncioActivo.type === 'youtube') {
        document.getElementById('txt-btn-forzar-play').innerText = "DALE PLAY AL VIDEO";
        const ytId = parseYouTubeId(anuncioActivo.media_url);
        
        container.innerHTML = `
            <div class="w-full max-w-3xl aspect-video bg-black shadow-2xl rounded-lg overflow-hidden relative">
                <div id="yt-player-container" class="w-full h-full pointer-events-none"></div>
            </div>`;
        
        btnForzarPlay.onclick = () => {
            if (ytAdPlayer && typeof ytAdPlayer.playVideo === 'function') {
                ytAdPlayer.playVideo();
            }
        };

        const intervalCheckYT = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(intervalCheckYT);
                ytAdPlayer = new YT.Player('yt-player-container', {
                    videoId: ytId,
                    playerVars: { 'autoplay': 0, 'controls': 0, 'rel': 0, 'modestbranding': 1, 'playsinline': 1, 'disablekb': 1 },
                    events: {
                        'onStateChange': (event) => {
                            if (event.data === YT.PlayerState.PLAYING) {
                                overlayPlay.classList.add('hidden');
                                iniciarTemporizadorAnuncio();
                            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                detenerTemporizadorAnuncio();
                                overlayPlay.classList.remove('hidden');
                                txtPausa.classList.remove('hidden');
                            }
                        }
                    }
                });
            }
        }, 300);

    } else if (anuncioActivo.type === 'tiktok') {
        overlayPlay.classList.add('hidden'); 
        const ttId = parseTikTokId(anuncioActivo.media_url);
        
        // Iframe nativo con la ALTURA OFICIAL (740px)
        container.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-start overflow-y-auto pt-4 pb-12">
                <p class="text-yellow-400 font-black mb-3 animate-pulse text-sm text-center uppercase drop-shadow-md">
                    \u25BC \u00A1DALE PLAY AL VIDEO DE TIKTOK ABAJO! \u25BC
                </p>
                <div class="w-full max-w-md bg-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    <iframe 
                        src="https://www.tiktok.com/embed/v2/${ttId}" 
                        style="width: 100%; height: 740px; display: block; border: none;" 
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture;" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
        
        iniciarTemporizadorAnuncio();

    } else if (anuncioActivo.type === 'hosted_video') {
        document.getElementById('txt-btn-forzar-play').innerText = "DALE PLAY AL VIDEO";
        
        // Contenedor ajustado a 9:16 vertical con etiqueta HTML5 nativa
        container.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-start overflow-y-auto pt-4 pb-12">
                <p class="text-yellow-400 font-black mb-3 animate-pulse text-sm text-center uppercase drop-shadow-md">
                    \u25BC \u00A1DALE PLAY AL VIDEO ABAJO! \u25BC
                </p>
                <div class="w-full max-w-sm aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] relative flex justify-center items-center">
                    <video id="html5-hosted-video" src="${anuncioActivo.media_url}" class="w-full h-full object-cover" playsinline preload="metadata" controlsList="nodownload noplaybackrate"></video>
                </div>
            </div>
        `;
        
        hostedVideoPlayer = document.getElementById('html5-hosted-video');
        
        btnForzarPlay.onclick = () => {
            if (hostedVideoPlayer) {
                hostedVideoPlayer.play().catch(e => console.log("Play error:", e));
                hostedVideoPlayer.controls = true; // Activa controles nativos tras la primera interacción
            }
        };

        hostedVideoPlayer.addEventListener('play', () => {
            overlayPlay.classList.add('hidden');
            iniciarTemporizadorAnuncio();
        });

        hostedVideoPlayer.addEventListener('pause', () => {
            detenerTemporizadorAnuncio();
            overlayPlay.classList.remove('hidden');
            txtPausa.classList.remove('hidden');
        });

        hostedVideoPlayer.addEventListener('ended', () => {
            detenerTemporizadorAnuncio();
            overlayPlay.classList.remove('hidden');
            txtPausa.classList.remove('hidden');
            document.getElementById('txt-btn-forzar-play').innerText = "REPETIR VIDEO";
        });

    } else if (socialMissionTypes.includes(anuncioActivo.type)) {
        let btnText = "ABRIR ENLACE Y EMPEZAR";
        if(anuncioActivo.type === 'whatsapp') { btnText = "IR A WHATSAPP"; iconoPlay.className = "fab fa-whatsapp mr-3 text-2xl"; }
        if(anuncioActivo.type === 'instagram') { btnText = "IR A INSTAGRAM"; iconoPlay.className = "fab fa-instagram mr-3 text-2xl"; }
        if(anuncioActivo.type === 'facebook') { btnText = "IR A FACEBOOK"; iconoPlay.className = "fab fa-facebook mr-3 text-2xl"; }
        if(anuncioActivo.type === 'telegram') { btnText = "IR A TELEGRAM"; iconoPlay.className = "fab fa-telegram mr-3 text-2xl"; }

        document.getElementById('txt-btn-forzar-play').innerText = btnText;
        
        let mediaHtml = anuncioActivo.media_url 
            ? `<img src="${anuncioActivo.media_url}" class="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl relative z-10 mb-4">` 
            : `<i class="${iconoPlay.className.replace('mr-3 text-2xl', 'text-8xl text-white mb-6 drop-shadow-lg')}"></i>`;

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center w-full h-full p-4">
                ${mediaHtml}
                <p class="text-gray-300 font-bold mb-4 text-sm px-4">Completa esta misi\u00F3n visitando el enlace proporcionado.</p>
            </div>
        `;
        
        btnForzarPlay.onclick = () => {
            window.open(anuncioActivo.target_link, '_blank', 'noopener,noreferrer');
            overlayPlay.classList.add('hidden');
            iniciarTemporizadorAnuncio();
        };
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
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
            btn.innerHTML = `<i class="fas fa-gift mr-2"></i> RECLAMAR CART\u00D3N`;
        }
    }, 1000);
}

function detenerTemporizadorAnuncio() {
    if(timerAnuncio) clearInterval(timerAnuncio);
}

window.reclamarRecompensaAnuncio = async () => {
    const btn = document.getElementById('btn-reclamar-anuncio');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';

    try {
        const uid = auth.currentUser.uid;
        const updates = {};
        updates[`users/${uid}/creditos_bingo_gratis`] = creditosGratis + anuncioActivo.reward;
        updates[`users/${uid}/misiones_completadas/${anuncioActivo.id}`] = true;
        
        await db.ref().update(updates);
        
        document.getElementById('modal-anuncio-estricto').classList.add('hidden');
        document.getElementById('modal-anuncio-estricto').style.display = 'none';
        
        // Limpieza
        if(ytAdPlayer) { ytAdPlayer.destroy(); ytAdPlayer = null; }
        if(hostedVideoPlayer) { hostedVideoPlayer.pause(); hostedVideoPlayer.removeAttribute('src'); hostedVideoPlayer.load(); hostedVideoPlayer = null; }
        document.getElementById('contenedor-media-anuncio').innerHTML = '';
        
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
    if(confirm("\u26A0\uFE0F Si cierras ahora perder\u00E1s el cart\u00F3n gratis. \u00BFSeguro?")) {
        detenerTemporizadorAnuncio();
        document.getElementById('modal-anuncio-estricto').classList.add('hidden');
        document.getElementById('modal-anuncio-estricto').style.display = 'none';
        
        // Limpieza
        if(ytAdPlayer) { ytAdPlayer.destroy(); ytAdPlayer = null; }
        if(hostedVideoPlayer) { hostedVideoPlayer.pause(); hostedVideoPlayer.removeAttribute('src'); hostedVideoPlayer.load(); hostedVideoPlayer = null; }
        document.getElementById('contenedor-media-anuncio').innerHTML = '';
    }
};

// --- ANTI TRAMPA INTELIGENTE ---
function configurarAntiTrampas() {
    document.addEventListener("visibilitychange", () => {
        const modal = document.getElementById('modal-anuncio-estricto');
        
        const socialMissionTypes = ['popup', 'whatsapp', 'instagram', 'facebook', 'telegram'];
        const esMisionSocial = anuncioActivo && socialMissionTypes.includes(anuncioActivo.type);

        if (modal && modal.style.display === 'flex' && document.hidden && !esMisionSocial) {
            detenerTemporizadorAnuncio();
            if (ytAdPlayer && typeof ytAdPlayer.pauseVideo === 'function') ytAdPlayer.pauseVideo();
            if (hostedVideoPlayer) hostedVideoPlayer.pause(); // Poner pausa automática al video si cambian de pestaña
            
            const overlayPlay = document.getElementById('overlay-play-anuncio');
            const txtPausa = document.getElementById('txt-pausa-advertencia');
            if(overlayPlay) overlayPlay.classList.remove('hidden');
            if(txtPausa) txtPausa.classList.remove('hidden');
        }
    });
}

// --- ÁREA DE SELECCIÓN DE CARTÓN ---
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
        
        const statusSnap = await db.ref('config/bingo_gratis/draw_status').once('value');
        const drawData = statusSnap.val();
        
        if(!drawData || drawData.status !== 'open') {
            throw new Error("El sorteo gratuito no est\u00E1 abierto en este momento.");
        }
        
        const fechaSorteo = drawData.date;
        const numerosArr = Array.from(seleccionCartonGratis).sort((a,b) => a - b);
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

        await db.ref(`users/${uid}/creditos_bingo_gratis`).transaction(c => {
            if ((c || 0) <= 0) return; 
            return c - 1;
        });

        await db.ref('bingo_aprobados_gratis').push({
            id: randomId,
            uid: uid,
            date: fechaSorteo,
            numbers: numerosArr,
            phone: auth.currentUser.phoneNumber || 'Sin Tlf',
            status: 'APROBADO',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '\u00A1Cart\u00F3n Registrado!',
                html: `Tu ID de cart\u00F3n es <b>#${randomId}</b><br><br>Ve a la Sala de Sorteos para ver tus cartones en juego.`,
                icon: 'success',
                confirmButtonColor: '#10b981',
                confirmButtonText: 'Entendido',
                allowOutsideClick: false
            }).then(() => {
                seleccionCartonGratis.clear();
                document.getElementById('area-armado-carton').classList.add('hidden');
                document.getElementById('area-canje-creditos').classList.remove('hidden');
                document.getElementById('misiones-gratis-area').classList.remove('hidden');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check mr-1"></i> LISTO';
            });
        } else {
            alert(`\u00A1Cart\u00F3n Registrado! ID: #${randomId}. Ve a la Sala de Sorteos para verlo en juego.`);
            seleccionCartonGratis.clear();
            document.getElementById('area-armado-carton').classList.add('hidden');
            document.getElementById('area-canje-creditos').classList.remove('hidden');
            document.getElementById('misiones-gratis-area').classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check mr-1"></i> LISTO';
        }

    } catch (error) {
        alert("Error al procesar: " + error.message);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-check mr-1"></i> REINTENTAR`;
    }
};
