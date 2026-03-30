/* ============================================================
   BINGO TEXIER - MÓDULO VIP 7 RAYOS (vip7rayos.js)
   Descripción: Inyección dinámica de HTML, Control de membresías, tickets protegidos y cobros.
   ============================================================ */

// --- 1. INYECCIÓN DINÁMICA DEL HTML (Para no saturar el cuadro de texto) ---
function injectVipHTML() {
    const containerWrapper = document.querySelector('.container-wrapper');
    if(!containerWrapper || document.getElementById('section-vip')) return;

    const vipSection = document.createElement('div');
    vipSection.id = 'section-vip';
    vipSection.className = 'hidden';
    vipSection.style.display = 'none';
    
    // Todo el HTML de la sección VIP metido aquí (Comprimido y sin emojis literales)
    vipSection.innerHTML = `<div class="flex justify-between items-center mb-4"><button onclick="location.reload()" class="text-xs text-gray-500"><i class="fas fa-arrow-left"></i> Menú Principal</button></div><div class="bg-gray-900 border border-yellow-600 shadow-2xl rounded-xl overflow-hidden relative flex flex-col mb-6"><div class="bg-black p-4 flex justify-between items-center border-b border-yellow-600 shadow-md z-20"><h3 class="font-black text-lg text-yellow-500 tracking-widest flex items-center"><i class="fas fa-crown mr-2 text-xl"></i> BLACK TEXIER</h3></div><div class="p-4 flex-1"><div id="vip-locked-msg" class="text-center py-6"><div class="inline-block p-4 bg-gray-800 rounded-full border border-yellow-600 mb-4 shadow-lg"><i class="fas fa-lock text-5xl text-yellow-500"></i></div><h4 class="text-white font-black text-xl mb-2 tracking-wide uppercase">Club Privado</h4><p class="text-gray-400 text-sm mb-6 leading-relaxed">Asegura tu ganancia diaria con los datos fijos del sistema. <br><span class="text-yellow-500 font-bold">Si no ganas, te devolvemos tu jugada.</span></p><a href="https://wa.me/584220153364?text=Hola,%20quiero%20informaci%C3%B3n%20para%20unirme%20al%20Black%20Texier%20VIP" target="_blank" class="w-full inline-block bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition hover:bg-green-500 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"><i class="fab fa-whatsapp text-xl"></i> SOLICITAR ACCESO VIP</a></div><div id="vip-user-dashboard" class="hidden space-y-5"><div class="bg-black/60 rounded-xl p-4 border border-gray-700 flex justify-between items-center shadow-inner"><div class="flex flex-col"><span id="vip-level-badge" class="px-2 py-1 bg-yellow-500 text-black text-[10px] font-black rounded w-max mb-1 uppercase tracking-wider">NIVEL ...</span><span class="text-xs text-gray-400">Días Restantes: <b id="vip-days-display" class="text-white">--</b></span></div><div class="text-right border-l border-gray-700 pl-4"><span class="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Total Ganado</span><span id="vip-earnings-display" class="text-lg font-black text-green-400">Bs 0.00</span></div></div><div class="bg-gray-800 rounded-xl p-4 border border-gray-700 relative shadow-lg"><div class="flex justify-between items-center mb-4 border-b border-gray-700 pb-2"><h4 class="font-bold text-yellow-500 text-sm tracking-wide">TICKET DEL DÍA</h4><span class="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">Tasa: <span id="vip-tasa-display">...</span></span></div><div id="vip-ticket-candado" class="absolute inset-0 bg-gray-900/95 z-10 rounded-xl flex flex-col items-center justify-center backdrop-blur-md border border-yellow-600/30"><i class="fas fa-lock text-5xl text-yellow-600 mb-3 opacity-80"></i><p class="text-white font-black text-sm tracking-widest uppercase mb-1">Ticket Protegido</p><p class="text-gray-400 text-[10px] uppercase">Sella tu jugada para revelar</p></div><div id="vip-ticket-grid" class="grid grid-cols-3 gap-2"></div></div><div class="pt-2"><button id="btn-sellar-vip" onclick="procesarSelloVIP()" class="hidden w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] transition transform active:scale-95 text-sm flex justify-center items-center tracking-wide uppercase"><i class="fas fa-stamp mr-2 text-lg"></i> SELLAR TICKET HOY ($1)</button><button id="btn-cobrar-vip" class="hidden w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition transform active:scale-95 text-sm animate-pulse flex justify-center items-center tracking-wide uppercase">COBRAR PREMIO</button></div></div></div></div>`;
    
    containerWrapper.appendChild(vipSection);
}

