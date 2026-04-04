/* ============================================================
   BINGO TEXIER - M\u00D3DULO EL CORRAL (corralolokun4.js)
   Descripci\u00F3n: Supervivencia 50/50 con monitor de pista.
   Privacidad: Nombres y Tel\u00E9fonos enmascarados.
   Estado: 100% Unicode - Cero Emojis Literales.
   ============================================================ */

let corralConfig = { ronda: 1, recompra_activa: true, pozo: "0.00", precio: 0, precio_recompra: 0, isOpen: true, lastResult: null };
let corralPlayer = null; 
let allCorralPlayers = {}; 
let corralUserBalance = 0;
let lastResultSeen = 0;
let isProcessingCorral = false;

// 1. FUNCIONES DE INICIO Y NAVEGACI\u00D3N
window.openCorralSection = function() {
    const gs = document.getElementById('game-selector'); if(gs) gs.classList.add('hidden');
    const mb = document.getElementById('main-live-btn'); if(mb) mb.classList.add('hidden');
    const sv = document.getElementById('section-corral'); if(sv) { 
        sv.classList.remove('hidden'); 
        sv.style.display = 'block'; 
    }
    renderCorralUI();
};

window.cerrarCorral = function() {
    document.getElementById('section-corral').style.display = 'none';
    const gs = document.getElementById('game-selector'); if(gs) gs.classList.remove('hidden');
    const mb = document.getElementById('main-live-btn'); if(mb) mb.classList.remove('hidden');
};

// 2. SINCRONIZACI\u00D3N CON FIREBASE
firebase.auth().onAuthStateChanged(function(user) {
    if (user) setTimeout(initCorralSystem, 1000); 
});

function initCorralSystem() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    // Escuchar configuraci\u00F3n global
    db.ref('corral_game/config').on('value', s => {
        if (s.exists()) {
            corralConfig = s.val();
            const pzDisp = document.getElementById('corral-pozo-display');
            const rdDisp = document.getElementById('corral-ronda-display');
            if(pzDisp) pzDisp.textContent = corralConfig.pozo;
            if(rdDisp) rdDisp.textContent = corralConfig.ronda;

            // Detectar nuevo sorteo para mostrar alerta
            if (corralConfig.lastResult && corralConfig.lastResult.timestamp !== lastResultSeen && corralPlayer) {
                lastResultSeen = corralConfig.lastResult.timestamp;
                mostrarAlertaResultado(corralConfig.lastResult);
            }
            renderCorralUI(); 
        }
    });

    // Escuchar todos los jugadores para el monitor de la pista
    db.ref('corral_game/players').on('value', s => {
        allCorralPlayers = s.val() || {};
        corralPlayer = allCorralPlayers[uid] || null;
        renderCorralUI();
        updatePistaMonitor();
    });

    // Escuchar saldo del usuario
    db.ref(`users/${uid}/balance`).on('value', s => {
        corralUserBalance = s.val() || 0;
        const bDisp = document.getElementById('corral-balance-disp');
        if(bDisp) bDisp.textContent = corralUserBalance.toFixed(2);
    });
}

