// ============================================================================
// BINGO TEXIER - SISTEMA INTEGRAL DUAL (ESTELAR + GRATIS)
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- 1. INYECCIÓN DEL DISEÑO Y ESTILOS (HTML/CSS) ---
const appCSS = `
    body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: white; padding: 0; margin: 0; min-height: 100vh; display: flex; flex-direction: column; }
    .bingo-ticket { background-color: #fff; border: 2px solid #fbbf24; border-radius: 8px; overflow: hidden; position: relative; width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); transition: all 0.3s ease; }
    .ticket-header { background: linear-gradient(to right, #b45309, #d97706, #b45309); color: white; font-weight: 900; padding: 3px 4px; font-size: 0.65rem; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; }
    
    /* BINGO GRATIS */
    .bingo-ticket.gratis-card { border-color: #10b981; }
    .bingo-ticket.gratis-card .ticket-header { background: linear-gradient(to right, #059669, #10b981, #059669); }
    .gratis-card.leader-mode { border-color: #fcd34d !important; animation: borderPulseGratis 1s infinite; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8); z-index: 10; }
    @keyframes borderPulseGratis { 0% { border-color: #fcd34d; } 50% { border-color: #fbbf24; } 100% { border-color: #fcd34d; } }

    .ticket-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background-color: #cbd5e1; padding: 1px; }
    .ticket-cell { background-color: #fff; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #1f2937; position: relative; } 
    .ticket-cell.hit { background-color: #10b981 !important; color: white !important; }
    @keyframes flashHitEffect { 0% { background-color: #ffffff; transform: scale(1.2); box-shadow: 0 0 10px white; z-index: 10; } 100% { background-color: #10b981; transform: scale(1); z-index: 1; } }
    .ticket-cell.hit-new { animation: flashHitEffect 0.5s ease-out forwards !important; background-color: #10b981 !important; color: white !important; }
    
    .leader-mode { border-color: #ef4444 !important; animation: borderPulse 1s infinite; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); z-index: 10; }
    @keyframes borderPulse { 0% { border-color: #ef4444; } 50% { border-color: #b91c1c; } 100% { border-color: #ef4444; } }

    .locked-card { filter: grayscale(100%); opacity: 0.7; border-color: #4b5563 !important; }
    .locked-card .ticket-header { background: #374151 !important; }
    .lock-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 5; }
    
    .racha-overlay { position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; z-index: 30; animation: popFade 2.5s forwards; }
    .racha-badge { background: linear-gradient(45deg, #ef4444, #f59e0b); color: white; font-weight: 900; font-size: 1rem; padding: 4px 10px; border-radius: 8px; border: 2px solid white; transform: rotate(-10deg); box-shadow: 0 4px 10px rgba(0,0,0,0.5); text-align: center; line-height: 1; }
    @keyframes popFade { 0% { transform: scale(0); opacity: 0; } 15% { transform: scale(1.1); opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: scale(1.3); } }

    .video-blocker { position: absolute; inset: 0; z-index: 10; background: transparent; cursor: pointer; }
    .custom-controls-area { background: #1f2937; padding: 8px; border-bottom: 1px solid #374151; }
    .tv-progress-container { width: 100%; height: 8px; background: #374151; border-radius: 4px; cursor: pointer; position: relative; overflow: hidden; margin-bottom: 8px; }
    .tv-progress-container:hover { height: 10px; }
    .tv-progress-bar { height: 100%; background: linear-gradient(90deg, #fbbf24, #d97706); width: 0%; transition: width 0.1s linear; }

    .mosca-animalito { transform: scale(0); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .mosca-animalito.show { transform: scale(1); }
    
    @keyframes scrollTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .ticker-container { width: 100%; height: 2rem; overflow: hidden; display: flex; align-items: center; border-bottom: 1px solid #374151; }
    .ticker-content { display: flex; white-space: nowrap; animation: scrollTicker 35s linear infinite; }
    .ticker-content:hover { animation-play-state: paused; }

    @keyframes shineSweep { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
    .animate-shine { background: linear-gradient(120deg, transparent 20%, rgba(74, 222, 128, 0.3) 50%, transparent 80%); background-size: 200% auto; animation: shineSweep 3s linear infinite; }
    @keyframes floatUpDown { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .float-anim { animation: floatUpDown 5s ease-in-out infinite; }
    @keyframes glowText { 0% { text-shadow: 0 0 5px #4ade80, 0 0 10px #22c55e; } 100% { text-shadow: 0 0 15px #4ade80, 0 0 25px #16a34a; } }
    .glow-money { animation: glowText 1.5s infinite alternate; }
    @keyframes floatMoney { 0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.7; } 50% { transform: translateY(-15px) scale(1.1) rotate(10deg); opacity: 1; } 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.7; } }
    .money-anim { display: inline-block; animation: floatMoney 3s ease-in-out infinite; }

    @keyframes explodeBingo { 0% { transform: scale(0.1); opacity: 0; } 40% { transform: scale(1.3); opacity: 1; text-shadow: 0 0 50px #4ade80, 0 0 100px #22c55e; } 60% { transform: scale(0.9); text-shadow: 0 0 20px #4ade80; } 80% { transform: scale(1.1); text-shadow: 0 0 40px #4ade80; } 100% { transform: scale(1); opacity: 1; text-shadow: 0 0 30px #4ade80; } }
    .giant-bingo-text { font-size: 4.5rem; font-weight: 900; color: white; text-transform: uppercase; animation: explodeBingo 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; background: linear-gradient(to bottom, #4ade80, #16a34a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 10px 25px rgba(0,0,0,0.9)); }

    @keyframes casinoBg { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .casino-countdown { background: linear-gradient(-45deg, #0f172a, #1e1b4b, #000000, #312e81); background-size: 400% 400%; animation: casinoBg 15s ease infinite; border-bottom: 2px solid #fbbf24; padding: 2px; }
    .time-box { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; box-shadow: 0 4px 10px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.1); border-radius: 8px; padding: 4px 5px; min-width: 48px; }
    .time-val { font-size: 1.4rem; font-weight: 900; color: #fbbf24; text-shadow: 0 0 15px rgba(251, 191, 36, 0.6); line-height: 1; }
    .time-label { font-size: 0.45rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-top: 3px; letter-spacing: 1px; }
`;

