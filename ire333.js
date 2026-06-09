// ============================================================================
// BINGO TEXIER - SISTEMA INTEGRAL DUAL (ESTELAR + GRATIS)
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- 1. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = { 
    apiKey: "AIzaSyBp_0_Er-3eUNhG1h5UUsX5oOWrAM4Zl2A", 
    authDomain: "bingo-nuevo.firebaseapp.com", 
    databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", 
    projectId: "bingo-nuevo", 
    storageBucket: "bingo-nuevo.firebasestorage.app", 
    messagingSenderId: "519445444132", 
    appId: "1:519445444132:web:1dd8327222a6472f654ab1" 
};
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app); 
const auth = getAuth(app);

const ANIMAL_MAP = { 1:{n:"Carnero",i:"\u{1F40F}"}, 2:{n:"Toro",i:"\u{1F402}"}, 3:{n:"Ciempi\u00E9s",i:"\u{1F41B}"}, 4:{n:"Alacr\u00E1n",i:"\u{1F982}"}, 5:{n:"Le\u00F3n",i:"\u{1F981}"}, 6:{n:"Rana",i:"\u{1F438}"}, 7:{n:"Perico",i:"\u{1F99C}"}, 8:{n:"Rat\u00F3n",i:"\u{1F401}"}, 9:{n:"\u00C1guila",i:"\u{1F985}"}, 10:{n:"Tigre",i:"\u{1F405}"}, 11:{n:"Gato",i:"\u{1F408}"}, 12:{n:"Caballo",i:"\u{1F40E}"}, 13:{n:"Mono",i:"\u{1F412}"}, 14:{n:"Paloma",i:"\u{1F54A}"}, 15:{n:"Zorro",i:"\u{1F98A}"}, 16:{n:"Oso",i:"\u{1F43B}"}, 17:{n:"Pavo",i:"\u{1F983}"}, 18:{n:"Burro",i:"\u{1F434}"}, 19:{n:"Chivo",i:"\u{1F410}"}, 20:{n:"Cochino",i:"\u{1F416}"}, 21:{n:"Gallo",i:"\u{1F413}"}, 22:{n:"Camello",i:"\u{1F42A}"}, 23:{n:"Cebra",i:"\u{1F993}"}, 24:{n:"Iguana",i:"\u{1F98E}"}, 25:{n:"Gallina",i:"\u{1F414}"} };
const audioBingo = new Audio("https://raw.githubusercontent.com/distribuidoraosye-lab/audiosbingo/refs/heads/main/Bingo.mp3");
const audioRonda1 = new Audio("https://raw.githubusercontent.com/distribuidoraosye-lab/audiosbingo/refs/heads/main/Ronda1.mp3");
const audioRonda2 = new Audio("https://raw.githubusercontent.com/distribuidoraosye-lab/audiosbingo/refs/heads/main/Ronda2.mp3");
const audioRonda3 = new Audio("https://raw.githubusercontent.com/distribuidoraosye-lab/audiosbingo/refs/heads/main/Ronda%203.mp3");

let player, currentUser=null, activeSoldCards=[], nextSoldCards=[], myActiveCards=[], myNextCards=[], videoEvents=[], currentNumbers=[], videoId="", usersMap={};
let isVoiceEnabled=true, viewMode='ACTIVE', lastWinnerSec=-1, lastResetSec=-1, progressInterval=null, globalMaxScore=0, lastDrawnNumber=-1;
let videoAlreadyWatched = false, isPlayingVideo = false, lastSorteoDateText = "Fecha anterior", globalSorteoTimestamp = 0;

let dataLoaded = { sorteoEstelar: false, sorteoGratis: false, aprobadosEstelar: false, aprobadosGratis: false };
let dataEstelar = null, dataGratis = null, aprobadosEstelar = {}, aprobadosGratis = {};
let currentDrawType = 'ESTELAR'; 
let nextDrawTarget = 'GRATIS';   

let countdownInterval = null;

// --- 2. EXPOSICIÓN DE FUNCIONES A WINDOW (Para el HTML) ---
window.startVideoPlayback = () => {
    isPlayingVideo = true;
    viewMode = 'ACTIVE'; 
    evaluateSystemState(); 
    if (isVoiceEnabled) {
        [audioBingo, audioRonda2, audioRonda3].forEach(a => {
            a.muted = true; let playPromise = a.play();
            if (playPromise !== undefined) playPromise.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(e => { a.muted = false; });
        });
        if(player && player.getCurrentTime && player.getCurrentTime() < 5) { audioRonda1.currentTime = 0; audioRonda1.play().catch(e=>{}); }
    }
    if(player && typeof player.playVideo === 'function') { 
        player.unMute(); player.playVideo(); 
        document.getElementById('start-overlay').classList.add('hidden'); 
        document.getElementById('custom-player-controls').classList.remove('hidden');
        startProgressLoop();
    }
};

window.backToWaiting = () => {
    isPlayingVideo = false;
    if(player && typeof player.pauseVideo === 'function') player.pauseVideo();
    evaluateSystemState();
    document.getElementById('start-overlay').classList.remove('hidden');
    document.getElementById('custom-player-controls').classList.add('hidden');
};