// 3. RENDERIZADO DE LA INTERFAZ (M\u00E1quina de Estados)
function renderCorralUI() {
    const area = document.getElementById('corral-game-area');
    if (!area) return;

    // ESTADO: GANADOR ABSOLUTO
    const survivors = Object.values(allCorralPlayers).filter(p => p.status === 'vivo');
    if (survivors.length === 1 && corralPlayer && survivors.phone === corralPlayer.phone && corralConfig.ronda > 1) {
        area.innerHTML = `
            <div class="text-center w-full animate-bounce">
                <div class="text-6xl mb-4">\uD83D\uDC51</div>
                <h4 class="text-white font-black text-3xl uppercase tracking-widest mb-2">\u00A1ERES EL GANADOR!</h4>
                <p class="text-yellow-400 font-bold text-lg mb-6">Pote Ganado: $${corralConfig.pozo}</p>
                <div class="bg-green-900/30 border border-green-500 p-3 rounded-lg">
                    <p class="text-green-400 text-[10px] uppercase font-bold">El premio ser\u00E1 acreditado por el administrador</p>
                </div>
            </div>
        `;
        return;
    }

    // ESTADO: NO PARTICIPA
    if (!corralPlayer) {
        let txtPrecio = corralConfig.precio > 0 ? `Bs ${corralConfig.precio.toFixed(2)}` : '\u00A1ENTRADA GRATIS!';
        area.innerHTML = `
            <div class="text-5xl mb-4 text-gray-700">\uD83C\uDFAB</div>
            <h4 class="text-white font-bold text-lg uppercase tracking-widest mb-2">Entra al Corral</h4>
            <p class="text-gray-400 text-xs text-center mb-6">Sobrevive a las rondas y ll\u00E9vate el pozo acumulado.</p>
            <button onclick="participarCorral()" class="w-full max-w-xs bg-gradient-to-r from-orange-500 to-orange-700 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 uppercase tracking-widest text-sm border-b-4 border-orange-900">
                PAGAR ENTRADA - ${txtPrecio}
            </button>
        `;
        return;
    }

    // ESTADO: VIVO - DEBE ELEGIR
    if (corralPlayer.status === 'vivo' && corralPlayer.corral === 0) {
        area.innerHTML = `
            <div class="text-center w-full animate-bounce-in">
                <h4 class="text-white font-black text-xl uppercase tracking-widest mb-1">TOMA TU DECISI\u00D3N</h4>
                <p class="text-orange-400 text-xs font-bold mb-6">Ronda ${corralConfig.ronda} \u2022 \u00BFD\u00F3nde te escondes?</p>
                <div class="grid grid-cols-2 gap-4 w-full">
                    <button onclick="seleccionarCorral(1)" class="bg-orange-900/40 hover:bg-orange-800/60 border-2 border-orange-500 rounded-xl p-4 flex flex-col items-center transition transform active:scale-95 group shadow-lg">
                        <div class="text-4xl mb-2 group-hover:scale-110 transition">\uD83D\uDC0E</div>
                        <span class="text-white font-black tracking-widest uppercase">CORRAL 1</span>
                        <span class="text-orange-300 text-[9px] font-bold mt-1">(Del 1 al 13)</span>
                    </button>
                    <button onclick="seleccionarCorral(2)" class="bg-blue-900/40 hover:bg-blue-800/60 border-2 border-blue-500 rounded-xl p-4 flex flex-col items-center transition transform active:scale-95 group shadow-lg">
                        <div class="text-4xl mb-2 group-hover:scale-110 transition">\uD83D\uDC13</div>
                        <span class="text-white font-black tracking-widest uppercase">CORRAL 2</span>
                        <span class="text-blue-300 text-[9px] font-bold mt-1">(Del 14 al 26)</span>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // ESTADO: VIVO - ESPERANDO
    if (corralPlayer.status === 'vivo' && corralPlayer.corral > 0) {
        const nC = corralPlayer.corral === 1 ? "CORRAL 1" : "CORRAL 2";
        const cC = corralPlayer.corral === 1 ? "text-orange-400" : "text-blue-400";
        area.innerHTML = `
            <div class="text-center w-full animate-pulse-fast">
                <div class="text-5xl mb-4 text-gray-600">\uD83D\uDD12</div>
                <h4 class="text-white font-black text-lg uppercase tracking-widest mb-1">DECISI\u00D3N SELLADA</h4>
                <p class="text-gray-400 text-sm mb-6">Est\u00E1s en el <span class="font-black ${cC}">${nC}</span></p>
                <div class="bg-black/50 border border-gray-700 p-4 rounded-xl">
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest">Espera el sorteo en el grupo.<br>Si sale tu corral, pasas a la Ronda ${corralConfig.ronda + 1}.</p>
                </div>
            </div>
        `;
        return;
    }

    // ESTADO: MUERTO
    if (corralPlayer.status === 'muerto') {
        if (corralConfig.recompra_activa) {
            area.innerHTML = `
                <div class="text-center w-full animate-bounce-in">
                    <div class="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">\uD83D\uDC80</div>
                    <h4 class="text-white font-black text-2xl uppercase tracking-widest mb-1">\u00A1HAS MUERTO!</h4>
                    <p class="text-gray-400 text-xs mb-6 uppercase tracking-widest">El Verdugo te elimin\u00F3.</p>
                    <div class="bg-red-900/20 border border-red-800 p-3 rounded-xl mb-6 text-[10px] text-red-400 font-bold uppercase">
                        \uD83D\uDEF0\uFE0F Salvavidas habilitado por el Admin
                    </div>
                    <button onclick="recomprarCorral()" class="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 uppercase tracking-widest text-sm border-b-4 border-green-900">
                        REVIVIR - Bs ${corralConfig.precio_recompra.toFixed(2)}
                    </button>
                </div>
            `;
        } else {
            area.innerHTML = `
                <div class="text-center w-full opacity-80 grayscale">
                    <div class="text-7xl mb-4 text-gray-600">\uD83E\uDEA6</div>
                    <h4 class="text-red-500 font-black text-2xl uppercase tracking-widest mb-1">ELIMINADO</h4>
                    <p class="text-gray-400 text-sm mb-4">Muerte S\u00DAbita activada.</p>
                    <div class="bg-black border border-gray-800 p-3 rounded-lg inline-block">
                        <span class="text-[10px] text-red-600 font-bold uppercase tracking-widest">RONDA CERRADA - SIN RECOMPRAS</span>
                    </div>
                </div>
            `;
        }
        return;
    }
}

// 4. MONITOR DE LA PISTA (Privacidad con asteriscos)
function updatePistaMonitor() {
    // Si no existe el contenedor del monitor, lo inyectamos din\u00E1micamente al final de la secci\u00F3n
    let monitor = document.getElementById('corral-live-monitor');
    if(!monitor) {
        const areaMain = document.getElementById('section-corral');
        const mDiv = document.createElement('div');
        mDiv.id = 'corral-live-monitor';
        mDiv.className = 'mt-4 p-4 bg-gray-900/80 rounded-xl border border-gray-700 shadow-inner';
        areaMain.querySelector('.bg-gray-900').appendChild(mDiv);
        monitor = mDiv;
    }

    let h1 = '', h2 = '', c1 = 0, c2 = 0;
    
    Object.values(allCorralPlayers).forEach(p => {
        if(p.status === 'vivo' && p.corral > 0) {
            // Enmascarar tel\u00E9fono: 04121234567 -> 0412****4567
            const masked = p.phone ? p.phone.replace(/(\d{4})\d{4}(\d{3})/, "$1****$2") : '****';
            const item = `<div class="flex justify-between items-center text-[10px] border-b border-white/5 py-1">
                <span class="text-gray-300 font-bold truncate w-24">${p.name}</span>
                <span class="text-gray-500 font-mono">${masked}</span>
            </div>`;
            
            if(p.corral === 1) { h1 += item; c1++; } 
            else { h2 += item; c2++; }
        }
    });

    monitor.innerHTML = `
        <h5 class="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 text-center">\uD83D\uDC65 JUGADORES EN PISTA</h5>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <p class="text-[9px] font-bold text-orange-400 mb-2 border-b border-orange-500/30 pb-1">CORRAL 1 (${c1})</p>
                <div class="max-h-32 overflow-y-auto pr-1 custom-scrollbar">${h1 || '<p class="text-gray-700 italic">Vac\u00EDo</p>'}</div>
            </div>
            <div>
                <p class="text-[9px] font-bold text-blue-400 mb-2 border-b border-blue-500/30 pb-1">CORRAL 2 (${c2})</p>
                <div class="max-h-32 overflow-y-auto pr-1 custom-scrollbar">${h2 || '<p class="text-gray-700 italic">Vac\u00EDo</p>'}</div>
            </div>
        </div>
    `;
}

// 5. ACCIONES DEL JUGADOR (Con validaciones)
window.participarCorral = async () => {
    if(isProcessingCorral) return;
    const uid = auth.currentUser.uid;
    const precio = corralConfig.precio;

    if(corralUserBalance < precio) return alert(`Saldo insuficiente. Necesitas Bs ${precio.toFixed(2)}.`);
    if(!confirm(`\u00BFEntrar al Corral por Bs ${precio.toFixed(2)}?`)) return;

    isProcessingCorral = true;
    try {
        if(precio > 0) await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - precio);
        const uSnap = await db.ref(`users/${uid}`).once('value');
        const ud = uSnap.val() || {};
        await db.ref(`corral_game/players/${uid}`).set({
            status: 'vivo', corral: 0, name: ud.name || 'Jugador', phone: ud.phone || ''
        });
    } catch (e) { alert("Error: " + e.message); } finally { isProcessingCorral = false; }
};

window.seleccionarCorral = async (n) => {
    if(isProcessingCorral) return;
    isProcessingCorral = true;
    try {
        await db.ref(`corral_game/players/${auth.currentUser.uid}/corral`).set(n);
    } catch (e) { alert("Error: " + e.message); } finally { isProcessingCorral = false; }
};

window.recomprarCorral = async () => {
    if(isProcessingCorral) return;
    const uid = auth.currentUser.uid;
    const pRec = corralConfig.precio_recompra;

    if(corralUserBalance < pRec) return alert(`Saldo insuficiente.`);
    if(!confirm(`\u00BFRevivir por Bs ${pRec.toFixed(2)}?`)) return;

    isProcessingCorral = true;
    try {
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - pRec);
        await db.ref(`corral_game/players/${uid}`).update({ status: 'vivo', corral: 0 });
    } catch (e) { alert("Error: " + e.message); } finally { isProcessingCorral = false; }
};

// 6. ALERTAS VISUALES DE RESULTADO
function mostrarAlertaResultado(res) {
    if(!corralPlayer || corralPlayer.corral === 0) return;

    const modal = document.getElementById('corral-result-modal');
    const card = document.getElementById('corral-result-card');
    const icon = document.getElementById('corral-result-icon');
    const title = document.getElementById('corral-result-title');
    const text = document.getElementById('corral-result-text');

    const win = corralPlayer.corral === res.gana;

    if (win) {
        card.className = "bg-gray-900 border-2 border-green-500 rounded-xl w-full max-w-sm p-6 shadow-2xl text-center";
        icon.className = "inline-block p-4 rounded-full border-2 border-green-500 bg-green-900/50 mb-4 text-5xl text-green-400";
        icon.innerHTML = '\u2705';
        title.className = "text-green-400 font-black text-2xl uppercase mb-2";
        title.innerText = "\u00A1SOBREVIVISTE!";
        text.innerHTML = `Sali\u00F3 el <b>${res.animal} - ${res.nombre}</b>.<br>Prep\u00E1rate para la siguiente ronda.`;
    } else {
        card.className = "bg-gray-900 border-2 border-red-600 rounded-xl w-full max-w-sm p-6 shadow-2xl text-center";
        icon.className = "inline-block p-4 rounded-full border-2 border-red-600 bg-red-900/50 mb-4 text-5xl text-red-500";
        icon.innerHTML = '\u2620\uFE0F';
        title.className = "text-red-500 font-black text-2xl uppercase mb-2";
        title.innerText = "\u00A1FUISTE ELIMINADO!";
        text.innerHTML = `Sali\u00F3 el <b>${res.animal} - ${res.nombre}</b>.<br>El Corral ha sido masacrado.`;
    }
    modal.classList.remove('hidden');
}

window.cerrarModalResultado = function() {
    document.getElementById('corral-result-modal').classList.add('hidden');
};