const appHTML = `
<nav class="w-full bg-gray-950 shadow-md border-b border-gray-800 z-50 h-14 flex items-center px-3 sticky top-0 shrink-0">
    <div class="w-full max-w-md mx-auto flex justify-between items-center">
        <div class="flex items-center gap-1.5">
            <i class="fas fa-ticket-alt text-yellow-400 text-lg"></i>
            <div class="text-sm font-extrabold tracking-wider text-white" id="main-nav-title">BINGO <span class="text-yellow-400">TEXIER</span></div>
        </div>
        
        <div id="user-nav-info" class="flex items-center gap-2">
            <a href="https://whatsapp.com/channel/0029VbBiWgpLCoWswVhikS2M" target="_blank" class="bg-green-500 hover:bg-green-400 text-white text-[9px] font-black py-1 px-2 rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wide">
                <i class="fab fa-whatsapp"></i> CANAL
            </a>
            <button onclick="window.logout()" class="text-red-500 hover:text-red-400 text-lg transition"><i class="fas fa-sign-out-alt"></i></button>
        </div>
    </div>
</nav>

<div class="w-full max-w-md mx-auto flex-1 flex flex-col bg-slate-900 relative">
    <div id="video-container-wrapper" class="relative bg-black border-b border-yellow-500 shadow-lg w-full aspect-video flex items-center justify-center group shrink-0">
        
        <div id="live-badge" class="hidden absolute top-2 left-2 z-40 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded flex items-center gap-1 shadow-lg border border-red-500 tracking-widest">
            <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
            EN VIVO
        </div>

        <div id="no-draw-msg" class="text-gray-500 font-bold animate-pulse hidden">CARGANDO SORTEO...</div>
        
        <!-- AQUI CARGA YOUTUBE (NADA FIJO) -->
        <div id="youtube-player" class="w-full h-full"></div>
        
        <div class="video-blocker" onclick="window.togglePause()"></div> 
        
        <div id="mosca-container" class="absolute top-2 right-2 z-40 flex flex-col items-end gap-1 pointer-events-none hidden">
            <div id="mosca-animalito" class="mosca-animalito bg-black/85 border border-yellow-400 rounded p-1 flex items-center gap-1.5 shadow-xl">
                <span id="mosca-icon" class="text-2xl drop-shadow-md"></span>
                <div class="flex flex-col justify-center">
                    <span class="text-[7px] text-yellow-400 font-black uppercase tracking-widest leading-none mb-[1px]">Salió</span>
                    <span id="mosca-num" class="text-white font-black text-sm leading-none"></span>
                </div>
            </div>
            <div id="mosca-history" class="flex flex-col gap-0.5 items-end transition-all"></div>
        </div>

        <div id="start-overlay" class="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-20 pointer-events-auto hidden">
            <div id="status-icon-container" class="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-red-600/50 animate-pulse">
                <i id="status-icon" class="fas fa-play text-white text-lg sm:text-xl ml-1"></i>
            </div>
            <h2 id="video-overlay-title" class="text-white font-black text-lg sm:text-xl mb-1 text-center uppercase px-4">CARGANDO...</h2>
            <p id="video-overlay-subtitle" class="text-yellow-400 font-bold text-[10px] sm:text-xs mb-2 text-center px-4"></p>

            <button id="btn-play-video" onclick="window.startVideoPlayback()" class="bg-green-600 hover:bg-green-500 text-white font-black py-1.5 px-6 rounded-full text-xs shadow-lg transform hover:scale-105 transition active:scale-95 border-b-4 border-green-800">
                <span id="btn-play-text">VER TRANSMISIÓN</span>
            </button>

            <button id="btn-view-results" onclick="window.showFinalResults()" class="hidden mt-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-1.5 px-6 rounded-full shadow-lg transform hover:scale-105 transition text-[10px]"><i class="fas fa-list-ol mr-2"></i> VER GANADORES</button>
        </div>

        <div id="countdown-overlay" class="absolute inset-0 z-30 casino-countdown flex flex-col items-center justify-center pointer-events-auto">
            <h2 class="text-white font-black text-[9px] sm:text-[11px] mb-1.5 text-center uppercase tracking-widest drop-shadow-md text-yellow-400">EL SIGUIENTE SORTEO EMPIEZA EN:</h2>
            
            <div class="flex gap-2 sm:gap-3 mb-2 mt-1">
                <div class="time-box flex flex-col items-center"><span id="cd-hours" class="time-val">00</span><span class="time-label">Horas</span></div>
                <div class="text-xl font-black text-yellow-500 self-center animate-pulse mb-2">:</div>
                <div class="time-box flex flex-col items-center"><span id="cd-mins" class="time-val">00</span><span class="time-label">Min</span></div>
                <div class="text-xl font-black text-yellow-500 self-center animate-pulse mb-2">:</div>
                <div class="time-box flex flex-col items-center"><span id="cd-secs" class="time-val">00</span><span class="time-label">Seg</span></div>
            </div>
            
            <p class="text-[8px] sm:text-[9px] text-gray-300 mb-1.5 text-center px-6 font-bold leading-tight">Si quieres recibir la notificación de cuando empecemos, únete al canal de WhatsApp</p>
            
            <a href="https://whatsapp.com/channel/0029VbBiWgpLCoWswVhikS2M" target="_blank" class="bg-green-500 hover:bg-green-400 text-white font-black py-1.5 px-4 rounded-full text-[9px] shadow-[0_0_15px_rgba(34,197,94,0.4)] transform hover:scale-105 transition uppercase tracking-wide flex items-center gap-1.5">
                <i class="fab fa-whatsapp text-xs"></i> UNIRME AL CANAL
            </a>
            
            <button id="btn-toggle-view-countdown" onclick="window.startVideoPlayback()" class="mt-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold py-1 px-4 rounded-full border border-gray-600 text-[8px] transition active:scale-95 uppercase flex items-center justify-center gap-1.5 shadow-lg hidden"><i class="fas fa-history"></i> Ver último sorteo</button>
        </div>

        <div id="round-overlay" class="hidden absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
            <div class="bg-purple-600/90 text-white font-black text-xl px-4 py-2 rounded-lg shadow-2xl animate-bounce border-2 border-white">NUEVA RONDA!</div>
        </div>
    </div>

    <div id="custom-player-controls" class="custom-controls-area hidden shrink-0">
        <div id="progress-track" class="tv-progress-container" onclick="window.seekFromBar(event)"><div id="progress-fill" class="tv-progress-bar"></div></div>
        <div class="flex justify-between items-center">
            <div id="playback-buttons" class="flex gap-2 opacity-50 pointer-events-none transition-opacity duration-300">
                <button onclick="window.skipVideo(-10)" class="text-gray-400 hover:text-white font-bold px-2 py-1 bg-gray-800 rounded active:scale-95 text-[10px]"><i class="fas fa-undo"></i> -10s</button>
                <button id="btn-pause-toggle" onclick="window.togglePause()" class="text-black font-black h-6 w-6 flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 rounded-full shadow active:scale-95 text-[10px]"><i class="fas fa-pause"></i></button>
                <button onclick="window.skipVideo(10)" class="text-gray-400 hover:text-white font-bold px-2 py-1 bg-gray-800 rounded active:scale-95 text-[10px]">+10s <i class="fas fa-redo"></i></button>
            </div>
            <button id="voice-toggle" onclick="window.toggleVoice()" class="text-[9px] font-bold bg-gray-800 hover:bg-gray-700 text-white py-1 px-2 rounded border border-gray-700 flex items-center gap-1.5"><span>VOZ:</span> <span id="voice-status" class="text-green-400">ON</span></button>
        </div>
    </div>

    <div id="vip-ticker" class="ticker-container bg-black shrink-0">
        <div class="ticker-content" id="ticker-content">
            <!-- Se llena por JS -->
        </div>
    </div>

    <button id="btn-toggle-view" onclick="window.backToWaiting()" class="hidden"></button>

    <div class="flex-1 flex flex-col">
        <div id="login-card" class="bg-gray-950 border-t-4 border-yellow-500 shadow-2xl overflow-hidden max-w-sm mx-auto rounded-xl mt-6 hidden">
            <div class="p-6 text-center">
                <h3 class="text-white font-black text-lg mb-4 uppercase tracking-widest">ACCESO A JUGADORES</h3>
                <form onsubmit="event.preventDefault(); window.fullLogin();" class="space-y-3">
                    <input type="tel" id="login-phone" class="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg font-bold text-white outline-none focus:border-yellow-500 text-sm" placeholder="Teléfono" required="">
                    <input type="password" id="login-pass" class="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:border-yellow-500 text-sm" placeholder="Contraseña" required="">
                    <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-lg shadow-lg uppercase text-sm w-full">Entrar</button>
                </form>
            </div>
        </div>
        
        <div id="my-cards-area" class="flex-1 flex flex-col">
            <div class="bg-gray-900 py-2 px-3 border-b border-gray-800 flex justify-between items-center shrink-0">
                <h3 class="text-xs font-black text-white uppercase tracking-widest" id="section-title"><i class="fas fa-lock text-blue-400 mr-2"></i> TICKETS ASEGURADOS</h3>
                <span id="cards-counter" class="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black shadow">0</span>
            </div>

            <div id="my-cards-grid" class="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-800 shrink-0"></div>

            <div id="prizes-waiting-box" class="m-4 bg-gradient-to-b from-gray-900 to-black border-2 border-green-500/80 rounded-xl p-4 shadow-[0_0_20px_rgba(34,197,94,0.2)] relative overflow-hidden float-anim">
                <div class="absolute inset-0 animate-shine z-0 pointer-events-none"></div>
                <div class="absolute top-2 left-3 text-xl money-anim" style="animation-delay: 0s;">&#x1F4B8;</div>
                <div class="absolute bottom-2 right-3 text-xl money-anim" style="animation-delay: 1.5s;">&#x1F4B0;</div>

                <div class="relative z-10">
                    <h3 class="font-black text-center mb-3 tracking-widest text-xs uppercase drop-shadow">
                        <span class="text-green-400 glow-money"> PREMIOS EN JUEGO </span>
                    </h3>
                    <div class="grid grid-cols-1 gap-1.5 text-xs font-bold" id="waiting-prizes-list">
                        <!-- Se llena por JS -->
                    </div>
                </div>
            </div>

            <div id="ranking-section" class="flex-1 flex flex-col bg-gray-950 border-t-2 border-gray-800">
                <div class="bg-gradient-to-r from-yellow-600 to-yellow-400 p-2 border-b border-gray-800 flex justify-center items-center shrink-0 w-full shadow-md">
                    <span class="text-[11px] text-black font-black uppercase tracking-widest">TOP 10 JUGADORES CON MÁS ACIERTOS </span>
                </div>
                
                <div id="pavoso-container" class="p-2 shrink-0 border-b border-gray-800 hidden">
                    <div class="bg-red-950/50 border border-red-900/50 rounded-lg p-2 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-lg"></span>
                            <div class="flex flex-col">
                                <span class="text-[8px] text-red-400 font-black uppercase tracking-wider">EL PAVOSO (ÚLTIMO)</span>
                                <span class="text-white font-bold text-xs" id="pavoso-name">...</span>
                            </div>
                        </div>
                        <span class="text-red-500 font-black text-sm bg-red-950 px-2 rounded" id="pavoso-score">0</span>
                    </div>
                </div>
                
                <ul id="leaderboard-body" class="flex-1 overflow-y-auto px-2 py-1 text-sm space-y-1 pb-10"></ul>
            </div>
        </div>
    </div>
</div>

<div id="giant-bingo-overlay" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
    <div class="giant-bingo-text italic tracking-tighter">¡BINGO!</div>
</div>

<div id="final-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
    <div class="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-5 w-full max-w-md text-center shadow-[0_0_50px_rgba(234,179,8,0.5)] relative flex flex-col max-h-[80vh]">
        <h2 class="text-3xl font-black text-white mb-1 uppercase italic shrink-0"><i class="fas fa-trophy text-yellow-400 mr-2"></i>¡GANADORES!</h2>
        
        <div id="winners-list-container" class="bg-transparent rounded-xl p-0 my-2 overflow-y-auto border-0 text-left flex-1" style="max-height: 55vh;">
            <ul id="winners-list" class="space-y-0"></ul>
        </div>
        
        <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-4 shrink-0">
            <div id="modal-timer-bar" class="bg-yellow-500 h-full w-full transition-all duration-[8000ms] ease-linear"></div>
        </div>
        
        <button onclick="window.closeModal()" class="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-2 rounded-lg shadow uppercase text-sm shrink-0">Cerrar</button>
    </div>
</div>
`;

