/* ============================================================
   BINGO TEXIER - HORA LOCA (EL COFRE Y EL GANCHO)
   - Inyección 100% dinámica. HTML original intacto.
   - AISLAMIENTO TOTAL: No interactúa con el sistema de rachas.
   - Utiliza la variable nativa 'free_bingo_credits' para los premios.
   ============================================================ */

let dbHL;
let hl_uid = null;
let hl_estadoReto = 'pending';
let hl_premioCartones = 0;
let hl_balanceInicial = 0;
let admin_HoraLocaActiva = false;

// 1. INYECTOR DE INTERFAZ (HTML Dinámico)
function inyectarUIHoraLoca() {
    if(document.getElementById('hora-loca-container-gancho')) return; 

    // Panel en el Dashboard
    const uiHTML = `
        <div id="hora-loca-container-gancho" class="w-full mb-4" style="display:none;">
            <button id="btn-trigger-hl" onclick="abrirCofreHL()" class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900 font-black py-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse border-2 border-white mb-2 transition transform hover:scale-105">
                <i class="fas fa-gift text-2xl mr-2"></i> ¡TIENES UN REGALO MISTERIOSO!
            </button>
            
            <div id="panel-reto-activo" class="hidden bg-gray-900 p-4 rounded-xl border-l-4 border-yellow-400 text-white shadow-xl relative overflow-hidden mb-2">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-sm text-yellow-400"><i class="fas fa-lock mr-2"></i> RECOMPENSA BLOQUEADA</h3>
                    <span class="bg-yellow-500 text-red-900 text-[10px] font-black px-2 py-1 rounded animate-pulse">PENDIENTE</span>
                </div>
                <p class="text-xs text-gray-300 mb-2">Tienes <span id="hl-cant-cartones" class="font-black text-green-400 text-lg">0</span> Cartones Estelares esperando por ti.</p>
                <div class="bg-gray-800 p-2 rounded border border-gray-700">
                    <p class="text-[10px] text-gray-300"><i class="fas fa-info-circle text-blue-400 mr-1"></i> <b>Misión:</b> Compra al menos 1 ticket de Bingo o Torneo con tu saldo real hoy para liberarlos automáticamente.</p>
                </div>
                <p class="text-[9px] text-gray-500 mt-2 italic text-center">Nota: Las jugadas realizadas con saldo gratis o cartones de regalo no suman progreso para tu racha diaria.</p>
            </div>
        </div>
    `;
    const ancla = document.getElementById('welcome-bonus-module-container');
    if(ancla) ancla.insertAdjacentHTML('afterend', uiHTML);

    // Modales: El Cofre y El Reto
    const modalesHTML = `
        <div id="modal-cofre-hl" class="hidden fixed inset-0 bg-black/90 z- flex items-center justify-center">
            <div class="text-center w-full max-w-sm px-4">
                <h2 class="text-4xl font-black text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">¡SORPRESA!</h2>
                <p class="text-white text-sm mb-6 font-medium">Hemos reservado un regalo para ti.</p>
                <i class="fas fa-box-open text-8xl text-orange-400 mb-8 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)] animate-bounce"></i>
                <button onclick="descubrirPremioHL()" class="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-black py-4 rounded-xl shadow-xl text-2xl transition transform active:scale-95 border-b-4 border-yellow-600">
                    ABRIR COFRE
                </button>
            </div>
        </div>

        <div id="modal-gancho-hl" class="hidden fixed inset-0 bg-black/80 z- flex items-center justify-center">
            <div class="bg-white p-6 rounded-3xl w-11/12 max-w-sm text-center border-t-8 border-orange-500 shadow-2xl">
                <h3 class="text-2xl font-black text-gray-800 mb-2">¡ATRAPASTE <span id="hl-texto-premio" class="text-green-600"></span>!</h3>
                <p class="text-sm text-gray-600 mb-4 font-medium">Están reservados a tu nombre. Solo necesitas realizar <b>una compra</b> de cualquier valor con tu saldo real hoy para que se agreguen a tu cuenta automáticamente.</p>
                <button onclick="aceptarGanchoHL()" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg transition tracking-wide text-lg">
                    ACEPTAR RETO
                </button>
                <p class="text-[9px] text-gray-400 mt-3 italic">Tus cartones de regalo no sumarán para la racha diaria.</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalesHTML);
}

// 2. INICIO Y VIGILANCIA SILENCIOSA DE FIREBASE
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        dbHL = firebase.database();
        hl_uid = user.uid;
        
        dbHL.ref('config/hora_loca').on('value', snapAdmin => {
            const config = snapAdmin.val() || {};
            admin_HoraLocaActiva = config.activa === true;

            // Filtro: No molestar a los que tienen bono de bienvenida
            dbHL.ref(`users/${hl_uid}/welcome_bonus_status`).once('value', snapBono => {
                let estadoBono = snapBono.val();
                if (estadoBono === 'pending' || estadoBono === 'active') return; 

                inyectarUIHoraLoca();
                document.getElementById('hora-loca-container-gancho').style.display = 'block';

                // Fecha local para resetear el reto cada día
                const hoy = new Date().toLocaleDateString('es-VE', {timeZone: 'America/Caracas'}).replace(/\//g, '-');

                dbHL.ref(`users/${hl_uid}/reto_cartones`).on('value', snapUser => {
                    let data = snapUser.val() || {};
                    
                    // Si el reto es de ayer, se resetea para que le salga el cofre de nuevo hoy
                    if(data.fecha !== hoy) {
                        data = { status: 'pending', premio: 0, balance_inicial: 0, fecha: hoy };
                        dbHL.ref(`users/${hl_uid}/reto_cartones`).set(data);
                    }

                    hl_estadoReto = data.status;
                    hl_premioCartones = data.premio;
                    hl_balanceInicial = data.balance_inicial;

                    actualizarInterfazVisual();
                });

                // EL VIGILANTE DE COMPRAS (Solo mira el Balance)
                dbHL.ref(`users/${hl_uid}/balance`).on('value', snapBalance => {
                    let saldoActual = snapBalance.val() || 0;
                    
                    // Si el saldo baja del inicial, significa que francisca.js procesó un pago exitoso
                    if (hl_estadoReto === 'locked' && saldoActual < hl_balanceInicial) {
                        liberarCartones();
                    }
                    
                    // Si el saldo sube (recarga), actualizamos la meta para que no libere cartones gratis
                    if (hl_estadoReto === 'locked' && saldoActual > hl_balanceInicial) {
                        dbHL.ref(`users/${hl_uid}/reto_cartones/balance_inicial`).set(saldoActual);
                    }
                });
            });
        });
    }
});

// 3. CONTROL DE INTERFAZ
function actualizarInterfazVisual() {
    const btnRegalo = document.getElementById('btn-trigger-hl');
    const panelReto = document.getElementById('panel-reto-activo');
    
    if (hl_estadoReto === 'pending' && admin_HoraLocaActiva) {
        if(btnRegalo) btnRegalo.style.display = 'block';
        if(panelReto) panelReto.style.display = 'none';
    } else if (hl_estadoReto === 'locked') {
        if(btnRegalo) btnRegalo.style.display = 'none';
        if(panelReto) {
            panelReto.style.display = 'block';
            document.getElementById('hl-cant-cartones').textContent = hl_premioCartones;
        }
    } else {
        // 'claimed' o apagado
        if(btnRegalo) btnRegalo.style.display = 'none';
        if(panelReto) panelReto.style.display = 'none';
    }
}

// 4. ACCIONES DEL USUARIO (COFRE)
window.abrirCofreHL = function() {
    document.getElementById('modal-cofre-hl').style.display = 'flex';
}

window.descubrirPremioHL = function() {
    // Sorteo: 50% gana 5, 30% gana 10, 20% gana 15 cartones.
    let rng = Math.random();
    let premio = 5;
    if (rng > 0.5 && rng <= 0.8) premio = 10;
    else if (rng > 0.8) premio = 15;

    hl_premioCartones = premio;

    document.getElementById('modal-cofre-hl').style.display = 'none';
    document.getElementById('hl-texto-premio').innerText = `${premio} CARTONES`;
    document.getElementById('modal-gancho-hl').style.display = 'flex';
}

window.aceptarGanchoHL = async function() {
    // Leer el saldo exacto en este instante
    const snap = await dbHL.ref(`users/${hl_uid}/balance`).once('value');
    const saldoActual = snap.val() || 0;
    const hoy = new Date().toLocaleDateString('es-VE', {timeZone: 'America/Caracas'}).replace(/\//g, '-');

    // Bloquear el premio y empezar a vigilar
    await dbHL.ref(`users/${hl_uid}/reto_cartones`).set({
        status: 'locked',
        premio: hl_premioCartones,
        balance_inicial: saldoActual,
        fecha: hoy
    });

    document.getElementById('modal-gancho-hl').style.display = 'none';
}

// 5. LIBERACIÓN DEL PREMIO
async function liberarCartones() {
    // 1. Marcar como completado para evitar ciclos infinitos
    await dbHL.ref(`users/${hl_uid}/reto_cartones/status`).set('claimed');
    
    // 2. Sumar a 'free_bingo_credits' (variable nativa)
    await dbHL.ref(`users/${hl_uid}/free_bingo_credits`).transaction(current => (current || 0) + hl_premioCartones);
    
    // 3. Notificación de victoria
    alert(`🎉 ¡RETO CUMPLIDO! Has hecho una compra con tu saldo y tus ${hl_premioCartones} Cartones Gratis han sido desbloqueados automáticamente. ¡Revisa tu menú de BINGO ESTELAR!`);
}
