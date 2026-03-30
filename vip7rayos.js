/* ============================================================
   BINGO TEXIER - MÓDULO VIP 7 RAYOS (vip7rayos.js)
   Descripción: Control de membresías, tickets protegidos y cobros.
   ============================================================ */

const VIP_LEVELS = {
    'bronce': { prize: 5 },
    'plata': { prize: 10 },
    'oro': { prize: 20 }
};

let vipConfig = { tasa: 0, fecha_activa: null };
let vipUserData = { active: false, level: 'bronce', days_left: 0, earnings: 0 };
let currentVipTicket = null;
let myDailyVipBet = null;
let vipResults = { lotto: null, granjita: null, selva: null };

// --- 1. INICIALIZACIÓN ---
// Llama a esta función dentro de tu auth.onAuthStateChanged en francisca.js
function initVIPSystem() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    // 1. Escuchar Configuración General (Tasa y Fecha)
    db.ref('vip_config').on('value', s => {
        if (s.exists()) {
            vipConfig = s.val();
            updateVipUIConfig();
            listenToTodayTicket();
            listenToMyVipBet();
            listenToVipResults();
        }
    });

    // 2. Escuchar Estado VIP del Usuario
    db.ref(`users/${uid}/vip_data`).on('value', s => {
        if (s.exists()) {
            vipUserData = s.val();
        } else {
            vipUserData = { active: false, level: 'bronce', days_left: 0, earnings: 0 };
        }
        renderVipDashboard();
    });
}

// --- 2. ESCUCHADORES DE BASE DE DATOS ---
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
        renderVipTicketUI(); // Re-renderiza para destapar los animales si ya pagó
        evaluateVipPrizes();
    });
}

function listenToVipResults() {
    if (!vipConfig.fecha_activa) return;
    db.ref(`vip_results/${vipConfig.fecha_activa}`).on('value', s => {
        vipResults = s.exists() ? s.val() : { lotto: null, granjita: null, selva: null };
        renderVipTicketUI(); // Re-renderiza para iluminar los aciertos
        evaluateVipPrizes(); // Revisa si ya llegó a 2 aciertos
    });
}

// --- 3. RENDERIZADO VISUAL ---
function updateVipUIConfig() {
    const elRate = document.getElementById('vip-tasa-display');
    if (elRate) elRate.textContent = vipConfig.tasa.toFixed(2);
    
    const elCost = document.getElementById('vip-cost-display');
    if (elCost) elCost.textContent = `Bs ${vipConfig.tasa.toFixed(2)}`;
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
        
        // Colores según nivel
        const badge = document.getElementById('vip-level-badge');
        badge.className = "px-3 py-1 rounded text-xs font-black ";
        if(vipUserData.level === 'oro') badge.classList.add('bg-yellow-400', 'text-gray-900');
        else if(vipUserData.level === 'plata') badge.classList.add('bg-gray-300', 'text-gray-900');
        else badge.classList.add('bg-orange-600', 'text-white'); // Bronce

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

    // Lógica de Horario (Bloqueo a las 7:50 AM)
    const now = new Date(Date.now() + serverTimeOffset);
    const dateParts = vipConfig.fecha_activa.split('-'); // DD-MM-YYYY
    const ticketDate = new Date(`${dateParts}-${dateParts}-${dateParts}T07:50:00`);
    const isLockedTime = now > ticketDate;

    if (!currentVipTicket) {
        grid.innerHTML = '<p class="text-center text-gray-500 col-span-3 py-4">El ticket oficial de hoy aún no ha sido publicado.</p>';
        if (sellarBtn) sellarBtn.classList.add('hidden');
        if (candadoOverlay) candadoOverlay.classList.add('hidden');
        return;
    }

    // Si no ha sellado
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
                sellarBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
                sellarBtn.innerHTML = `<i class="fas fa-stamp"></i> SELLAR TICKET HOY ($1) - Bs ${vipConfig.tasa.toFixed(2)}`;
            }
        }
    } else {
        // Si ya selló
        if (candadoOverlay) candadoOverlay.classList.add('hidden');
        if (sellarBtn) sellarBtn.classList.add('hidden');
    }

    // Dibujar los 9 animalitos
    let html = '';
    const buildCol = (title, imgPath, dataArray, lotteryKey) => {
        let colHtml = `<div class="bg-white p-2 border rounded text-center shadow-sm">
            <img src="${imgPath}" class="w-8 h-8 mx-auto rounded-full mb-2">
            <h4 class="text-[10px] font-bold text-gray-600 mb-2 border-b pb-1">${title}</h4>`;
            
        dataArray.forEach((idAnimal, index) => {
            // Verificar si este animal salió en los resultados VIP
            const isHit = vipResults[lotteryKey] && vipResults[lotteryKey][index] === idAnimal;
            const aInfo = ANIMAL_MAP_LOTTO[idAnimal] || { i: '\u2753', n: '?' };
            
            // Ocultar número si no ha sellado (misterio)
            const displayId = myDailyVipBet ? idAnimal : '\u2753';
            const displayEmoji = myDailyVipBet ? aInfo.i : '\uD83D\uDD12'; // Candado unicode
            
            const hitClass = isHit ? 'bg-green-100 border-green-500 text-green-700 shadow-inner' : 'bg-gray-50 border-gray-200';
            const checkIcon = isHit ? '<i class="fas fa-check-circle text-green-500 absolute -top-2 -right-2 bg-white rounded-full"></i>' : '';

            colHtml += `
            <div class="relative border rounded p-1 mb-2 flex flex-col items-center ${hitClass} transition-all">
                ${checkIcon}
                <span class="text-xl leading-none">${displayEmoji}</span>
                <span class="text-[12px] font-black mt-1">${displayId}</span>
            </div>`;
        });
        colHtml += `</div>`;
        return colHtml;
    };

    html += buildCol('Lotto Activo', LOTTO_IMGS['Lotto Activo'], currentVipTicket.lotto, 'lotto');
    html += buildCol('La Granjita', LOTTO_IMGS['La Granjita'], currentVipTicket.granjita, 'granjita');
    html += buildCol('Selva Plus', LOTTO_IMGS['Selva Plus'], currentVipTicket.selva, 'selva');
    
    grid.innerHTML = html;
}

