/* ============================================================
   BINGO TEXIER - MÓDULO EL CORRAL (Supervivencia)
   Descripción: Módulo inyectable para el jugador. 
   ============================================================ */

let corralConfig = { ronda: 1, recompra_activa: true, pozo: "0.00", precio: 0, precio_recompra: 0, isOpen: true, lastResult: null };
let corralPlayer = null; // { status: 'vivo'|'muerto', corral: 0|1|2 }
let corralUserBalance = 0;
let lastResultSeen = 0;
let isProcessingCorral = false;

// 1. INYECTAR EL HTML AL INICIAR
function injectCorralHTML() {
    const containerWrapper = document.querySelector('.container-wrapper');
    if(!containerWrapper || document.getElementById('section-corral')) return;

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
                    <li>En cada ronda, debes elegir un Corral para sobrevivir.</li>
                    <li><b>Corral 1:</b> Si sale un animalito del 1 al 13, sobrevives.</li>
                    <li><b>Corral 2:</b> Si sale un animalito del 14 al 26, sobrevives.</li>
                    <li>Si sale un animalito del corral contrario, quedas <span class="text-red-400 font-bold">ELIMINADO</span>.</li>
                    <li>¡El último jugador en pie se lleva todo el pozo!</li>
                </ul>
            </div>
        </div>

        <div id="corral-game-area" class="p-6 flex-1 min-h-[300px] flex flex-col justify-center items-center relative">
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

// 2. ABRIR / CERRAR MÓDULO
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

// 3. INICIALIZAR SISTEMA
if(document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', injectCorralHTML); } 
else { injectCorralHTML(); }

firebase.auth().onAuthStateChanged(function(user) {
    if (user) setTimeout(initCorralSystem, 1000); 
});

function initCorralSystem() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    // Escuchar Configuración Global del Corral
    db.ref('corral_game/config').on('value', s => {
        if (s.exists()) {
            const oldConfig = JSON.parse(JSON.stringify(corralConfig));
            corralConfig = s.val();
            
            document.getElementById('corral-pozo-display').textContent = corralConfig.pozo;
            document.getElementById('corral-ronda-display').textContent = corralConfig.ronda;

            // Detectar si hubo un nuevo resultado masivo
            if (corralConfig.lastResult && corralConfig.lastResult.timestamp !== lastResultSeen && corralPlayer) {
                lastResultSeen = corralConfig.lastResult.timestamp;
                mostrarAlertaResultado(corralConfig.lastResult);
            }
            renderCorralUI(); 
        }
    });

    // Escuchar Jugador
    db.ref(`corral_game/players/${uid}`).on('value', s => {
        corralPlayer = s.exists() ? s.val() : null;
        renderCorralUI();
    });

    // Escuchar Saldo del Usuario
    db.ref(`users/${uid}/balance`).on('value', s => {
        corralUserBalance = s.val() || 0;
        const balanceDisp = document.getElementById('corral-balance-disp');
        if(balanceDisp) balanceDisp.textContent = corralUserBalance.toFixed(2);
    });
}

// 4. MÁQUINA DE ESTADOS (RENDER UI)
function renderCorralUI() {
    const area = document.getElementById('corral-game-area');
    if (!area) return;

    // ESTADO 0: No está participando
    if (!corralPlayer) {
        let precioTexto = corralConfig.precio > 0 ? `Bs ${corralConfig.precio.toFixed(2)}` : '¡ENTRADA GRATIS!';
        area.innerHTML = `
            <i class="fas fa-ticket-alt text-6xl text-gray-700 mb-4"></i>
            <h4 class="text-white font-bold text-lg uppercase tracking-widest mb-2">Entra al Corral</h4>
            <p class="text-gray-400 text-xs text-center mb-6">Únete a la supervivencia. El último en pie se lleva el pozo acumulado.</p>
            <button onclick="participarCorral()" class="w-full max-w-xs bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)] transition transform active:scale-95 uppercase tracking-widest text-sm border-b-4 border-orange-900">
                PAGAR ENTRADA - ${precioTexto}
            </button>
        `;
        return;
    }

    // ESTADO 1: Participando, VIVO, pero en el Limbo (Tiene que elegir)
    if (corralPlayer.status === 'vivo' && corralPlayer.corral === 0) {
        area.innerHTML = `
            <div class="text-center w-full animate-bounce-in">
                <h4 class="text-white font-black text-xl uppercase tracking-widest mb-1 text-center">TOMA TU DECISIÓN</h4>
                <p class="text-orange-400 text-xs font-bold mb-6 text-center">Ronda ${corralConfig.ronda} • Elige sabiamente</p>
                
                <div class="grid grid-cols-2 gap-4 w-full">
                    <button onclick="seleccionarCorral(1)" class="bg-orange-900/40 hover:bg-orange-800/60 border-2 border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center transition transform active:scale-95 group shadow-lg">
                        <i class="fas fa-horse-head text-4xl text-orange-400 mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-white font-black tracking-widest uppercase">CORRAL 1</span>
                        <span class="text-orange-300 text-[10px] font-bold mt-1">(Del 1 al 13)</span>
                    </button>
                    
                    <button onclick="seleccionarCorral(2)" class="bg-blue-900/40 hover:bg-blue-800/60 border-2 border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center transition transform active:scale-95 group shadow-lg">
                        <i class="fas fa-crow text-4xl text-blue-400 mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-white font-black tracking-widest uppercase">CORRAL 2</span>
                        <span class="text-blue-300 text-[10px] font-bold mt-1">(Del 14 al 26)</span>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // ESTADO 2: Participando, VIVO, Ya eligió corral (Esperando)
    if (corralPlayer.status === 'vivo' && corralPlayer.corral > 0) {
        const nombreCorral = corralPlayer.corral === 1 ? "CORRAL 1" : "CORRAL 2";
        const colorClass = corralPlayer.corral === 1 ? "text-orange-400" : "text-blue-400";
        const iconClass = corralPlayer.corral === 1 ? "fa-horse-head" : "fa-crow";
        
        area.innerHTML = `
            <div class="text-center w-full animate-pulse-fast">
                <i class="fas fa-lock text-5xl text-gray-600 mb-4"></i>
                <h4 class="text-white font-black text-lg uppercase tracking-widest mb-1">DECISIÓN SELLADA</h4>
                <p class="text-gray-400 text-sm mb-6">Estás esperando en el <span class="font-black ${colorClass}">${nombreCorral}</span></p>
                
                <div class="bg-black/50 border border-gray-700 p-4 rounded-xl">
                    <i class="fas ${iconClass} text-3xl ${colorClass} mb-2 opacity-50"></i>
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest">Atento al grupo de WhatsApp.<br>Si el animalito sorteado está en tu corral, pasas a la siguiente ronda.</p>
                </div>
            </div>
        `;
        return;
    }

    // ESTADO 3: MUERTO
    if (corralPlayer.status === 'muerto') {
        if (corralConfig.recompra_activa) {
            // Muerte con salvavidas
            area.innerHTML = `
                <div class="text-center w-full animate-bounce-in">
                    <i class="fas fa-skull text-6xl text-red-600 mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"></i>
                    <h4 class="text-white font-black text-2xl uppercase tracking-widest mb-1">¡MORISTE!</h4>
                    <p class="text-gray-400 text-sm mb-6">El Verdugo eliminó tu corral en esta ronda.</p>
                    
                    <div class="bg-red-900/20 border border-red-800 p-4 rounded-xl mb-6">
                        <p class="text-red-400 font-bold text-xs uppercase mb-2"><i class="fas fa-life-ring mr-1"></i> Salvavidas Disponible</p>
                        <p class="text-gray-300 text-[10px]">Aún puedes volver al juego pagando la recompra.</p>
                    </div>
                    
                    <button onclick="recomprarCorral()" class="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.4)] transition transform active:scale-95 uppercase tracking-widest text-sm">
                        REVIVIR AHORA - Bs ${corralConfig.precio_recompra.toFixed(2)}
                    </button>
                </div>
            `;
        } else {
            // Muerte Súbita (Ronda final, sin salvavidas)
            area.innerHTML = `
                <div class="text-center w-full opacity-80 grayscale">
                    <i class="fas fa-tombstone text-7xl text-gray-600 mb-4"></i>
                    <h4 class="text-red-500 font-black text-2xl uppercase tracking-widest mb-1">ESTÁS FUERA</h4>
                    <p class="text-gray-400 text-sm mb-4">Fuiste eliminado definitivamente.</p>
                    <div class="bg-black border border-gray-800 p-3 rounded-lg inline-block">
                        <span class="text-[10px] text-red-600 font-bold uppercase tracking-widest"><i class="fas fa-ban mr-1"></i> FASE DE MUERTE SÚBITA - NO HAY RECOMPRA</span>
                    </div>
                </div>
            `;
        }
        return;
    }
}

// 5. ACCIONES DEL JUGADOR
window.participarCorral = async () => {
    if(isProcessingCorral) return;
    const uid = auth.currentUser.uid;
    const precio = corralConfig.precio;

    if(corralUserBalance < precio) return alert(`Saldo insuficiente. Necesitas Bs ${precio.toFixed(2)}.`);
    if(!confirm(`¿Entrar a la Supervivencia por Bs ${precio.toFixed(2)}?`)) return;

    isProcessingCorral = true;
    try {
        if(precio > 0) await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - precio);
        
        // Obtener nombre y teléfono del usuario para el Admin
        const userSnap = await db.ref(`users/${uid}`).once('value');
        const userData = userSnap.val() || {};

        await db.ref(`corral_game/players/${uid}`).set({
            status: 'vivo',
            corral: 0,
            name: userData.name || 'Jugador',
            phone: userData.phone || ''
        });
        
        if (navigator.vibrate) navigator.vibrate(50);
    } catch (e) {
        alert("Error de conexión: " + e.message);
    } finally {
        isProcessingCorral = false;
    }
};

window.seleccionarCorral = async (numCorral) => {
    if(isProcessingCorral) return;
    const uid = auth.currentUser.uid;
    
    isProcessingCorral = true;
    try {
        await db.ref(`corral_game/players/${uid}/corral`).set(numCorral);
        if (navigator.vibrate) navigator.vibrate(50);
    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        isProcessingCorral = false;
    }
};

window.recomprarCorral = async () => {
    if(isProcessingCorral) return;
    const uid = auth.currentUser.uid;
    const precioRec = corralConfig.precio_recompra;

    if(corralUserBalance < precioRec) return alert(`Saldo insuficiente. La recompra cuesta Bs ${precioRec.toFixed(2)}.`);
    if(!confirm(`¿Revivir en el juego por Bs ${precioRec.toFixed(2)}?`)) return;

    isProcessingCorral = true;
    try {
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - precioRec);
        
        await db.ref(`corral_game/players/${uid}`).update({
            status: 'vivo',
            corral: 0 // Lo mandamos al limbo para que elija
        });
        
        if (navigator.vibrate) navigator.vibrate(); // Vibración de éxito
    } catch (e) {
        alert("Error de conexión: " + e.message);
    } finally {
        isProcessingCorral = false;
    }
};

// 6. ANIMACIONES DE RESULTADO (ALERTA VISUAL)
function mostrarAlertaResultado(resultado) {
    if(!corralPlayer || corralPlayer.corral === 0) return; // Si no estaba jugando en esa ronda, no mostramos nada

    const modal = document.getElementById('corral-result-modal');
    const card = document.getElementById('corral-result-card');
    const icon = document.getElementById('corral-result-icon');
    const title = document.getElementById('corral-result-title');
    const text = document.getElementById('corral-result-text');

    const fueGanador = corralPlayer.corral === resultado.gana;

    if (fueGanador) {
        card.className = "bg-gray-900 border-2 border-green-500 rounded-xl w-full max-w-sm p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] text-center transform scale-100";
        icon.className = "inline-block p-4 rounded-full border-2 border-green-500 bg-green-900/50 mb-4 text-5xl text-green-400";
        icon.innerHTML = '<i class="fas fa-check"></i>';
        title.className = "text-green-400 font-black text-2xl tracking-widest uppercase mb-2";
        title.innerText = "¡SOBREVIVISTE!";
        text.innerHTML = `Salió el <b>${resultado.animal} - ${resultado.nombre}</b>.<br>Tu corral se salva. Prepárate para elegir de nuevo.`;
        if (navigator.vibrate) navigator.vibrate();
    } else {
        card.className = "bg-gray-900 border-2 border-red-600 rounded-xl w-full max-w-sm p-6 shadow-[0_0_30px_rgba(220,38,38,0.4)] text-center transform scale-100";
        icon.className = "inline-block p-4 rounded-full border-2 border-red-600 bg-red-900/50 mb-4 text-5xl text-red-500";
        icon.innerHTML = '<i class="fas fa-skull"></i>';
        title.className = "text-red-500 font-black text-2xl tracking-widest uppercase mb-2";
        title.innerText = "¡FUISTE ELIMINADO!";
        text.innerHTML = `Salió el <b>${resultado.animal} - ${resultado.nombre}</b>.<br>El Verdugo masacró tu corral.`;
        if (navigator.vibrate) navigator.vibrate(500); // Vibración larga de muerte
    }

    modal.classList.remove('hidden');
}

window.cerrarModalResultado = function() {
    document.getElementById('corral-result-modal').classList.add('hidden');
}