window.fullLogin = () => signInWithEmailAndPassword(auth, document.getElementById('login-phone').value.trim()+"@bingotexier.com", document.getElementById('login-pass').value).catch(()=>alert("Datos incorrectos"));
window.logout = () => signOut(auth).then(()=>location.reload());
window.toggleVoice = () => { 
    isVoiceEnabled = !isVoiceEnabled; const s = document.getElementById('voice-status'); 
    if(isVoiceEnabled) { s.textContent="ON"; s.className="text-green-400"; window.speechSynthesis.cancel(); } 
    else { s.textContent="OFF"; s.className="text-red-400"; window.speechSynthesis.cancel(); [audioBingo, audioRonda1, audioRonda2, audioRonda3].forEach(a => { a.pause(); a.currentTime=0; }); } 
};
window.togglePause = () => { if(!player) return; const s = player.getPlayerState(); const b = document.getElementById('btn-pause-toggle'); if(s===1) { player.pauseVideo(); b.innerHTML='<i class="fas fa-play"></i>'; } else { player.playVideo(); b.innerHTML='<i class="fas fa-pause"></i>'; } };
window.skipVideo = (s) => { if(!player) return; player.seekTo(player.getCurrentTime()+s, true); };
window.seekFromBar = (e) => { if(!videoAlreadyWatched || !player) return; const r=document.getElementById('progress-track').getBoundingClientRect(); player.seekTo(player.getDuration()*((e.clientX-r.left)/r.width), true); };
window.showFinalResults = () => { showWinnerModalLive(); }
window.closeModal = () => { document.getElementById('final-modal').classList.add('hidden'); document.getElementById('giant-bingo-overlay').classList.add('hidden'); };

document.addEventListener('DOMContentLoaded', () => {
    const blocker = document.querySelector('.video-blocker');
    if(blocker) blocker.addEventListener('click', () => window.togglePause());
});

// --- 3. LOGICA DE TIEMPOS Y RELOJ ---
function updateCountdown() {
    const now = new Date();
    const target = new Date(now);
    
    if (now.getHours() < 18) {
        target.setHours(18, 0, 0, 0);
        nextDrawTarget = 'GRATIS';
    } else if (now.getHours() < 21) {
        target.setHours(21, 0, 0, 0);
        nextDrawTarget = 'ESTELAR';
    } else {
        target.setDate(target.getDate() + 1);
        target.setHours(18, 0, 0, 0);
        nextDrawTarget = 'GRATIS';
    }
    
    let diff = target - now;
    if (diff < 0) diff = 0; // Prevenir negativos

    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    const elH = document.getElementById('cd-hours');
    const elM = document.getElementById('cd-mins');
    const elS = document.getElementById('cd-secs');
    if(elH) elH.textContent = String(h).padStart(2, '0');
    if(elM) elM.textContent = String(m).padStart(2, '0');
    if(elS) elS.textContent = String(s).padStart(2, '0');

    updateNextCards(); 
}