// Ejecutar inyección al cargar el JS
if(document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', injectVipHTML); } 
else { injectVipHTML(); }

// Manejo del botón de apertura
window.openVipSection = function() {
    const gs = document.getElementById('game-selector');
    if(gs) gs.classList.add('hidden');
    const mb = document.getElementById('main-live-btn');
    if(mb) mb.classList.add('hidden');
    const sv = document.getElementById('section-vip');
    if(sv) { sv.classList.remove('hidden'); sv.style.display = 'block'; }
};

// Auto-arranque al detectar el usuario
firebase.auth().onAuthStateChanged(function(user) {
    if (user) setTimeout(initVIPSystem, 1500); // 1.5s de espera para asegurar que firebase esté listo
});

// --- 2. LÓGICA DEL VIP ---
const VIP_LEVELS = { 'bronce': { prize: 5 }, 'plata': { prize: 10 }, 'oro': { prize: 20 } };

let vipConfig = { tasa: 0, fecha_activa: null };
let vipUserData = { active: false, level: 'bronce', days_left: 0, earnings: 0 };
let currentVipTicket = null;
let myDailyVipBet = null;
let vipResults = { lotto: null, granjita: null, selva: null };
let isProcessingVip = false;

function initVIPSystem() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    db.ref('vip_config').on('value', s => {
        if (s.exists()) {
            vipConfig = s.val();
            updateVipUIConfig();
            listenToTodayTicket();
            listenToMyVipBet();
            listenToVipResults();
        }
    });

    db.ref(`users/${uid}/vip_data`).on('value', s => {
        if (s.exists()) vipUserData = s.val();
        else vipUserData = { active: false, level: 'bronce', days_left: 0, earnings: 0 };
        renderVipDashboard();
    });
}

function listenToTodayTicket() {
    if (!vipConfig.fecha_activa) return;
    db.ref(`vip_tickets/${vipConfig.fecha_activa}`).on('value', s => {
        currentVipTicket = s.exists() ? s.val() : null;
        renderVipTicketUI();
    });
}

function listenToMyVipBet() {
    if (!auth.currentUser || !vipConfig.fecha_activa) return;
    db.ref(`bets_vip/${vipConfig.fecha_activa}/${auth.currentUser.uid}`).on('value', s => {
        myDailyVipBet = s.exists() ? s.val() : null;
        renderVipTicketUI(); 
        evaluateVipPrizes();
    });
}

function listenToVipResults() {
    if (!vipConfig.fecha_activa) return;
    db.ref(`vip_results/${vipConfig.fecha_activa}`).on('value', s => {
        vipResults = s.exists() ? s.val() : { lotto: null, granjita: null, selva: null };
        renderVipTicketUI(); 
        evaluateVipPrizes(); 
    });
}

function updateVipUIConfig() {
    const elRate = document.getElementById('vip-tasa-display');
    if (elRate) elRate.textContent = vipConfig.tasa.toFixed(2);
}

function renderVipDashboard() {
    const container = document.getElementById('vip-user-dashboard');
    const noVipMsg = document.getElementById('vip-locked-msg');
    if (!container || !noVipMsg) return;

    if (vipUserData.active && vipUserData.days_left > 0) {
        container.classList.remove('hidden');
        noVipMsg.classList.add('hidden');
        
        document.getElementById('vip-level-badge').innerHTML = `<i class="fas fa-gem"></i> NIVEL ${vipUserData.level.toUpperCase()}`;
        document.getElementById('vip-days-display').textContent = `${vipUserData.days_left} Días`;
        document.getElementById('vip-earnings-display').textContent = `Bs ${(vipUserData.earnings || 0).toFixed(2)}`;
        
        const badge = document.getElementById('vip-level-badge');
        badge.className = "px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider ";
        if(vipUserData.level === 'oro') badge.classList.add('bg-yellow-400', 'text-gray-900');
        else if(vipUserData.level === 'plata') badge.classList.add('bg-gray-300', 'text-gray-900');
        else badge.classList.add('bg-orange-600', 'text-white'); 
    } else {
        container.classList.add('hidden');
        noVipMsg.classList.remove('hidden');
    }
}

