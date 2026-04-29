/* ============================================================
   BINGO TEXIER - HORA LOCA (ARQUITECTURA NATIVA "CERO CHOQUES")
   Se integra como un bloque del Dashboard, igual que la Bienvenida.
   ============================================================ */

let hl_db = null;
let hl_uid = null;
let hl_adminData = { activa: false, terminaEn: 0, probs: { p3k: 40, p6k: 20, p10k: 20, p50k: 20 } };
let hl_userData = { status: 'pending', premio: 0, progreso: 0, saldo_bono: 0, meta: 5 };

// 1. EL MOTOR PRINCIPAL: ESPERA SU TURNO EN SILENCIO
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        hl_uid = user.uid;
        hl_db = firebase.database();
        
        // Esperamos a que la página exista físicamente
        let validadorDOM = setInterval(() => {
            let zonaJuegos = document.getElementById('game-selector');
            if (zonaJuegos) {
                clearInterval(validadorDOM);
                construirModuloVacio(zonaJuegos); // Creamos la casa
                encenderLecturaFirebase();        // Prendemos la luz
                interceptarPagosSeguro();         // Protegemos la racha
            }
        }, 500);
    }
});

// 2. CONSTRUIMOS LA "CASA" DEL MÓDULO (Para no chocar)
function construirModuloVacio(zonaJuegos) {
    if (!document.getElementById('modulo-hora-loca-seguro')) {
        let modulo = document.createElement('div');
        modulo.id = 'modulo-hora-loca-seguro';
        modulo.className = 'w-full mb-4';
        zonaJuegos.parentNode.insertBefore(modulo, zonaJuegos);
    }
    
    // Inyectamos el CSS de la ruleta una sola vez
    if (!document.getElementById('css-hl')) {
        document.head.insertAdjacentHTML('beforeend', `<style id="css-hl">@keyframes hl-parpadeo { 0%, 100% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; } 50% { border-color: #a855f7; box-shadow: 0 0 40px #a855f7; } } .hl-luces { animation: hl-parpadeo 0.5s infinite; } .slice-hl { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 60px; height: 50%; margin-left: -30px; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; font-weight: 900; font-size: 14px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }</style>`);
    }
}

// 3. LECTURA DE BASE DE DATOS Y JERARQUÍA
function encenderLecturaFirebase() {
    hl_db.ref('config/hora_loca').on('value', snapA => {
        let d = snapA.val() || {};
        hl_adminData.activa = d.activa === true;
        hl_adminData.terminaEn = d.terminaEn || 0;
        if(d.probabilidades) hl_adminData.probs = d.probabilidades;

        // JERARQUÍA: Si tiene bono de bienvenida, apagamos esto
        hl_db.ref(`users/${hl_uid}/welcome_bonus_status`).once('value', snapBono => {
            let est = snapBono.val();
            if (est === 'pending' || est === 'active') {
                document.getElementById('modulo-hora-loca-seguro').innerHTML = ''; // Limpiamos y abortamos
                return; 
            }

            // SI ES USUARIO NORMAL, LEEMOS SU HORA LOCA
            hl_db.ref(`users/${hl_uid}/hora_loca_data`).on('value', snapU => {
                let u = snapU.val() || {};
                hl_userData.status = u.status || 'pending';
                hl_userData.premio = u.premio || 0;
                hl_userData.progreso = u.progreso || 0;
                hl_userData.saldo_bono = u.saldo_bono || 0;
                
                dibujarInterfazCorrecta();
            });
        });
    });
}

