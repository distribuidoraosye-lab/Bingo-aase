/* ============================================================
   BINGO TEXIER - MÓDULO EL CORRAL (Supervivencia)
   Descripción: Módulo inyectable con Monitor de Pista y Ganador.
   ============================================================ */

let corralConfig = { ronda: 1, recompra_activa: true, pozo: "0.00", precio: 0, precio_recompra: 0, isOpen: true, lastResult: null };
let corralPlayer = null; 
let allCorralPlayers = {}; // Nueva para el monitor
let corralUserBalance = 0;
let lastResultSeen = 0;
let isProcessingCorral = false;

// 1. INYECTAR EL HTML DEL JUEGO
function injectCorralApp() {
    const containerWrapper = document.querySelector('.container-wrapper');
    if(containerWrapper && !document.getElementById('section-corral')) {
        const corralSection = document.createElement('div');
        corralSection.id = 'section-corral';
        corralSection.className = 'hidden';
        corralSection.style.display = 'none';
        
        corralSection.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <button onclick="cerrarCorral()" class="text-xs text-gray-500 hover:text-gray-800 transition font-bold"><i class="fas fa-arrow-left"></i> Volver al Menú</button>
            <span class="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Saldo: Bs <span id="corral-balance-disp">0.00</span></span>
        </div>
        
        <div class="bg-gray-900 border-2 border-orange-600 shadow-2xl rounded-xl overflow-hidden relative flex flex-col mb-6">
            
            <div class="bg-black p-4 text-center border-b border-orange-600 shadow-md relative z-20">
                <div class="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                <h3 class="font-black text-2xl text-orange-500 tracking-widest relative z-10"><i class="fas fa-hat-cowboy mr-2"></i>EL CORRAL</h3>
                <div class="mt-2 bg-gray-800 inline-block px-6 py-2 rounded-xl border border-gray-600 relative z-10 shadow-inner">
                    <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Pozo Acumulado</p>
                    <p class="text-3xl font-black text-green-400 drop-shadow-md">$<span id="corral-pozo-display">0.00</span></p>
                </div>
                <div class="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow animate-pulse">
                    RONDA <span id="corral-ronda-display">1</span>
                </div>
            </div>

            <div class="bg-gray-800 p-2 border-b border-gray-700 text-center">
                <button onclick="document.getElementById('corral-info').classList.toggle('hidden')" class="text-xs text-orange-400 font-bold tracking-widest uppercase hover:text-orange-300"><i class="fas fa-info-circle mr-1"></i> ¿Cómo se juega?</button>
                <div id="corral-info" class="hidden mt-2 p-3 bg-gray-900 rounded text-[10px] text-gray-300 text-left border border-gray-700">
                    <ul class="list-disc pl-4 space-y-1">
                        <li>En cada ronda, elige un Corral para sobrevivir.</li>
                        <li><b>Corral 1:</b> Del 1 al 13. <b>Corral 2:</b> Del 14 al 26.</li>
                        <li>Si sale tu corral, avanzas. Si no, ¡mueres!</li>
                        <li>El último en pie se lleva el Pote. 🤠</li>
                    </ul>
                </div>
            </div>

            <div id="corral-game-area" class="p-6 flex-1 min-h-[300px] flex flex-col justify-center items-center relative"></div>

            <div id="corral-pista" class="bg-black/40 p-4 border-t border-orange-900/50 hidden">
                <h4 class="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 text-center">👥 ESTADO DE LA PISTA</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-orange-900/20 p-2 rounded border border-orange-500/30">
                        <p class="text-[9px] font-bold text-orange-300 uppercase mb-2 text-center">Corral 1: <span id="count-c1">0</span></p>
                        <div id="list-c1" class="text-[8px] space-y-1 max-h-24 overflow-y-auto custom-scrollbar"></div>
                    </div>
                    <div class="bg-blue-900/20 p-2 rounded border border-blue-500/30">
                        <p class="text-[9px] font-bold text-blue-300 uppercase mb-2 text-center">Corral 2: <span id="count-c2">0</span></p>
                        <div id="list-c2" class="text-[8px] space-y-1 max-h-24 overflow-y-auto custom-scrollbar"></div>
                    </div>
                </div>
            </div>

        </div>

        <div id="corral-result-modal" class="hidden fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div id="corral-result-card" class="bg-gray-900 border-2 rounded-xl w-full max-w-sm p-6 shadow-2xl text-center transform transition-all scale-100">
                <div id="corral-result-icon" class="inline-block p-4 rounded-full border-2 mb-4 text-4xl"></div>
                <h3 id="corral-result-title" class="text-white font-black text-2xl tracking-widest uppercase mb-2"></h3>
                <p id="corral-result-text" class="text-gray-300 text-sm mb-6"></p>
                <button onclick="cerrarModalResultado()" class="w-full bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-xl border border-gray-600 transition uppercase tracking-widest text-sm">CONTINUAR</button>
            </div>
        </div>
        `;
        containerWrapper.appendChild(corralSection);
    }

    const gameSelector = document.getElementById('game-selector');
    if(gameSelector && !document.getElementById('btn-open-corral')) {
        const btnCorral = document.createElement('button');
        btnCorral.id = 'btn-open-corral';
        btnCorral.onclick = window.openCorralSection;
        btnCorral.className = "col-span-2 w-full bg-gradient-to-r from-orange-600 to-red-800 text-white p-4 rounded-xl shadow-lg transform transition hover:scale-105 border border-orange-500 group flex items-center justify-center gap-4 relative overflow-hidden mt-2";
        btnCorral.innerHTML = `
            <i class="fas fa-hat-cowboy text-4xl group-hover:animate-pulse"></i>
            <div class="flex flex-col text-left leading-tight">
                <span class="text-lg tracking-wider font-black uppercase">EL CORRAL (En Vivo)</span>
                <span class="text-xs font-bold text-orange-200">Sobrevive y llévate el Pozo</span>
            </div>
        `;
        gameSelector.appendChild(btnCorral);
    }
}

// 2. ABRIR / CERRAR
window.openCorralSection = function() {
    const gs = document.getElementById('game-selector'); if(gs) gs.classList.add('hidden');
    const mb = document.getElementById('main-live-btn'); if(mb) mb.classList.add('hidden');
    const sv = document.getElementById('section-corral'); if(sv) { sv.classList.remove('hidden'); sv.style.display = 'block'; }
    renderCorralUI();
};

window.cerrarCorral = function() {
    document.getElementById('section-corral').style.display = 'none';
    const gs = document.getElementById('game-selector'); if(gs) gs.classList.remove('hidden');
    const mb = document.getElementById('main-live-btn'); if(mb) mb.classList.remove('hidden');
};

// 3. INICIALIZAR (Sincronización)
if(document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', injectCorralApp); } 
else { injectCorralApp(); }

firebase.auth().onAuthStateChanged(function(user) {
    if (user) setTimeout(initCorralSystem, 1000); 
});

function initCorralSystem() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    db.ref('corral_game/config').on('value', s => {
        if (s.exists()) {
            corralConfig = s.val();
            document.getElementById('corral-pozo-display').textContent = corralConfig.pozo;
            document.getElementById('corral-ronda-display').textContent = corralConfig.ronda;
            if (corralConfig.lastResult && corralConfig.lastResult.timestamp !== lastResultSeen && corralPlayer) {
                lastResultSeen = corralConfig.lastResult.timestamp;
                mostrarAlertaResultado(corralConfig.lastResult);
            }
            renderCorralUI(); 
        }
    });

    // Listener para MI estado (El que funciona)
    db.ref(`corral_game/players/${uid}`).on('value', s => {
        corralPlayer = s.exists() ? s.val() : null;
        renderCorralUI();
    });

    // Listener para LA PISTA (Todos los jugadores)
    db.ref('corral_game/players').on('value', s => {
        allCorralPlayers = s.val() || {};
        updatePistaUI();
    });

    db.ref(`users/${uid}/balance`).on('value', s => {
        corralUserBalance = s.val() || 0;
        const balanceDisp = document.getElementById('corral-balance-disp');
        if(balanceDisp) balanceDisp.textContent = corralUserBalance.toFixed(2);
    });
}

// 4. MÁQUINA DE ESTADOS
function renderCorralUI() {
    const area = document.getElementById('corral-game-area');
    const pista = document.getElementById('corral-pista');
    if (!area) return;

    if (!corralPlayer) {
        pista.classList.add('hidden');
        let precioTexto = corralConfig.precio > 0 ? `Bs ${corralConfig.precio.toFixed(2)}` : '¡ENTRADA GRATIS!';
        area.innerHTML = `
            <i class="fas fa-ticket-alt text-6xl text-gray-700 mb-4"></i>
            <h4 class="text-white font-bold text-lg uppercase tracking-widest mb-2">Entra al Corral</h4>
            <p class="text-gray-400 text-xs text-center mb-6">Únete a la supervivencia. El último en pie gana.</p>
            <button onclick="participarCorral()" class="w-full max-w-xs bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 uppercase tracking-widest text-sm border-b-4 border-orange-900">
                PAGAR ENTRADA - ${precioTexto}
            </button>
        `;
        return;
    }

    pista.classList.remove('hidden');

    // CHEQUEO DE GANADOR (Último vivo en la pista)
    const vivos = Object.values(allCorralPlayers).filter(p => p.status === 'vivo');
    if(vivos.length === 1 && vivos.phone === corralPlayer.phone && corralConfig.ronda > 1) {
        area.innerHTML = `
            <div class="text-center w-full animate-bounce">
                <i class="fas fa-crown text-7xl text-yellow-500 mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]"></i>
                <h4 class="text-white font-black text-3xl uppercase tracking-widest mb-2">¡ERES EL GANADOR! 👑</h4>
                <p class="text-yellow-400 font-bold text-lg mb-6">Te llevas el pote de $${corralConfig.pozo}</p>
                <p class="text-gray-400 text-[10px] uppercase">Contacta al admin para cobrar tu premio.</p>
            </div>
        `;
        return;
    }

    if (corralPlayer.status === 'vivo' && corralPlayer.corral === 0) {
        area.innerHTML = `
            <div class="text-center w-full animate-bounce-in">
                <h4 class="text-white font-black text-xl uppercase tracking-widest mb-1 text-center">TOMA TU DECISIÓN</h4>
                <p class="text-orange-400 text-xs font-bold mb-6 text-center">Ronda ${corralConfig.ronda} • Elige sabiamente</p>
                <div class="grid grid-cols-2 gap-4 w-full">
                    <button onclick="seleccionarCorral(1)" class="bg-orange-900/40 hover:bg-orange-800/60 border-2 border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center transition transform active:scale-95 group shadow-lg">
                        <i class="fas fa-horse-head text-4xl text-orange-400 mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-white font-black tracking-widest uppercase">CORRAL 1</span>
                        <span class="text-orange-300 text-[9px] font-bold mt-1">(1 al 13) 🐴</span>
                    </button>
                    <button onclick="seleccionarCorral(2)" class="bg-blue-900/40 hover:bg-blue-800/60 border-2 border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center transition transform active:scale-95 group shadow-lg">
                        <i class="fas fa-crow text-4xl text-blue-400 mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-white font-black tracking-widest uppercase">CORRAL 2</span>
                        <span class="text-blue-300 text-[9px] font-bold mt-1">(14 al 26) 🐦</span>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    if (corralPlayer.status === 'vivo' && corralPlayer.corral > 0) {
        const nombreCorral = corralPlayer.corral === 1 ? "CORRAL 1" : "CORRAL 2";
        const colorClass = corralPlayer.corral === 1 ? "text-orange-400" : "text-blue-400";
        area.innerHTML = `
            <div class="text-center w-full animate-pulse-fast">
                <i class="fas fa-lock text-5xl text-gray-600 mb-4"></i>
                <h4 class="text-white font-black text-lg uppercase tracking-widest mb-1">DECISIÓN SELLADA</h4>
                <p class="text-gray-400 text-sm mb-6">Estás esperando en el <span class="font-black ${colorClass}">${nombreCorral}</span></p>
                <div class="bg-black/50 border border-gray-700 p-4 rounded-xl">
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest">Mira el video en WhatsApp.<br>Si el animalito está en tu corral, avanzas. 🤠</p>
                </div>
            </div>
        `;
        return;
    }

    if (corralPlayer.status === 'muerto') {
        if (corralConfig.recompra_activa) {
            area.innerHTML = `
                <div class="text-center w-full animate-bounce-in">
                    <i class="fas fa-skull text-6xl text-red-600 mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"></i>
                    <h4 class="text-white font-black text-2xl uppercase tracking-widest mb-1">¡MORISTE! 💀</h4>
                    <p class="text-gray-400 text-sm mb-6">El Verdugo eliminó tu corral.</p>
                    <button onclick="recomprarCorral()" class="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 uppercase tracking-widest text-sm border-b-4 border-green-900">
                        REVIVIR AHORA - Bs ${corralConfig.precio_recompra.toFixed(2)} 🛟
                    </button>
                </div>
            `;
        } else {
            area.innerHTML = `
                <div class="text-center w-full opacity-80 grayscale">
                    <i class="fas fa-tombstone text-7xl text-gray-600 mb-4"></i>
                    <h4 class="text-red-500 font-black text-2xl uppercase tracking-widest mb-1">ESTÁS FUERA 🪦</h4>
                    <p class="text-gray-400 text-sm mb-4">Fuiste eliminado definitivamente.</p>
                    <div class="bg-black border border-gray-800 p-3 rounded-lg inline-block">
                        <span class="text-[10px] text-red-600 font-bold uppercase tracking-widest">RONDA CERRADA - MUERTE SÚBITA</span>
                    </div>
                </div>
            `;
        }
        return;
    }
}

// 5. ACTUALIZAR PISTA (Privacidad)
function updatePistaUI() {
    const l1 = document.getElementById('list-c1');
    const l2 = document.getElementById('list-c2');
    if(!l1 || !l2) return;
    let h1 = '', h2 = '', c1 = 0, c2 = 0;

    Object.values(allCorralPlayers).forEach(p => {
        if(p.status === 'vivo' && p.corral > 0) {
            const masked = p.phone ? p.phone.replace(/(\d{4})\d+(\d{4})/, "$1****$2") : '****';
            const item = `<div class="flex justify-between text-gray-400 border-b border-white/5 pb-1"><span class="truncate w-16">${p.name}</span><span>${masked}</span></div>`;
            if(p.corral === 1) { h1 += item; c1++; } else { h2 += item; c2++; }
        }
    });

    l1.innerHTML = h1 || '<p class="text-gray-700 italic py-2">Vacío</p>';
    l2.innerHTML = h2 || '<p class="text-gray-700 italic py-2">Vacío</p>';
    document.getElementById('count-c1').innerText = c1;
    document.getElementById('count-c2').innerText = c2;
}

// 6. ACCIONES
window.participarCorral = async () => {
    if(isProcessingCorral) return;
    const uid = auth.currentUser.uid;
    const precio = corralConfig.precio;
    if(corralUserBalance < precio) return alert(`Saldo insuficiente.`);
    if(!confirm(`¿Entrar al Corral por Bs ${precio.toFixed(2)}?`)) return;
    isProcessingCorral = true;
    try {
        if(precio > 0) await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - precio);
        const uSnap = await db.ref(`users/${uid}`).once('value');
        const ud = uSnap.val() || {};
        await db.ref(`corral_game/players/${uid}`).set({ status: 'vivo', corral: 0, name: ud.name || 'Jugador', phone: ud.phone || '' });
    } catch (e) { alert("Error: " + e.message); } finally { isProcessingCorral = false; }
};

