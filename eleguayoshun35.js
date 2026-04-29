/* ============================================================
   BINGO TEXIER - HORA LOCA (V. BOTÓN ATRAPA-BOBOS)
   - Gatillo manual: El usuario hace clic para ver la ruleta.
   - 100% estable. No choca con la carga del sistema principal.
   - Interceptor aislado para no dañar las Rachas.
   ============================================================ */

let dbHL;
let hl_uid = null;
let hl_saldoBono = 0;
let hl_estadoReto = 'pending';
let hl_progresoReto = 0;
let hl_metaReto = 5;
let hl_premioAtrapado = 0;

let admin_HoraLocaActiva = false;
let admin_TerminaEn = 0;
let admin_Probabilidades = { p3k: 40, p6k: 20, p10k: 20, p50k: 20 };
let hl_inyectado = false;

// 1. EL CONSTRUCTOR VISUAL (Se inyecta una sola vez y se oculta)
function inyectarEstructuraSegura() {
    if (hl_inyectado || document.getElementById('btn-trigger-hl')) return;

    // Buscamos un lugar estable en tu HTML (Arriba de los botones de juego)
    const gameSelector = document.getElementById('game-selector');
    if (!gameSelector) {
        setTimeout(inyectarEstructuraSegura, 500); // Si no ha cargado, espera.
        return;
    }

    // A. EL BOTÓN ATRAPA-BOBOS (Gatillo)
    const botonRegalo = `
        <button id="btn-trigger-hl" onclick="abrirModalRuletaHL()" class="hidden w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(219,39,119,0.6)] mb-4 text-lg animate-pulse border-2 border-yellow-400 transition transform hover:scale-[1.02] active:scale-95" style="display:none;">
            <i class="fas fa-gift text-2xl mr-2 text-yellow-300"></i> ABRIR REGALO HORA LOCA
        </button>
    `;
    gameSelector.insertAdjacentHTML('beforebegin', botonRegalo);

    // B. LA BÓVEDA
    const bovedaHtml = `
        <div id="boveda-hl-box" style="display: none; background: linear-gradient(135deg, #4c1d95, #2e1065); border: 2px solid #a855f7; border-radius: 0.8rem; padding: 16px; margin-bottom: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); text-align: center;">
            <h3 style="color: #c084fc; font-size: 14px; font-weight: 900; text-transform: uppercase; margin: 0 0 5px 0;"><i class="fas fa-lock mr-1"></i> SALDO BONO ATRAPADO</h3>
            <p style="color: #facc15; font-size: 24px; font-weight: 900; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" id="boveda-hl-monto">0 Bs</p>
            <p style="font-size: 11px; color: #d1d5db; margin: 8px 0; font-weight: bold;">Juega 5 cartones reales para liberar tu Saldo de Bono.</p>
            <div style="background: rgba(0,0,0,0.3); border-radius: 999px; height: 12px; margin-top: 10px; border: 1px solid #7e22ce; overflow: hidden;">
                <div id="boveda-hl-barra" style="background: linear-gradient(90deg, #a855f7, #facc15); width: 0%; height: 100%; transition: width 0.5s;"></div>
            </div>
            <p style="font-size: 11px; color: white; font-weight: bold; margin-top: 5px;">Progreso: <span id="boveda-hl-progreso" style="color: #facc15;">0</span> / 5 Cartones</p>
        </div>
    `;
    document.getElementById('racha-module-container').insertAdjacentHTML('beforebegin', bovedaHtml);

    // C. ESTILOS Y MODALES AL BODY
    document.head.insertAdjacentHTML('beforeend', `<style>@keyframes hl-parpadeo { 0%, 100% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; } 50% { border-color: #a855f7; box-shadow: 0 0 40px #a855f7; } } .hl-luces { animation: hl-parpadeo 0.5s infinite; } .slice-hl { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 60px; height: 50%; margin-left: -30px; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; font-weight: 900; font-size: 14px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }</style>`);
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="modal-ruleta-hl" class="hidden fixed inset-0 flex items-center justify-center modal-overlay" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
            <div class="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl w-11/12 max-w-sm relative text-center border-4 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.6)] overflow-hidden">
                <button onclick="document.getElementById('modal-ruleta-hl').style.display='none'" class="absolute top-2 right-3 text-gray-400 hover:text-white text-xl z-50"><i class="fas fa-times"></i></button>
                <h3 class="relative z-10 text-2xl font-black text-purple-400 mb-1 animate-pulse">¡RULETA DE BONOS!</h3>
                <p class="relative z-10 text-xs text-gray-300 mb-6 font-bold uppercase tracking-widest">Saldo Exclusivo de Juego</p>
                <div class="relative z-10 mx-auto w-72 h-72 mb-6">
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-white text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"><i class="fas fa-caret-down"></i></div>
                    <div id="rueda-hl" class="w-full h-full rounded-full border-8 border-gray-800 hl-luces overflow-hidden relative" style="background: conic-gradient(#a855f7 0 45deg, #3b82f6 45deg 90deg, #eab308 90deg 135deg, #ef4444 135deg 180deg, #a855f7 180deg 225deg, #3b82f6 225deg 270deg, #eab308 270deg 315deg, #ef4444 315deg 360deg);">
                        <div class="slice-hl" style="transform: rotate(22.5deg);">3000</div><div class="slice-hl" style="transform: rotate(67.5deg);">10000</div><div class="slice-hl" style="transform: rotate(112.5deg);">6000</div><div class="slice-hl" style="transform: rotate(157.5deg);">50000</div><div class="slice-hl" style="transform: rotate(202.5deg);">3000</div><div class="slice-hl" style="transform: rotate(247.5deg);">6000</div><div class="slice-hl" style="transform: rotate(292.5deg);">10000</div><div class="slice-hl" style="transform: rotate(337.5deg);">50000</div>
                        <div class="absolute inset-0 flex items-center justify-center"><div class="w-16 h-16 bg-black rounded-full border-4 border-purple-500 z-10 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]"><i class="fas fa-gift text-purple-400 text-2xl animate-pulse"></i></div></div>
                    </div>
                </div>
                <button id="btn-girar-hl" onclick="iniciarGiroHL()" class="relative z-10 w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.8)] transition uppercase text-xl transform active:scale-95">¡GIRAR AHORA!</button>
            </div>
        </div>

        <div id="modal-reto-hl" class="hidden fixed inset-0 flex items-center justify-center modal-overlay" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
            <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                <div class="text-6xl mb-2 text-purple-500"><i class="fas fa-lock"></i></div>
                <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none mb-2">¡SALDO ATRAPADO!</h2>
                <p class="text-sm font-bold text-gray-500 mb-4">Tienes un Saldo Bono encerrado en la bóveda.</p>
                <div class="bg-purple-100 border-2 border-purple-500 rounded-xl p-4 mb-4 shadow-inner"><span class="text-4xl font-black text-purple-600" id="texto-premio-hl">0 Bs</span></div>
                <div class="text-left bg-gray-100 border border-gray-300 rounded-lg p-3 mb-5">
                    <p class="text-xs font-black text-red-600 uppercase mb-2 border-b border-gray-300 pb-1"><i class="fas fa-exclamation-triangle mr-1"></i> REGLAS:</p>
                    <ul class="text-[11px] text-gray-700 font-bold space-y-2">
                        <li><i class="fas fa-check text-green-500 mr-1"></i>Para liberarlo, juega <b>5 cartones</b> con tu saldo real.</li>
                        <li><i class="fas fa-ban text-orange-500 mr-1"></i>El Saldo Bono es ÚNICAMENTE para jugar.</li>
                    </ul>
                </div>
                <button onclick="aceptarRetoHL()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase text-lg">ACEPTAR RETO</button>
            </div>
        </div>
    `);
    
    hl_inyectado = true;
}

// 2. EL CEREBRO: LECTURA DE DATOS
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        dbHL = firebase.database();
        hl_uid = user.uid;
        
        inyectarEstructuraSegura();

        dbHL.ref('config/hora_loca').on('value', snapAdmin => {
            const config = snapAdmin.val() || {};
            admin_HoraLocaActiva = config.activa === true;
            if(config.probabilidades) admin_Probabilidades = config.probabilidades;

            // REGLA: Respetamos a los nuevos. Si tiene bono de bienvenida, lo ignoramos.
            dbHL.ref(`users/${hl_uid}/welcome_bonus_status`).once('value', snapBono => {
                let estadoBienvenida = snapBono.val();
                if (estadoBienvenida === 'pending' || estadoBienvenida === 'active') {
                    return; // Silencio total. No mostramos el botón.
                }

                // SI NO ES NUEVO, VERIFICAMOS SU ESTATUS DE HORA LOCA
                dbHL.ref(`users/${hl_uid}/hora_loca_data`).on('value', snap => {
                    let data = snap.val() || {};
                    hl_estadoReto = data.status || 'pending';
                    hl_progresoReto = data.progreso || 0;
                    hl_premioAtrapado = data.premio || 0;
                    hl_saldoBono = data.saldo_bono || 0;

                    actualizarInterfaz();
                    interceptarPagos();
                });
            });
        });
    }
});

// 3. ACTUALIZADOR DE PANTALLA
function actualizarInterfaz() {
    // 1. Mostrar/Ocultar el Botón de Regalo
    const btnRegalo = document.getElementById('btn-trigger-hl');
    if (btnRegalo) {
        if (admin_HoraLocaActiva && hl_estadoReto === 'pending') {
            btnRegalo.style.display = 'block';
        } else {
            btnRegalo.style.display = 'none';
        }
    }

    // 2. Mostrar/Ocultar Bóveda
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

    // 3. Crear y Actualizar Saldo Bono en Billetera
    let panelBalance = document.getElementById('user-dashboard');
    if (panelBalance && !document.getElementById('display-saldo-bono')) {
        document.getElementById('balance-display').parentNode.insertAdjacentHTML('beforeend', `
            <div id="display-saldo-bono" class="text-right mt-1" style="display:none;">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1">Bono:</span>
                <span class="text-sm font-black text-purple-600" id="monto-saldo-bono">0.00 Bs</span>
            </div>
        `);
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

// 4. EL GATILLO: ABRIR LA RULETA
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

// 5. DETECTOR DE COMPRAS (Desbloquea el Reto)
let hl_lastB = null;
setInterval(() => {
    if(hl_estadoReto === 'active' && typeof userBalance !== 'undefined') {
        if(hl_lastB === null) hl_lastB = userBalance;
        if(userBalance < hl_lastB) {
            hl_progresoReto++; hl_lastB = userBalance;
            if(hl_progresoReto >= hl_metaReto) {
                dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ status: 'completed', saldo_bono: firebase.database.ServerValue.increment(hl_premioAtrapado), progreso: hl_progresoReto });
                alert(`¡RETO SUPERADO! Tus ${hl_premioAtrapado} Bs han sido desbloqueados para jugar.`);
            } else { dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ progreso: hl_progresoReto }); }
        } else if (userBalance > hl_lastB) hl_lastB = userBalance; 
    }
}, 1000);

// 6. INTERCEPTOR (Pagar con Bono sin dañar Racha)
let b_int = false; let t_int = false;
let ctx_hl = null; let args_hl = null; let func_hl = null; let tipo_hl = null;

function interceptarPagos() {
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
                <button id="btn-real-${id}" class="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
                    <span>SALDO REAL</span><span class="text-[10px] bg-green-700 px-2 py-1 rounded mt-1">Suma a racha</span>
                </button>
                <button id="btn-bono-${id}" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
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
