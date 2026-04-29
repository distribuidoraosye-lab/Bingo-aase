/* ============================================================
   BINGO TEXIER - MÓDULO HORA LOCA (VERSIÓN DEFINITIVA)
   Inyección dinámica, lógica de intercepción segura y compatibilidad total.
   ============================================================ */

let dbHL;
let hl_uid = null;
let hl_saldoBono = 0;
let hl_estadoReto = 'pending';
let hl_progresoReto = 0;
let hl_metaReto = 5;
let hl_premioAtrapado = 0;
let admin_HoraLocaActiva = false;
let admin_Probabilidades = { p3k: 40, p6k: 20, p10k: 20, p50k: 20 };

// 1. INYECTOR DINÁMICO DE INTERFAZ
// Crea el HTML necesario sin tocar el index.html original
function inyectarUIHoraLoca() {
    if(document.getElementById('hora-loca-container')) return; 

    const uiHTML = `
        <div id="hora-loca-container" class="w-full mb-4" style="display:none;">
            <button id="btn-trigger-hl" onclick="abrirModalRuletaHL()" class="hidden w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black py-3 rounded-xl shadow-lg animate-pulse border-2 border-white mb-2 transition transform hover:scale-105">
                <i class="fas fa-gift mr-2 text-yellow-300"></i> ¡ATRAPA TU REGALO HORA LOCA!
            </button>
            <div id="boveda-hl-box" class="hidden bg-gray-900 p-4 rounded-xl border-2 border-pink-500 text-white shadow-xl relative overflow-hidden mb-2">
                <h3 class="font-bold text-sm text-pink-400 mb-1"><i class="fas fa-lock mr-2"></i> BÓVEDA HORA LOCA</h3>
                <p class="text-xs text-gray-300 mb-2">Juega con tu Saldo Real para liberar premio de: <span id="boveda-hl-monto" class="font-black text-green-400 text-lg">0 Bs</span></p>
                <div class="w-full bg-gray-700 rounded-full h-4 mb-1 border border-gray-600 shadow-inner">
                    <div id="boveda-hl-barra" class="bg-gradient-to-r from-pink-600 to-pink-400 h-4 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
                <p class="text-[10px] text-right font-bold text-gray-400">Progreso: <span id="boveda-hl-progreso">0</span>/5 jugadas</p>
            </div>
            <div id="display-saldo-bono" class="hidden bg-purple-100 border border-purple-300 p-3 rounded-lg text-center mb-2 shadow-sm">
                <span class="text-xs font-bold text-purple-800"><i class="fas fa-coins mr-1 text-yellow-500"></i> SALDO BONO: </span>
                <span id="monto-saldo-bono" class="font-black text-purple-900 text-xl tracking-tight">0 Bs</span>
            </div>
        </div>
    `;
    const ancla = document.getElementById('welcome-bonus-module-container');
    if(ancla) ancla.insertAdjacentHTML('afterend', uiHTML);

    const modalesHTML = `
        <div id="modal-ruleta-hl" class="hidden fixed inset-0 bg-black/90 z- flex items-center justify-center">
            <div class="text-center w-full max-w-sm px-4">
                <h2 class="text-4xl font-black text-pink-500 mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">¡GIRA Y GANA!</h2>
                <img id="rueda-hl" src="https://bingotexier.com/archivos/imagenes/23317580062f6aaf7111ed9d37c811fe37801382.jpeg" class="w-64 h-64 mx-auto mb-8 rounded-full border-4 border-yellow-400 object-cover shadow-[0_0_40px_rgba(236,72,153,0.8)]">
                <button id="btn-girar-hl" onclick="iniciarGiroHL()" class="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-black py-4 rounded-full shadow-xl text-2xl transition transform active:scale-95 border-b-4 border-yellow-600">
                    GIRAR AHORA
                </button>
            </div>
        </div>
        <div id="modal-reto-hl" class="hidden fixed inset-0 bg-black/80 z- flex items-center justify-center">
            <div class="bg-white p-6 rounded-3xl w-11/12 max-w-sm text-center border-t-8 border-pink-500 shadow-2xl relative overflow-hidden">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <i class="fas fa-lock text-4xl text-gray-400"></i>
                </div>
                <h3 class="text-2xl font-black text-gray-800 mb-2">¡ATRAPASTE <span id="texto-premio-hl" class="text-green-600"></span>!</h3>
                <p class="text-xs text-gray-600 mb-6 font-medium px-2">El dinero está asegurado en la bóveda. Realiza 5 jugadas con tu saldo real para desbloquearlo y pasarlo a tu Saldo Bono.</p>
                <button onclick="aceptarRetoHL()" class="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-4 rounded-xl shadow-lg transition tracking-wider">
                    ACEPTAR RETO
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalesHTML);
}

// 2. ARRANQUE DEL SISTEMA
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        dbHL = firebase.database();
        hl_uid = user.uid;
        
        dbHL.ref('config/hora_loca').on('value', snapAdmin => {
            const config = snapAdmin.val() || {};
            admin_HoraLocaActiva = config.activa === true;
            if(config.probabilidades) admin_Probabilidades = config.probabilidades;

            // Filtro Anticolisión: Ignora si el usuario tiene el bono de bienvenida
            dbHL.ref(`users/${hl_uid}/welcome_bonus_status`).once('value', snapBono => {
                let estadoBono = snapBono.val();
                if (estadoBono === 'pending' || estadoBono === 'active') return; 

                inyectarUIHoraLoca();
                document.getElementById('hora-loca-container').style.display = 'block';

                dbHL.ref(`users/${hl_uid}/hora_loca_data`).on('value', snapUser => {
                    let data = snapUser.val() || {};
                    hl_estadoReto = data.status || 'pending';
                    hl_progresoReto = data.progreso || 0;
                    hl_premioAtrapado = data.premio || 0;
                    hl_saldoBono = data.saldo_bono || 0;

                    actualizarInterfazVisual();
                    interceptarPagos();
                });
            });
        });
    }
});

function actualizarInterfazVisual() {
    const btnRegalo = document.getElementById('btn-trigger-hl');
    if (btnRegalo) btnRegalo.style.display = (admin_HoraLocaActiva && hl_estadoReto === 'pending') ? 'block' : 'none';

    const boxBoveda = document.getElementById('boveda-hl-box');
    if (boxBoveda) {
        if (hl_estadoReto === 'active') {
            boxBoveda.style.display = 'block';
            document.getElementById('boveda-hl-monto').innerText = `${hl_premioAtrapado} Bs`;
            document.getElementById('boveda-hl-progreso').innerText = hl_progresoReto;
            document.getElementById('boveda-hl-barra').style.width = `${(hl_progresoReto / hl_metaReto) * 100}%`;
        } else {
            boxBoveda.style.display = 'none';
        }
    }

    const dispSaldo = document.getElementById('display-saldo-bono');
    if (dispSaldo) {
        if (hl_saldoBono > 0) {
            dispSaldo.style.display = 'block';
            document.getElementById('monto-saldo-bono').innerText = hl_saldoBono + " Bs";
        } else {
            dispSaldo.style.display = 'none';
        }
    }
}

// 3. RULETA Y BÓVEDA
window.abrirModalRuletaHL = function() { document.getElementById('modal-ruleta-hl').style.display = 'flex'; }

window.iniciarGiroHL = function() {
    const btn = document.getElementById('btn-girar-hl');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GIRANDO...';

    const rueda = document.getElementById('rueda-hl');
    rueda.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    let rng = Math.floor(Math.random() * 100) + 1;
    let angulo = 0; let valor = 3000;
    let t3k = parseFloat(admin_Probabilidades.p3k) || 40; let t6k = t3k + (parseFloat(admin_Probabilidades.p6k) || 20); let t10k = t6k + (parseFloat(admin_Probabilidades.p10k) || 20);
    
    if (rng <= t3k) { valor = 3000; angulo = 360 - 22.5; } 
    else if (rng <= t6k) { valor = 6000; angulo = 360 - 112.5; } 
    else if (rng <= t10k) { valor = 10000; angulo = 360 - 67.5; } 
    else { valor = 50000; angulo = 360 - 157.5; }

    hl_premioAtrapado = valor;
    rueda.style.transform = `rotate(${(6 * 360) + angulo}deg)`;
    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}

    setTimeout(() => {
        document.getElementById('modal-ruleta-hl').style.display = 'none';
        document.getElementById('texto-premio-hl').innerText = `${valor} Bs`;
        document.getElementById('modal-reto-hl').style.display = 'flex';
    }, 5500); 
}

window.aceptarRetoHL = function() {
    dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ status: 'active', premio: hl_premioAtrapado, progreso: 0 });
    document.getElementById('modal-reto-hl').style.display = 'none';
}

// Observador pasivo: Detecta cuando userBalance (de francisca.js) baja para subir el progreso
let hl_lastB = null;
setInterval(() => {
    if(hl_estadoReto === 'active' && typeof window.userBalance !== 'undefined') {
        if(hl_lastB === null) hl_lastB = window.userBalance;
        if(window.userBalance < hl_lastB) {
            hl_progresoReto++; hl_lastB = window.userBalance;
            if(hl_progresoReto >= hl_metaReto) {
                dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ status: 'completed', saldo_bono: firebase.database.ServerValue.increment(hl_premioAtrapado), progreso: hl_progresoReto });
                alert(`¡RETO SUPERADO! Tus ${hl_premioAtrapado} Bs han sido añadidos a tu Saldo Bono.`);
            } else { dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ progreso: hl_progresoReto }); }
        } else if (window.userBalance > hl_lastB) hl_lastB = window.userBalance; 
    }
}, 1000);

// 4. INTERCEPCIÓN PROFUNDA CON FRANCISCA.JS
let b_int = false; let t_int = false;
let ctx_hl = null; let args_hl = null; let func_hl = null; let tipo_hl = null; let costo_hl = 0; let free_hl = 0;

function interceptarPagos() {
    if (hl_saldoBono <= 0) return;

    // Intercepta Bingo Estelar
    if (!b_int && typeof window.confirmCurrentCard === 'function') {
        const originalConfirmBingo = window.confirmCurrentCard;
        window.confirmCurrentCard = function() {
            // Evaluamos las variables de francisca.js
            if (typeof purchaseState !== 'undefined' && typeof currentCardPrice !== 'undefined') {
                // Si NO es el último cartón a confirmar, dejamos que francisca.js siga su flujo
                if (purchaseState.currentCardIndex + 1 < purchaseState.totalQty) {
                    return originalConfirmBingo.apply(this, arguments);
                }

                // Si ES el último cartón, calculamos el costo exacto
                let paidCount = purchaseState.totalQty;
                let usedFree = 0;
                if (typeof freeBingoCredits !== 'undefined' && freeBingoCredits > 0) {
                    usedFree = Math.min(purchaseState.totalQty, freeBingoCredits);
                    paidCount = purchaseState.totalQty - usedFree;
                }
                const cost = paidCount * currentCardPrice;

                // Si tiene Bono suficiente para cubrirlo, mostramos la opción
                if (cost > 0 && hl_saldoBono >= cost) {
                    checkPago('bingo', originalConfirmBingo, this, arguments, cost, usedFree);
                    return;
                }
            }
            originalConfirmBingo.apply(this, arguments);
        };
        b_int = true;
    }

    // Intercepta Torneo Express
    if (!t_int && typeof window.confirmTorneoPurchase === 'function') {
        const originalConfirmTorneo = window.confirmTorneoPurchase;
        window.confirmTorneoPurchase = function() {
            if (typeof torneoSelection !== 'undefined' && torneoSelection.size === 15) {
                const cost = (typeof torneoConfig !== 'undefined' && torneoConfig.price) ? torneoConfig.price : 1000;
                if (hl_saldoBono >= cost) {
                    checkPago('torneo', originalConfirmTorneo, this, arguments, cost, 0);
                    return;
                }
            }
            originalConfirmTorneo.apply(this, arguments);
        };
        t_int = true;
    }
}

// Renderiza el Cajero Flotante
function checkPago(t, orig, ctx, args, costoTotal, freeUsados) {
    tipo_hl = t; func_hl = orig; ctx_hl = ctx; args_hl = args; costo_hl = costoTotal; free_hl = freeUsados;
    const id = `modal-pago-hl-${Date.now()}`;
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="fixed inset-0 flex items-center justify-center bg-black/80 z-">
            <div class="bg-white p-6 rounded-3xl w-11/12 max-w-sm text-center shadow-2xl relative border-t-8 border-green-500">
                <h3 class="text-2xl font-black text-gray-800 mb-1"><i class="fas fa-wallet mr-2 text-green-500"></i> CAJERO</h3>
                <p class="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Elige cómo pagar (Costo: ${costoTotal} Bs)</p>
                
                <button id="btn-real-${id}" class="w-full bg-green-500 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center transition transform active:scale-95">
                    <span class="text-lg tracking-wider">SALDO REAL</span>
                    <span class="text-[10px] bg-green-700 px-2 py-1 rounded mt-1 font-medium">Desbloquea logros y bóvedas</span>
                </button>
                <button id="btn-bono-${id}" class="w-full bg-purple-600 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center transition transform active:scale-95">
                    <span class="text-lg tracking-wider">SALDO BONO (${hl_saldoBono} Bs)</span>
                    <span class="text-[10px] bg-purple-800 px-2 py-1 rounded mt-1 font-medium">No suma progreso de usuario</span>
                </button>
                <button onclick="document.getElementById('${id}').remove()" class="text-xs text-gray-400 font-bold mt-2 hover:text-gray-600">Cancelar Compra</button>
            </div>
        </div>
    `);

    document.getElementById(`btn-real-${id}`).onclick = () => { document.getElementById(id).remove(); func_hl.apply(ctx_hl, args_hl); };
    document.getElementById(`btn-bono-${id}`).onclick = () => { document.getElementById(id).remove(); procesarCompraConBono(); };
}