function renderVipTicketUI() {
    const grid = document.getElementById('vip-ticket-grid');
    const sellarBtn = document.getElementById('btn-sellar-vip');
    const candadoOverlay = document.getElementById('vip-ticket-candado');
    if (!grid) return;

    const now = new Date(Date.now() + (window.serverTimeOffset || 0));
    let isLockedTime = false;
    if(vipConfig.fecha_activa) {
        const dateParts = vipConfig.fecha_activa.split('-'); 
        const ticketDate = new Date(`${dateParts}-${dateParts}-${dateParts}T07:50:00`);
        isLockedTime = now > ticketDate;
    }

    if (!currentVipTicket) {
        grid.innerHTML = '<p class="text-center text-gray-500 col-span-3 py-4 text-xs">El ticket oficial de hoy aún no ha sido publicado.</p>';
        if (sellarBtn) sellarBtn.classList.add('hidden');
        if (candadoOverlay) candadoOverlay.classList.add('hidden');
        return;
    }

    if (!myDailyVipBet) {
        if (candadoOverlay) candadoOverlay.classList.remove('hidden');
        if (sellarBtn) {
            sellarBtn.classList.remove('hidden');
            if (isLockedTime) {
                sellarBtn.disabled = true;
                sellarBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
                sellarBtn.innerHTML = '<i class="fas fa-lock"></i> TIEMPO AGOTADO (7:50 AM)';
            } else {
                sellarBtn.disabled = false;
                sellarBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
                sellarBtn.classList.add('bg-gradient-to-r', 'from-yellow-400', 'to-yellow-600', 'text-black');
                sellarBtn.innerHTML = `<i class="fas fa-stamp mr-2 text-lg"></i> SELLAR TICKET HOY ($1)`;
            }
        }
    } else {
        if (candadoOverlay) candadoOverlay.classList.add('hidden');
        if (sellarBtn) sellarBtn.classList.add('hidden');
    }

    let html = '';
    const lottoImgs = {
        'lotto': 'https://bingotexier.com/archivos/imagenes/b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png',
        'granjita': 'https://bingotexier.com/archivos/imagenes/21e0b011b246a96b2561eeea537bcc519ab647a9.jpeg',
        'selva': 'https://i.imgur.com/MbtPoOD.png'
    };

    const buildCol = (title, imgPath, dataArray, lotteryKey) => {
        let colHtml = `<div class="bg-white p-2 border border-gray-200 rounded text-center shadow-sm"><img src="${imgPath}" class="w-8 h-8 mx-auto rounded-full mb-2 border border-gray-300"><h4 class="text-[9px] font-bold text-gray-600 mb-2 border-b pb-1 uppercase">${title}</h4>`;
        dataArray.forEach((idAnimal, index) => {
            const isHit = vipResults[lotteryKey] && vipResults[lotteryKey][index] === idAnimal;
            let aInfo = { i: '\u2753', n: '?' }; 
            if(typeof ANIMAL_MAP_LOTTO !== 'undefined' && ANIMAL_MAP_LOTTO[idAnimal]) aInfo = ANIMAL_MAP_LOTTO[idAnimal];
            
            const displayId = myDailyVipBet ? idAnimal : '\u2753';
            const displayEmoji = myDailyVipBet ? aInfo.i : '\uD83D\uDD12';
            const hitClass = isHit ? 'bg-green-100 border-green-500 text-green-700 shadow-inner' : 'bg-gray-50 border-gray-200';
            const checkIcon = isHit ? '<i class="fas fa-check-circle text-green-500 absolute -top-2 -right-2 bg-white rounded-full"></i>' : '';

            colHtml += `<div class="relative border rounded p-1 mb-2 flex flex-col items-center ${hitClass} transition-all">${checkIcon}<span class="text-xl leading-none">${displayEmoji}</span><span class="text-[12px] font-black mt-1">${displayId}</span></div>`;
        });
        colHtml += `</div>`;
        return colHtml;
    };

    html += buildCol('Lotto', lottoImgs['lotto'], currentVipTicket.lotto, 'lotto');
    html += buildCol('Granjita', lottoImgs['granjita'], currentVipTicket.granjita, 'granjita');
    html += buildCol('Selva', lottoImgs['selva'], currentVipTicket.selva, 'selva');
    grid.innerHTML = html;
}

