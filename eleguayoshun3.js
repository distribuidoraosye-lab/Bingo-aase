/* ============================================================
   BINGO TEXIER - HORA LOCA (V7.0 - INYECCIÓN JS CAZADOR)
   - 100% JS. No requiere tocar el HTML principal.
   - Espera pacientemente a que el DOM exista antes de inyectarse.
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
let hl_intervaloTimer = null;
let hl_inyectado = false; // Candado para no inyectar doble

// 1. EL CAZADOR DE ELEMENTOS (Busca el HTML y lo inyecta seguro)
function intentarInyectarHL() {
    if (hl_inyectado) return; // Si ya lo inyectó, se detiene

    const loggedInArea = document.getElementById('logged-in-area');
    const divBalance = document.getElementById('balance-display');
    const rachaContainer = document.getElementById('racha-module-container');

    // Solo si esos 3 elementos ya existen en la página, procedemos
    if (loggedInArea && divBalance && rachaContainer) {
        
        // A. ESTILOS Y ANIMACIONES
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                @keyframes hl-parpadeo { 0%, 100% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; } 50% { border-color: #a855f7; box-shadow: 0 0 40px #a855f7; } }
                .hl-luces { animation: hl-parpadeo 0.5s infinite; }
                .slice-hl { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 60px; height: 50%; margin-left: -30px; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; font-weight: 900; font-size: 14px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }
            </style>
        `);

        // B. BANNER SUPERIOR
        loggedInArea.insertAdjacentHTML('afterbegin', `
            <div id="hl-top-banner" class="hidden w-full bg-gradient-to-r from-purple-800 via-pink-600 to-purple-800 text-white p-2 text-center shadow-[0_4px_15px_rgba(219,39,119,0.5)] border-b-2 border-yellow-400 relative overflow-hidden mb-4 rounded-xl" style="display:none; z-index: 40;">
                <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                <h3 class="relative z-10 font-black text-[11px] uppercase tracking-widest"><i class="fas fa-fire mr-1 text-yellow-400"></i> ¡HORA LOCA ACTIVA!</h3>
                <p class="relative z-10 text-[10px] font-bold mt-1">Termina en: <span id="hl-banner-timer" class="text-yellow-300 font-mono text-sm font-black ml-1">00:00:00</span></p>
            </div>
        `);

        // C. SALDO BONO EN LA BILLETERA
        divBalance.parentNode.insertAdjacentHTML('beforeend', `
            <div id="display-saldo-bono" class="text-right mt-1" style="display:none;">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1">Bono:</span>
                <span class="text-sm font-black text-purple-600" id="monto-saldo-bono">0.00 Bs</span>
            </div>
        `);

        // D. BÓVEDA
        rachaContainer.insertAdjacentHTML('beforebegin', `
            <div id="boveda-hl-box" style="display: none; background: linear-gradient(135deg, #4c1d95, #2e1065); border: 2px solid #a855f7; border-radius: 0.8rem; padding: 16px; margin-bottom: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); text-align: center; width: 100%;">
                <h3 style="color: #c084fc; font-size: 14px; font-weight: 900; text-transform: uppercase; margin: 0 0 5px 0;"><i class="fas fa-lock mr-1"></i> SALDO ATRAPADO</h3>
                <p style="color: #facc15; font-size: 24px; font-weight: 900; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" id="boveda-hl-monto">0 Bs</p>
                <p style="font-size: 11px; color: #d1d5db; margin: 8px 0; font-weight: bold;">Juega 5 cartones reales para liberar.</p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 999px; height: 12px; margin-top: 10px; border: 1px solid #7e22ce; overflow: hidden;">
                    <div id="boveda-hl-barra" style="background: linear-gradient(90deg, #a855f7, #facc15); width: 0%; height: 100%; transition: width 0.5s;"></div>
                </div>
                <p style="font-size: 11px; color: white; font-weight: bold; margin-top: 5px;">Progreso: <span id="boveda-hl-progreso" style="color: #facc15;">0</span> / 5</p>
            </div>
        `);

        // E. MODALES DE RULETA Y RETO (Directo al body)
        document.body.insertAdjacentHTML('beforeend', `
            <div id="modal-ruleta-hl" class="hidden modal-overlay" style="display: none; z-index: 9999999 !important;">
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
                    <button id="btn-girar-hl" onclick="iniciarGiroHL()" class="relative z-10 w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.8)] transition uppercase text-xl">¡GIRAR AHORA!</button>
                </div>
            </div>

            <div id="modal-reto-hl" class="hidden modal-overlay" style="display: none; z-index: 9999999 !important;">
                <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                    <div class="text-6xl mb-2 text-purple-500"><i class="fas fa-lock"></i></div>
                    <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none mb-2">¡SALDO ATRAPADO!</h2>
                    <p class="text-sm font-bold text-gray-500 mb-4">Tienes un Saldo Bono encerrado en la bóveda.</p>
                    <div class="bg-purple-100 border-2 border-purple-500 rounded-xl p-4 mb-4 shadow-inner"><span class="text-4xl font-black text-purple-600" id="texto-premio-hl">0 Bs</span></div>
                    <div class="text-left bg-gray-100 border border-gray-300 rounded-lg p-3 mb-5">
                        <p class="text-xs font-black text-red-600 uppercase mb-2 border-b border-gray-300 pb-1"><i class="fas fa-exclamation-triangle mr-1"></i> REGLAS:</p>
                        <ul class="text-[11px] text-gray-700 font-bold space-y-2">
                            <li><i class="fas fa-check text-green-500 mr-1"></i>Para liberarlo, juega <b>5 cartones</b> con saldo real.</li>
                            <li><i class="fas fa-ban text-orange-500 mr-1"></i>El Saldo es ÚNICAMENTE para jugar.</li>
                        </ul>
                    </div>
                    <button onclick="aceptarRetoHL()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase text-lg">ACEPTAR RETO</button>
                </div>
            </div>

            <div id="modal-pago-hl" class="hidden modal-overlay" style="display: none; z-index: 9999999 !important;">
                <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-2xl relative">
                    <h3 class="text-xl font-black text-gray-800 mb-2"><i class="fas fa-wallet mr-2 text-green-500"></i> MÉTODO DE PAGO</h3>
                    <button id="btn-real-hl" class="w-full bg-green-500 text-white font-black py-4 rounded-xl shadow-md mb-3">SALDO REAL<br><span class="text-[10px]">Suma a racha</span></button>
                    <button id="btn-bono-hl" class="w-full bg-purple-500 text-white font-black py-4 rounded-xl shadow-md mb-3">SALDO BONO <span id="btn-bono-monto"></span><br><span class="text-[10px]">NO suma a racha</span></button>
                    <button onclick="document.getElementById('modal-pago-hl').style.display='none'" class="text-xs text-gray-400 font-bold mt-2">Cancelar</button>
                </div>
            </div>
        `);

        hl_inyectado = true;
        iniciarLogicaFirebase(); // Ahora que existe el HTML, prendemos el motor
    } else {
        // Si no existen todavía, vuelve a intentarlo en medio segundo
        setTimeout(intentarInyectarHL, 500);
    }
}

// Empezamos la cacería apenas cargue la página
intentarInyectarHL();

// 2. LÓGICA FIREBASE (Idéntico a bienvenida)
function iniciarLogicaFirebase() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            dbHL = firebase.database();
            hl_uid = user.uid;

            dbHL.ref('config/hora_loca').on('value', snapAdmin => {
                const config = snapAdmin.val() || {};
                admin_HoraLocaActiva = config.activa === true;
                admin_TerminaEn = config.terminaEn || 0;
                if(config.probabilidades) admin_Probabilidades = config.probabilidades;
                
                manejarBannerTimer();

                // Jerarquía: Respetar Bono Bienvenida
                dbHL.ref(`users/${hl_uid}/welcome_bonus_status`).once('value', snapBono => {
                    let estadoBono = snapBono.val();
                    if (estadoBono === 'pending' || estadoBono === 'active') return; 
                    
                    dbHL.ref(`users/${hl_uid}/hora_loca_data`).on('value', snapHL => {
                        let data = snapHL.val() || {};
                        hl_estadoReto = data.status || 'pending';
                        hl_saldoBono = data.saldo_bono || 0;
                        hl_progresoReto = data.progreso || 0;
                        hl_premioAtrapado = data.premio || 0;

                        const mdRuleta = document.getElementById('modal-ruleta-hl');
                        if (mdRuleta) {
                            mdRuleta.style.display = (admin_HoraLocaActiva && hl_estadoReto === 'pending') ? 'flex' : 'none';
                        }

                        actualizarUIBilletera();
                        interceptarPAGOS();
                    });
                });
            });
        }
    });
}

function manejarBannerTimer() {
    const banner = document.getElementById('hl-top-banner');
    if (!banner) return;
    clearInterval(hl_intervaloTimer);

    if (admin_HoraLocaActiva && admin_TerminaEn > Date.now()) {
        banner.style.display = 'block';
        hl_intervaloTimer = setInterval(() => {
            let falta = admin_TerminaEn - Date.now();
            if (falta <= 0) {
                banner.style.display = 'none'; clearInterval(hl_intervaloTimer);
            } else {
                let h = Math.floor(falta / 3600000); let m = Math.floor((falta % 3600000) / 60000); let s = Math.floor((falta % 60000) / 1000);
                document.getElementById('hl-banner-timer').innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            }
        }, 1000);
    } else {
        banner.style.display = 'none';
    }
}

function actualizarUIBilletera() {
    const dispSaldo = document.getElementById('display-saldo-bono');
    if (dispSaldo) {
        dispSaldo.style.display = (hl_saldoBono > 0) ? 'block' : 'none';
        document.getElementById('monto-saldo-bono').innerText = hl_saldoBono + " Bs";
    }

    const box = document.getElementById('boveda-hl-box');
    if (box) {
        if (hl_estadoReto === 'active') {
            box.style.display = 'block';
            document.getElementById('boveda-hl-monto').innerText = `${hl_premioAtrapado} Bs`;
            document.getElementById('boveda-hl-progreso').innerText = hl_progresoReto;
            document.getElementById('boveda-hl-barra').style.width = `${(hl_progresoReto / hl_metaReto) * 100}%`;
        } else {
            box.style.display = 'none';
        }
    }
}

// 3. EVENTOS FRONTEND (Girar, Aceptar, Pagar)
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

let hl_lastB = null;
setInterval(() => {
    if(hl_estadoReto === 'active' && typeof userBalance !== 'undefined') {
        if(hl_lastB === null) hl_lastB = userBalance;
        if(userBalance < hl_lastB) {
            hl_progresoReto++; hl_lastB = userBalance;
            if(hl_progresoReto >= hl_metaReto) {
                dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ status: 'completed', saldo_bono: firebase.database.ServerValue.increment(hl_premioAtrapado), progreso: hl_progresoReto });
                alert(`¡RETO SUPERADO! Tus ${hl_premioAtrapado} Bs están listos para jugar.`);
            } else { dbHL.ref(`users/${hl_uid}/hora_loca_data`).update({ progreso: hl_progresoReto }); }
        } else if (userBalance > hl_lastB) hl_lastB = userBalance; 
    }
}, 1000);

let b_intercept = false; let t_intercept = false;
let hl_ctxActual = null; let hl_argsActual = null; let hl_funcActual = null; let hl_tipoJuego = null;

function interceptarPAGOS() {
    if (hl_saldoBono <= 0) return;
    if (!b_intercept && typeof window.confirmCurrentCard === 'function') {
        const ob = window.confirmCurrentCard;
        window.confirmCurrentCard = function() { checkModalPago('bingo', ob, this, arguments); }; b_intercept = true;
    }
    if (!t_intercept && typeof window.confirmTorneoPurchase === 'function') {
        const ot = window.confirmTorneoPurchase;
        window.confirmTorneoPurchase = function() { checkModalPago('torneo', ot, this, arguments); }; t_intercept = true;
    }
}

function checkModalPago(t, orig, ctx, args) {
    if (hl_saldoBono <= 0) { orig.apply(ctx, args); return; }
    hl_tipoJuego = t; hl_funcActual = orig; hl_ctxActual = ctx; hl_argsActual = args;
    
    document.getElementById('btn-bono-monto').innerText = `(${hl_saldoBono} Bs)`;
    document.getElementById('modal-pago-hl').style.display = 'flex';
    
    document.getElementById('btn-real-hl').onclick = () => { document.getElementById('modal-pago-hl').style.display = 'none'; hl_funcActual.apply(hl_ctxActual, hl_argsActual); };
    document.getElementById('btn-bono-hl').onclick = () => { document.getElementById('modal-pago-hl').style.display = 'none'; procesarBono(hl_tipoJuego); };
}

function procesarBono(t) {
    let costo = t === 'bingo' ? parseFloat(document.getElementById('starter-card-price').innerText) : parseFloat(document.getElementById('torneo-ticket-price-display').innerText);
    if (hl_saldoBono < costo) return alert("Saldo Bono insuficiente.");
    dbHL.ref(`users/${hl_uid}/hora_loca_data/saldo_bono`).set(hl_saldoBono - costo);
    
    let d = new Date(); let f = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    if (t === 'bingo') {
        dbHL.ref(`bingo_to_grade/estelar/${f}/bets`).push().set({ uid: hl_uid, name: document.getElementById('user-display-name').innerText, phone: "N/A", date: f, status: "pending", payment_method: "BONO", animals: window.currentBingoCard || });
        alert("¡Comprado con Saldo Bono!"); location.reload();
    } else {
        if((window.selectedTorneoAnimals || []).length < 15) return alert("Completa los 15 animalitos");
        dbHL.ref(`bets_torneo_express/${f}/${hl_uid}`).push().set({ animalitos: window.selectedTorneoAnimals, tipo_pago: "SALDO_BONO", timestamp: firebase.database.ServerValue.TIMESTAMP });
        alert("¡Ticket comprado con Saldo Bono!"); location.reload();
    }
}
