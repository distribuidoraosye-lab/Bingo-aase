/* ============================================================
   BINGO TEXIER - HORA LOCA (VERSIÓN MANUAL/ADMIN)
   - Sin fechas. Sale una sola vez.
   - Solo vuelve a salir si el Admin presiona "Resetear a Todos".
   ============================================================ */

let dbHL;
let hl_uid = null;
let hl_estadoReto = 'pending';
let hl_premioCant = 0;
let hl_tipoPremio = ''; 
let hl_balanceInicial = 0;
let hl_cartonesGratisActuales = 0; 
let admin_HoraLocaActiva = false;
let admin_Probs = { p5: 50, p10: 30, p15: 19.99999, p50: 0.00001 };
let hl_listenersActivos = false;

// 1. INYECTOR DE INTERFAZ
function inyectarUIHoraLoca() {
    if(document.getElementById('hora-loca-container-gancho')) return; 

    const uiHTML = `
        <div id="hora-loca-container-gancho" class="w-full mb-4" style="display:none;">
            <div id="panel-reto-activo" class="hidden bg-gray-900 p-4 rounded-xl border-l-4 border-yellow-400 text-white shadow-xl relative overflow-hidden mb-2">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-sm text-yellow-400"><i class="fas fa-lock mr-2"></i> PREMIO BLOQUEADO</h3>
                    <span class="bg-yellow-500 text-red-900 text-[10px] font-black px-2 py-1 rounded animate-pulse">PENDIENTE</span>
                </div>
                <p class="text-xs text-gray-300 mb-2">Tienes <span id="hl-cant-cartones" class="font-black text-green-400 text-lg">0</span> esperando por ti.</p>
                <div class="bg-gray-800 p-2 rounded border border-gray-700">
                    <p class="text-[10px] text-gray-300"><i class="fas fa-info-circle text-blue-400 mr-1"></i> <b>Misión:</b> Compra al menos 1 ticket de Bingo o Torneo con tu saldo real para liberarlo automáticamente.</p>
                </div>
                <p class="text-[9px] text-gray-500 mt-2 italic text-center">Nota: Las jugadas con saldo gratis no suman progreso para tu racha diaria.</p>
            </div>

            <div id="panel-reto-completado" class="hidden bg-green-900 p-4 rounded-xl border-l-4 border-green-400 text-white shadow-xl relative overflow-hidden mb-2">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-sm text-green-400"><i class="fas fa-unlock-alt mr-2"></i> ¡PREMIO DESBLOQUEADO!</h3>
                    <span class="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded">ACTIVO</span>
                </div>
                <p class="text-xs text-gray-300 mb-3">Te quedan <span id="hl-cartones-restantes" class="font-black text-yellow-400 text-xl mx-1">0</span> cartones gratis por jugar.</p>
                <div class="bg-green-800 p-2 rounded border border-green-600 text-center shadow-inner">
                    <p class="text-[10px] text-green-100 font-medium"><i class="fas fa-exclamation-triangle text-yellow-400 mr-1"></i> <b>IMPORTANTE:</b> Debes usar tus cartones hoy mismo o se perderán a la medianoche.</p>
                </div>
            </div>
        </div>
    `;
    const ancla = document.getElementById('welcome-bonus-module-container');
    if(ancla) ancla.insertAdjacentHTML('afterend', uiHTML);

    const modalesHTML = `
        <div id="modal-ruleta-hl" class="hidden fixed inset-0 bg-black/90 z- flex items-center justify-center">
            <div class="text-center w-full max-w-sm px-4">
                <h2 class="text-4xl font-black text-yellow-400 mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse">¡HORA LOCA!</h2>
                <div class="relative w-64 h-64 mx-auto mb-8">
                    <img id="rueda-hl" src="https://bingotexier.com/archivos/imagenes/23317580062f6aaf7111ed9d37c811fe37801382.jpeg" class="w-full h-full rounded-full border-4 border-yellow-400 object-cover shadow-[0_0_40px_rgba(245,158,11,0.8)]">
                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 text-white text-3xl drop-shadow-md z-10"><i class="fas fa-caret-down"></i></div>
                </div>
                <button id="btn-girar-hl" onclick="iniciarGiroHL()" class="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-black py-4 rounded-full shadow-xl text-2xl transition transform active:scale-95 border-b-4 border-yellow-600">
                    GIRAR AHORA
                </button>
            </div>
        </div>

        <div id="modal-gancho-hl" class="hidden fixed inset-0 bg-black/80 z- flex items-center justify-center">
            <div class="bg-white p-6 rounded-3xl w-11/12 max-w-sm text-center border-t-8 border-orange-500 shadow-2xl">
                <h3 class="text-2xl font-black text-gray-800 mb-2">¡TE TOCARON <span id="hl-texto-premio" class="text-green-600"></span>!</h3>
                <p class="text-sm text-gray-600 mb-4 font-medium">Están reservados a tu nombre. Solo necesitas realizar <b>una compra</b> de cualquier valor con tu saldo real hoy para que se agreguen a tu cuenta automáticamente.</p>
                <button onclick="aceptarGanchoHL()" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg transition tracking-wide text-lg">
                    ACEPTAR RETO
                </button>
                <p class="text-[9px] text-gray-400 mt-3 italic">Tus premios de regalo no sumarán para la racha diaria.</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalesHTML);
}

// 2. ARRANQUE E INYECCIÓN DE LISTENERS
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        dbHL = firebase.database();
        hl_uid = user.uid;
        
        if (hl_listenersActivos) return;
        hl_listenersActivos = true;

        dbHL.ref(`users/${hl_uid}/welcome_bonus_status`).once('value', snapBono => {
            let estadoBono = snapBono.val();
            if (estadoBono === 'pending' || estadoBono === 'active') return; 

            inyectarUIHoraLoca();
            document.getElementById('hora-loca-container-gancho').style.display = 'block';

            // A. Escuchar Configuración Global
            dbHL.ref('config/hora_loca').on('value', snapAdmin => {
                const config = snapAdmin.val() || {};
                admin_HoraLocaActiva = config.activa === true;
                if(config.probabilidades_ruleta) admin_Probs = config.probabilidades_ruleta;
                actualizarInterfazVisual();
            });

            // B. Escuchar Estatus del Reto del Usuario (SIN FECHAS)
            dbHL.ref(`users/${hl_uid}/reto_ruleta`).on('value', snapUser => {
                if (!snapUser.exists()) {
                    // Si no existe (porque el admin lo reseteó), se crea en pendiente y permitimos que la ruleta salga de nuevo
                    window.ruletaAutomaticaMostrada = false;
                    dbHL.ref(`users/${hl_uid}/reto_ruleta`).set({ status: 'pending', premio_cant: 0, tipo_premio: '', balance_inicial: 0 });
                    return; 
                }

                let data = snapUser.val();
                hl_estadoReto = data.status;
                hl_premioCant = data.premio_cant;
                hl_tipoPremio = data.tipo_premio;
                hl_balanceInicial = data.balance_inicial;
                
                actualizarInterfazVisual();
            });

            // C. Escuchar Saldo Real
            dbHL.ref(`users/${hl_uid}/balance`).on('value', snapBalance => {
                let saldoActual = snapBalance.val() || 0;
                
                if (hl_estadoReto === 'locked' && saldoActual < hl_balanceInicial) {
                    hl_estadoReto = 'claiming'; 
                    liberarPremioFinal();
                }
                if (hl_estadoReto === 'locked' && saldoActual > hl_balanceInicial) {
                    dbHL.ref(`users/${hl_uid}/reto_ruleta/balance_inicial`).set(saldoActual);
                }
            });

            // D. Escuchar Cartones Gratis
            dbHL.ref(`users/${hl_uid}/free_bingo_credits`).on('value', snapCartones => {
                hl_cartonesGratisActuales = snapCartones.val() || 0;
                if(document.getElementById('hl-cartones-restantes')) {
                    document.getElementById('hl-cartones-restantes').textContent = hl_cartonesGratisActuales;
                }
                actualizarInterfazVisual(); 
            });
        });
    } else {
        hl_listenersActivos = false;
    }
});

// 3. CONTROL DE INTERFAZ
function actualizarInterfazVisual() {
    const panelBloqueado = document.getElementById('panel-reto-activo');
    const panelDesbloqueado = document.getElementById('panel-reto-completado');
    const modalRuleta = document.getElementById('modal-ruleta-hl');
    
    if (hl_estadoReto === 'pending' && admin_HoraLocaActiva) {
        if(panelBloqueado) panelBloqueado.style.display = 'none';
        if(panelDesbloqueado) panelDesbloqueado.style.display = 'none';
        
        if(!window.ruletaAutomaticaMostrada && modalRuleta) {
            modalRuleta.style.display = 'flex';
            window.ruletaAutomaticaMostrada = true;
        }
    } 
    else if (hl_estadoReto === 'locked') {
        if(modalRuleta) modalRuleta.style.display = 'none';
        if(panelDesbloqueado) panelDesbloqueado.style.display = 'none';
        if(panelBloqueado) {
            panelBloqueado.style.display = 'block';
            let textoVisible = hl_tipoPremio === 'efectivo' ? 'Premio Mayor de 50$' : `${hl_premioCant} Cartones`;
            document.getElementById('hl-cant-cartones').textContent = textoVisible;
        }
    } 
    else if (hl_estadoReto === 'claimed' || hl_estadoReto === 'claiming') {
        if(modalRuleta) modalRuleta.style.display = 'none';
        if(panelBloqueado) panelBloqueado.style.display = 'none';
        if(panelDesbloqueado) {
            if(hl_tipoPremio === 'efectivo' || hl_cartonesGratisActuales <= 0) {
                panelDesbloqueado.style.display = 'none';
            } else {
                panelDesbloqueado.style.display = 'block';
                document.getElementById('hl-cartones-restantes').textContent = hl_cartonesGratisActuales;
            }
        }
    } 
    else {
        if(modalRuleta) modalRuleta.style.display = 'none';
        if(panelBloqueado) panelBloqueado.style.display = 'none';
        if(panelDesbloqueado) panelDesbloqueado.style.display = 'none';
    }
}

// 4. ACCIONES DE LA RULETA
window.iniciarGiroHL = function() {
    const btn = document.getElementById('btn-girar-hl');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GIRANDO...';

    const rueda = document.getElementById('rueda-hl');
    rueda.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    let rng = Math.random() * 100;
    let premioValor = 5;
    let tipo = 'cartones';
    let angulo = 0;

    let t1 = parseFloat(admin_Probs.p5);
    let t2 = t1 + parseFloat(admin_Probs.p10);
    let t3 = t2 + parseFloat(admin_Probs.p15);

    if (rng <= t1) { premioValor = 5; tipo = 'cartones'; angulo = 360 - 45; } 
    else if (rng <= t2) { premioValor = 10; tipo = 'cartones'; angulo = 360 - 135; } 
    else if (rng <= t3) { premioValor = 15; tipo = 'cartones'; angulo = 360 - 225; } 
    else { premioValor = 50; tipo = 'efectivo'; angulo = 360 - 315; }

    hl_premioCant = premioValor;
    hl_tipoPremio = tipo;

    rueda.style.transform = `rotate(${(6 * 360) + angulo}deg)`;
    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}

    setTimeout(() => {
        document.getElementById('modal-ruleta-hl').style.display = 'none';
        
        let textoPremio = tipo === 'efectivo' ? '¡EL PREMIO MAYOR DE 50$!' : `${premioValor} CARTONES`;
        document.getElementById('hl-texto-premio').innerText = textoPremio;
        
        document.getElementById('modal-gancho-hl').style.display = 'flex';
    }, 5500); 
}

window.aceptarGanchoHL = async function() {
    const snap = await dbHL.ref(`users/${hl_uid}/balance`).once('value');
    const saldoActual = snap.val() || 0;
    
    await dbHL.ref(`users/${hl_uid}/reto_ruleta`).set({
        status: 'locked',
        premio_cant: hl_premioCant,
        tipo_premio: hl_tipoPremio,
        balance_inicial: saldoActual
    });

    document.getElementById('modal-gancho-hl').style.display = 'none';
}

// 5. LIBERACIÓN DEL PREMIO
async function liberarPremioFinal() {
    const statusRef = dbHL.ref(`users/${hl_uid}/reto_ruleta/status`);
    
    const result = await statusRef.transaction(currentStatus => {
        if (currentStatus === 'locked') return 'claimed';
        return undefined; 
    });

    if (result.committed) {
        if (hl_tipoPremio === 'cartones') {
            await dbHL.ref(`users/${hl_uid}/free_bingo_credits`).transaction(current => (current || 0) + hl_premioCant);
            alert(`🎉 ¡RETO CUMPLIDO! Tus ${hl_premioCant} Cartones Gratis han sido desbloqueados automáticamente. ¡Revisa tu menú de BINGO ESTELAR!`);
        } else if (hl_tipoPremio === 'efectivo') {
            let montoEnBs = 2500; 
            await dbHL.ref(`users/${hl_uid}/balance`).transaction(current => (current || 0) + montoEnBs);
            alert(`💰 ¡RETO CUMPLIDO! Felicidades, has ganado el PREMIO MAYOR. Se ha inyectado el equivalente a 50$ en tu Saldo Real.`);
        }
    }
}