// 4. EL DIBUJANTE: PINTA LO QUE TOCA SIN DAÑAR EL HTML
function dibujarInterfazCorrecta() {
    const contenedor = document.getElementById('modulo-hora-loca-seguro');
    if (!contenedor) return;

    // A. Mostrar Billetera de Bono (En el dashboard)
    let bDisplay = document.getElementById('display-saldo-bono-seguro');
    if (!bDisplay) {
        document.getElementById('balance-display').parentNode.insertAdjacentHTML('beforeend', `<div id="display-saldo-bono-seguro" class="text-right mt-1" style="display:none;"><span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1">Bono:</span><span class="text-sm font-black text-purple-600" id="txt-monto-bono">0 Bs</span></div>`);
        bDisplay = document.getElementById('display-saldo-bono-seguro');
    }
    bDisplay.style.display = (hl_userData.saldo_bono > 0) ? 'block' : 'none';
    document.getElementById('txt-monto-bono').innerText = hl_userData.saldo_bono + " Bs";

    // B. Lógica de Pestañas (Qué se dibuja en el contenedor)
    if (hl_adminData.activa && hl_userData.status === 'pending') {
        // PINTA: BOTÓN DE REGALO GIGANTE
        contenedor.innerHTML = `
            <button onclick="dibujarRuletaEnPantalla()" class="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(219,39,119,0.6)] animate-pulse border-2 border-yellow-400 text-lg">
                <i class="fas fa-gift text-2xl mr-2 text-yellow-300"></i> ABRIR REGALO HORA LOCA
            </button>
        `;
    } else if (hl_userData.status === 'active') {
        // PINTA: LA BÓVEDA INCRUSTADA
        let pct = (hl_userData.progreso / hl_userData.meta) * 100;
        contenedor.innerHTML = `
            <div style="background: linear-gradient(135deg, #4c1d95, #2e1065); border: 2px solid #a855f7; border-radius: 0.8rem; padding: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); text-align: center;">
                <h3 style="color: #c084fc; font-size: 14px; font-weight: 900; text-transform: uppercase; margin: 0 0 5px 0;"><i class="fas fa-lock mr-1"></i> SALDO BONO ATRAPADO</h3>
                <p style="color: #facc15; font-size: 24px; font-weight: 900; margin: 0;">${hl_userData.premio} Bs</p>
                <p style="font-size: 11px; color: #d1d5db; margin: 8px 0; font-weight: bold;">Juega ${hl_userData.meta} cartones reales para liberar.</p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 999px; height: 12px; margin-top: 10px; border: 1px solid #7e22ce; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #a855f7, #facc15); width: ${pct}%; height: 100%; transition: width 0.5s;"></div>
                </div>
                <p style="font-size: 11px; color: white; font-weight: bold; margin-top: 5px;">Progreso: <span style="color: #facc15;">${hl_userData.progreso}</span> / ${hl_userData.meta}</p>
            </div>
        `;
    } else {
        // PINTA: NADA (Oculta el módulo)
        contenedor.innerHTML = '';
    }
}

// 5. ACCIONES FRONTEND
window.dibujarRuletaEnPantalla = function() {
    const contenedor = document.getElementById('modulo-hora-loca-seguro');
    contenedor.innerHTML = `
        <div class="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl w-full text-center border-4 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.6)] overflow-hidden">
            <h3 class="text-2xl font-black text-purple-400 mb-1 animate-pulse">¡RULETA DE BONOS!</h3>
            <div class="relative mx-auto w-64 h-64 my-4">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-white text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"><i class="fas fa-caret-down"></i></div>
                <div id="rueda-animada-hl" class="w-full h-full rounded-full border-8 border-gray-800 hl-luces overflow-hidden relative" style="background: conic-gradient(#a855f7 0 45deg, #3b82f6 45deg 90deg, #eab308 90deg 135deg, #ef4444 135deg 180deg, #a855f7 180deg 225deg, #3b82f6 225deg 270deg, #eab308 270deg 315deg, #ef4444 315deg 360deg);">
                    <div class="slice-hl" style="transform: rotate(22.5deg);">3000</div><div class="slice-hl" style="transform: rotate(67.5deg);">10000</div><div class="slice-hl" style="transform: rotate(112.5deg);">6000</div><div class="slice-hl" style="transform: rotate(157.5deg);">50000</div><div class="slice-hl" style="transform: rotate(202.5deg);">3000</div><div class="slice-hl" style="transform: rotate(247.5deg);">6000</div><div class="slice-hl" style="transform: rotate(292.5deg);">10000</div><div class="slice-hl" style="transform: rotate(337.5deg);">50000</div>
                    <div class="absolute inset-0 flex items-center justify-center"><div class="w-16 h-16 bg-black rounded-full border-4 border-purple-500 z-10 flex items-center justify-center"><i class="fas fa-gift text-purple-400 text-2xl animate-pulse"></i></div></div>
                </div>
            </div>
            <button id="btn-ejecutar-giro" onclick="procesarGiroRuleta()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase text-xl">¡GIRAR!</button>
        </div>
    `;
}

window.procesarGiroRuleta = function() {
    document.getElementById('btn-ejecutar-giro').disabled = true;
    document.getElementById('btn-ejecutar-giro').innerHTML = 'GIRANDO...';
    
    let rueda = document.getElementById('rueda-animada-hl');
    rueda.classList.remove('hl-luces');
    rueda.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    let rng = Math.floor(Math.random() * 100) + 1;
    let val = 3000; let ang = 0;
    let t3k = parseFloat(hl_adminData.probs.p3k) || 40; let t6k = t3k + (parseFloat(hl_adminData.probs.p6k) || 20); let t10k = t6k + (parseFloat(hl_adminData.probs.p10k) || 20);
    
    if (rng <= t3k) { val = 3000; ang = 360 - 22.5; } else if (rng <= t6k) { val = 6000; ang = 360 - 112.5; } else if (rng <= t10k) { val = 10000; ang = 360 - 67.5; } else { val = 50000; ang = 360 - 157.5; }

    rueda.style.transform = `rotate(${(6 * 360) + ang}deg)`;
    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}

    setTimeout(() => {
        hl_db.ref(`users/${hl_uid}/hora_loca_data`).update({ status: 'active', premio: val, progreso: 0 });
    }, 5500);
}