window.seleccionarCorral = async (n) => {
    if(isProcessingCorral) return;
    isProcessingCorral = true;
    try { await db.ref(`corral_game/players/${auth.currentUser.uid}/corral`).set(n); } 
    catch (e) { alert("Error: " + e.message); } finally { isProcessingCorral = false; }
};

window.recomprarCorral = async () => {
    if(isProcessingCorral) return;
    const uid = auth.currentUser.uid;
    const pr = corralConfig.precio_recompra;
    if(corralUserBalance < pr) return alert(`Saldo insuficiente.`);
    if(!confirm(`¿Revivir por Bs ${pr.toFixed(2)}?`)) return;
    isProcessingCorral = true;
    try {
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - pr);
        await db.ref(`corral_game/players/${uid}`).update({ status: 'vivo', corral: 0 });
    } catch (e) { alert("Error: " + e.message); } finally { isProcessingCorral = false; }
};

function mostrarAlertaResultado(res) {
    if(!corralPlayer || corralPlayer.corral === 0) return;
    const modal = document.getElementById('corral-result-modal');
    const card = document.getElementById('corral-result-card');
    const icon = document.getElementById('corral-result-icon');
    const title = document.getElementById('corral-result-title');
    const text = document.getElementById('corral-result-text');
    const win = corralPlayer.corral === res.gana;

    if (win) {
        card.className = "bg-gray-900 border-2 border-green-500 rounded-xl w-full max-w-sm p-6 shadow-lg text-center";
        icon.className = "inline-block p-4 rounded-full border-2 border-green-500 bg-green-900/50 mb-4 text-5xl text-green-400";
        icon.innerHTML = '<i class="fas fa-check"></i>';
        title.className = "text-green-400 font-black text-2xl tracking-widest uppercase mb-2";
        title.innerText = "¡SOBREVIVISTE! ✅";
        text.innerHTML = `Salió el <b>${res.animal} - ${res.nombre}</b>.<br>Tu corral se salvó. Prepárate para elegir de nuevo.`;
    } else {
        card.className = "bg-gray-900 border-2 border-red-600 rounded-xl w-full max-w-sm p-6 shadow-lg text-center";
        icon.className = "inline-block p-4 rounded-full border-2 border-red-600 bg-red-900/50 mb-4 text-5xl text-red-500";
        icon.innerHTML = '<i class="fas fa-skull"></i>';
        title.className = "text-red-500 font-black text-2xl tracking-widest uppercase mb-2";
        title.innerText = "¡ELIMINADO! 💀";
        text.innerHTML = `Salió el <b>${res.animal} - ${res.nombre}</b>.<br>El Verdugo masacró tu corral.`;
    }
    modal.classList.remove('hidden');
}

window.cerrarModalResultado = function() {
    document.getElementById('corral-result-modal').classList.add('hidden');
};
