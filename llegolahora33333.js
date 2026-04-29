/* ============================================================
   BINGO TEXIER - MÓDULO HORA LOCA Y SALDO BONO (V2.0)
   - Conectado al Panel de Admin (Botón de Encendido y Timer)
   - Lee las probabilidades configuradas por el Admin en vivo
   - Bóveda de Reto Diario y Expiración a las 8:00 PM
   ============================================================ */

const dbHoraLoca = firebase.database();

let hl_uid = null;
let hl_fechaHoy = null;
let hl_saldoBono = 0;
let hl_estadoReto = null;
let hl_progresoReto = 0;
let hl_metaReto = 5;
let hl_premioAtrapado = 0;

// Variables controladas por el Admin
let admin_HoraLocaActiva = false;
let admin_Probabilidades = { p3k: 40, p6k: 20, p10k: 20, p50k: 20 };

// 1. FECHA Y HORA DEL SERVIDOR
function obtenerFechaLocal() {
    let d = new Date();
    let day = String(d.getDate()).padStart(2, '0');
    let month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${d.getFullYear()}`;
}

function esDespuesDeLas8PM() {
    let d = new Date();
    return d.getHours() >= 20; // 20:00 o más
}

// 2. INYECCIÓN VISUAL (DOM)
function inyectarInterfazHL() {
    const css = `
        @keyframes parpadeo-luces { 0%, 100% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; } 50% { border-color: #a855f7; box-shadow: 0 0 40px #a855f7; } }
        .luces-bono { animation: parpadeo-luces 0.5s infinite; }
        .slice-hl { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 60px; height: 50%; margin-left: -30px; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; font-weight: 900; font-size: 14px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

    // Modal de Ruleta
    const modalRuleta = `
        <div id="modal-ruleta-hl" class="hidden fixed inset-0 flex items-center justify-center" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
            <div class="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl w-11/12 max-w-sm relative text-center border-4 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.6)] overflow-hidden">
                <button onclick="document.getElementById('modal-ruleta-hl').style.display='none'" class="absolute top-2 right-3 text-gray-400 hover:text-white text-xl z-50"><i class="fas fa-times"></i></button>
                <h3 class="relative z-10 text-2xl font-black text-purple-400 mb-1 animate-pulse">¡RULETA DE BONOS!</h3>
                <p class="relative z-10 text-xs text-gray-300 mb-6 font-bold uppercase tracking-widest">Saldo Exclusivo de Juego</p>
                
                <div class="relative z-10 mx-auto w-72 h-72 mb-6">
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-white text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"><i class="fas fa-caret-down"></i></div>
                    
                    <div id="rueda-hl" class="w-full h-full rounded-full border-8 border-gray-800 luces-bono overflow-hidden relative" style="background: conic-gradient(#a855f7 0 45deg, #3b82f6 45deg 90deg, #eab308 90deg 135deg, #ef4444 135deg 180deg, #a855f7 180deg 225deg, #3b82f6 225deg 270deg, #eab308 270deg 315deg, #ef4444 315deg 360deg);">
                        <div class="slice-hl" style="transform: rotate(22.5deg);">3000</div>
                        <div class="slice-hl" style="transform: rotate(67.5deg);">10000</div>
                        <div class="slice-hl" style="transform: rotate(112.5deg);">6000</div>
                        <div class="slice-hl" style="transform: rotate(157.5deg);">50000</div>
                        <div class="slice-hl" style="transform: rotate(202.5deg);">3000</div>
                        <div class="slice-hl" style="transform: rotate(247.5deg);">6000</div>
                        <div class="slice-hl" style="transform: rotate(292.5deg);">10000</div>
                        <div class="slice-hl" style="transform: rotate(337.5deg);">50000</div>
                        
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-16 h-16 bg-black rounded-full border-4 border-purple-500 z-10 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]"><i class="fas fa-gift text-purple-400 text-2xl animate-pulse"></i></div>
                        </div>
                    </div>
                </div>
                <button id="btn-girar-hl" onclick="iniciarGiroHL()" class="relative z-10 w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.8)] transition uppercase text-xl transform active:scale-95">
                    ¡GIRAR AHORA!
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalRuleta);

    // Modal de Aceptar Reto (Aclara Términos)
    const modalReto = `
        <div id="modal-reto-hl" class="hidden fixed inset-0 flex items-center justify-center" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
            <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                <div class="text-6xl mb-2 text-purple-500"><i class="fas fa-lock"></i></div>
                <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none mb-2">¡SALDO ATRAPADO!</h2>
                <p class="text-sm font-bold text-gray-500 mb-4">Tienes un Saldo Bono encerrado en la bóveda.</p>
                
                <div class="bg-purple-100 border-2 border-purple-500 rounded-xl p-4 mb-4 shadow-inner">
                    <span class="text-4xl font-black text-purple-600 drop-shadow-sm" id="texto-premio-hl">0 Bs</span>
                </div>

                <div class="text-left bg-gray-100 border border-gray-300 rounded-lg p-3 mb-5">
                    <p class="text-xs font-black text-red-600 uppercase mb-2 border-b border-gray-300 pb-1"><i class="fas fa-exclamation-triangle mr-1"></i> REGLAS ESTRICTAS:</p>
                    <ul class="text-[11px] text-gray-700 font-bold space-y-2">
                        <li><i class="fas fa-check text-green-500 mr-1"></i>Para liberarlo, juega un mínimo de <b>5 cartones HOY</b> con tu saldo real (En Bingo o Torneo Express).</li>
                        <li><i class="fas fa-ban text-orange-500 mr-1"></i>El Saldo Bono es ÚNICAMENTE para jugar. No se puede retirar.</li>
                        <li><i class="fas fa-clock text-red-500 mr-1"></i>Debes liberarlo y jugarlo <b>ANTES DE LAS 8:00 PM HOY</b>, o se perderá para siempre.</li>
                    </ul>
                </div>
                
                <button onclick="aceptarRetoHL()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase text-lg">
                    ACEPTAR RETO
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalReto);

    // Contenedor de la Bóveda en el Home
    const boxRef = document.getElementById('welcome-bonus-module-container');
    if (boxRef && !document.getElementById('boveda-hl-box')) {
        const bovedaHtml = `
            <div id="boveda-hl-box" style="display: none; background: linear-gradient(135deg, #4c1d95, #2e1065); border: 2px solid #a855f7; border-radius: 0.8rem; padding: 16px; margin-bottom: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); text-align: center;">
                <h3 style="color: #c084fc; font-size: 14px; font-weight: 900; text-transform: uppercase; margin: 0 0 5px 0;"><i class="fas fa-lock mr-1"></i> SALDO BONO ATRAPADO</h3>
                <p style="color: #facc15; font-size: 24px; font-weight: 900; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" id="boveda-hl-monto">0 Bs</p>
                <p style="font-size: 11px; color: #d1d5db; margin: 8px 0; font-weight: bold; line-height: 1.3;">Juega 5 cartones reales para liberar tu Saldo de Bono.</p>
                
                <div style="background: rgba(0,0,0,0.3); border-radius: 999px; height: 12px; margin-top: 10px; position: relative; border: 1px solid #7e22ce; overflow: hidden;">
                    <div id="boveda-hl-barra" style="background: linear-gradient(90deg, #a855f7, #facc15); width: 0%; height: 100%; transition: width 0.5s;"></div>
                </div>
                <p style="font-size: 11px; color: white; font-weight: bold; margin-top: 5px;">Progreso: <span id="boveda-hl-progreso" style="color: #facc15;">0</span> / 5 Cartones</p>
            </div>
        `;
        boxRef.insertAdjacentHTML('afterend', bovedaHtml);
    }
}

function actualizarBilleteraBono() {
    let panelBalance = document.getElementById('user-dashboard');
    if (panelBalance && !document.getElementById('display-saldo-bono')) {
        const divBalance = document.getElementById('balance-display').parentNode;
        const bonoHTML = `
            <div id="display-saldo-bono" class="text-right mt-1" style="display:none;">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest mr-1">Saldo Bono:</span>
                <span class="text-lg font-black text-purple-600" id="monto-saldo-bono">0.00 Bs</span>
            </div>
        `;
        divBalance.insertAdjacentHTML('beforeend', bonoHTML);
    }

    if (hl_saldoBono > 0) {
        document.getElementById('display-saldo-bono').style.display = 'block';
        document.getElementById('monto-saldo-bono').innerText = hl_saldoBono + ".00 Bs";
    } else {
        const disp = document.getElementById('display-saldo-bono');
        if (disp) disp.style.display = 'none';
    }
}

// 3. INICIALIZACIÓN Y LECTURA DEL ADMIN
function initHoraLocaSistema() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            hl_uid = user.uid;
            hl_fechaHoy = obtenerFechaLocal();
            inyectarInterfazHL();
            
            // Leemos el panel de Admin en tiempo real
            dbHoraLoca.ref('config/hora_loca').on('value', snapAdmin => {
                const config = snapAdmin.val() || {};
                admin_HoraLocaActiva = config.activa === true;
                if(config.probabilidades) {
                    admin_Probabilidades = config.probabilidades;
                }
                revisarEstadoUsuario();
            });
        }
    });
}