// 6. DETECTOR DE COMPRAS (Desbloquea el Reto)
let validadorCompras = null;
setInterval(() => {
    if(hl_userData.status === 'active' && typeof userBalance !== 'undefined') {
        if(validadorCompras === null) validadorCompras = userBalance;
        if(userBalance < validadorCompras) { // Detecta que la plata bajó (compró)
            hl_userData.progreso++; 
            validadorCompras = userBalance;
            if(hl_userData.progreso >= hl_userData.meta) {
                hl_db.ref(`users/${hl_uid}/hora_loca_data`).update({ status: 'completed', saldo_bono: firebase.database.ServerValue.increment(hl_userData.premio), progreso: hl_userData.progreso });
                alert(`¡RETO SUPERADO! Tus ${hl_userData.premio} Bs han sido añadidos a tu Saldo Bono.`);
            } else { hl_db.ref(`users/${hl_uid}/hora_loca_data`).update({ progreso: hl_userData.progreso }); }
        } else if (userBalance > validadorCompras) validadorCompras = userBalance; 
    }
}, 1000);

// 7. INTERCEPTOR (Pagar con Bono sin dañar Racha)
let intActivado = false; let cfgPago = {};

function interceptarPagosSeguro() {
    if (intActivado) return;
    
    if (typeof window.confirmCurrentCard === 'function') {
        const oBingo = window.confirmCurrentCard;
        window.confirmCurrentCard = function() { gestionarDoblePago('bingo', oBingo, this, arguments); };
    }
    if (typeof window.confirmTorneoPurchase === 'function') {
        const oTorneo = window.confirmTorneoPurchase;
        window.confirmTorneoPurchase = function() { gestionarDoblePago('torneo', oTorneo, this, arguments); };
    }
    intActivado = true;
}

function gestionarDoblePago(tipo, original, contexto, argumentos) {
    if (hl_userData.saldo_bono <= 0) { original.apply(contexto, argumentos); return; }
    
    cfgPago = { t: tipo, o: original, c: contexto, a: argumentos };
    const idModal = `modal-doble-pago-${Date.now()}`;
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="${idModal}" class="fixed inset-0 flex items-center justify-center" style="background: rgba(0,0,0,0.85); z-index: 9999999;">
            <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-2xl">
                <h3 class="text-xl font-black text-gray-800 mb-4"><i class="fas fa-wallet mr-2 text-green-500"></i> ¿CÓMO PAGARÁS?</h3>
                <button id="pago-real-${idModal}" class="w-full bg-green-500 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
                    <span>SALDO REAL</span><span class="text-[10px] bg-green-700 px-2 py-1 rounded mt-1">Suma a racha</span>
                </button>
                <button id="pago-bono-${idModal}" class="w-full bg-purple-500 text-white font-black py-4 rounded-xl shadow-md mb-3 flex flex-col items-center">
                    <span>SALDO BONO (${hl_userData.saldo_bono} Bs)</span><span class="text-[10px] bg-purple-700 px-2 py-1 rounded mt-1">NO suma a racha</span>
                </button>
                <button onclick="document.getElementById('${idModal}').remove()" class="text-xs text-gray-400 font-bold mt-2 p-2">Cancelar</button>
            </div>
        </div>
    `);

    document.getElementById(`pago-real-${idModal}`).onclick = () => { document.getElementById(idModal).remove(); cfgPago.o.apply(cfgPago.c, cfgPago.a); };
    document.getElementById(`pago-bono-${idModal}`).onclick = () => { document.getElementById(idModal).remove(); ejecutarCompraBono(cfgPago.t); };
}

function ejecutarCompraBono(tipo) {
    let costo = tipo === 'bingo' ? parseFloat(document.getElementById('starter-card-price').innerText) : parseFloat(document.getElementById('torneo-ticket-price-display').innerText);
    if (hl_userData.saldo_bono < costo) return alert("Saldo Bono insuficiente. Elige Saldo Real.");
    
    hl_db.ref(`users/${hl_uid}/hora_loca_data/saldo_bono`).set(hl_userData.saldo_bono - costo);
    let d = new Date(); let f = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    
    if (tipo === 'bingo') {
        hl_db.ref(`bingo_to_grade/estelar/${f}/bets`).push().set({ uid: hl_uid, name: document.getElementById('user-display-name').innerText, phone: "N/A", date: f, status: "pending", payment_method: "BONO", animals: window.currentBingoCard || });
        alert("¡Cartón comprado con Saldo Bono!"); location.reload();
    } else {
        if((window.selectedTorneoAnimals || []).length < 15) return alert("Completa los 15 animalitos");
        hl_db.ref(`bets_torneo_express/${f}/${hl_uid}`).push().set({ animalitos: window.selectedTorneoAnimals, tipo_pago: "SALDO_BONO", timestamp: firebase.database.ServerValue.TIMESTAMP });
        alert("¡Ticket comprado con Saldo Bono!"); location.reload();
    }
}