function startCountdown() {
    updateCountdown();
    if(countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
}

function stopCountdown() {
    if(countdownInterval) clearInterval(countdownInterval);
}

// --- 4. ACTUALIZADOR DINÁMICO DE PREMIOS ---
function updatePrizesUI() {
    const navTitle = document.getElementById('main-nav-title');
    const ticker = document.getElementById('ticker-content');
    const waitingBox = document.getElementById('waiting-prizes-list');

    if (currentDrawType === 'GRATIS') {
        if(navTitle) navTitle.innerHTML = 'BINGO <span class="text-green-400">GRATIS</span>';
        if(ticker) ticker.innerHTML = `
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-green-400 mx-4 font-black animate-pulse">BINGO GRATIS</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$100</span></span><span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-medal text-gray-300 mr-1"></i> 2do Lugar: <span class="text-green-400 font-black">$5</span></span>
            </div>
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-green-400 mx-4 font-black ml-10 animate-pulse">BINGO GRATIS</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$100</span></span><span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-medal text-gray-300 mr-1"></i> 2do Lugar: <span class="text-green-400 font-black">$5</span></span>
            </div>`;
        if (waitingBox) waitingBox.innerHTML = `
            <div class="flex justify-between items-center bg-gray-800/90 p-2 rounded border border-green-500/50 shadow-inner">
                <span class="text-gray-200"><i class="fas fa-trophy text-yellow-400 mr-2"></i>1er Lugar</span><span class="text-green-400 font-black text-lg drop-shadow-md">$100</span>
            </div>
            <div class="flex justify-between items-center bg-gray-800/90 p-2 rounded border border-gray-400/50 mt-1">
                <span class="text-gray-200"><i class="fas fa-medal text-gray-300 mr-2"></i>2do Lugar</span><span class="text-green-400 font-black text-base">$5</span>
            </div>`;
    } else {
        if(navTitle) navTitle.innerHTML = 'BINGO <span class="text-yellow-400">TEXIER</span>';
        if(ticker) ticker.innerHTML = `
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-yellow-500 mx-4 font-black animate-pulse">PREMIOS EN JUEGO</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$800</span></span><span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-medal text-gray-300 mr-1"></i> 2do Lugar: <span class="text-green-400 font-black">$100</span></span><span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-sad-tear text-red-400 mr-1"></i> Pavoso: <span class="text-green-400 font-black">$30</span></span>
            </div>
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-yellow-500 mx-4 font-black ml-10 animate-pulse">PREMIOS EN JUEGO</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$800</span></span><span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-medal text-gray-300 mr-1"></i> 2do Lugar: <span class="text-green-400 font-black">$100</span></span><span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-sad-tear text-red-400 mr-1"></i> Pavoso: <span class="text-green-400 font-black">$30</span></span>
            </div>`;
        if (waitingBox) waitingBox.innerHTML = `
            <div class="flex justify-between items-center bg-gray-800/90 p-2 rounded border border-green-500/50 shadow-inner">
                <span class="text-gray-200"><i class="fas fa-trophy text-yellow-400 mr-2"></i>1er Lugar</span><span class="text-green-400 font-black text-lg drop-shadow-md">$800</span>
            </div>
            <div class="flex justify-between items-center bg-gray-800/90 p-2 rounded border border-gray-400/50 mt-1">
                <span class="text-gray-200"><i class="fas fa-medal text-gray-300 mr-2"></i>2do Lugar</span><span class="text-green-400 font-black text-base">$100</span>
            </div>
            <div class="flex justify-between items-center bg-gray-800/90 p-2 rounded border border-red-500/40 mt-1">
                <span class="text-gray-200 uppercase text-[10px]"><i class="fas fa-sad-tear text-red-400 mr-2"></i>Pavoso</span><span class="text-red-400 font-black text-sm">$30</span>
            </div>`;
    }
}

// --- 5. EVALUADORES DE ESTADO DUAL ---
function evaluateActiveDraw() {
    if (!dataLoaded.sorteoEstelar || !dataLoaded.sorteoGratis || !dataLoaded.aprobadosEstelar || !dataLoaded.aprobadosGratis) return;
    
    let tsE = dataEstelar ? (dataEstelar.timestamp || 0) : 0;
    let tsG = dataGratis ? (dataGratis.timestamp || 0) : 0;
    let activeData = null;

    if (tsE === 0 && tsG === 0) {
        activeData = null;
    } else if (tsG > tsE) {
        currentDrawType = 'GRATIS';
        activeData = dataGratis;
    } else {
        currentDrawType = 'ESTELAR';
        activeData = dataEstelar;
    }

    updatePrizesUI();

    if (activeData) {
        globalSorteoTimestamp = activeData.timestamp || 0;
        lastSorteoDateText = formatCustomDate(activeData.timestamp);
        videoEvents = activeData.events || [];
        
        if (activeData.videoId !== videoId) {
            videoId = activeData.videoId;
            videoAlreadyWatched = localStorage.getItem('bingo_watched_' + videoId) === 'true';
            document.getElementById('no-draw-msg').classList.add('hidden'); 
            document.getElementById('youtube-player').classList.remove('hidden'); 
            if(!isPlayingVideo) document.getElementById('start-overlay').classList.remove('hidden');
            
            if(window.YT && window.YT.Player) {
                if (player && typeof player.loadVideoById === 'function') {
                    player.loadVideoById(videoId);
                } else {
                    initYouTubePlayer();
                }
            }
        } else if (player && typeof player.loadVideoById === 'function' && player.getVideoData) {
                let currentLoadedId = player.getVideoData().video_id;
                if(currentLoadedId !== videoId) {
                    player.loadVideoById(videoId);
                }
        }

        activeSoldCards = []; myActiveCards = [];
        
        // Blindaje extra: Si el panel de admin no guardó el snapshot, busca los cartones del día correspondiente
        if(activeData.cartones_snapshot) {
            Object.values(activeData.cartones_snapshot).forEach(c => { 
                if(c.numbers) { 
                    c.numbers = c.numbers.map(Number); 
                    c.drawType = currentDrawType; 
                    activeSoldCards.push(c); 
                    if(currentUser && c.uid === currentUser.uid) myActiveCards.push(c); 
                } 
            });
        } else {
            const d = new Date(globalSorteoTimestamp || Date.now());
            const activeDateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
            const sourceObj = currentDrawType === 'GRATIS' ? aprobadosGratis : aprobadosEstelar;
            
            Object.values(sourceObj).forEach(c => { 
                if(c.numbers && c.date === activeDateStr) { 
                    c.numbers = c.numbers.map(Number); 
                    c.drawType = currentDrawType; 
                    activeSoldCards.push(c); 
                    if(currentUser && c.uid === currentUser.uid) myActiveCards.push(c); 
                } 
            });
        }
        renderRanking();
    } else {
        videoId=""; activeSoldCards=[]; myActiveCards=[]; globalSorteoTimestamp=0; 
        if(player && player.stopVideo) player.stopVideo();
    }
    evaluateSystemState();
}

function updateNextCards() {
    if (!dataLoaded.aprobadosEstelar || !dataLoaded.aprobadosGratis) return;
    
    const d = new Date();
    if(d.getHours() >= 21) d.setDate(d.getDate() + 1); 
    const dateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;

    nextSoldCards=[]; myNextCards=[];
    
    // Carga COMBINADA para la sala de espera (Muestra ambos)
    Object.values(aprobadosEstelar).forEach(c => { 
        if(c.numbers && c.date === dateStr) { 
            c.numbers = c.numbers.map(Number); c.drawType = 'ESTELAR'; 
            nextSoldCards.push(c); if(currentUser && c.uid === currentUser.uid) myNextCards.push(c); 
        } 
    });
    
    Object.values(aprobadosGratis).forEach(c => { 
        if(c.numbers && c.date === dateStr) { 
            c.numbers = c.numbers.map(Number); c.drawType = 'GRATIS'; 
            nextSoldCards.push(c); if(currentUser && c.uid === currentUser.uid) myNextCards.push(c); 
        } 
    });

    evaluateSystemState();
}

// --- 6. ESTADO MAESTRO DE LA PANTALLA ---
function evaluateSystemState() {
    const isLoggedIn = currentUser && !currentUser.isAnonymous;
    
    const title = document.getElementById('video-overlay-title');
    const subtitle = document.getElementById('video-overlay-subtitle');
    const btnPlay = document.getElementById('btn-play-video');
    const iconContainer = document.getElementById('status-icon-container');
    const icon = document.getElementById('status-icon');
    const sectionTitle = document.getElementById('section-title');
    const startOverlay = document.getElementById('start-overlay');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const btnToggleCountdown = document.getElementById('btn-toggle-view-countdown');
    const liveBadge = document.getElementById('live-badge');
    const moscaContainer = document.getElementById('mosca-container');
    const prizesBox = document.getElementById('prizes-waiting-box');
    const btnToggle = document.getElementById('btn-toggle-view');

    if(moscaContainer) {
        if(isPlayingVideo) { moscaContainer.classList.remove('hidden'); } 
        else { moscaContainer.classList.add('hidden'); }
    }

    if (!isLoggedIn) {
        if(title) title.textContent = "INICIA SESI\u00D3N";
        if(subtitle) subtitle.innerHTML = '<span class="text-yellow-400 font-bold text-sm">Inicia sesi\u00F3n abajo para ver tus cartones.</span>';
        if(sectionTitle) sectionTitle.innerHTML = '<i class="fas fa-lock text-gray-500 mr-2"></i> TICKETS';
        if(btnPlay) btnPlay.classList.add('hidden');
        if (prizesBox) prizesBox.classList.add('hidden');
        if (btnToggle) btnToggle.classList.add('hidden');
        if(iconContainer) iconContainer.className = "w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center mb-3 shadow-lg";
        if(icon) icon.className = "fas fa-user-lock text-white text-xl";
        if(countdownOverlay) countdownOverlay.classList.add('hidden');
        stopCountdown();
        if(liveBadge) liveBadge.classList.add('hidden');
        if(startOverlay) startOverlay.classList.remove('hidden');
        if(player && typeof player.pauseVideo === 'function') player.pauseVideo();
        renderMyCards();
        renderRanking(); 
        return; 
    }

    if (!dataLoaded.sorteoEstelar || !dataLoaded.sorteoGratis || !dataLoaded.aprobadosEstelar || !dataLoaded.aprobadosGratis) return;

    let hasPendingFutureCards = myNextCards.some(nextCard => !myActiveCards.some(activeCard => activeCard.id === nextCard.id));
    let now = new Date();
    let cutoffTime = new Date();
    cutoffTime.setHours(13, 0, 0, 0); 
    let isOldDrawPastCutoff = (globalSorteoTimestamp > 0 && now > cutoffTime && new Date(globalSorteoTimestamp) < cutoffTime);

    let shouldDefaultToNext = (myActiveCards.length === 0) || (videoAlreadyWatched && hasPendingFutureCards) || isOldDrawPastCutoff;

    if (!isPlayingVideo) {
        if (shouldDefaultToNext) { viewMode = 'NEXT'; } else { viewMode = 'ACTIVE'; }
    }

    let name = getRealName(currentUser.uid, currentUser.email);

    if (viewMode === 'NEXT') {
        if(sectionTitle) sectionTitle.innerHTML = '<i class="fas fa-lock text-blue-400 mr-2"></i> TICKETS ASEGURADOS';
        if (prizesBox) prizesBox.classList.remove('hidden');
        if (btnToggle) btnToggle.classList.add('hidden');

        if(startOverlay) startOverlay.classList.add('hidden'); 
        if(countdownOverlay) countdownOverlay.classList.remove('hidden'); 
        if(liveBadge) liveBadge.classList.add('hidden');
        startCountdown();

        if (videoId && btnToggleCountdown) {
            btnToggleCountdown.classList.remove('hidden');
            let timePassed = Date.now() - globalSorteoTimestamp;
            let isLive = (timePassed < 30 * 60 * 1000); 
            let btnText = isLive ? "Ver sorteo en curso" : `Ver \u00FAltimo sorteo (<span class="text-yellow-200">${lastSorteoDateText}</span>)`;
            btnToggleCountdown.innerHTML = `<i class="fas fa-history"></i> ${btnText}`;
            btnToggleCountdown.className = "mt-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold py-1 px-4 rounded-full border border-gray-600 text-[8px] transition active:scale-95 uppercase flex items-center justify-center gap-1.5 shadow-lg";
        }
    } else {
        if(title) title.textContent = `\u00A1HOLA, ${name.toUpperCase()}!`;
        if(subtitle) subtitle.textContent = "EL SORTEO EST\u00C1 LISTO O EN VIVO";
        if(sectionTitle) sectionTitle.innerHTML = '<i class="fas fa-play-circle text-red-500 mr-1"></i> TICKETS EN JUEGO';
        
        if(btnPlay) btnPlay.classList.remove('hidden');
        if (prizesBox) prizesBox.classList.add('hidden');
        if(countdownOverlay) countdownOverlay.classList.add('hidden');
        stopCountdown();

        if (shouldDefaultToNext && isPlayingVideo) {
            if (btnToggle) {
                btnToggle.classList.remove('hidden');
                btnToggle.innerHTML = `<i class="fas fa-undo text-lg"></i> SALIR DEL VIDEO`;
                btnToggle.className = "w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-50 hover:to-teal-500 text-white font-black py-3 px-6 rounded-xl shadow border border-emerald-400/50 text-xs transition active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2";
            }
        } else {
            if (btnToggle) btnToggle.classList.add('hidden');
        }
        
        if(iconContainer) iconContainer.className = "w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-red-600/50 animate-pulse";
        if(icon) icon.className = "fas fa-play text-white text-lg sm:text-xl ml-1";
        
        if (videoAlreadyWatched) {
            if(document.getElementById('btn-play-text')) document.getElementById('btn-play-text').textContent = "VER REPETICI\u00D3N";
            if(document.getElementById('btn-view-results')) document.getElementById('btn-view-results').classList.remove('hidden');
            if(document.getElementById('playback-buttons')) document.getElementById('playback-buttons').classList.remove('opacity-50', 'pointer-events-none');
            if(document.getElementById('progress-track')) document.getElementById('progress-track').classList.add('interactive');
        } else {
            if(document.getElementById('btn-play-text')) document.getElementById('btn-play-text').textContent = "VER TRANSMISI\u00D3N";
            if(document.getElementById('btn-view-results')) document.getElementById('btn-view-results').classList.add('hidden');
        }

        if (isPlayingVideo) {
            if(startOverlay) startOverlay.classList.add('hidden');
            let durationMs = (player && typeof player.getDuration === 'function') ? player.getDuration() * 1000 : 0;
            let timePassed = Date.now() - globalSorteoTimestamp;
            let isLiveNow = false;
            
            if (durationMs > 0) { isLiveNow = timePassed < durationMs; } 
            else { isLiveNow = timePassed < (30 * 60 * 1000); }

            if (isLiveNow) { if(liveBadge) liveBadge.classList.remove('hidden'); } 
            else { if(liveBadge) liveBadge.classList.add('hidden'); }
        } else {
            if(startOverlay) startOverlay.classList.remove('hidden');
            if(liveBadge) liveBadge.classList.add('hidden');
        }
    }
    
    renderMyCards();
    renderRanking(); 
}

// --- 7. ESCUCHA DE DATOS (FIREBASE READERS) ---
function initData() {
    ['usuarios','users'].forEach(p => onValue(ref(db, p), s => { 
        if(s.exists()) { usersMap={...usersMap, ...s.val()}; renderRanking(); if(currentUser) evaluateSystemState(); } 
    }));
    
    onValue(ref(db, 'sorteo_en_juego'), s => { dataLoaded.sorteoEstelar = true; dataEstelar = s.val() || null; evaluateActiveDraw(); });
    onValue(ref(db, 'sorteo_en_juego_gratis'), s => { dataLoaded.sorteoGratis = true; dataGratis = s.val() || null; evaluateActiveDraw(); });
    
    // IMPORTANTE: Corrección de la base de datos "bingo_aprobados" para el Estelar
    onValue(ref(db, 'bingo_aprobados'), s => { dataLoaded.aprobadosEstelar = true; aprobadosEstelar = s.val() || {}; updateNextCards(); });
    onValue(ref(db, 'bingo_aprobados_gratis'), s => { dataLoaded.aprobadosGratis = true; aprobadosGratis = s.val() || {}; updateNextCards(); });
}

onAuthStateChanged(auth, (u) => {
    const vipTicker = document.getElementById('vip-ticker');
    const rankingSection = document.getElementById('ranking-section');

    if (u && !u.isAnonymous) { 
        currentUser=u; 
        document.getElementById('login-card').classList.add('hidden'); 
        document.getElementById('my-cards-area').classList.remove('hidden'); 
        document.getElementById('user-nav-info').classList.remove('hidden'); 
        if (vipTicker) vipTicker.classList.remove('hidden');
        if (rankingSection) rankingSection.classList.remove('hidden');
    } else { 
        if(!u) signInAnonymously(auth); 
        currentUser = null;
        document.getElementById('login-card').classList.remove('hidden'); 
        document.getElementById('my-cards-area').classList.add('hidden'); 
        if (vipTicker) vipTicker.classList.add('hidden');
        if (rankingSection) rankingSection.classList.add('hidden');
    }
    evaluateSystemState(); 
    initData();
});

// --- YOUTUBE API & TIMELINES ---
window.onYouTubeIframeAPIReady = () => { if(videoId) initYouTubePlayer(); };
function initYouTubePlayer() {
    if(!videoId) return;
    if(player && player.loadVideoById) { player.loadVideoById(videoId); return; }
    if(typeof YT === 'undefined' || typeof YT.Player === 'undefined') { setTimeout(initYouTubePlayer, 50); return; }
    player = new YT.Player('youtube-player', { height:'100%', width:'100%', videoId:videoId, playerVars:{'playsinline':1,'controls':0,'disablekb':1,'rel':0,'modestbranding':1, 'fs': 0, 'iv_load_policy': 3}, events:{ 'onReady':()=>{}, 'onStateChange': onPlayerStateChange }});
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
        localStorage.setItem('bingo_watched_' + videoId, 'true');
        videoAlreadyWatched = true;
        evaluateSystemState();
        showFinalResults();
        if(document.getElementById('btn-pause-toggle')) document.getElementById('btn-pause-toggle').innerHTML = '<i class="fas fa-play"></i>';
    }
}