// Carga Inicial y Configuración Visual Suave
document.body.style.opacity = '0';
document.body.innerHTML = appHTML;

const styleElement = document.createElement('style');
styleElement.innerHTML = appCSS;
document.head.appendChild(styleElement);

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
    });
}
function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

loadStylesheet("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css");
loadStylesheet("https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap");
loadScript("https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js");
loadScript("https://cdn.tailwindcss.com").then(() => {
    document.body.style.transition = 'opacity 0.5s ease-in';
    document.body.style.opacity = '1';
});

if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
    loadScript("https://www.youtube.com/iframe_api");
}

// --- 2. CONFIGURACIÓN FIREBASE Y VARIABLES ---
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
let videoAlreadyWatched = false; 
let isPlayingVideo = false;
let lastSorteoDateText = "Fecha anterior";
let globalSorteoTimestamp = 0;

let dataLoaded = { sorteoEstelar: false, sorteoGratis: false, aprobadosEstelar: false, aprobadosGratis: false };
let dataEstelar = null;
let dataGratis = null;
let aprobadosEstelar = {};
let aprobadosGratis = {};
let currentDrawType = 'ESTELAR'; 
let nextDrawTarget = 'GRATIS';   

let countdownInterval = null;

// --- 3. LOGICA GLOBAL DE COMPONENTES ---

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
    
    const diff = target - now;
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

