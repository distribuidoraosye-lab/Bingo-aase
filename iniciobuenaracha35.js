/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (Streak & Rollover)
   V7 - DISEÑO COMPACTO, ESTADO SINCRONIZADO Y REGLAS EXACTAS
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

// Control para evitar "flasheos" al recargar
let dbLoaded = { dep: false, bingo: false, torneo: false };

// 1. Inyectar Interfaz Ultra-Compacta
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gray-900 rounded-xl p-3 shadow-xl border border-yellow-500 mb-4 relative">
            
            <div class="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                <h3 id="projected-prize-text" class="font-black text-yellow-400 text-[10px] sm:text-xs tracking-wider uppercase animate-pulse">
                    ⏳ CARGANDO RACHA...
                </h3>
                <button onclick="showRachaRules()" class="text-[10px] text-gray-300 hover:text-white underline font-bold whitespace-nowrap ml-2">
                    <i class="fas fa-info-circle"></i> Reglas
                </button>
            </div>

            <div class="mb-3 relative">
                <div class="w-full bg-gray-800 rounded-full h-2.5 shadow-inner">
                    <div id="streak-bar-7days" class="bg-gradient-to-r from-orange-500 to-green-500 h-2.5 rounded-full transition-all duration-700" style="width: 0%"></div>
                </div>
                <div id="streak-days-grid" class="flex justify-between mt-1.5 px-1">
                    </div>
            </div>

            <div class="bg-black/50 rounded-lg flex justify-between items-center p-2 border border-gray-700">
                <div class="flex gap-3 text-[10px] sm:text-xs">
                    <div><span class="text-gray-500 uppercase font-bold">Dep:</span> <b id="today-deposit-text" class="text-white">Bs 0</b></div>
                    <div><span class="text-gray-500 uppercase font-bold">Jug:</span> <b id="today-played-text" class="text-orange-400">Bs 0</b></div>
                </div>
                <div id="today-level-badge" class="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gray-700 px-2 py-1 rounded text-white">
                    CARGANDO...
                </div>
            </div>
            <p id="rollover-warning" class="text-[9px] text-red-400 text-center mt-2 font-bold uppercase hidden">
                ⚠️ Cuidado: Juega todo lo depositado hoy antes de retirar.
            </p>
        </div>

        <div id="modal-rules-racha" class="hidden fixed inset-0 bg-black/95 z- flex items-center justify-center p-4">
            <div class="bg-gray-900 border-2 border-yellow-500 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full border border-white shadow-lg"><i class="fas fa-times"></i></button>
                <h3 class="text-yellow-500 font-black text-xl text-center mb-4 tracking-tighter uppercase">REGLAS DE RACHA</h3>
                <div class="space-y-3 text-xs text-gray-300 leading-relaxed">
                    <p><b class="text-white">¿CÓMO AVANZAR?</b> Juega 7 días seguidos cumpliendo el mínimo diario equivalente a cartones de Bingo.</p>
                    <div class="bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <p class="mb-1"><b class="text-orange-400">🥉 Bronce:</b> Juega mín. 1 Cartón ($1) ➔ <b class="text-green-400">Ganas $10</b></p>
                        <p class="mb-1"><b class="text-gray-300">🥈 Plata:</b> Juega mín. 3 Cartones ($3) ➔ <b class="text-green-400">Ganas $30</b></p>
                        <p><b class="text-yellow-400">🥇 Oro:</b> Juega mín. 6 Cartones ($6) ➔ <b class="text-green-400">Ganas $60</b></p>
                    </div>
                    <p><b class="text-red-400 uppercase">⚠️ ANTI-TRAMPA (RETIROS):</b> Todo lo que deposites HOY debes jugarlo HOY. Si depositas y luego retiras el dinero sin haberlo apostado por completo, tu racha se penaliza y vuelve al Día 0.</p>
                </div>
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="w-full mt-4 bg-yellow-500 text-black font-black py-3 rounded-xl shadow-xl uppercase">Entendido</button>
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
    const dateStr = getSystemDate();

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
        dbLoaded.dep = true;
        checkAndRender(uid, dateStr);
    });

    dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let jugadoB = 0;
        const cardPrice = (typeof currentCardPrice !== 'undefined' && currentCardPrice > 0) ? currentCardPrice : 35;
        s.forEach(c => {
            if(c.val().date === dateStr && c.val().payment_method !== 'GRATIS') jugadoB += cardPrice;
        });
        streakState.jugadoBingo = jugadoB;
        dbLoaded.bingo = true;
        checkAndRender(uid, dateStr);
    });

    dbRacha.ref(`bets_torneo_express/${dateStr}/${uid}`).on('value', s => {
        let jugadoT = 0;
        const torneoPrice = (typeof torneoConfig !== 'undefined' && torneoConfig.price > 0) ? torneoConfig.price : 1000;
        if (s.exists()) {
            s.forEach(c => { jugadoT += torneoPrice; });
        }
        streakState.jugadoTorneo = jugadoT;
        dbLoaded.torneo = true;
        checkAndRender(uid, dateStr);
    });
}