function startProgressLoop() {
    if(progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if(player && player.getCurrentTime) {
            const cur = player.getCurrentTime(); const dur = player.getDuration();
            if(dur > 0 && document.getElementById('progress-fill')) document.getElementById('progress-fill').style.width = ((cur/dur)*100) + "%";
            if (isPlayingVideo && globalSorteoTimestamp > 0 && dur > 0) {
                if (Date.now() - globalSorteoTimestamp >= dur * 1000) { if(document.getElementById('live-badge')) document.getElementById('live-badge').classList.add('hidden'); }
            }
            checkTimeline(cur);
        }
    }, 300); 
}

function checkTimeline(sec) {
    const resets = videoEvents.filter(e => e.type === 'RESET' && e.sec <= sec);
    const currentReset = resets.length > 0 ? resets[resets.length - 1] : null;
    
    if (currentReset && currentReset.sec !== lastResetSec) {
        lastResetSec = currentReset.sec; currentNumbers = []; lastWinnerSec = -1; lastDrawnNumber = -1;
        const mosca = document.getElementById('mosca-animalito');
        if(mosca) mosca.classList.remove('show');
        const hst = document.getElementById('mosca-history');
        if(hst) hst.innerHTML = '';
        
        if (isVoiceEnabled && !videoAlreadyWatched) {
            let roundNum = resets.length + 1;
            if (roundNum === 2) { audioRonda2.currentTime = 0; audioRonda2.play().catch(e=>{}); } 
            else if (roundNum >= 3) { audioRonda3.currentTime = 0; audioRonda3.play().catch(e=>{}); }
        }
        
        const ol = document.getElementById('round-overlay'); if(ol) ol.classList.remove('hidden'); setTimeout(() => { if(ol) ol.classList.add('hidden'); }, 3000);
    }
    
    const effectiveStart = currentReset ? currentReset.sec : 0;
    const winnerEvent = videoEvents.find(e => e.type === 'WINNER' && e.sec <= sec && e.sec > effectiveStart);
    if (winnerEvent && winnerEvent.sec !== lastWinnerSec) { lastWinnerSec = winnerEvent.sec; showWinnerModalLive(); }

    const validNums = videoEvents.filter(e => e.type !== 'WINNER' && e.type !== 'RESET' && e.sec <= sec && e.sec > effectiveStart && e.num).map(e => Number(e.num));
    
    if (JSON.stringify(validNums) !== JSON.stringify(currentNumbers)) {
        const isNewNumber = validNums.length > currentNumbers.length;
        currentNumbers = validNums;
        
        if(isNewNumber) {
            lastDrawnNumber = validNums[validNums.length - 1]; 
            const info = ANIMAL_MAP[lastDrawnNumber] || {n: "Desconocido", i: "\u2753"};
            updateMosca(lastDrawnNumber);
            updateMoscaHistory();

            if(info.n !== "Desconocido" && isVoiceEnabled && !videoAlreadyWatched) { 
                window.speechSynthesis.cancel(); 
                const u = new SpeechSynthesisUtterance(`${lastDrawnNumber}... ${info.n}`); 
                u.lang='es-ES'; u.rate=1.1; 
                window.speechSynthesis.speak(u); 
            }
            checkRachaSequence(lastDrawnNumber); 
        }
        renderRanking(); 
        renderMyCards(); 
    }
}

