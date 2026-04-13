/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (Streak & Rollover)
   VERSIÓN DEFINITIVA - DISEÑO PREMIUM RESTAURADO Y REGLAS EXACTAS
   ============================================================ */

const dbRacha = firebase.database();

let streakState = {
    todayDeposit: 0,
    jugadoBingo: 0,
    jugadoTorneo: 0,
    get todayPlayed() { return this.jugadoBingo + this.jugadoTorneo; }
};

// 1. Interfaz Premium Restaurada (Tamaño grande, candados y textos claros)
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gray-900 rounded-2xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mt-2 mb-6">
            
            <div class="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 p-4 text-center border-b border-gray-800 shadow-inner">
                <h3 id="projected-prize-text" class="font-black text-white text-lg tracking-tighter uppercase animate-pulse drop-shadow-lg leading-tight">
                    🔥 ¡JUEGA DESDE $1 DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🔥
                </h3>
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
                    <span id="today-level-badge" class="text-[10px] bg-gray-700 px-2 py-1 rounded text-white font-black shadow-sm">ESPERANDO JUGADA...</span>
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
                <p id="rollover-warning" class="text-[10px] text-red-400 text-center mt-3 font-black uppercase tracking-widest hidden animate-pulse">
                    ⚠️ Depositaste hoy: Juega ese saldo para asegurar tu día.
                </p>
            </div>

            <div class="bg-black/90 p-2 text-center">
                <button onclick="showRachaRules()" class="text-[10px] text-yellow-500 font-black uppercase tracking-widest hover:underline opacity-80 hover:opacity-100 transition">
                    📖 Ver Tabla de Premios y Reglas
                </button>
            </div>
        </div>

        <div id="modal-rules-racha" class="hidden fixed inset-0 bg-black/95 z- flex items-center justify-center p-4">
            <div class="bg-gray-900 border-2 border-yellow-500 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full border-2 border-white shadow-lg"><i class="fas fa-times"></i></button>
                <h3 class="text-yellow-500 font-black text-2xl text-center mb-4 tracking-tighter uppercase">REGLAS CLARAS</h3>
                
                <div class="space-y-3 text-xs text-gray-300">
                    <p><b class="text-white uppercase">¿CÓMO GANAR?</b><br>El premio final se basa en el nivel del día que MENOS hayas apostado en la semana.</p>
                    
                    <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-inner">
                        <p class="mb-2"><b class="text-orange-400">🥉 Nivel Bronce:</b> Si juegas mín. $1 diario en bingo o torneo por 7 días ➔ <b class="text-green-400 font-black">Ganas $10</b></p>
                        <p class="mb-2"><b class="text-gray-300">🥈 Nivel Plata:</b> Si juegas mín. $3 diarios en bingo o torneo por 7 días ➔ <b class="text-green-400 font-black">Ganas $30</b></p>
                        <p><b class="text-yellow-400">🥇 Nivel Oro:</b> Si juegas mín. $6 diarios en bingo o torneo por 7 días ➔ <b class="text-green-400 font-black">Ganas $60</b></p>
                    </div>

                    <p><b class="text-red-400 uppercase">⚠️ REGLA ESTRICTA (ANTI-TRAMPA):</b><br>Si decides depositar, el monto que ingreses HOY debes jugarlo antes de solicitar un retiro. Si depositas y retiras el dinero sin haberlo apostado, pierdes la racha y vuelves al Día 0.</p>
                </div>
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="w-full mt-6 bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest">Entendido</button>
            </div>
        </div>
    `;
}

window.showRachaRules = () => { document.getElementById('modal-rules-racha').style.display = 'flex'; };

function getSystemDate() {
    const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
    if(d.getHours() >= 20) d.setDate(d.getDate() + 1); 
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

// 2. Inicializador Directo
document.addEventListener('DOMContentLoaded', () => {
    injectRachaUI();
    renderStreakDaysGrid(0, false, false, 0); // Pinta los candados de inmediato para que no se vea vacío
    
    setTimeout(() => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                initStreakMonitor(user.uid);
                protectWithdrawals(user.uid);
            }
        });
    }, 500); 
});

async function initStreakMonitor(uid) {
    const dateStr = getSystemDate();

    // CONEXIÓN DIRECTA Y EN TIEMPO REAL
    dbRacha.ref('referencias_usadas').orderByChild('uid').equalTo(uid).on('value', s => {
        let depositado = 0;
        if (s.exists()) {
            s.forEach(ref => {
                const data = ref.val();
                const depDate = new Date(data.date);
                if(depDate.getHours() >= 20) depDate.setDate(depDate.getDate() + 1);
                const depDateStr = `${String(depDate.getDate()).padStart(2,'0')}-${String(depDate.getMonth()+1).padStart(2,'0')}-${depDate.getFullYear()}`;
                if(depDateStr === dateStr) depositado += data.amt;
            });
        }
        streakState.todayDeposit = depositado;
        updateStreakUI(uid, dateStr);
    });

    dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let jugadoB = 0;
        const cardPrice = (typeof currentCardPrice !== 'undefined' && currentCardPrice > 0) ? currentCardPrice : 35;
        if (s.exists()) {
            s.forEach(c => {
                if(c.val().date === dateStr && c.val().payment_method !== 'GRATIS') jugadoB += cardPrice;
            });
        }
        streakState.jugadoBingo = jugadoB;
        updateStreakUI(uid, dateStr);
    });

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
    const cardPrice = (typeof currentCardPrice !== 'undefined' && currentCardPrice > 0) ? currentCardPrice : 35;
    
    // CÁLCULO ESTRICTO BASADO EN LO QUE JUEGA ($1 = 1 Cartón)
    const usdDepositado = streakState.todayDeposit / cardPrice;
    const usdJugado = streakState.todayPlayed / cardPrice;
    
    let nivelAlcanzadoHoy = 0;
    if (usdJugado >= 6) { nivelAlcanzadoHoy = 3; }
    else if (usdJugado >= 3) { nivelAlcanzadoHoy = 2; }
    else if (usdJugado >= 1) { nivelAlcanzadoHoy = 1; }

    let diaSalvado = (usdJugado >= 1);

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3, last_update: "00-00-0000", last_active: "00-00-0000" };
        let isPenalized = (data.penalizado_hoy === dateStr);
        let isDirty = false;
        let updates = {};

        // PERDÓN DE PENALIZACIÓN
        if (isPenalized && diaSalvado) {
            isPenalized = false;
            updates.penalizado_hoy = null; 
            data.dias = 0; 
            isDirty = true;
        }

        const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
        const ayerDate = new Date(d); ayerDate.setDate(ayerDate.getDate() - 1);
        const ayerStr = `${String(ayerDate.getDate()).padStart(2,'0')}-${String(ayerDate.getMonth()+1).padStart(2,'0')}-${ayerDate.getFullYear()}`;

        // VERDUGO POR INACTIVIDAD
        if (!isPenalized && data.dias > 0 && data.last_active !== dateStr && data.last_active !== ayerStr) {
            data.dias = 0;
            data.nivel_minimo = 3;
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = dateStr;
            isDirty = true;
        }

        // GUARDAR DÍA SI JUGÓ
        let visualDay = data.dias;
        let barFillPercentage = (visualDay / 7) * 100;

        if (!isPenalized && diaSalvado) {
            visualDay = Math.min(7, data.dias + 1); 
            barFillPercentage = (visualDay / 7) * 100;
            
            if (data.last_update !== dateStr) {
                let minLvl = data.dias === 0 ? nivelAlcanzadoHoy : Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                updates.dias = visualDay;
                updates.nivel_minimo = minLvl;
                updates.last_update = dateStr;
                updates.last_active = dateStr;
                isDirty = true;
                data.dias = visualDay; 
                data.nivel_minimo = minLvl;
            } else if (data.last_update === dateStr) {
                let minLvl = data.dias === 1 ? nivelAlcanzadoHoy : Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                if(data.nivel_minimo !== minLvl) {
                    updates.nivel_minimo = minLvl;
                    isDirty = true;
                    data.nivel_minimo = minLvl;
                }
            }
        } else if (!isPenalized && usdDepositado > 0) {
            if (data.last_active !== dateStr) {
                updates.last_active = dateStr;
                isDirty = true;
            }
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }

        // ACTUALIZAR NÚMEROS EN PANTALLA
        document.getElementById('today-deposit-text').textContent = "Bs " + streakState.todayDeposit.toLocaleString('es-VE');
        document.getElementById('today-played-text').textContent = "Bs " + streakState.todayPlayed.toLocaleString('es-VE');

        const warnEl = document.getElementById('rollover-warning');
        const badgeEl = document.getElementById('today-level-badge');
        const titleEl = document.getElementById('projected-prize-text');

        // ADVERTENCIA SI DEPOSITÓ PERO NO HA JUGADO LO MISMO
        if (streakState.todayDeposit > 0 && streakState.todayPlayed < streakState.todayDeposit) {
            warnEl.classList.remove('hidden');
        } else {
            warnEl.classList.add('hidden');
        }

        if (isPenalized) {
            badgeEl.innerHTML = "<span class='text-red-400'>🚫 PENALIZADO (RACHA PERDIDA)</span>";
            titleEl.innerHTML = `🚫 RACHA PERDIDA POR RETIRO 🚫`;
            document.getElementById('streak-bar-7days').className = "bg-red-600 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
            
        } else {
            document.getElementById('streak-bar-7days').className = "bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]";

            if (diaSalvado) {
                if (nivelAlcanzadoHoy === 3) {
                    badgeEl.innerHTML = "<span class='text-yellow-400'>🥇 DÍA ORO ASEGURADO</span>";
                    titleEl.innerHTML = `🏆 ¡VAS POR $60 GRATIS SI JUEGAS LOS 7 DÍAS! 🏆`;
                } else if (nivelAlcanzadoHoy === 2) {
                    badgeEl.innerHTML = "<span class='text-gray-300'>🥈 DÍA PLATA ASEGURADO</span>";
                    titleEl.innerHTML = `🚀 ¡VAS POR $30 GRATIS SI JUEGAS LOS 7 DÍAS! 🚀`;
                } else {
                    badgeEl.innerHTML = "<span class='text-orange-400'>🥉 DÍA BRONCE ASEGURADO</span>";
                    titleEl.innerHTML = `🔥 ¡VAS POR $10 GRATIS SI JUEGAS LOS 7 DÍAS! 🔥`;
                }
            } else if (usdDepositado > 0) {
                badgeEl.innerHTML = "<span class='text-yellow-400 animate-pulse'>⏳ FALTA JUGAR</span>";
                titleEl.innerHTML = `⚠️ ¡JUEGA TU SALDO PARA ASEGURAR EL DÍA! ⚠️`;
            } else {
                badgeEl.innerHTML = "<span class='text-gray-400'>🎯 ESPERANDO JUGADA...</span>";
                let projected = data.dias > 0 ? (data.nivel_minimo === 3 ? 60 : (data.nivel_minimo === 2 ? 30 : 10)) : 60;
                titleEl.innerHTML = data.dias > 0 
                    ? `🔥 ¡JUEGA HOY PARA SEGUIR POR TUS $${projected} GRATIS! 🔥`
                    : `🔥 ¡JUEGA DESDE $1 DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🔥`;
            }
        }

        document.getElementById('streak-bar-7days').style.width = barFillPercentage + '%';
        renderStreakDaysGrid(data.dias, isPenalized, diaSalvado, usdDepositado);
    });
}

// RESTAURADOS LOS CÍRCULOS ORIGINALES DEL DISEÑO
function renderStreakDaysGrid(diasCompletados, isPenalized, diaSalvado, usdDepositado) {
    const grid = document.getElementById('streak-days-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    for(let i=1; i<=7; i++) {
        let icon = '🔒';
        let color = 'bg-gray-800 border-gray-700 text-gray-600';
        let subText = 'Día ' + i;

        if (i <= diasCompletados) {
            icon = '✅';
            color = 'bg-green-600 border-white text-white shadow-[0_0_10px_rgba(34,197,94,0.6)]';
            subText = 'Listo';
        } else if (i === diasCompletados + 1) {
            if (isPenalized) {
                icon = '🚫'; color = 'bg-red-600 border-white text-white animate-pulse'; subText = 'Perdido';
            } else if (diaSalvado) {
                icon = '✅'; color = 'bg-green-500 border-white text-white shadow-[0_0_15px_rgba(34,197,94,0.8)] scale-110'; subText = 'Asegurado';
            } else if (usdDepositado > 0) {
                icon = '⏳'; color = 'bg-yellow-500 border-white text-black animate-pulse scale-110'; subText = 'Juega';
            } else {
                icon = '🔥'; color = 'bg-orange-500 border-white text-white shadow-[0_0_15px_rgba(249,115,22,0.8)] scale-110 animate-pulse'; subText = 'Hoy';
            }
        } else if (i === 7) {
            icon = '🎁';
            color = 'bg-gray-800 border-gray-700 text-gray-500 opacity-50'; 
        }

        grid.innerHTML += `
            <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full border-2 ${color} flex items-center justify-center text-xs transition-all duration-500">
                    ${icon}
                </div>
                <span class="text-[8px] font-black mt-1 uppercase ${i <= diasCompletados + 1 && !isPenalized ? 'text-white' : 'text-gray-600'} text-center">${subText}</span>
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
        
        if(streakState.todayDeposit > 0 && streakState.todayPlayed < streakState.todayDeposit) {
            const warn = confirm("⚠️ ¡ALERTA DE PENALIZACIÓN! ⚠️\n\nIntentas retirar dinero depositado HOY sin haberlo jugado por completo.\n\nSi continúas, PERDERÁS LA RACHA y volverás al DÍA 0.\n\n¿Deseas retirar de todas formas?");
            
            if(!warn) {
                document.getElementById('withdraw-form-area').style.display='none';
                return;
            }

            const dateStr = getSystemDate();
            await dbRacha.ref(`users/${uid}/racha_data`).update({ 
                dias: 0, 
                nivel_minimo: 3,
                penalizado_hoy: dateStr 
            });
        }
        
        if(oldSubmit) oldSubmit.call(form, e);
    };
}