function updatePrizesUI() {
    const navTitle = document.getElementById('main-nav-title');
    const ticker = document.getElementById('ticker-content');
    const waitingBox = document.getElementById('waiting-prizes-list');

    if (currentDrawType === 'GRATIS') {
        navTitle.innerHTML = 'BINGO <span class="text-green-400">GRATIS</span>';
        ticker.innerHTML = `
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-green-400 mx-4 font-black animate-pulse">BINGO GRATIS</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$100</span></span>
                <span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-medal text-gray-300 mr-1"></i> 2do Lugar: <span class="text-green-400 font-black">$5</span></span>
            </div>
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-green-400 mx-4 font-black ml-10 animate-pulse">BINGO GRATIS</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$100</span></span>
                <span class="text-gray-600 mx-1">|</span>
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
        navTitle.innerHTML = 'BINGO <span class="text-yellow-400">TEXIER</span>';
        ticker.innerHTML = `
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-yellow-500 mx-4 font-black animate-pulse">PREMIOS EN JUEGO</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$800</span></span>
                <span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-medal text-gray-300 mr-1"></i> 2do Lugar: <span class="text-green-400 font-black">$100</span></span>
                <span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-sad-tear text-red-400 mr-1"></i> Pavoso: <span class="text-green-400 font-black">$30</span></span>
            </div>
            <div class="flex items-center text-[10px] tracking-widest uppercase">
                <span class="text-yellow-500 mx-4 font-black ml-10 animate-pulse">PREMIOS EN JUEGO</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-trophy text-yellow-400 mr-1"></i> 1er Lugar: <span class="text-green-400 font-black">$800</span></span>
                <span class="text-gray-600 mx-1">|</span>
                <span class="text-white mx-3 font-bold"><i class="fas fa-medal text-gray-300 mr-1"></i> 2do Lugar: <span class="text-green-400 font-black">$100</span></span>
                <span class="text-gray-600 mx-1">|</span>
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

function evaluateActiveDraw() {
    if (!dataLoaded.sorteoEstelar || !dataLoaded.sorteoGratis || !dataLoaded.aprobadosEstelar || !dataLoaded.aprobadosGratis) return;
    
    let tsE = dataEstelar ? (dataEstelar.timestamp || 0) : 0;
    let tsG = dataGratis ? (dataGratis.timestamp || 0) : 0;

    let activeData = null;

    if (tsG > tsE) {
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
        if(activeData.cartones_snapshot) {
            Object.values(activeData.cartones_snapshot).forEach(c => { 
                if(c.numbers) { 
                    c.numbers = c.numbers.map(Number); 
                    c.drawType = currentDrawType; // Asigna el tipo de sorteo actual
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

    nextSoldCards = []; myNextCards = [];
    
    Object.values(aprobadosEstelar).forEach(c => { 
        if(c.numbers && c.date === dateStr) { 
            c.numbers = c.numbers.map(Number); 
            c.drawType = 'ESTELAR'; 
            nextSoldCards.push(c); 
            if(currentUser && c.uid === currentUser.uid) myNextCards.push(c); 
        } 
    });
    
    Object.values(aprobadosGratis).forEach(c => { 
        if(c.numbers && c.date === dateStr) { 
            c.numbers = c.numbers.map(Number); 
            c.drawType = 'GRATIS'; 
            nextSoldCards.push(c); 
            if(currentUser && c.uid === currentUser.uid) myNextCards.push(c); 
        } 
    });

    evaluateSystemState();
}

// --- 4. EXPOSICIÓN DE FUNCIONES GLOBALES (Para botones onClick en HTML) ---
window.startVideoPlayback = () => {
    isPlayingVideo = true;
    viewMode = 'ACTIVE'; 
    evaluateSystemState(); 
    
    if (isVoiceEnabled) {
        [audioBingo, audioRonda2, audioRonda3].forEach(a => {
            a.muted = true;
            let playPromise = a.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    a.pause();
                    a.currentTime = 0;
                    a.muted = false;
                }).catch(e => { a.muted = false; });
            }
        });

        if(player && player.getCurrentTime) {
            if (player.getCurrentTime() < 5) {
                audioRonda1.currentTime = 0;
                audioRonda1.play().catch(e=>{});
            }
        }
    }

    if(player && typeof player.playVideo === 'function') { 
        player.unMute(); player.playVideo(); 
        document.getElementById('start-overlay').classList.add('hidden'); 
        document.getElementById('custom-player-controls').classList.remove('hidden');
        startProgressLoop();
    }
}

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
    isVoiceEnabled = !isVoiceEnabled; 
    const s = document.getElementById('voice-status'); 
    if(isVoiceEnabled) { 
        s.textContent="ON"; s.className="text-green-400"; 
        window.speechSynthesis.cancel(); 
    } else { 
        s.textContent="OFF"; s.className="text-red-400"; 
        window.speechSynthesis.cancel(); 
        [audioBingo, audioRonda1, audioRonda2, audioRonda3].forEach(a => { a.pause(); a.currentTime=0; });
    } 
};
window.togglePause = () => { if(!player) return; const s = player.getPlayerState(); const b = document.getElementById('btn-pause-toggle'); if(s===1) { player.pauseVideo(); b.innerHTML='<i class="fas fa-play"></i>'; } else { player.playVideo(); b.innerHTML='<i class="fas fa-pause"></i>'; } };
window.skipVideo = (s) => { if(!player) return; player.seekTo(player.getCurrentTime()+s, true); };
window.seekFromBar = (e) => { if(!videoAlreadyWatched || !player) return; const r=document.getElementById('progress-track').getBoundingClientRect(); player.seekTo(player.getDuration()*((e.clientX-r.left)/r.width), true); };
window.showFinalResults = () => { showWinnerModalLive(); }
window.closeModal = () => { 
    document.getElementById('final-modal').classList.add('hidden');
    document.getElementById('giant-bingo-overlay').classList.add('hidden');
};

// Autenticación de Firebase
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

function startProgressLoop() {
    if(progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if(player && player.getCurrentTime) {
            const cur = player.getCurrentTime(); const dur = player.getDuration();
            if(dur > 0) document.getElementById('progress-fill').style.width = ((cur/dur)*100) + "%";
            
            if (isPlayingVideo && globalSorteoTimestamp > 0 && dur > 0) {
                if (Date.now() - globalSorteoTimestamp >= dur * 1000) {
                    document.getElementById('live-badge').classList.add('hidden');
                }
            }
            checkTimeline(cur);
        }
    }, 300); 
}

function formatCustomDate(ts) {
    if(!ts) return "Fecha anterior";
    const d = new Date(ts);
    const hrs = d.getHours();
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const h12 = hrs % 12 || 12;
    const min = String(d.getMinutes()).padStart(2, '0');
    const day = d.getDate();
    const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const month = months[d.getMonth()];
    return `${h12}:${min} ${ampm} (${day} ${month})`;
}

// 5. EVALUACION MAESTRA DE ESTADO DE PANTALLA
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
        title.textContent = "INICIA SESI\u00D3N";
        subtitle.innerHTML = '<span class="text-yellow-400 font-bold text-sm">Inicia sesi\u00F3n abajo para ver tus cartones.</span>';
        if(sectionTitle) sectionTitle.innerHTML = '<i class="fas fa-lock text-gray-500 mr-2"></i> TICKETS';
        
        btnPlay.classList.add('hidden');
        if (prizesBox) prizesBox.classList.add('hidden');
        if (btnToggle) btnToggle.classList.add('hidden');
        
        iconContainer.className = "w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center mb-3 shadow-lg";
        icon.className = "fas fa-user-lock text-white text-xl";
        
        countdownOverlay.classList.add('hidden');
        stopCountdown();
        liveBadge.classList.add('hidden');
        startOverlay.classList.remove('hidden');
        
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
        if (shouldDefaultToNext) { 
            viewMode = 'NEXT'; 
        } else { 
            viewMode = 'ACTIVE'; 
        }
    }

    let name = getRealName(currentUser.uid, currentUser.email);

    if (viewMode === 'NEXT') {
        if(sectionTitle) sectionTitle.innerHTML = '<i class="fas fa-lock text-blue-400 mr-2"></i> TICKETS ASEGURADOS';
        if (prizesBox) prizesBox.classList.remove('hidden');
        if (btnToggle) btnToggle.classList.add('hidden');

        startOverlay.classList.add('hidden'); 
        countdownOverlay.classList.remove('hidden'); 
        liveBadge.classList.add('hidden');
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
        title.textContent = `\u00A1HOLA, ${name.toUpperCase()}!`;
        subtitle.textContent = "EL SORTEO EST\u00C1 LISTO O EN VIVO";
        if(sectionTitle) sectionTitle.innerHTML = '<i class="fas fa-play-circle text-red-500 mr-1"></i> TICKETS EN JUEGO';
        
        btnPlay.classList.remove('hidden');
        if (prizesBox) prizesBox.classList.add('hidden');
        countdownOverlay.classList.add('hidden');
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
        
        iconContainer.className = "w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-red-600/50 animate-pulse";
        icon.className = "fas fa-play text-white text-lg sm:text-xl ml-1";
        
        if (videoAlreadyWatched) {
            document.getElementById('btn-play-text').textContent = "VER REPETICI\u00D3N";
            document.getElementById('btn-view-results').classList.remove('hidden');
            document.getElementById('playback-buttons').classList.remove('opacity-50', 'pointer-events-none');
            document.getElementById('progress-track').classList.add('interactive');
        } else {
            document.getElementById('btn-play-text').textContent = "VER TRANSMISI\u00D3N";
            document.getElementById('btn-view-results').classList.add('hidden');
        }

        if (isPlayingVideo) {
            startOverlay.classList.add('hidden');
            let durationMs = (player && typeof player.getDuration === 'function') ? player.getDuration() * 1000 : 0;
            let timePassed = Date.now() - globalSorteoTimestamp;
            let isLiveNow = false;
            
            if (durationMs > 0) { isLiveNow = timePassed < durationMs; } 
            else { isLiveNow = timePassed < (30 * 60 * 1000); }

            if (isLiveNow) { liveBadge.classList.remove('hidden'); } 
            else { liveBadge.classList.add('hidden'); }
        } else {
            startOverlay.classList.remove('hidden');
            liveBadge.classList.add('hidden');
        }
    }
    
    renderMyCards();
    renderRanking(); 
}

