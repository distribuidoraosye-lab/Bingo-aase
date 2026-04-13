/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (Streak & Rollover)
   V5 - BARRA SEMANAL, PREMIO PARPADEANTE Y PERDÓN DE PENALTI
   ============================================================ */

const dbRacha = firebase.database();

let streakState = {
    todayDeposit: 0,
    jugadoBingo: 0,
    jugadoTorneo: 0,
    get todayPlayed() { return this.jugadoBingo + this.jugadoTorneo; },
    currentDay: 0,
    minLevel: 3
};

// 1. Inyectar Interfaz Premium 
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gray-900 rounded-2xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mt-2 mb-6">
            
            <div class="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 p-4 text-center border-b border-gray-800 shadow-inner">
                <h3 id="projected-prize-text" class="font-black text-white text-xl tracking-tighter uppercase animate-pulse drop-shadow-lg">
                    🔥 ¡GANARÁS $60 GRATIS AL LLEGAR AL DÍA 7! 🔥
                </h3>
                <p class="text-[9px] text-yellow-200 uppercase tracking-widest mt-1 font-bold">
                    El premio final se ajusta a tu depósito más bajo de la semana
                </p>
            </div>

            <div class="p-5 bg-black/80">
                <div class="w-full bg-gray-800 rounded-full h-6 p-0.5 border border-gray-700 shadow-inner relative mb-6">
                    <div id="streak-bar-7days" class="bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]" style="width: 0%"></div>
                    <div class="absolute inset-0 flex justify-between px-3 items-center text-[10px] font-black text-white/50 pointer-events-none">
                        <span>D1</span><span>D2</span><span>D3</span><span>D4</span><span>D5</span><span>D6</span><span class="text-yellow-400 drop-shadow-md text-xs">🎁 D7</span>
                    </div>
                </div>

                <div id="streak-days-grid" class="flex justify-between items-start px-1">
                    </div>
            </div>
            
            <div class="bg-gray-800 p-4 border-t border-gray-700">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Misión de Hoy:</span>
                    <span id="today-level-badge" class="text-[10px] bg-gray-700 px-2 py-1 rounded text-white font-black shadow-sm">ESPERANDO DEPÓSITO...</span>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-center">
                    <div class="bg-black/50 p-2 rounded-lg border border-gray-600 shadow-inner">
                        <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">Depositado Hoy</p>
                        <p id="today-deposit-text" class="text-sm font-black text-white">Bs 0.00</p>
                    </div>
                    <div class="bg-black/50 p-2 rounded-lg border border-gray-600 shadow-inner">
                        <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">Jugado Hoy</p>
                        <p id="today-played-text" class="text-sm font-black text-orange-400">Bs 0.00</p>
                    </div>
                </div>
                <p id="rollover-warning" class="text-[9px] text-red-400 text-center mt-3 font-bold uppercase tracking-widest hidden animate-pulse">
                    ⚠️ Debes jugar todo lo depositado hoy para asegurar el día.
                </p>
            </div>

            <div class="bg-black/90 p-2 text-center">
                <button onclick="showRachaRules()" class="text-[10px] text-yellow-500 font-black uppercase tracking-widest hover:underline opacity-80 hover:opacity-100 transition">
                    📖 Ver Tabla de Niveles y Reglas
                </button>
            </div>
        </div>

        <div id="modal-rules-racha" class="hidden fixed inset-0 bg-black/95 z- flex items-center justify-center p-4">
            <div class="bg-gray-900 border-2 border-yellow-500 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full border-2 border-white shadow-lg"><i class="fas fa-times"></i></button>
                <h3 class="text-yellow-500 font-black text-2xl text-center mb-4 tracking-tighter uppercase">REGLAS CLARAS</h3>
                
                <div class="space-y-3 text-xs text-gray-300">
                    <p><b class="text-white uppercase">¿CÓMO GANAR?</b><br>Juega 7 días seguidos cumpliendo el mínimo diario equivalente a cartones de Bingo. El premio final se basa en el nivel del día que MENOS hayas apostado.</p>
                    
                    <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-inner">
                        <p class="mb-2"><b class="text-orange-400">🥉 Nivel Bronce:</b> Juega mín. 1 Cartón ($1) diario ➔ <b class="text-green-400 font-black">Ganas $10</b></p>
                        <p class="mb-2"><b class="text-gray-300">🥈 Nivel Plata:</b> Juega mín. 3 Cartones ($3) diarios ➔ <b class="text-green-400 font-black">Ganas $30</b></p>
                        <p><b class="text-yellow-400">🥇 Nivel Oro:</b> Juega mín. 6 Cartones ($6) diarios ➔ <b class="text-green-400 font-black">Ganas $60</b></p>
                    </div>

                    <p><b class="text-red-400 uppercase">⚠️ REGLA ESTRICTA (ANTI-TRAMPA):</b><br>Todo lo que deposites en el día <b>DEBES JUGARLO</b> (en Bingo o Torneo). Si depositas y luego retiras el dinero sin haberlo apostado, pierdes la racha y vuelves al Día 0.</p>
                </div>
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="w-full mt-6 bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest">Entendido</button>
            </div>
        </div>
    `;
}

window.showRachaRules = () => { document.getElementById('modal-rules-racha').style.display = 'flex'; };

// 2. Inicializador
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                injectRachaUI();
                initStreakMonitor(user.uid);
                protectWithdrawals(user.uid);
            }
        });
    }, 500); 
});

async function initStreakMonitor(uid) {
    const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
    if(d.getHours() >= 20) d.setDate(d.getDate() + 1); 
    const dateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;

    // Depósitos de hoy
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
        updateStreakUI(uid, dateStr);
    });

    // Jugado hoy (Bingo)
    dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let jugadoB = 0;
        const cardPrice = (typeof currentCardPrice !== 'undefined' && currentCardPrice > 0) ? currentCardPrice : 35;
        s.forEach(c => {
            if(c.val().date === dateStr && c.val().payment_method !== 'GRATIS') jugadoB += cardPrice;
        });
        streakState.jugadoBingo = jugadoB;
        updateStreakUI(uid, dateStr);
    });

    // Jugado hoy (Torneo)
    dbRacha.ref(`bets_torneo_express/${dateStr}/${uid}`).on('value', s => {
        let jugadoT = 0;
        const torneoPrice = (typeof torneoConfig !== 'undefined' && torneoConfig.price > 0) ? torneoConfig.price : 1000;
        if (s.exists()) {
            s.forEach(c => { jugadoT += torneoPrice; });
        }
        streakState.jugadoTorneo = jugadoT;
        updateStreakUI(uid, dateStr);
    });
}

function updateStreakUI(uid, dateStr) {
    // Matemática: Precio de Cartón = $1
    const cardPrice = (typeof currentCardPrice !== 'undefined' && currentCardPrice > 0) ? currentCardPrice : 35;
    const usdDepositado = streakState.todayDeposit / cardPrice;
    
    let nivelAlcanzadoHoy = 0;
    let badgeHtml = "<span class='text-gray-400'>ESPERANDO DEPÓSITO...</span>";

    if (usdDepositado >= 6) { nivelAlcanzadoHoy = 3; badgeHtml = "<span class='text-yellow-400'>🥇 NIVEL ORO ALCANZADO</span>"; }
    else if (usdDepositado >= 3) { nivelAlcanzadoHoy = 2; badgeHtml = "<span class='text-gray-300'>🥈 NIVEL PLATA (Juega más para Oro)</span>"; }
    else if (usdDepositado >= 1) { nivelAlcanzadoHoy = 1; badgeHtml = "<span class='text-orange-400'>🥉 NIVEL BRONCE (Juega más para Plata)</span>"; }
    else if (usdDepositado > 0) { badgeHtml = "<span class='text-red-400'>INCOMPLETO (Mínimo 1 Cartón)</span>"; }

    // Actualizar Panel Misión de Hoy
    document.getElementById('today-deposit-text').textContent = "Bs " + streakState.todayDeposit.toLocaleString('es-VE');
    document.getElementById('today-played-text').textContent = "Bs " + streakState.todayPlayed.toLocaleString('es-VE');
    document.getElementById('today-level-badge').innerHTML = badgeHtml;

    let rolloverOk = (usdDepositado >= 1 && streakState.todayPlayed >= streakState.todayDeposit);
    
    const warnEl = document.getElementById('rollover-warning');
    if (usdDepositado > 0 && !rolloverOk) { warnEl.classList.remove('hidden'); } 
    else { warnEl.classList.add('hidden'); }

    // Conexión a Base de Datos
    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3, last_update: "00-00-0000", last_active: "00-00-0000" };
        let isPenalized = (data.penalizado_hoy === dateStr);
        let isDirty = false;
        let updates = {};

        // 1. EL PERDÓN: Si estaba penalizado hoy, pero recapacitó, depositó de nuevo y cumplió el rollover.
        if (isPenalized && rolloverOk) {
            isPenalized = false;
            updates.penalizado_hoy = null; // Borra la penalización
            data.dias = 0; // Arranca su Día 1 hoy
            isDirty = true;
            console.log("✅ Rollover cumplido después de penalización. Perdón aplicado.");
        }

        // 2. EL VERDUGO DE INACTIVIDAD
        const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
        const ayerDate = new Date(d); ayerDate.setDate(ayerDate.getDate() - 1);
        const ayerStr = `${String(ayerDate.getDate()).padStart(2,'0')}-${String(ayerDate.getMonth()+1).padStart(2,'0')}-${ayerDate.getFullYear()}`;

        if (!isPenalized && data.dias > 0 && data.last_active !== dateStr && data.last_active !== ayerStr) {
            data.dias = 0;
            data.nivel_minimo = 3;
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = dateStr;
            isDirty = true;
        }

        // 3. CÁLCULO DE DÍAS Y BARRA
        let diasOficiales = isPenalized ? 0 : data.dias;
        let barFillPercentage = (diasOficiales / 7) * 100;

        // Si cumplió hoy, la barra sube hasta el nuevo día
        if (!isPenalized && rolloverOk) {
            const nuevoDia = Math.min(7, data.dias + 1);
            barFillPercentage = (nuevoDia / 7) * 100;
            
            if (data.last_update !== dateStr) {
                // Guarda el progreso sellado
                let minLvl = data.dias === 0 ? nivelAlcanzadoHoy : Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                updates.dias = nuevoDia;
                updates.nivel_minimo = minLvl;
                updates.last_update = dateStr;
                updates.last_active = dateStr;
                isDirty = true;
                data.dias = nuevoDia; // Actualizamos local para el render
                data.nivel_minimo = minLvl;
            }
        } else if (!isPenalized && usdDepositado > 0) {
            // Animación de que "está llenando" el día actual pero aún no completa el rollover
            barFillPercentage = ((data.dias + 0.5) / 7) * 100;
            if (data.last_active !== dateStr) {
                updates.last_active = dateStr;
                isDirty = true;
            }
        }

        // 4. ACTUALIZAR PREMIO PROYECTADO
        let currentMinLvl = data.nivel_minimo || 3;
        // Si está en el día 0, el letrero muestra el potencial máximo basado en lo que está apostando hoy
        if (data.dias === 0 || (isPenalized && rolloverOk)) {
            currentMinLvl = nivelAlcanzadoHoy > 0 ? nivelAlcanzadoHoy : 3;
        } else if (usdDepositado > 0) {
            // Si ya tiene días acumulados y hoy apuesta menos, el letrero baja el premio al instante para advertirle
            currentMinLvl = Math.min(currentMinLvl, nivelAlcanzadoHoy > 0 ? nivelAlcanzadoHoy : currentMinLvl);
        }

        let premioProyectado = 60;
        if (currentMinLvl === 2) premioProyectado = 30;
        if (currentMinLvl === 1) premioProyectado = 10;
        if (isPenalized) premioProyectado = 0;

        const titleEl = document.getElementById('projected-prize-text');
        if (isPenalized) {
            titleEl.innerHTML = `🚫 RACHA PERDIDA POR RETIRO 🚫`;
            titleEl.className = "font-black text-white text-xl tracking-tighter uppercase drop-shadow-lg";
        } else {
            titleEl.innerHTML = `🔥 ¡GANARÁS $${premioProyectado} GRATIS AL LLEGAR AL DÍA 7! 🔥`;
            titleEl.className = "font-black text-white text-xl tracking-tighter uppercase animate-pulse drop-shadow-lg";
        }

        // 5. PINTAR BARRA PRINCIPAL
        const bar = document.getElementById('streak-bar-7days');
        bar.style.width = barFillPercentage + '%';
        if (isPenalized) {
            bar.className = "bg-red-600 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
        } else {
            bar.className = "bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }

        renderStreakDaysGrid(data.dias, isPenalized, rolloverOk, nivelAlcanzadoHoy);
    });
}

function renderStreakDaysGrid(diasCompletados, isPenalized, rolloverOk, nivelAlcanzadoHoy) {
    const grid = document.getElementById('streak-days-grid');
    grid.innerHTML = '';
    
    for(let i=1; i<=7; i++) {
        let icon = '🔒';
        let cssText = 'text-gray-600 opacity-50';
        let bgStyle = '';

        if (i <= diasCompletados) {
            // Días ya sellados
            icon = '✅';
            cssText = 'text-green-500 drop-shadow-md transform scale-110';
        } else if (i === diasCompletados + 1) {
            // El día que está peleando HOY
            if (isPenalized) {
                icon = '🚫';
                cssText = 'text-red-500 animate-pulse';
            } else if (streakState.todayDeposit > 0 && !rolloverOk) {
                // Depositó pero le falta jugar (Muestra la medalla por la que va)
                icon = nivelAlcanzadoHoy === 3 ? '🥇' : (nivelAlcanzadoHoy === 2 ? '🥈' : '🥉');
                cssText = 'animate-pulse scale-125';
                bgStyle = 'background: radial-gradient(circle, rgba(234,179,8,0.3) 0%, transparent 70%);';
            } else if (rolloverOk) {
                // Lo selló hoy mismo
                icon = '✅';
                cssText = 'text-green-500 drop-shadow-md scale-110';
            } else {
                // Aún no ha hecho nada hoy
                icon = '⏳';
                cssText = 'text-yellow-600 opacity-80';
            }
        } else if (i === 7) {
            icon = '🎁';
            cssText = 'text-gray-400 opacity-50'; // Regalo bloqueado
        }

        grid.innerHTML += `
            <div class="flex flex-col items-center justify-center w-10 h-12 rounded-lg" style="${bgStyle}">
                <div class="text-xl transition-all duration-300 ${cssText}">${icon}</div>
                <span class="text-[8px] font-black mt-1 uppercase ${i <= diasCompletados + 1 && !isPenalized ? 'text-white' : 'text-gray-600'}">Día ${i}</span>
            </div>
        `;
    }
}

// 4. EL GUARDIÁN DE RETIROS (Penalización Inmediata)
function protectWithdrawals(uid) {
    const form = document.getElementById('withdraw-form');
    if(!form) return;
    const oldSubmit = form.onsubmit;

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        if(streakState.todayDeposit > 0 && streakState.todayPlayed < streakState.todayDeposit) {
            const warn = confirm("⚠️ ¡ALERTA DE PENALIZACIÓN! ⚠️\n\nEstás intentando retirar dinero depositado hoy sin haberlo apostado por completo.\n\nSi continúas con este retiro, PERDERÁS TU PROGRESO DE LA RACHA DE INMEDIATO y volverás al DÍA 0.\n\n¿Aceptas la penalización y deseas retirar?");
            
            if(!warn) {
                document.getElementById('withdraw-form-area').style.display='none';
                return;
            }

            const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
            if(d.getHours() >= 20) d.setDate(d.getDate() + 1);
            const dateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;

            // Sellar penalización en la BD
            await dbRacha.ref(`users/${uid}/racha_data`).update({ 
                dias: 0, 
                nivel_minimo: 3,
                penalizado_hoy: dateStr 
            });
        }
        
        if(oldSubmit) oldSubmit.call(form, e);
    };
}