// Motor Interno: Paga con bono comunicándose directamente con la Base de Datos
async function procesarCompraConBono() {
    const btnBono = document.getElementById(`btn-bono-${document.querySelector('[id^="modal-pago-hl-"]').id}`);
    if(btnBono) btnBono.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';

    // Restar el saldo bono inmediatamente
    await dbHL.ref(`users/${hl_uid}/hora_loca_data/saldo_bono`).set(hl_saldoBono - costo_hl);

    // Identificar las fechas configuradas por francisca.js
    const dateBingo = typeof currentDateStr !== 'undefined' ? currentDateStr : 'ERROR_DATE';
    const dateTorneo = typeof torneoDateStr !== 'undefined' ? torneoDateStr : 'ERROR_DATE';

    if (tipo_hl === 'bingo') {
        // Empujar la última selección manualmente, ya que interceptamos antes de que francisca lo hiciera
        purchaseState.draftCards.push(Array.from(currentSelection).sort((a,b)=>a-b));
        
        const userName = document.getElementById('user-display-name') ? document.getElementById('user-display-name').textContent : 'Anónimo';
        const cards = purchaseState.draftCards.map(n => ({numbers: n, id: Math.random().toString(36).substring(2, 8).toUpperCase()})); 
        
        await Promise.all(cards.map((c, index) => {
            const isFree = index < free_hl;
            return dbHL.ref('bingo_aprobados_estelar').push({ 
                numbers: c.numbers, 
                id: c.id, 
                uid: hl_uid, 
                date: dateBingo, 
                status: 'APROBADO', 
                payment_method: isFree ? 'GRATIS' : 'SALDO_BONO' 
            });
        }));

        if (free_hl > 0) {
            await dbHL.ref(`users/${hl_uid}/free_bingo_credits`).transaction(c => (c || 0) - free_hl);
        }

        alert("¡Cartones adquiridos con Saldo Bono! Suerte en el sorteo.");
        location.reload();
        
    } else if (tipo_hl === 'torneo') {
        const cardId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const numbers = Array.from(torneoSelection).sort((a,b) => {
            if(a==='00') return -1; if(b==='00') return 1; if(a==='0') return -1; if(b==='0') return 1;
            return parseInt(a) - parseInt(b);
        });

        await dbHL.ref(`bets_torneo_express/${dateTorneo}/${hl_uid}`).push({
            id: cardId,
            numbers: numbers,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            tipo_pago: 'SALDO_BONO'
        });

        alert("¡Ticket de Torneo adquirido con Saldo Bono!");
        location.reload();
    }
}