// --- 4. LÓGICA DE TRANSACCIONES ---

window.procesarSelloVIP = async () => {
    if (isProcessing) return;
    if (!vipUserData.active || vipUserData.days_left <= 0) return alert("\u26A0\uFE0F Tu membresía VIP no está activa.");
    if (myDailyVipBet) return alert("Ya sellaste el ticket de hoy.");
    
    const costoBs = parseFloat(vipConfig.tasa);
    if (userBalance < costoBs) return alert(`\u274C Saldo insuficiente. Necesitas Bs ${costoBs.toFixed(2)} para sellar.`);

    const btn = document.getElementById('btn-sellar-vip');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
    }
    isProcessing = true;

    try {
        const uid = auth.currentUser.uid;
        // 1. Descontar saldo
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - costoBs);
        
        // 2. Registrar jugada
        await db.ref(`bets_vip/${vipConfig.fecha_activa}/${uid}`).set({
            sealed: true,
            status: 'PENDING',
            cost_bs: costoBs,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        alert("\u2705 \u00A1Ticket VIP Sellado con éxito! Mucha suerte hoy.");
    } catch (e) {
        alert("Error al sellar: " + e.message);
        if(btn) btn.disabled = false;
    } finally {
        isProcessing = false;
    }
};

function evaluateVipPrizes() {
    if (!myDailyVipBet || myDailyVipBet.status !== 'PENDING') {
        const btnCobrar = document.getElementById('btn-cobrar-vip');
        if(btnCobrar) btnCobrar.classList.add('hidden');
        return;
    }

    // Contar aciertos
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

    // 1. Escenario Ganador (2 o más aciertos)
    if (hits >= 2) {
        btnCobrar.classList.remove('hidden');
        btnCobrar.classList.remove('bg-gray-500');
        btnCobrar.classList.add('bg-green-600', 'animate-pulse');
        btnCobrar.innerHTML = `<i class="fas fa-money-bill-wave"></i> \u00A1COBRAR PREMIO! (Bs ${prizeBs.toFixed(2)})`;
        btnCobrar.onclick = () => ejecutarCobroVIP('WIN', prizeBs);
        return;
    }

    // 2. Escenario Seguro de Devolución (0 aciertos al final de la tarde)
    const now = new Date(Date.now() + serverTimeOffset);
    // Asumimos que después de las 7:30 PM ya no hay más sorteos
    if (now.getHours() >= 19 && now.getMinutes() >= 30 && hits === 0) {
        btnCobrar.classList.remove('hidden');
        btnCobrar.classList.remove('bg-green-600', 'animate-pulse');
        btnCobrar.classList.add('bg-blue-600');
        btnCobrar.innerHTML = `<i class="fas fa-shield-alt"></i> RECLAMAR SEGURO (Devolución Bs ${seguroBs.toFixed(2)})`;
        btnCobrar.onclick = () => ejecutarCobroVIP('SEGURO', seguroBs);
        return;
    }

    // Si tiene 1 acierto o es temprano, se oculta el botón
    btnCobrar.classList.add('hidden');
}

window.ejecutarCobroVIP = async (tipo, montoBs) => {
    if (isProcessing) return;
    isProcessing = true;
    
    const btn = document.getElementById('btn-cobrar-vip');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ABONANDO A TU SALDO...';

    try {
        const uid = auth.currentUser.uid;
        
        // 1. Sumar al balance principal
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) + montoBs);
        
        // 2. Actualizar las ganancias históricas del VIP
        await db.ref(`users/${uid}/vip_data/earnings`).transaction(e => (e || 0) + montoBs);
        
        // 3. Restar 1 día a la suscripción (solo se resta el día que se evalúa el ticket)
        await db.ref(`users/${uid}/vip_data/days_left`).transaction(d => Math.max(0, (d || 0) - 1));

        // 4. Marcar el ticket de hoy como cobrado
        await db.ref(`bets_vip/${vipConfig.fecha_activa}/${uid}/status`).set(tipo === 'WIN' ? 'CLAIMED_WIN' : 'CLAIMED_SAFE');
        
        const mensaje = tipo === 'WIN' 
            ? `\u2705 \u00A1Felicidades! Se abonaron Bs ${montoBs.toFixed(2)} a tu saldo.` 
            : `\u26A8\uFE0F Seguro Activado. Se devolvieron Bs ${montoBs.toFixed(2)} a tu saldo.`;
            
        alert(mensaje);
        btn.classList.add('hidden'); // Ocultar al finalizar

    } catch (e) {
        alert("Hubo un error al procesar el pago: " + e.message);
        btn.disabled = false;
        btn.innerHTML = 'REINTENTAR COBRO';
    } finally {
        isProcessing = false;
    }
};
