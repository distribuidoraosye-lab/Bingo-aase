/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (Streak & Rollover)
   V3 - DEFINITIVO, BLINDADO Y AUTÓNOMO
   ============================================================ */

// 1. Conexión propia y segura a la BD para no chocar con el sistema principal
const dbRacha = firebase.database();

let streakState = {
    todayDeposit: 0,
    todayPlayed: 0,
    currentDay: 0,
    minLevel: 3, 
    tasa: 35 // Ajusta esto según tu tasa de cambio real Bs/$
};

// 2. Inyectar Interfaz Premium
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) {
        console.error("❌ ERROR: No se encontró el <div id='racha-module-container'> en el HTML.");
        return;
    }

    container.innerHTML = `
        <div class="bg-gray-900 rounded-2xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mt-2 mb-6">
            <div class="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase animate-pulse z-10">
                Pozo Semanal $60
            </div>
            
            <div class="p-4 text-center border-b border-gray-800 bg-black/40">
                <h3 class="font-black text-white text-xl tracking-tighter uppercase flex items-center justify-center gap-2">
                    <i class="fas fa-fire text-orange-500"></i> RACHA TEXIER
                </h3>
            </div>

            <div class="p-5 bg-gradient-to-b from-transparent to-black/80">
                <div class="mb-5">
                    <div class="flex justify-between text-[11px] font-black mb-2 text-gray-400 uppercase tracking-widest">
                        <span id="streak-msg">Mueve tu dinero hoy</span>
                        <span id="streak-badge" class="text-yellow-500">CALCULANDO...</span>
                    </div>
                    <div class="w-full bg-gray-800 rounded-full h-4 p-0.5 border border-gray-700 shadow-inner overflow-hidden">
                        <div id="streak-bar" class="bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]" style="width: 0%"></div>
                    </div>
                    <div class="flex justify-between text-[9px] text-gray-500 font-bold px-2 mt-1 uppercase">
                        <span>$1 Bronce</span>
                        <span>$3 Plata</span>
                        <span>$6+ Oro</span>
                    </div>
                </div>

                <div id="streak-days" class="flex justify-between items-center px-1">
                    </div>
            </div>
            
            <div class="bg-black/60 p-3 flex justify-between items-center">
                <button onclick="showRachaRules()" class="text-[10px] text-yellow-500 font-black uppercase tracking-widest hover:underline">
                    <i class="fas fa-info-circle mr-1"></i> Reglas de Racha
                </button>
                <div class="bg-gray-800 px-3 py-1 rounded-lg border border-gray-700 flex items-center">
                    <span class="text-[9px] text-gray-400 font-bold uppercase mr-2">Jugado Hoy:</span>
                    <span id="streak-played" class="text-white font-black text-xs">Bs 0.00</span>
                </div>
            </div>
        </div>

        <div id="modal-rules-racha" class="hidden fixed inset-0 bg-black/95 z- flex items-center justify-center p-4">
            <div class="bg-gray-900 border-2 border-yellow-500 rounded-3xl w-full max-w-sm p-8 shadow-2xl relative">
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full border-2 border-white shadow-lg"><i class="fas fa-times"></i></button>
                <h3 class="text-yellow-500 font-black text-2xl text-center mb-6 tracking-tighter uppercase">REGLAS DE ORO</h3>
                <div class="space-y-4 text-xs text-gray-300">
                    <p><b class="text-white uppercase">1. El primer depósito activa tu racha.</b> Debes mantener el flujo de juego durante 7 días seguidos.</p>
                    <p><b class="text-white uppercase">2. Niveles:</b> El premio final ($10, $30 o $60) dependerá del monto MÁS BAJO depositado en la semana.</p>
                    <p><b class="text-orange-400 uppercase">3. Rollover Anti-Trampa:</b> Todo depósito diario DEBE ser jugado. Si retiras antes de jugar lo depositado hoy, <b class="text-red-500 font-black">LA RACHA VUELVE A CERO.</b></p>
                </div>
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="w-full mt-8 bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest">Entendido</button>
            </div>
        </div>
    `;
    console.log("✅ Interfaz de Racha inyectada con éxito.");
}