function revisarEstadoUsuario() {
    dbHoraLoca.ref(`users/${hl_uid}/hora_loca_data`).on('value', snap => {
        let data = snap.val() || {};
        
        // Exterminador de las 8 PM
        if (esDespuesDeLas8PM()) {
            if (data.saldo_bono > 0 || data.status === 'active') {
                dbHoraLoca.ref(`users/${hl_uid}/hora_loca_data`).set({
                    date: hl_fechaHoy, status: 'expired', saldo_bono: 0
                });
                hl_saldoBono = 0;
            }
            actualizarBilleteraBono();
            document.getElementById('boveda-hl-box').style.display = 'none';
            document.getElementById('modal-ruleta-hl').style.display = 'none';
            return;
        }

        // ¿Le toca ver la ruleta?
        // Solo si es un día nuevo Y el Admin tiene la Hora Loca encendida
        if (data.date !== hl_fechaHoy) {
            if (admin_HoraLocaActiva) {
                dbHoraLoca.ref(`users/${hl_uid}/hora_loca_data`).set({
                    date: hl_fechaHoy, status: 'pending', saldo_bono: 0, premio: 0, progreso: 0
                });
                document.getElementById('modal-ruleta-hl').style.display = 'flex';
            } else {
                document.getElementById('modal-ruleta-hl').style.display = 'none';
            }
            return;
        }

        // Cargar Estado Actual si ya pasó la ruleta
        hl_estadoReto = data.status;
        hl_progresoReto = data.progreso || 0;
        hl_premioAtrapado = data.premio || 0;
        hl_saldoBono = data.saldo_bono || 0;

        // Si su estatus es 'pending' (cerró la ruleta sin jugar) y el admin la tiene activa, mostrársela
        if (hl_estadoReto === 'pending' && admin_HoraLocaActiva) {
            document.getElementById('modal-ruleta-hl').style.display = 'flex';
        } else {
            document.getElementById('modal-ruleta-hl').style.display = 'none';
        }

        actualizarBilleteraBono();
        renderizarBoveda();
        interceptarBotonesDePago();
    });
}

