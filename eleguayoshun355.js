/* ============================================================
   BINGO TEXIER - HORA LOCA (V. JS INTERRUPTOR)
   - Todo el HTML ya es nativo.
   - Solo lee BD y muestra u oculta.
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

// 1. INICIAR SISTEMA
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        dbHL = firebase.database();
        hl_uid = user.uid;
        
        dbHL.ref('config/hora_loca').on('value', snapAdmin => {
            const config = snapAdmin.val() || {};
            admin_HoraLocaActiva = config.activa === true;
            if(config.probabilidades) admin_Probabilidades = config.probabilidades;

            // IGNORAR SI ES USUARIO NUEVO
            dbHL.ref(`users/${hl_uid}/welcome_bonus_status`).once('value', snapBono => {
                let estadoBono = snapBono.val();
                if (estadoBono === 'pending' || estadoBono === 'active') {
                    document.getElementById('btn-trigger-hl').style.display = 'none';
                    return; 
                }

                // SI ES USUARIO VIEJO
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
    // A. Mostrar el Botón Atrapa-Bobos
    const btnRegalo = document.getElementById('btn-trigger-hl');
    if (btnRegalo) {
        btnRegalo.style.display = (admin_HoraLocaActiva && hl_estadoReto === 'pending') ? 'block' : 'none';
    }

    // B. Mostrar la Bóveda
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

    // C. Mostrar el Saldo Bono en Billetera
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

// 2. ACCIONES DEL BOTÓN Y LA RULETA
window.abrirModalRuletaHL = function() {
    document.getElementById('modal-ruleta-hl').style.display = 'flex';
}

window.iniciarGiroHL = function() {
    const btn = document.getElementById('btn-girar-hl');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GIRANDO...';

    const rueda = document.getElementById('rueda-hl');
    rueda.classList.remove('hl-luces'); 
    rueda.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    let rng = Math.floor(Math.random() * 100) + 1;
    let angulo = 0; let valor = 3000;
    let t3k = parseFloat(admin_Probabilidades.p3k) || 40; let t6k = t3k + (parseFloat(admin_Probabilidades.p6k) || 20); let t10k = t6k + (parseFloat(admin_Probabilidades.p10k) || 20);
    if (rng <= t3k) { valor = 3000; angulo = 360 - 22.5; } else if (rng <= t6k) { valor = 6000; angulo = 360 - 112.5; } else if (rng <= t10k) { valor = 10000; angulo = 360 - 67.5; } else { valor = 50000; angulo = 360 - 157.5; }

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

// 3. DESBLOQUEO AUTOMÁTICO DE BÓVEDA AL COMPRAR
let hl_lastB = null;
setInterval(() => {
    if(hl_estadoReto === 'active' && typeof userBalance !== 'undefined') {
        if(hl_lastB === null) hl_lastB = userBalance;
        if(userBalance < hl_lastB) {
            hl_progresoReto++; hl_lastB = userBalance;
            if(hl_progresoReto >= hl_metaReto) {
                dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ status: 'completed', saldo_bono: firebase.database.ServerValue.increment(hl_premioAtrapado), progreso: hl_progresoReto });
                alert(`¡RETO SUPERADO! Tus ${hl_premioAtrapado} Bs han sido añadidos a tu Saldo Bono.`);
            } else { dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ progreso: hl_progresoReto }); }
        } else if (userBalance > hl_lastB) hl_lastB = userBalance; 
    }
}, 1000);

// 4. INTERCEPTOR AISLADO (PARA PAGAR CON BONO)
let b_int = false; let t_int = false;
let ctx_hl = null; let args_hl = null; let func_hl = null; let tipo_hl = null;

function interceptarPagos() {
    if (hl_saldoBono <= 0) return;
    if (!b_int && typeof window.confirmCurrentCard === 'function') {
        const ob = window.confirmCurrentCard;
        window.confirmCurrentCard = function() { checkPago('bingo', ob, this, arguments); }; b_int = true;
    }
    if (!t_int && typeof window.confirmTorneoPurchase === 'function') {
        const ot = window.confirmTorneoPurchase;
        window.confirmTorneoPurchase = function() { checkPago('torneo', ot, this, arguments); }; t_int = true;
    }
}

function checkPago(t, orig, ctx, args) {
    if (hl_saldoBono <= 0) { orig.apply(ctx, args); return; }
    tipo_hl = t; func_hl = orig; ctx_hl = ctx; args_hl = args;
    const id = `modal-pago-hl-${Date.now()}`;
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="fixed inset-0 flex items-center justify-center bg-black/80" style="z-index: 9999999;">
            <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-2xl">
                <h3 class="text-xl font-black text-gray-800 mb-2"><i class="fas fa-wallet mr-2 text-green-500"></i> MÉTODO DE PAGO</h3>
                <button id="btn-real-${id}" class="w-full bg-green-500 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
                    <span>SALDO REAL</span><span class="text-[10px] bg-green-700 px-2 py-1 rounded mt-1">Suma a racha</span>
                </button>
                <button id="btn-bono-${id}" class="w-full bg-purple-500 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
                    <span>SALDO BONO (${hl_saldoBono} Bs)</span><span class="text-[10px] bg-purple-700 px-2 py-1 rounded mt-1">NO suma a racha</span>
                </button>
                <button onclick="document.getElementById('${id}').remove()" class="text-xs text-gray-400 font-bold mt-2">Cancelar</button>
            </div>
        </div>
    `);

    document.getElementById(`btn-real-${id}`).onclick = () => { document.getElementById(id).remove(); func_hl.apply(ctx_hl, args_hl); };
    document.getElementById(`btn-bono-${id}`).onclick = () => { document.getElementById(id).remove(); comprarConBono(tipo_hl); };
}

function comprarConBono(t) {
    let costo = t === 'bingo' ? parseFloat(document.getElementById('starter-card-price').innerText) : parseFloat(document.getElementById('torneo-ticket-price-display').innerText);
    if (hl_saldoBono < costo) return alert("Saldo Bono insuficiente. Elige Saldo Real.");
    
    dbHL.ref(`users/${hl_uid}/hora_loca_data/saldo_bono`).set(hl_saldoBono - costo);
    let d = new Date(); let f = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    
    if (t === 'bingo') {
        dbHL.ref(`bingo_to_grade/estelar/${f}/bets`).push().set({ uid: hl_uid, name: document.getElementById('user-display-name').innerText, phone: "N/A", date: f, status: "pending", payment_method: "BONO", animals: window.currentBingoCard || });
        alert("¡Cartón comprado con Saldo Bono!"); location.reload();
    } else {
        if((window.selectedTorneoAnimals || []).length < 15) return alert("Completa los 15 animalitos");
        dbHL.ref(`bets_torneo_express/${f}/${hl_uid}`).push().set({ animalitos: window.selectedTorneoAnimals, tipo_pago: "SALDO_BONO", timestamp: firebase.database.ServerValue.TIMESTAMP });
        alert("¡Ticket comprado con Saldo Bono!"); location.reload();
    }
}