function updateMosca(num) {
    const info = ANIMAL_MAP[num] || {n: "Desconocido", i: "\u2753"};
    const mosca = document.getElementById('mosca-animalito');
    if(document.getElementById('mosca-icon')) document.getElementById('mosca-icon').textContent = info.i;
    if(document.getElementById('mosca-num')) document.getElementById('mosca-num').textContent = num;
    if(mosca) mosca.classList.remove('show');
    setTimeout(() => { if(mosca) mosca.classList.add('show'); }, 50);

    if (!videoAlreadyWatched) {
        let userHit = false;
        myActiveCards.forEach(c => { if (c.numbers.includes(num)) userHit = true; });
        if (userHit) { if (navigator.vibrate) navigator.vibrate(200); }
    }
}

function updateMoscaHistory() {
    const historyContainer = document.getElementById('mosca-history');
    if (!historyContainer) return;
    if (currentNumbers.length <= 1) { historyContainer.innerHTML = ''; return; }
    
    const prevNumbers = currentNumbers.slice(-5, -1).reverse();
    let html = '<div class="text-[7px] text-yellow-400 font-black uppercase tracking-widest mt-0.5 text-right bg-black/60 px-1 rounded drop-shadow-md">\u00DAltimos</div>';
    html += prevNumbers.map(n => {
        const a = ANIMAL_MAP[n] || {i: "\u2753"};
        return `<div class="flex items-center gap-1.5 bg-black/80 rounded px-1.5 py-0.5 border border-gray-600/50 shadow"><span class="text-sm drop-shadow">${a.i}</span><span class="text-white font-bold text-[9px]">${n}</span></div>`;
    }).join('');
    historyContainer.innerHTML = html;
}

