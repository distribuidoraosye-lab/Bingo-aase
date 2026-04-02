/* ============================================================
   BINGO TEXIER - MÓDULO VIP BLACK (vip7rayos.js)
   Descripción: Sistema de Tickets Premium, Doble Saldo, Retiro Fraccionado (25%) y Racha Visual.
   ============================================================ */

let vipConfig = { tasa: 0, fecha_activa: null };
let vipUserData = { saldo_vip: 0, balance_general: 0, last_transfer: 0, streak: 0, ticket_hoy: 0 };
let currentVipTicket = null;
let serverOffset = 0;
let isProcessingVip = false;

// Obtener la diferencia de tiempo con el servidor de Firebase (Antitrampas)
firebase.database().ref('.info/serverTimeOffset').on('value', function(snapshot) {
    serverOffset = snapshot.val() || 0;
});

function getServerTime() {
    return Date.now() + serverOffset;
}

// --- 1. INYECCIÓN DINÁMICA DEL HTML ---
function injectVipHTML() {
    const containerWrapper = document.querySelector('.container-wrapper');
    if(!containerWrapper || document.getElementById('section-vip')) return;

    const vipSection = document.createElement('div');
    vipSection.id = 'section-vip';
    vipSection.className = 'hidden';
    vipSection.style.display = 'none';
    
    // HTML de la sección VIP
    vipSection.innerHTML = `
    <div class="flex justify-between items-center mb-4">
        <button onclick="location.reload()" class="text-xs text-gray-400 hover:text-white transition"><i class="fas fa-arrow-left"></i> Volver al Menú</button>
    </div>
    
    <div class="bg-gray-900 border border-yellow-600 shadow-2xl rounded-xl overflow-hidden relative flex flex-col mb-6">
        
        <div class="bg-black p-4 flex justify-between items-center border-b border-yellow-600 shadow-md z-20">
            <h3 class="font-black text-lg text-yellow-500 tracking-widest flex items-center">
                <i class="fas fa-crown mr-2 text-xl"></i> BLACK TEXIER
            </h3>
            <span class="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">Tasa: <span id="vip-tasa-display">...</span></span>
        </div>

        <div class="p-4 flex-1">
            
            <div class="bg-gradient-to-b from-gray-800 to-black rounded-xl p-4 border border-gray-700 shadow-inner mb-5">
                <div class="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
                    <div>
                        <span class="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Tu B\u00F3veda VIP</span>
                        <span id="vip-vault-display" class="text-2xl font-black text-green-400 shadow-sm">$0.00</span>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Saldo General</span>
                        <span id="vip-general-display" class="text-lg font-bold text-white">Bs 0.00</span>
                    </div>
                </div>
                
                <div class="flex flex-col items-center">
                    <span class="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Racha Semanal</span>
                    <div id="vip-streak-container" class="flex gap-2">
                        </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 relative shadow-lg mb-5">
                <div class="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h4 class="font-bold text-yellow-500 text-sm tracking-wide"><i class="fas fa-ticket-alt mr-1"></i> TICKET DEL D\u00CDA</h4>
                    <span id="vip-status-badge" class="text-[10px] font-black uppercase px-2 py-1 rounded bg-gray-700 text-gray-400 border border-gray-600">ESPERANDO JUGADA</span>
                </div>
                
                <div id="vip-ticket-candado" class="absolute inset-0 bg-gray-900/90 z-10 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm border border-yellow-600/30">
                    <i class="fas fa-lock text-5xl text-yellow-600 mb-2 opacity-80"></i>
                    <p class="text-yellow-500 font-black text-sm tracking-widest uppercase mb-1">Ticket Oculto</p>
                    <p class="text-gray-300 text-[10px] uppercase text-center px-4">Sella tu jugada para revelar los 9 datos fijos de hoy.</p>
                </div>
                
                <div id="vip-ticket-grid" class="grid grid-cols-3 gap-2">
                    </div>
            </div>

            <div id="vip-buy-section" class="space-y-4 mb-5">
                <p class="text-center text-xs text-gray-400 uppercase tracking-widest mb-2">\u00A1Gana x3 al instante!</p>
                
                <button onclick="comprarTicketVIP(2)" class="w-full relative overflow-hidden bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-xl border-2 border-gray-500 shadow-lg transition transform active:scale-95 flex justify-between items-center px-6">
                    <span class="text-gray-300"><i class="fas fa-play-circle mr-2"></i>TICKET $2</span>
                    <span class="text-green-400 bg-gray-900 px-3 py-1 rounded border border-gray-600">COBRAS $6</span>
                </button>

                <button onclick="comprarTicketVIP(5)" class="w-full relative overflow-hidden bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-400 text-black font-black py-4 rounded-xl border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.4)] transition transform active:scale-95 flex justify-between items-center px-6">
                    <span class="flex items-center"><i class="fas fa-star mr-2"></i>TICKET $5</span>
                    <span class="text-black font-black bg-white/30 px-3 py-1 rounded border border-yellow-700">COBRAS $15</span>
                    <div class="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase">\uD83D\uDD25 Favorita</div>
                </button>

                <button onclick="comprarTicketVIP(10)" class="w-full relative overflow-hidden bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-xl border-2 border-gray-500 shadow-lg transition transform active:scale-95 flex justify-between items-center px-6">
                    <span class="text-gray-300"><i class="fas fa-gem mr-2"></i>TICKET $10</span>
                    <span class="text-green-400 bg-gray-900 px-3 py-1 rounded border border-gray-600">COBRAS $30</span>
                </button>
            </div>

            <button id="btn-traslado-vip" onclick="abrirModalTraslado()" class="w-full bg-blue-900 hover:bg-blue-800 border border-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition text-xs flex justify-center items-center tracking-widest uppercase">
                <i class="fas fa-exchange-alt mr-2"></i> Trasladar Ganancia
            </button>
        </div>
    </div>

    <div id="modal-traslado" class="hidden fixed inset-0 bg-black/80 z- flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-gray-900 border border-blue-500 rounded-xl w-full max-w-sm p-6 shadow-2xl relative">
            <button onclick="cerrarModalTraslado()" class="absolute top-3 right-3 text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
            
            <div class="text-center mb-6">
                <div class="inline-block p-3 bg-blue-900/50 rounded-full border border-blue-500 mb-3 text-blue-400 text-3xl">
                    <i class="fas fa-random"></i>
                </div>
                <h3 class="text-white font-black text-xl tracking-widest uppercase mb-1">Traslado VIP</h3>
                <p class="text-gray-400 text-xs">Para evitar abusos del sistema, solo puedes pasar el 25% de tu Saldo VIP al Saldo General cada 24 horas.</p>
            </div>
            
            <div class="bg-black rounded border border-gray-700 p-4 mb-6">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-500">Tu Saldo VIP:</span>
                    <span class="text-green-400 font-bold" id="modal-saldo-vip">$0.00</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-300 font-bold">Monto a pasar hoy (25%):</span>
                    <span class="text-white font-black text-lg" id="modal-monto-traslado">$0.00</span>
                </div>
                <p id="modal-warning" class="text-red-400 text-[10px] text-center mt-3 hidden">Necesitas acumular al menos $1.00 en tu cuota del 25% para poder transferir.</p>
                <p id="modal-time-warning" class="text-red-400 text-[10px] text-center mt-3 hidden">A\u00FAn no han pasado 24 horas desde tu \u00FAltimo traslado.</p>
            </div>
            
            <button id="btn-procesar-traslado" onclick="procesarTraslado()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded shadow transition uppercase tracking-widest">
                PASAR AL SALDO GENERAL
            </button>
        </div>
    </div>
    
    <div id="modal-exito-traslado" class="hidden fixed inset-0 bg-black/90 z- flex items-center justify-center p-4 backdrop-blur-md">
        <div class="bg-gray-900 border border-green-500 rounded-xl w-full max-w-sm p-6 shadow-2xl text-center transform transition-all scale-100">
            <div class="inline-block p-4 bg-green-900/50 rounded-full border border-green-500 mb-4 text-green-400 text-4xl animate-bounce">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="text-white font-black text-2xl tracking-widest uppercase mb-2">\u00A1TRASLADO EXITOSO!</h3>
            <p class="text-gray-300 text-sm mb-6">El dinero ya est\u00E1 disponible en tu Saldo General (Bs).</p>
            
            <button onclick="irABingo()" class="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.4)] transition uppercase tracking-widest text-sm">
                <i class="fas fa-dice text-lg mr-2"></i> IR A COMPRAR CARTONES
            </button>
            <button onclick="document.getElementById('modal-exito-traslado').classList.add('hidden')" class="mt-4 text-gray-500 text-xs hover:text-white transition uppercase">
                Cerrar y volver al VIP
            </button>
        </div>
    </div>
    `;
    
    containerWrapper.appendChild(vipSection);
}