function renderizarBoveda() {
    const box = document.getElementById('boveda-hl-box');
    if (!box) return;

    if (hl_estadoReto === 'active') {
        box.style.display = 'block';
        document.getElementById('boveda-hl-monto').innerText = `${hl_premioAtrapado} Bs`;
        document.getElementById('boveda-hl-progreso').innerText = hl_progresoReto;
        let pct = (hl_progresoReto / hl_metaReto) * 100;
        document.getElementById('boveda-hl-barra').style.width = `${pct}%`;
    } else {
        box.style.display = 'none';
    }
}

// 4. RULETA LÓGICA CON PORCENTAJES DEL ADMIN
window.iniciarGiroHL = function() {
    const btn = document.getElementById('btn-girar-hl');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GIRANDO...';
    btn.classList.add('opacity-50', 'cursor-not-allowed');

    const rueda = document.getElementById('rueda-hl');
    rueda.classList.remove('luces-bono'); 
    rueda.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    let rng = Math.floor(Math.random() * 100) + 1; // 1 al 100
    let anguloPremio = 0; 
    let valor = 3000;

    // Lógica acumulativa para probabilidades del Admin
    let tope3k = parseFloat(admin_Probabilidades.p3k) || 40;
    let tope6k = tope3k + (parseFloat(admin_Probabilidades.p6k) || 20);
    let tope10k = tope6k + (parseFloat(admin_Probabilidades.p10k) || 20);
    // El resto es 50k

    if (rng <= tope3k) { 
        valor = 3000; anguloPremio = 360 - 22.5; 
    } else if (rng <= tope6k) { 
        valor = 6000; anguloPremio = 360 - 112.5; 
    } else if (rng <= tope10k) { 
        valor = 10000; anguloPremio = 360 - 67.5; 
    } else { 
        valor = 50000; anguloPremio = 360 - 157.5; 
    }

    hl_premioAtrapado = valor;

    const rotacionTotal = (6 * 360) + anguloPremio;
    rueda.style.transform = `rotate(${rotacionTotal}deg)`;

    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}

    setTimeout(() => {
        document.getElementById('modal-ruleta-hl').style.display = 'none';
        document.getElementById('texto-premio-hl').innerText = `${valor} Bs`;
        document.getElementById('modal-reto-hl').style.display = 'flex';
    }, 5500); 
}