function checkRachaSequence(newNum) {
    if (currentNumbers.length <= 1) return; 
    const prevNum = currentNumbers[currentNumbers.length - 2]; 
    let rachaFound = false;
    myActiveCards.forEach(c => {
        if (c.numbers.includes(Number(newNum)) && c.numbers.includes(Number(prevNum))) rachaFound = true;
    });

    if (rachaFound) {
        if (navigator.vibrate) navigator.vibrate(200); 
        if (!videoAlreadyWatched) {
            const cardArea = document.getElementById('my-cards-area');
            if (cardArea) {
                const overlay = document.createElement('div'); overlay.className = 'racha-overlay';
                overlay.innerHTML = '<div class="racha-badge"><i class="fas fa-fire text-yellow-300"></i> &#x00A1;RACHA!</div>';
                cardArea.appendChild(overlay); setTimeout(() => overlay.remove(), 2500);
            }
        }
    }
}

function showWinnerModalLive() {
    if (isVoiceEnabled) { window.speechSynthesis.cancel(); audioBingo.currentTime = 0; audioBingo.play().catch(e=>{}); }
    if(document.getElementById('giant-bingo-overlay')) document.getElementById('giant-bingo-overlay').classList.remove('hidden');

    const listContainer = document.getElementById('winners-list');
    let prizesHTML = '';
    
    if (currentDrawType === 'ESTELAR') {
        prizesHTML = `
            <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded border border-yellow-500/50 shadow-inner">
                <span class="text-gray-200"><i class="fas fa-trophy text-yellow-400 mr-2"></i>1er Lugar</span><span class="text-green-400 font-black text-xl drop-shadow-md">$800</span>
            </div>
            <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded border border-gray-400/50 mt-2">
                <span class="text-gray-200"><i class="fas fa-medal text-gray-300 mr-2"></i>2do Lugar</span><span class="text-green-400 font-black text-lg">$100</span>
            </div>
            <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded border border-red-500/40 mt-2">
                <span class="text-gray-200 uppercase text-xs"><i class="fas fa-sad-tear text-red-400 mr-2"></i>Pavoso</span><span class="text-red-400 font-black text-base">$30</span>
            </div>`;
    } else {
        prizesHTML = `
            <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded border border-yellow-500/50 shadow-inner">
                <span class="text-gray-200"><i class="fas fa-trophy text-yellow-400 mr-2"></i>1er Lugar</span><span class="text-green-400 font-black text-xl drop-shadow-md">$100</span>
            </div>
            <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded border border-gray-400/50 mt-2">
                <span class="text-gray-200"><i class="fas fa-medal text-gray-300 mr-2"></i>2do Lugar</span><span class="text-green-400 font-black text-lg">$5</span>
            </div>`;
    }

    if(listContainer) {
        listContainer.innerHTML = `
            <div class="relative overflow-hidden p-4 rounded-xl bg-gradient-to-b from-gray-900 to-black border-2 border-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.2)] float-anim mt-2 mb-4">
                <div class="absolute inset-0 animate-shine z-0 pointer-events-none"></div>
                <div class="absolute top-2 left-3 text-xl money-anim" style="animation-delay: 0s;">&#x1F4B8;</div>
                <div class="absolute bottom-2 right-3 text-xl money-anim" style="animation-delay: 1.5s;">&#x1F4B0;</div>
                <div class="relative z-10">
                    <h3 class="font-black text-center mb-4 tracking-widest text-sm uppercase drop-shadow">
                        <span class="text-green-400 glow-money">&#x1F4B0; PREMIOS REPARTIDOS &#x1F4B0;</span>
                    </h3>
                    <div class="grid grid-cols-1 gap-2 text-sm font-bold">${prizesHTML}</div>
                </div>
            </div>`;
    }
    
    setTimeout(() => {
        if(document.getElementById('giant-bingo-overlay')) document.getElementById('giant-bingo-overlay').classList.add('hidden');
        if(document.getElementById('final-modal')) document.getElementById('final-modal').classList.remove('hidden');
        if(document.getElementById('modal-timer-bar')) document.getElementById('modal-timer-bar').style.width = '100%'; 
        if(typeof confetti !== 'undefined') confetti({particleCount:150, spread:80, origin:{y:0.6}});
        setTimeout(() => window.closeModal(), 8000); 
    }, 1500);
}