// Ejecutar inyección
if(document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', injectVipHTML); } 
else { injectVipHTML(); }

window.openVipSection = function() {
    const gs = document.getElementById('game-selector'); if(gs) gs.classList.add('hidden');
    const mb = document.getElementById('main-live-btn'); if(mb) mb.classList.add('hidden');
    const sv = document.getElementById('section-vip'); if(sv) { sv.classList.remove('hidden'); sv.style.display = 'block'; }
};

// --- 2. L\u00D3GICA Y FIREBASE ---
firebase.auth().onAuthStateChanged(function(user) {
    if (user) setTimeout(initVIPSystem, 1000); 
});

function initVIPSystem() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    db.ref('vip_config').on('value', s => {
        if (s.exists()) {
            vipConfig = s.val();
            document.getElementById('vip-tasa-display').textContent = vipConfig.tasa.toFixed(2);
            listenToTodayTicket();
        }
    });

    db.ref(`users/${uid}`).on('value', s => {
        if (s.exists()) {
            const data = s.val();
            // CORRECCIÓN AQUÍ: Usamos data.balance en lugar de data.saldo para sincronizar con la app principal
            vipUserData.balance_general = data.balance || 0; 
            vipUserData.saldo_vip = data.saldo_vip || 0;
            vipUserData.last_transfer = data.last_vip_transfer || 0;
            vipUserData.streak = data.vip_streak || 0;
            vipUserData.ticket_hoy = data.ticket_hoy || 0;
            actualizarUIUsuario();
        }
    });
}