window.aceptarRetoHL = function() {
    dbHoraLoca.ref(`users/${hl_uid}/hora_loca_data`).update({
        status: 'active',
        premio: hl_premioAtrapado,
        progreso: 0
    });
    document.getElementById('modal-reto-hl').style.display = 'none';
}

// 5. REGISTRAR COMPRAS REALES PARA EL RETO
let hl_lastBalance = null;
setInterval(() => {
    if(hl_estadoReto === 'active' && typeof userBalance !== 'undefined') {
        if(hl_lastBalance === null) hl_lastBalance = userBalance;
        if(userBalance < hl_lastBalance) {
            hl_progresoReto++;
            hl_lastBalance = userBalance;
            
            if(hl_progresoReto >= hl_metaReto) {
                dbHoraLoca.ref(`users/${hl_uid}/hora_loca_data`).update({
                    status: 'completed',
                    saldo_bono: firebase.database.ServerValue.increment(hl_premioAtrapado),
                    progreso: hl_progresoReto
                });
                alert(`¡RETO SUPERADO! Tus ${hl_premioAtrapado} Bs han sido añadidos a tu Saldo Bono.`);
            } else {
                dbHoraLoca.ref(`users/${hl_uid}/hora_loca_data`).update({ progreso: hl_progresoReto });
            }
        } else if (userBalance > hl_lastBalance) {
            hl_lastBalance = userBalance; 
        }
    }
}, 1000);

// 6. INTERCEPTOR DE BOTONES DE PAGO (BINGO Y TORNEO)
let bingoInterceptado = false;
let torneoInterceptado = false;

function interceptarBotonesDePago() {
    if (hl_saldoBono <= 0) return;

    if (!bingoInterceptado && typeof window.confirmCurrentCard === 'function') {
        const originalBingo = window.confirmCurrentCard;
        window.confirmCurrentCard = function() {
            mostrarModalPago('bingo', originalBingo, this, arguments);
        };
        bingoInterceptado = true;
    }

    if (!torneoInterceptado && typeof window.confirmTorneoPurchase === 'function') {
        const originalTorneo = window.confirmTorneoPurchase;
        window.confirmTorneoPurchase = function() {
            mostrarModalPago('torneo', originalTorneo, this, arguments);
        };
        torneoInterceptado = true;
    }
}