window.showRachaRules = () => { document.getElementById('modal-rules-racha').style.display = 'flex'; };

// 3. Inicializador Seguro (Espera que el HTML y Auth existan)
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Módulo Racha iniciado. Esperando a Firebase Auth...");
    setTimeout(() => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log("👤 Usuario logueado detectado:", user.uid);
                injectRachaUI();
                initStreakMonitor(user.uid);
                protectWithdrawals(user.uid);
            }
        });
    }, 500); 
});

async function initStreakMonitor(uid) {
    const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
    if(d.getHours() >= 20) d.setDate(d.getDate() + 1); // Cierre de caja 8 PM
    const dateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;

    // Monitor Depósitos Hoy (Automáticos y Manuales del Admin)
    dbRacha.ref('referencias_usadas').orderByChild('uid').equalTo(uid).on('value', s => {
        let depositado = 0;
        s.forEach(ref => {
            const data = ref.val();
            const depDate = new Date(data.date);
            if(depDate.getHours() >= 20) depDate.setDate(depDate.getDate() + 1);
            const depDateStr = `${String(depDate.getDate()).padStart(2,'0')}-${String(depDate.getMonth()+1).padStart(2,'0')}-${depDate.getFullYear()}`;
            if(depDateStr === dateStr) depositado += data.amt;
        });
        streakState.todayDeposit = depositado;
        updateStreakUI(uid);
    });

    // Monitor Jugado Hoy (Bingo Estelar)
    dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let jugado = 0;
        // Leemos el precio actual del cartón desde el sistema, si no existe usamos 35 Bs por defecto
        const cardPrice = (typeof currentCardPrice !== 'undefined' && currentCardPrice > 0) ? currentCardPrice : 35;
        
        s.forEach(c => {
            if(c.val().date === dateStr && c.val().payment_method !== 'GRATIS') {
                jugado += cardPrice;
            }
        });
        streakState.todayPlayed = jugado;
        updateStreakUI(uid);
    });
}

function updateStreakUI(uid) {
    const usd = streakState.todayDeposit / streakState.tasa;
    let width = 0; let badge = "INCOMPLETO"; let msg = "Mueve capital para avanzar";
    
    let nivelAlcanzadoHoy = 3; 
    if (usd >= 6) { width = 100; badge = "🥇 NIVEL ORO"; msg = "Nivel Oro Asegurado Hoy"; nivelAlcanzadoHoy = 3; }
    else if (usd >= 3) { width = 60; badge = "🥈 NIVEL PLATA"; msg = "Faltan $"+(6-usd).toFixed(2)+" para Oro"; nivelAlcanzadoHoy = 2; }
    else if (usd >= 1) { width = 25; badge = "🥉 NIVEL BRONCE"; msg = "Faltan $"+(3-usd).toFixed(2)+" para Plata"; nivelAlcanzadoHoy = 1; }

    const bar = document.getElementById('streak-bar');
    if(bar) bar.style.width = width + '%';
    
    const badgeEl = document.getElementById('streak-badge');
    if(badgeEl) badgeEl.textContent = badge;
    
    const msgEl = document.getElementById('streak-msg');
    if(msgEl) msgEl.textContent = msg;
    
    const playedEl = document.getElementById('streak-played');
    if(playedEl) playedEl.textContent = "Bs " + streakState.todayPlayed.toFixed(2);

    // ========================================================
    // EL MOTOR DE GUARDADO Y RESETEO AUTOMÁTICO
    // ========================================================
    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3, last_update: "00-00-0000", last_active: "00-00-0000" };
        let updates = {};
        let isDirty = false;

        const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
        if(d.getHours() >= 20) d.setDate(d.getDate() + 1);
        const dateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
        
        const ayerDate = new Date(d);
        ayerDate.setDate(ayerDate.getDate() - 1);
        const ayerStr = `${String(ayerDate.getDate()).padStart(2,'0')}-${String(ayerDate.getMonth()+1).padStart(2,'0')}-${ayerDate.getFullYear()}`;

        // 1. EL VERDUGO: Si rompió la racha por no jugar ayer ni hoy
        if (data.dias > 0 && data.last_active !== dateStr && data.last_active !== ayerStr) {
            console.log("⚠️ Racha rota por inactividad. Reseteando a 0.");
            data.dias = 0;
            data.nivel_minimo = 3;
            updates = { dias: 0, nivel_minimo: 3, last_active: dateStr };
            isDirty = true;
        }

        // 2. EVALUAR LA META DE HOY
        let visualDay = data.dias;

        if (usd >= 1 && streakState.todayPlayed >= streakState.todayDeposit) {
            visualDay = Math.min(7, data.dias + 1); 
            
            // Sellar el día superado si no se ha sellado hoy
            if (data.last_update !== dateStr) {
                const nuevoNivelMinimo = Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                updates.dias = visualDay;
                updates.nivel_minimo = nuevoNivelMinimo;
                updates.last_update = dateStr;
                updates.last_active = dateStr;
                isDirty = true;
                console.log(`🏆 ¡Día ${visualDay} superado y guardado!`);
            }
        } else if (usd > 0) {
            // Si depositó pero falta jugar, guardamos que estuvo activo para que el verdugo no lo mate
            if (data.last_active !== dateStr) {
                updates.last_active = dateStr;
                isDirty = true;
            }
        }

        // Enviar actualización a Firebase solo si hubo cambios (evita bucles)
        if (isDirty) {
            dbRacha.ref(`users/${uid}/racha_data`).update(updates);
        }

        renderStreakDays(visualDay);
    });
}