function listenToTodayTicket() {
    if (!vipConfig.fecha_activa) return;
    db.ref(`vip_tickets/${vipConfig.fecha_activa}`).on('value', s => {
        currentVipTicket = s.exists() ? s.val() : null;
        renderVipTicketUI();
    });
}

function actualizarUIUsuario() {
    document.getElementById('vip-vault-display').textContent = `$${parseFloat(vipUserData.saldo_vip).toFixed(2)}`;
    // Muestra el saldo general en Bs para que coincida visualmente con el top de la página
    document.getElementById('vip-general-display').textContent = `Bs ${parseFloat(vipUserData.balance_general).toFixed(2)}`;
    
    // Racha Visual
    const streakContainer = document.getElementById('vip-streak-container');
    streakContainer.innerHTML = '';
    for(let i=1; i<=7; i++) {
        const color = i <= vipUserData.streak ? 'text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]' : 'text-gray-700';
        streakContainer.innerHTML += `<i class="fas fa-fire ${color} text-sm"></i>`;
    }

    // Estado del ticket
    const candado = document.getElementById('vip-ticket-candado');
    const buySection = document.getElementById('vip-buy-section');
    const statusBadge = document.getElementById('vip-status-badge');

    if(vipUserData.ticket_hoy > 0) {
        candado.classList.add('hidden');
        buySection.classList.add('hidden');
        statusBadge.textContent = `TICKET ACTIVO: $${vipUserData.ticket_hoy}`;
        statusBadge.className = "text-[10px] font-black uppercase px-2 py-1 rounded bg-green-900 text-green-400 border border-green-600";
    } else {
        candado.classList.remove('hidden');
        buySection.classList.remove('hidden');
        statusBadge.textContent = "ESPERANDO JUGADA";
        statusBadge.className = "text-[10px] font-black uppercase px-2 py-1 rounded bg-gray-700 text-gray-400 border border-gray-600";
    }
}

function renderVipTicketUI() {
    const grid = document.getElementById('vip-ticket-grid');
    if (!currentVipTicket) {
        grid.innerHTML = '<p class="text-center text-gray-500 col-span-3 py-6 text-xs uppercase tracking-widest"><i class="fas fa-clock mb-2 text-xl block"></i> Ticket de hoy en preparaci\u00F3n</p>';
        return;
    }

    let html = '';
    const lottoImgs = {
        'lotto': 'https://bingotexier.com/archivos/imagenes/b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png',
        'granjita': 'https://bingotexier.com/archivos/imagenes/21e0b011b246a96b2561eeea537bcc519ab647a9.jpeg',
        'selva': 'https://i.imgur.com/MbtPoOD.png'
    };

    const buildCol = (title, imgPath, dataArray) => {
        let colHtml = `<div class="bg-gray-900 p-2 border border-gray-700 rounded text-center"><img src="${imgPath}" class="w-8 h-8 mx-auto rounded-full mb-2 border border-gray-500"><h4 class="text-[9px] font-bold text-gray-400 mb-2 border-b border-gray-700 pb-1 uppercase">${title}</h4>`;
        dataArray.forEach((idAnimal) => {
            let aInfo = { i: '\u2753', n: '?' }; 
            if(typeof ANIMAL_MAP_LOTTO !== 'undefined' && ANIMAL_MAP_LOTTO[idAnimal]) aInfo = ANIMAL_MAP_LOTTO[idAnimal];
            colHtml += `<div class="border border-gray-600 bg-black rounded p-1 mb-2 flex flex-col items-center"><span class="text-xl leading-none mt-1">${aInfo.i}</span><span class="text-[10px] font-black mt-1 text-gray-300">${idAnimal}</span></div>`;
        });
        colHtml += `</div>`; return colHtml;
    };

    html += buildCol('Lotto', lottoImgs['lotto'], currentVipTicket.lotto);
    html += buildCol('Granjita', lottoImgs['granjita'], currentVipTicket.granjita);
    html += buildCol('Selva', lottoImgs['selva'], currentVipTicket.selva);
    grid.innerHTML = html;
}