// --- 8. RENDERIZADO VISUAL DE CARTONES ---
function renderMyCards() {
    const grid = document.getElementById('my-cards-grid'), counter = document.getElementById('cards-counter');
    if(!grid || !counter) return;

    const cards = viewMode === 'ACTIVE' ? myActiveCards : myNextCards;
    counter.textContent = cards.length;
    
    if(!cards.length) { 
        let msg = viewMode === 'ACTIVE' ? "No juegas en este video." : "No tienes tickets asegurados.";
        let btnText = "Comprar Ticket";
        let linkHref = "https://bingotexier.com/web/pagina/40";
        
        if (nextDrawTarget === 'GRATIS' && viewMode === 'NEXT') {
            msg = "No tienes cartones gratis.";
            btnText = "Reclamar Gratis";
            linkHref = "https://bingotexier.com/web/pagina/40"; 
        }

        grid.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-6 bg-slate-900 rounded-lg border border-gray-700 border-dashed w-full max-w-sm"><i class="fas fa-ticket-alt text-2xl text-gray-600 mb-2"></i><p class="text-gray-400 mb-3 font-bold text-[10px] uppercase">${msg}</p><a href="${linkHref}" target="_blank" class="bg-green-600 hover:bg-green-500 text-white font-black py-2 px-6 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 text-xs"><i class="fas fa-shopping-cart"></i> ${btnText}</a></div>`; 
        return; 
    }

    if (viewMode === 'NEXT') {
        grid.innerHTML = cards.map((c, i) => {
            const isGratis = c.drawType === 'GRATIS';
            const baseClass = isGratis ? "bingo-ticket locked-card gratis-card relative" : "bingo-ticket locked-card relative";
            
            const cells = c.numbers.map(n => { const a = ANIMAL_MAP[n] || {i: "\u2753", n: "Desconocido"}; return `<div class="ticket-cell"><div class="text-[12px] leading-none opacity-50">${a.i}</div><div class="text-[7px] font-bold text-gray-400">${n}</div></div>`; }).join('');
            return `<div class="${baseClass}">
                    <div class="ticket-header">
                        <span class="truncate pr-1 text-[9px] w-full text-left">#${c.id?c.id.substring(0,6):i+1}</span>
                        ${isGratis ? '<span class="text-[8px] bg-green-800 text-white px-1 rounded shadow-sm">GRATIS</span>' : ''}
                    </div>
                    <div class="ticket-grid">${cells}</div>
                    <div class="lock-overlay"><span class="text-2xl text-white drop-shadow-lg">&#x1F512;</span></div>
                    <div class="bg-gray-100 px-1.5 py-0.5 text-center text-[8px] font-bold text-blue-600 uppercase border-t border-gray-300">Asegurado</div>
                    </div>`;
        }).join('');
        return;
    }

    grid.innerHTML = cards.map((c, i) => {
        const hits = c.numbers.filter(n => currentNumbers.includes(n)).length;
        const isLeader = (globalMaxScore > 0 && hits === globalMaxScore);
        const isGratis = c.drawType === 'GRATIS';
        
        let baseClass = "bingo-ticket";
        if (isGratis) baseClass += " gratis-card";
        if (isLeader) baseClass += " leader-mode";

        const cells = c.numbers.map(n => { 
            const isHit = currentNumbers.includes(n); 
            const a = ANIMAL_MAP[n] || {i: "\u2753", n: "Desconocido"}; 
            const isNewHit = isHit && !videoAlreadyWatched && (n === lastDrawnNumber);
            
            let cellClass = "ticket-cell";
            if (isNewHit) cellClass += " hit-new"; 
            else if (isHit) cellClass += " hit";   
            
            return `<div class="${cellClass}"><div class="text-[12px] leading-none">${a.i}</div><div class="text-[7px] font-bold text-gray-800">${n}</div></div>`; 
        }).join('');
        
        return `<div class="${baseClass}">
                <div class="ticket-header relative">
                    <span class="truncate pr-1 text-[9px] w-full text-left">#${c.id?c.id.substring(0,6):i+1}</span>
                    <div class="flex items-center gap-1">
                        ${isGratis ? '<span class="text-[8px] bg-green-800 text-white px-1 rounded shadow-sm">GRATIS</span>' : ''}
                        ${isLeader ? '<span class="text-[8px] bg-red-600 px-1 rounded shadow-sm">&#x1F451;</span>' : ''}
                    </div>
                </div>
                <div class="ticket-grid">${cells}</div>
                <div class="bg-gray-100 px-1.5 py-0.5 flex justify-between items-center text-[8px] font-bold text-gray-700 border-t border-gray-300"><span>ACIERTOS:</span><span class="${hits>=15?'text-green-600':(isLeader?'text-red-600 font-black':'text-blue-600')} text-[10px]">${hits}/15</span></div>
                </div>`;
    }).join('');
}