function mostrarModalPago(tipoJuego, funcionOriginal, contexto, argumentos) {
    if (hl_saldoBono <= 0 || esDespuesDeLas8PM()) {
        funcionOriginal.apply(contexto, argumentos);
        return;
    }

    const idModal = `modal-seleccion-pago-${Date.now()}`;
    const modalHTML = `
        <div id="${idModal}" class="fixed inset-0 flex items-center justify-center bg-black/80" style="z-index: 9999999;">
            <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-2xl">
                <h3 class="text-xl font-black text-gray-800 mb-2"><i class="fas fa-wallet mr-2 text-green-500"></i> MÉTODO DE PAGO</h3>
                <p class="text-sm font-bold text-gray-500 mb-4">Elige la billetera a utilizar:</p>
                
                <button id="btn-pago-real-${idModal}" class="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
                    <span>SALDO REAL</span>
                    <span class="text-[10px] bg-green-700 px-2 py-1 rounded mt-1">Suma a tu racha diaria</span>
                </button>
                
                <button id="btn-pago-bono-${idModal}" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
                    <span>SALDO BONO (${hl_saldoBono} Bs)</span>
                    <span class="text-[10px] bg-purple-700 px-2 py-1 rounded mt-1">NO suma a tu racha diaria</span>
                </button>

                <button onclick="document.getElementById('${idModal}').remove()" class="text-xs text-gray-400 font-bold mt-2">Cancelar</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById(`btn-pago-real-${idModal}`).onclick = () => {
        document.getElementById(idModal).remove();
        funcionOriginal.apply(contexto, argumentos); 
    };

    document.getElementById(`btn-pago-bono-${idModal}`).onclick = () => {
        document.getElementById(idModal).remove();
        procesarPagoConBono(tipoJuego);
    };
}

// 7. PROCESAMIENTO SEGURO DEL SALDO BONO
function procesarPagoConBono(tipoJuego) {
    let costoTicket = 0;
    
    if (tipoJuego === 'bingo') {
        const precioText = document.getElementById('starter-card-price').innerText;
        costoTicket = parseFloat(precioText) || 0;
    } else {
        const precioText = document.getElementById('torneo-ticket-price-display').innerText;
        costoTicket = parseFloat(precioText) || 0;
    }

    if (costoTicket <= 0 || isNaN(costoTicket)) {
        alert("Error leyendo el precio del cartón.");
        return;
    }

    if (hl_saldoBono < costoTicket) {
        alert("Saldo Bono insuficiente. Elige Saldo Real.");
        return;
    }

    dbHoraLoca.ref(`users/${hl_uid}/hora_loca_data/saldo_bono`).set(hl_saldoBono - costoTicket);

    dbHoraLoca.ref('draw_status/date').once('value').then(snapDate => {
        let fechaSorteo = obtenerFechaLocal(snapDate.val());
        let userName = document.getElementById('user-display-name').innerText;
        let userPhone = "N/A"; 

        if (tipoJuego === 'bingo') {
            let cartonGenerado = window.currentBingoCard ||; 
            dbHoraLoca.ref(`bingo_to_grade/estelar/${fechaSorteo}/bets`).push().set({
                uid: hl_uid, name: userName, phone: userPhone,
                date: fechaSorteo, status: "pending",
                payment_method: "BONO", 
                animals: cartonGenerado
            });
            alert("¡Cartón de Bingo comprado con Saldo Bono exitosamente!");
            location.reload();

        } else if (tipoJuego === 'torneo') {
            let seleccionTorneo = window.selectedTorneoAnimals || [];
            if(seleccionTorneo.length < 15) { alert("Completa los 15 animalitos"); return; }
            dbHoraLoca.ref(`bets_torneo_express/${fechaSorteo}/${hl_uid}`).push().set({
                animalitos: seleccionTorneo,
                tipo_pago: "SALDO_BONO",
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            alert("¡Ticket de Torneo comprado con Saldo Bono exitosamente!");
            location.reload();
        }
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHoraLocaSistema);
else initHoraLocaSistema();