window.comprarTicketVIP = async (montoUSD) => {
    if (isProcessingVip) return;
    if (!currentVipTicket) return alert("\u26A0\uFE0F El ticket de hoy a\u00FAn no est\u00E1 disponible.");
    
    const costoBs = montoUSD * vipConfig.tasa;
    // CORRECCIÓN AQUÍ: Valida contra balance_general
    if (vipUserData.balance_general < costoBs) return alert(`\u274C Saldo General insuficiente. Necesitas Bs ${costoBs.toFixed(2)}.`);

    if(confirm(`\u00BFConfirmas la compra del Ticket VIP de $${montoUSD}?\nSe descontar\u00E1n Bs ${costoBs.toFixed(2)} de tu Saldo General.`)) {
        isProcessingVip = true;
        try {
            const uid = auth.currentUser.uid;
            // CORRECCIÓN AQUÍ: Descuenta de 'balance'
            await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - costoBs);
            await db.ref(`users/${uid}/ticket_hoy`).set(montoUSD);
            
            // Subir racha m\u00E1ximo hasta 7
            let nuevaRacha = vipUserData.streak + 1;
            if(nuevaRacha > 7) nuevaRacha = 7;
            await db.ref(`users/${uid}/vip_streak`).set(nuevaRacha);

            if (navigator.vibrate) navigator.vibrate();
            
            alert("\u2705 \u00A1TICKET COMPRADO! Mucho \u00E9xito en los sorteos.");
        } catch(e) {
            alert("Error de conexi\u00F3n: " + e.message);
        } finally {
            isProcessingVip = false;
        }
    }
};

window.abrirModalTraslado = () => {
    const btn = document.getElementById('btn-procesar-traslado');
    const warningMin = document.getElementById('modal-warning');
    const warningTime = document.getElementById('modal-time-warning');
    
    const saldoVIP = parseFloat(vipUserData.saldo_vip);
    const traslado = saldoVIP * 0.25;
    
    document.getElementById('modal-saldo-vip').textContent = `$${saldoVIP.toFixed(2)}`;
    document.getElementById('modal-monto-traslado').textContent = `$${traslado.toFixed(2)}`;
    
    btn.disabled = false;
    btn.className = "w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded shadow transition uppercase tracking-widest";
    warningMin.classList.add('hidden');
    warningTime.classList.add('hidden');

    if(traslado < 1.00) {
        btn.disabled = true;
        btn.className = "w-full bg-gray-700 text-gray-500 font-black py-3 rounded uppercase tracking-widest cursor-not-allowed";
        warningMin.classList.remove('hidden');
    }

    const ahora = getServerTime();
    const diferenciaMs = ahora - vipUserData.last_transfer;
    const hrs24Ms = 24 * 60 * 60 * 1000;
    
    if(diferenciaMs < hrs24Ms && vipUserData.last_transfer !== 0) {
        btn.disabled = true;
        btn.className = "w-full bg-gray-700 text-gray-500 font-black py-3 rounded uppercase tracking-widest cursor-not-allowed";
        warningTime.classList.remove('hidden');
    }

    document.getElementById('modal-traslado').classList.remove('hidden');
};

window.cerrarModalTraslado = () => {
    document.getElementById('modal-traslado').classList.add('hidden');
};

window.procesarTraslado = async () => {
    if(isProcessingVip) return;
    isProcessingVip = true;
    const btn = document.getElementById('btn-procesar-traslado');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';

    const saldoVIP = parseFloat(vipUserData.saldo_vip);
    const montoTrasladoUSD = saldoVIP * 0.25;
    const montoBs = montoTrasladoUSD * vipConfig.tasa; 
    
    try {
        const uid = auth.currentUser.uid;
        await db.ref(`users/${uid}/saldo_vip`).transaction(s => Math.max(0, (s || 0) - montoTrasladoUSD));
        // CORRECCIÓN AQUÍ: Suma a 'balance' para que le aparezca arriba a la persona
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) + montoBs);
        await db.ref(`users/${uid}/last_vip_transfer`).set(firebase.database.ServerValue.TIMESTAMP);

        cerrarModalTraslado();
        document.getElementById('modal-exito-traslado').classList.remove('hidden');
    } catch(e) {
        alert("Error procesando traslado: " + e.message);
    } finally {
        isProcessingVip = false;
        btn.innerHTML = 'PASAR AL SALDO GENERAL';
    }
};

window.irABingo = () => {
    document.getElementById('modal-exito-traslado').classList.add('hidden');
    document.getElementById('section-vip').style.display = 'none';
    const gs = document.getElementById('game-selector');
    if(gs) gs.classList.remove('hidden');
};