// 9. DIBUJADO DE RANKING Y PAVOSO
function renderRanking() {
    const cardsToRank = viewMode === 'ACTIVE' ? activeSoldCards : nextSoldCards;
    const currentNumsToUse = viewMode === 'ACTIVE' ? currentNumbers : [];
    const leaderboardBody = document.getElementById('leaderboard-body');
    const pavosoContainer = document.getElementById('pavoso-container');

    if(!leaderboardBody) return;

    if(!cardsToRank.length) { 
        leaderboardBody.innerHTML=''; 
        if(document.getElementById('pavoso-name')) document.getElementById('pavoso-name').textContent = '...';
        if(document.getElementById('pavoso-score')) document.getElementById('pavoso-score').textContent = '0';
        if (pavosoContainer) pavosoContainer.classList.add('hidden');
        return; 
    }

    if (currentNumsToUse.length === 0) {
        leaderboardBody.innerHTML = '<li class="text-center text-gray-400 font-bold py-6 uppercase text-[10px] tracking-widest animate-pulse">Esperando que empiece el sorteo...</li>';
        if (pavosoContainer) pavosoContainer.classList.add('hidden');
        return;
    }

    // EL PAVOSO SE MUESTRA EN TODOS LOS SORTEOS
    if (pavosoContainer) {
        pavosoContainer.classList.remove('hidden');
    }
    
    const scores = cardsToRank.map(c => ({...c, hits: c.numbers.filter(n => currentNumsToUse.includes(n)).length})).sort((a,b) => b.hits - a.hits);
    const maxHits = scores.length ? scores[0].hits : 0;
    if (viewMode === 'ACTIVE') globalMaxScore = maxHits;

    const pavoso = scores[scores.length-1];
    if(pavoso && document.getElementById('pavoso-name')) { 
        document.getElementById('pavoso-name').textContent = getRealName(pavoso.uid, pavoso.phone).substring(0,15); 
        if(document.getElementById('pavoso-score')) document.getElementById('pavoso-score').textContent = pavoso.hits;
    }

    const uniqueScores = [...new Set(scores.map(s => s.hits))].sort((a, b) => b - a);
    const score1 = uniqueScores.length > 0 ? uniqueScores[0] : -1;
    const score2 = uniqueScores.length > 1 ? uniqueScores[1] : -1;
    const score3 = uniqueScores.length > 2 ? uniqueScores[2] : -1;
    
    leaderboardBody.innerHTML = scores.slice(0,10).map((p,i) => {
        let iconMedal = ""; let colorClass = "text-yellow-400";
        if (p.hits === score1) { iconMedal = "&#x1F947; "; colorClass = "text-yellow-400"; } 
        else if (p.hits === score2) { iconMedal = "&#x1F948; "; colorClass = "text-gray-300"; } 
        else if (p.hits === score3) { iconMedal = "&#x1F949; "; colorClass = "text-orange-400"; }
        else { colorClass = "text-white"; }
        
        return `<li class="flex justify-between items-center border-b border-gray-800 py-1.5 px-1">
                    <span class="text-white font-bold truncate w-48"><span class="text-gray-500 mr-1 text-xs">${i+1}.</span> ${iconMedal}${getRealName(p.uid, p.phone)}</span>
                    <span class="bg-gray-800/50 ${colorClass} font-black px-2 py-0.5 rounded text-[10px] border border-gray-700 uppercase">${p.hits} Ac</span>
                </li>`;
    }).join('');
}

function maskPhone(s) { return (!s || s.length<5) ? "******" : "****"+s.slice(-4); }
function getRealName(uid, fb) { if(usersMap[uid]) { const u=usersMap[uid]; const n=u.nombre||u.name||u.nombres; if(n && n.length>1) return n; if(u.telefono) return maskPhone(u.telefono); } return fb ? maskPhone(fb) : "Jugador"; }

// Ocultar mensaje de carga inicial (si existe en tu cascarón HTML)
const loadingMsg = document.getElementById('pantalla-carga');
if (loadingMsg) loadingMsg.classList.add('hidden');