// 6. ESCUCHA DE DATOS (FIREBASE READERS)
function initData() {
    ['usuarios','users'].forEach(p => onValue(ref(db, p), s => { 
        if(s.exists()) { usersMap={...usersMap, ...s.val()}; renderRanking(); if(currentUser) evaluateSystemState(); } 
    }));
    
    onValue(ref(db, 'sorteo_en_juego'), s => { dataLoaded.sorteoEstelar = true; dataEstelar = s.val() || null; evaluateActiveDraw(); });
    onValue(ref(db, 'sorteo_en_juego_gratis'), s => { dataLoaded.sorteoGratis = true; dataGratis = s.val() || null; evaluateActiveDraw(); });
    onValue(ref(db, 'bingo_aprobados'), s => { dataLoaded.aprobadosEstelar = true; aprobadosEstelar = s.val() || {}; updateNextCards(); });
    onValue(ref(db, 'bingo_aprobados_gratis'), s => { dataLoaded.aprobadosGratis = true; aprobadosGratis = s.val() || {}; updateNextCards(); });
}

// YOUTUBE API
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
        document.getElementById('btn-pause-toggle').innerHTML = '<i class="fas fa-play"></i>';
    }
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
        
        const ol = document.getElementById('round-overlay'); ol.classList.remove('hidden'); setTimeout(() => ol.classList.add('hidden'), 3000);
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
    document.getElementById('mosca-icon').textContent = info.i;
    document.getElementById('mosca-num').textContent = num;
    mosca.classList.remove('show');
    setTimeout(() => mosca.classList.add('show'), 50);

    if (!videoAlreadyWatched) {
        let userHit = false;
        myActiveCards.forEach(c => { if (c.numbers.includes(num)) userHit = true; });
        if (userHit) { if (navigator.vibrate) navigator.vibrate(200); }
    }
}