function renderStreakDays(activeDay) {
    const container = document.getElementById('streak-days');
    if(!container) return;
    container.innerHTML = '';
    for(let i=1; i<=7; i++) {
        let icon = '<i class="fas fa-lock opacity-30"></i>';
        let color = 'bg-gray-800 border-gray-700 text-gray-600';
        
        if(i < activeDay) {
            icon = '<i class="fas fa-check"></i>';
            color = 'bg-green-600 border-white text-white shadow-[0_0_10px_rgba(34,197,94,0.6)]';
        } else if (i === activeDay) {
            icon = '<i class="fas fa-fire animate-pulse"></i>';
            color = 'bg-orange-500 border-white text-white shadow-[0_0_15px_rgba(249,115,22,0.8)] scale-110';
        }

        container.innerHTML += `
            <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full border-2 ${color} flex items-center justify-center text-xs transition-all duration-500">
                    ${icon}
                </div>
                <span class="text-[8px] font-black mt-1 uppercase ${i <= activeDay ? 'text-white' : 'text-gray-600'}">Día ${i}</span>
            </div>
        `;
    }
}

// 4. EL GUARDIÁN DE RETIROS
function protectWithdrawals(uid) {
    const form = document.getElementById('withdraw-form');
    if(!form) return;
    const oldSubmit = form.onsubmit;

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Regla: Si depositaste hoy y quieres retirar sin haberlo jugado completo
        if(streakState.todayDeposit > 0 && streakState.todayPlayed < streakState.todayDeposit) {
            const warn = confirm("⚠️ ¡ALERTA DE RACHA! ⚠️\n\nNo has jugado el total de tu depósito de hoy. Si retiras ahora, tu racha volverá al DÍA 0 y perderás tu progreso.\n\n¿Deseas retirar de todas formas?");
            if(!warn) {
                // Canceló el retiro
                document.getElementById('withdraw-form-area').style.display='none';
                return;
            }
            // Si acepta el castigo, reseteamos la racha a cero
            await dbRacha.ref(`users/${uid}/racha_data`).update({ dias: 0, nivel_minimo: 3 });
        }
        
        // Continúa con el retiro normal si todo está en orden o si aceptó el castigo
        if(oldSubmit) oldSubmit.call(form, e);
    };
}