function checkAndRender(uid, dateStr) {
    if (dbLoaded.dep && dbLoaded.bingo && dbLoaded.torneo) {
        updateStreakUI(uid, dateStr);
    }
}

function updateStreakUI(uid, dateStr) {
    const cardPrice = (typeof currentCardPrice !== 'undefined' && currentCardPrice > 0) ? currentCardPrice : 35;
    
    // === CÁLCULOS ESTRICTOS ===
    const usdDepositado = streakState.todayDeposit / cardPrice;
    const usdJugado = streakState.todayPlayed / cardPrice;
    
    // Nivel basado EXCLUSIVAMENTE en lo que JUEGA
    let nivelAlcanzadoHoy = 0;
    if (usdJugado >= 6) { nivelAlcanzadoHoy = 3; }
    else if (usdJugado >= 3) { nivelAlcanzadoHoy = 2; }
    else if (usdJugado >= 1) { nivelAlcanzadoHoy = 1; }

    // Salva el día si JUGÓ al menos el mínimo ($1)
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

        // GUARDADO DE DÍA GANADO
        let visualDay = data.dias;
        
        if (!isPenalized && diaSalvado) {
            visualDay = Math.min(7, data.dias + 1); 
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

        if (isDirty) dbRacha.ref(`users/${uid}/racha_data`).update(updates);

        // === RENDERIZADO VISUAL ===
        document.getElementById('today-deposit-text').textContent = "Bs " + streakState.todayDeposit.toLocaleString('es-VE');
        document.getElementById('today-played-text').textContent = "Bs " + streakState.todayPlayed.toLocaleString('es-VE');

        const warnEl = document.getElementById('rollover-warning');
        const badgeEl = document.getElementById('today-level-badge');
        const titleEl = document.getElementById('projected-prize-text');

        // Advertencia de Retiro (Depositó pero no ha jugado todo)
        if (streakState.todayDeposit > 0 && streakState.todayPlayed < streakState.todayDeposit) {
            warnEl.classList.remove('hidden');
        } else {
            warnEl.classList.add('hidden');
        }

        let barFillPercentage = (visualDay / 7) * 100;

        if (isPenalized) {
            badgeEl.innerHTML = "<span class='text-red-400'>🚫 PENALIZADO</span>";
            badgeEl.className = "text-[9px] sm:text-[10px] font-black uppercase bg-red-900/50 border border-red-700 px-2 py-1 rounded text-red-100";
            titleEl.innerHTML = `🚫 RACHA PERDIDA POR RETIRO 🚫`;
            titleEl.className = "font-black text-red-500 text-[10px] sm:text-xs tracking-wider uppercase";
            document.getElementById('streak-bar-7days').className = "bg-red-600 h-full rounded-full";
        } else {
            document.getElementById('streak-bar-7days').className = "bg-gradient-to-r from-orange-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.4)]";
            badgeEl.className = "text-[9px] sm:text-[10px] font-black uppercase bg-gray-700 px-2 py-1 rounded text-white";

            if (diaSalvado) {
                if (nivelAlcanzadoHoy === 3) {
                    badgeEl.innerHTML = "<span class='text-yellow-400'>🥇 DÍA ORO</span>";
                    titleEl.innerHTML = `🏆 ¡VAS POR EL PREMIO MAYOR DE $60! 🏆`;
                } else if (nivelAlcanzadoHoy === 2) {
                    badgeEl.innerHTML = "<span class='text-gray-300'>🥈 DÍA PLATA</span>";
                    titleEl.innerHTML = `🚀 ¡JUEGA MÁS HOY Y GANA HASTA $60! 🚀`;
                } else {
                    badgeEl.innerHTML = "<span class='text-orange-400'>🥉 DÍA BRONCE</span>";
                    titleEl.innerHTML = `🔥 ¡AUMENTA TU JUEGO PARA GANAR $60! 🔥`;
                }
            } else if (usdDepositado > 0) {
                badgeEl.innerHTML = "<span class='text-yellow-400 animate-pulse'>⏳ FALTA JUGAR</span>";
                titleEl.innerHTML = `⚠️ ¡JUEGA TU SALDO PARA ASEGURAR EL DÍA! ⚠️`;
            } else {
                badgeEl.innerHTML = "<span class='text-gray-400'>🎯 ESPERANDO</span>";
                let projected = data.dias > 0 ? (data.nivel_minimo === 3 ? 60 : (data.nivel_minimo === 2 ? 30 : 10)) : 60;
                titleEl.innerHTML = data.dias > 0 
                    ? `🔥 JUEGA HOY PARA SEGUIR POR TUS $${projected} 🔥`
                    : `🔥 JUEGA DE $1 A $6 DIARIOS Y GANA HASTA $60 🔥`;
            }
        }

        document.getElementById('streak-bar-7days').style.width = barFillPercentage + '%';
        renderStreakDaysGrid(data.dias, isPenalized, diaSalvado, usdDepositado);
    });
}