window.procesarSelloVIP = async () => {
    if (isProcessingVip) return;
    if (!vipUserData.active || vipUserData.days_left <= 0) return alert("\u26A0\uFE0F Tu membresía VIP no está activa.");
    if (myDailyVipBet) return alert("Ya sellaste el ticket de hoy.");
    
    const costoBs = parseFloat(vipConfig.tasa);
    if (typeof userBalance !== 'undefined' && userBalance < costoBs) return alert(`\u274C Saldo insuficiente. Necesitas Bs ${costoBs.toFixed(2)}.`);

    const btn = document.getElementById('btn-sellar-vip');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...'; }
    isProcessingVip = true;

    try {
        const uid = auth.currentUser.uid;
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - costoBs);
        await db.ref(`bets_vip/${vipConfig.fecha_activa}/${uid}`).set({
            sealed: true, status: 'PENDING', cost_bs: costoBs, timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        alert("\u2705 \u00A1Ticket VIP Sellado con éxito! Mucha suerte hoy.");
    } catch (e) {
        alert("Error al sellar: " + e.message);
        if(btn) btn.disabled = false;
    } finally {
        isProcessingVip = false;
    }
};

function evaluateVipPrizes() {
    if (!myDailyVipBet || myDailyVipBet.status !== 'PENDING') {
        const btnCobrar = document.getElementById('btn-cobrar-vip');
        if(btnCobrar) btnCobrar.classList.add('hidden');
        return;
    }

    let hits = 0;
    ['lotto', 'granjita', 'selva'].forEach(lotteryKey => {
        if (currentVipTicket[lotteryKey] && vipResults[lotteryKey]) {
            currentVipTicket[lotteryKey].forEach((idAnimal, index) => {
                if (vipResults[lotteryKey][index] === idAnimal) hits++;
            });
        }
    });

    const btnCobrar = document.getElementById('btn-cobrar-vip');
    if (!btnCobrar) return;

    const prizeUSD = VIP_LEVELS[vipUserData.level].prize;
    const prizeBs = prizeUSD * vipConfig.tasa;
    const seguroBs = 1 * vipConfig.tasa;

    if (hits >= 2) {
        btnCobrar.classList.remove('hidden');
        btnCobrar.className = "w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition transform active:scale-95 text-sm animate-pulse flex justify-center items-center tracking-wide uppercase";
        btnCobrar.innerHTML = `<i class="fas fa-money-bill-wave mr-2"></i> \u00A1COBRAR PREMIO! (Bs ${prizeBs.toFixed(2)})`;
        btnCobrar.onclick = () => ejecutarCobroVIP('WIN', prizeBs);
        return;
    }

    const now = new Date(Date.now() + (window.serverTimeOffset || 0));
    if (now.getHours() >= 19 && now.getMinutes() >= 30 && hits === 0) {
        btnCobrar.classList.remove('hidden');
        btnCobrar.className = "w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition transform active:scale-95 text-sm flex justify-center items-center tracking-wide uppercase";
        btnCobrar.innerHTML = `<i class="fas fa-shield-alt mr-2"></i> RECLAMAR SEGURO (Devolución Bs ${seguroBs.toFixed(2)})`;
        btnCobrar.onclick = () => ejecutarCobroVIP('SEGURO', seguroBs);
        return;
    }

    btnCobrar.classList.add('hidden');
}

window.ejecutarCobroVIP = async (tipo, montoBs) => {
    if (isProcessingVip) return;
    isProcessingVip = true;
    
    const btn = document.getElementById('btn-cobrar-vip');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ABONANDO A TU SALDO...';

    try {
        const uid = auth.currentUser.uid;
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) + montoBs);
        await db.ref(`users/${uid}/vip_data/earnings`).transaction(e => (e || 0) + montoBs);
        await db.ref(`users/${uid}/vip_data/days_left`).transaction(d => Math.max(0, (d || 0) - 1));
        await db.ref(`bets_vip/${vipConfig.fecha_activa}/${uid}/status`).set(tipo === 'WIN' ? 'CLAIMED_WIN' : 'CLAIMED_SAFE');
        
        const mensaje = tipo === 'WIN' ? `\u2705 \u00A1Felicidades! Se abonaron Bs ${montoBs.toFixed(2)} a tu saldo.` : `\u26A8\uFE0F Seguro Activado. Se devolvieron Bs ${montoBs.toFixed(2)} a tu saldo.`;
        alert(mensaje);
        btn.classList.add('hidden'); 
    } catch (e) {
        alert("Hubo un error al procesar el pago: " + e.message);
        btn.disabled = false;
        btn.innerHTML = 'REINTENTAR COBRO';
    } finally {
        isProcessingVip = false;
    }
};
