/* ============================================================
   BINGO TEXIER - MÓDULO DE RACHA SEMANAL (STREAK SYSTEM)
   100% Independiente. Sin interferir con Bingo ni Torneo.
   ============================================================ */

let rachaState = {
    diasConsecutivos: 0,
    nivelActual: 3, // 1: Bronce ($1), 2: Plata ($3), 3: Oro ($6)
    depositadoHoy: 0,
    jugadoHoy: 0,
    rachaActiva: false
};

// 1. INYECTAR LA INTERFAZ AL CARGAR
function initRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gray-900 rounded-xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mb-4">
            <div class="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase animate-pulse">
                GANA HASTA $60
            </div>
            
            <div class="p-3 text-center border-b border-gray-800">
                <h3 class="font-black text-white text-lg tracking-widest uppercase flex items-center justify-center gap-2">
                    <i class="fas fa-fire text-orange-500"></i> RACHA TEXIER
                </h3>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Juega 7 días seguidos y llévate el pozo</p>
            </div>

            <div class="p-4 bg-black/50">
                <div class="mb-4">
                    <div class="flex justify-between text-[10px] font-bold mb-1 text-gray-400 uppercase">
                        <span id="racha-status-text">Calculando tu nivel de hoy...</span>
                        <span id="racha-level-badge" class="text-yellow-500"><i class="fas fa-spinner fa-spin"></i></span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-3 mb-1 overflow-hidden">
                        <div id="racha-daily-bar" class="bg-gradient-to-r from-orange-500 to-yellow-400 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <div class="flex justify-between text-[9px] text-gray-500 font-bold px-1">
                        <span>$1 (Bronce)</span>
                        <span>$3 (Plata)</span>
                        <span>$6+ (Oro)</span>
                    </div>
                </div>

                <div id="racha-days-grid" class="flex justify-between items-center mt-6">
                    </div>
            </div>
            
            <div class="bg-gray-800 p-2 text-center flex justify-between items-center">
                <button onclick="document.getElementById('modal-racha-info').style.display='flex'" class="text-[10px] text-yellow-500 hover:text-yellow-300 font-bold uppercase underline">
                    <i class="fas fa-book mr-1"></i> Ver Reglas
                </button>
                <div class="text-[10px] text-gray-400 font-bold">
                    <i class="fas fa-chart-line mr-1"></i> Jugado Hoy: <span id="racha-played-display" class="text-white">Bs 0.00</span>
                </div>
            </div>
        </div>

        <div id="modal-racha-info" class="hidden fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div class="bg-gray-900 border border-yellow-500 rounded-xl w-full max-w-sm p-6 shadow-2xl relative text-left">
                <button onclick="document.getElementById('modal-racha-info').style.display='none'" class="absolute top-3 right-3 text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
                <h3 class="text-yellow-500 font-black text-xl tracking-widest uppercase mb-4 text-center"><i class="fas fa-fire mr-2"></i>REGLAS DE LA RACHA</h3>
                <ul class="text-gray-300 text-xs space-y-3 mb-6">
                    <li><b class="text-white">1. Inicio Flexible:</b> Tu racha comienza el día de tu primer depósito. Tienes 7 días para completarla.</li>
                    <li><b class="text-white">2. Niveles de Premio:</b><br>
                        - Nivel Bronce (Min $1 diario): <b class="text-green-400">Ganas $10</b><br>
                        - Nivel Plata (Min $3 diario): <b class="text-green-400">Ganas $30</b><br>
                        - Nivel Oro (Min $6 diario): <b class="text-green-400">Ganas $60</b>
                    </li>
                    <li><b class="text-white">3. Regla del Eslabón Débil:</b> Tu premio final se calculará según el depósito más bajo que hayas hecho en esos 7 días.</li>
                    <li><b class="text-red-400">4. Anti-Trampa (Rollover):</b> Si depositas pero retiras el dinero sin haberlo jugado en el Bingo o Torneo ese mismo día, <b class="text-red-500">PERDERÁS TU RACHA</b> y volverás al Día 0.</li>
                </ul>
                <button onclick="document.getElementById('modal-racha-info').style.display='none'" class="w-full bg-yellow-500 text-black font-black py-3 rounded shadow transition uppercase tracking-widest">ENTENDIDO</button>
            </div>
        </div>
    `;
}

// 2. ESCUCHAR DATOS DEL USUARIO Y CALCULAR EL DÍA
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        initRachaUI();
        calcularDatosDiarios(user.uid);
        interceptarRetiros(user.uid);
    }
});

async function calcularDatosDiarios(uid) {
    // Calculamos la fecha actual de la misma forma que el sistema principal
    const d = new Date(); 
    if(d.getHours() >= 20) d.setDate(d.getDate() + 1); // Salto horario del bingo
    const dateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    
    let totalDepositado = 0;
    let totalJugado = 0;

    // 1. Escuchar Depósitos de Hoy (referencias_usadas)
    db.ref('referencias_usadas').orderByChild('uid').equalTo(uid).on('value', s => {
        totalDepositado = 0;
        if(s.exists()) {
            s.forEach(ref => {
                const data = ref.val();
                // Verificamos si el depósito fue hoy
                const depDate = new Date(data.date);
                if(depDate.getHours() >= 20) depDate.setDate(depDate.getDate() + 1);
                const depDateStr = `${String(depDate.getDate()).padStart(2,'0')}-${String(depDate.getMonth()+1).padStart(2,'0')}-${depDate.getFullYear()}`;
                if(depDateStr === dateStr) {
                    totalDepositado += data.amt;
                }
            });
        }
        rachaState.depositadoHoy = totalDepositado;
        procesarEstadoRacha(uid);
    });

    // 2. Escuchar Jugadas de Hoy (Bingo y Torneo Express)
    // Bingo
    db.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let jugadoBingo = 0;
        if(s.exists()){
            s.forEach(c => {
                const b = c.val();
                if(b.date === dateStr && b.payment_method !== 'GRATIS') {
                    // Nota: Asumimos el precio actual, idealmente el cartón debería guardar su costo
                    jugadoBingo += 35; // Valor de ejemplo, ajusta a tu precio promedio en Bs si el nodo no lo tiene
                }
            });
        }
        rachaState.jugadoHoy = jugadoBingo;
        procesarEstadoRacha(uid);
    });
    
    // Aquí puedes añadir la suma de bets_torneo_express de la misma manera
}

function procesarEstadoRacha(uid) {
    // Tasa de cambio aproximada para la UI (Ej: 35 Bs = $1)
    const tasa = 35; 
    const depDolares = rachaState.depositadoHoy / tasa;
    
    // Actualizar UI Barra diaria
    let width = 0;
    let text = "Deposita para iniciar";
    let badge = "";

    if (depDolares >= 6) { width = 100; text = "¡Nivel ORO asegurado hoy!"; badge = "🏆 ORO"; }
    else if (depDolares >= 3) { width = 60; text = "Nivel PLATA. Faltan $"+(6-depDolares).toFixed(2)+" para Oro"; badge = "🥈 PLATA"; }
    else if (depDolares >= 1) { width = 20; text = "Nivel BRONCE. Faltan $"+(3-depDolares).toFixed(2)+" para Plata"; badge = "🥉 BRONCE"; }
    else if (depDolares > 0) { width = 5; text = "Faltan $"+(1-depDolares).toFixed(2)+" para Bronce"; badge = "Incompleto"; }

    const bar = document.getElementById('racha-daily-bar');
    if(bar) {
        bar.style.width = width + '%';
        if(depDolares >= 1) bar.className = "bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-500";
        else bar.className = "bg-gradient-to-r from-orange-500 to-yellow-400 h-3 rounded-full transition-all duration-500";
    }

    const t = document.getElementById('racha-status-text'); if(t) t.textContent = text;
    const b = document.getElementById('racha-level-badge'); if(b) b.innerHTML = badge;
    const pj = document.getElementById('racha-played-display'); if(pj) pj.textContent = `Bs ${rachaState.jugadoHoy.toFixed(2)}`;

    // Leer el estado global de la racha desde Firebase
    db.ref(`users/${uid}/racha_data`).on('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3 };
        
        // Si depositó el mínimo hoy, el día de hoy se considera como el "siguiente" válido visualmente
        let diasVisuales = data.dias;
        if (depDolares >= 1 && rachaState.jugadoHoy >= rachaState.depositadoHoy) {
            diasVisuales = Math.min(7, data.dias + 1); // Si cumplió el rollover, se muestra como un día más superado
        }

        renderDaysGrid(diasVisuales);
    });
}

function renderDaysGrid(dias) {
    const grid = document.getElementById('racha-days-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    for(let i=1; i<=7; i++) {
        let icon = '<i class="fas fa-lock text-gray-700"></i>';
        let bg = 'bg-gray-800 border-gray-700';
        let text = 'text-gray-500';

        if(i < dias) {
            // Días pasados completados
            icon = '<i class="fas fa-check text-green-500"></i>';
            bg = 'bg-green-900/30 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
            text = 'text-green-400';
        } else if (i === dias) {
            // Día actual activo
            icon = '<i class="fas fa-fire text-orange-500 animate-pulse"></i>';
            bg = 'bg-orange-900/40 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
            text = 'text-orange-400 font-bold transform scale-110';
        }

        grid.innerHTML += `
            <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full border-2 ${bg} flex items-center justify-center text-xs transition-all duration-300">
                    ${icon}
                </div>
                <span class="text-[9px] mt-1 ${text}">DÍA ${i}</span>
            </div>
        `;
    }
}

// 3. EL GUARDIÁN: INTERCEPTOR DE RETIROS (ROLLOVER)
function interceptarRetiros(uid) {
    const withdrawForm = document.getElementById('withdraw-form');
    if(!withdrawForm) {
        setTimeout(() => interceptarRetiros(uid), 1000); // Reintentar si el DOM no ha cargado
        return;
    }

    // Guardamos la función original que procesa el retiro (si existe en el onsubmit)
    const originalSubmit = withdrawForm.onsubmit;

    withdrawForm.onsubmit = async (e) => {
        e.preventDefault();

        // VALIDACIÓN DE RACHA (Rollover x1)
        // Si depositó hoy algo, pero no lo ha jugado completamente y quiere retirar
        if(rachaState.depositadoHoy > 0 && rachaState.jugadoHoy < rachaState.depositadoHoy) {
            const confirmar = confirm(
                "⚠️ ALERTA DE RACHA ⚠️\n\n" +
                "Tienes dinero depositado hoy que no has jugado en su totalidad.\n" +
                "Si realizas este retiro ahora, el sistema detectará evasión de la regla y PERDERÁS TU PROGRESO DE LA RACHA (volverás al Día 0).\n\n" +
                "¿Estás seguro de que quieres retirar y perder la racha?"
            );

            if(!confirmar) {
                document.getElementById('withdraw-form-area').style.display='none';
                return; // Bloquea el retiro
            } else {
                // Si acepta perderla, reseteamos su racha en Firebase
                await db.ref(`users/${uid}/racha_data`).update({
                    dias: 0,
                    nivel_minimo: 3
                });
            }
        }

        // Si pasó la validación (o aceptó el castigo), ejecuta el retiro original
        if (originalSubmit) {
            originalSubmit.call(withdrawForm, e);
        }
    };
}