function updateMoscaHistory() {
    const historyContainer = document.getElementById('mosca-history');
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
    document.getElementById('giant-bingo-overlay').classList.remove('hidden');

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
    
    setTimeout(() => {
        document.getElementById('giant-bingo-overlay').classList.add('hidden');
        document.getElementById('final-modal').classList.remove('hidden');
        document.getElementById('modal-timer-bar').style.width = '100%'; 
        if(typeof confetti !== 'undefined') confetti({particleCount:150, spread:80, origin:{y:0.6}});
        setTimeout(() => window.closeModal(), 8000); 
    }, 1500);
}

// 7. MOTOR DE PINTADO DE CARTONES
function renderMyCards() {
    const grid = document.getElementById('my-cards-grid'), counter = document.getElementById('cards-counter');
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
                        ${isGratis ? '<span class="text-[8px] bg-green-800 text-white px-1 rounded">GRATIS</span>' : ''}
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

function renderRanking() {
    const cardsToRank = viewMode === 'ACTIVE' ? activeSoldCards : nextSoldCards;
    const currentNumsToUse = viewMode === 'ACTIVE' ? currentNumbers : [];
    const leaderboardBody = document.getElementById('leaderboard-body');
    const pavosoContainer = document.getElementById('pavoso-container');

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

    // PAVOSO AHORA SE MUESTRA EN TODOS LOS SORTEOS
    if (pavosoContainer) {
        pavosoContainer.classList.remove('hidden');
    }
    
    const scores = cardsToRank.map(c => ({...c, hits: c.numbers.filter(n => currentNumsToUse.includes(n)).length})).sort((a,b) => b.hits - a.hits);
    const maxHits = scores.length ? scores[0].hits : 0;
    if (viewMode === 'ACTIVE') globalMaxScore = maxHits;

    const pavoso = scores[scores.length-1];
    if(pavoso && document.getElementById('pavoso-name')) { 
        document.getElementById('pavoso-name').textContent = getRealName(pavoso.uid, pavoso.phone).substring(0,15); 
        document.getElementById('pavoso-score').textContent = pavoso.hits;
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