function renderStreakDaysGrid(diasCompletados, isPenalized, diaSalvado, usdDepositado) {
    const grid = document.getElementById('streak-days-grid');
    grid.innerHTML = '';
    
    for(let i=1; i<=7; i++) {
        let icon = '🔒';
        let cssText = 'text-gray-500 opacity-40 text-[10px]';

        if (i <= diasCompletados) {
            icon = '✅'; cssText = 'text-green-500 text-[12px] drop-shadow-md';
        } else if (i === diasCompletados + 1) {
            if (isPenalized) {
                icon = '🚫'; cssText = 'text-red-500 text-[12px] animate-pulse';
            } else if (diaSalvado) {
                icon = '✅'; cssText = 'text-green-400 text-[12px] drop-shadow-md';
            } else if (usdDepositado > 0) {
                icon = '⏳'; cssText = 'text-yellow-400 text-[12px] animate-pulse';
            } else {
                icon = '🎯'; cssText = 'text-orange-500 text-[12px] opacity-80'; 
            }
        } else if (i === 7) {
            icon = '🎁'; cssText = 'text-gray-400 opacity-50 text-[10px]'; 
        }

        grid.innerHTML += `
            <div class="flex flex-col items-center justify-center w-8">
                <div class="transition-all duration-300 ${cssText}">${icon}</div>
                <span class="text-[7px] font-black mt-0.5 uppercase ${i <= diasCompletados + 1 && !isPenalized ? 'text-gray-300' : 'text-gray-600'}">D${i}</span>
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
            await dbRacha.ref(`users/${uid}/racha_data`).update({ dias: 0, nivel_minimo: 3, penalizado_hoy: dateStr });
        }
        if(oldSubmit) oldSubmit.call(form, e);
    };
}
