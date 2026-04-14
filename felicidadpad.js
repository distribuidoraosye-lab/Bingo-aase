/* ============================================================
   BINGO TEXIER - MÓDULO RACHA (NÚCLEO DEFINITIVO)
   Adaptado 100% al JSON real (request_timestamp y autocompletado 500)
   ============================================================ */

const dbRacha = firebase.database();

// MEMORIA DE SESIÓN (Nunca se borra)
let rachaState = {
    deposito: 0,
    jugadoBingo: 0,
    jugadoTorneo: 0,
    get jugadoTotal() { return this.jugadoBingo + this.jugadoTorneo; }
};

function getSystemDateStr() {
    const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
    if(d.getHours() >= 20) d.setDate(d.getDate() + 1); 
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

// LECTOR DE FECHAS ADAPTADO A TU JSON
function isToday(timeVal, todayStr) {
    if (!timeVal) return false;
    
    if (typeof timeVal === 'string' && timeVal.includes(todayStr)) return true;
    
    let d;
    if (typeof timeVal === 'string' && timeVal.match(/^\d{2}-\d{2}-\d{4}/)) {
        let parts = timeVal.split(' ').split('-');
        d = new Date(`${parts}/${parts}/${parts}`);
    } else if (typeof timeVal === 'string' && timeVal.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        let parts = timeVal.split(' ').split('/');
        d = new Date(`${parts}/${parts}/${parts}`);
    } else {
        d = new Date(timeVal); // Lee los milisegundos de request_timestamp perfecto
    }

    if (!isNaN(d.getTime())) {
        if(d.getHours() >= 20) d.setDate(d.getDate() + 1);
        let dStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
        return dStr === todayStr;
    }
    return false;
}

function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    container.innerHTML = `
        <div id="racha-main-box" class="bg-gray-900 rounded-2xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mt-2 mb-6">
            <div class="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 p-4 text-center border-b border-gray-800 shadow-inner">
                <h3 id="projected-prize-text" class="font-black text-white text-lg tracking-tighter uppercase animate-pulse drop-shadow-lg leading-tight">
                    🎯 ¡JUEGA DESDE 1 CARTÓN DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🎯
                </h3>
            </div>
            <div class="p-5 bg-black/80">
                <div class="w-full bg-gray-800 rounded-full h-6 p-0.5 border border-gray-700 shadow-inner relative mb-6">
                    <div id="streak-bar-7days" class="bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]" style="width: 0%"></div>
                    <div class="absolute inset-0 flex justify-between px-3 items-center text-[10px] font-black text-white/50 pointer-events-none">
                        <span>D1</span><span>D2</span><span>D3</span><span>D4</span><span>D5</span><span>D6</span><span class="text-yellow-400 drop-shadow-md text-xs">🎁 D7</span>
                    </div>
                </div>
                <div id="streak-days-grid" class="flex justify-between items-start px-1"></div>
            </div>
            <div class="bg-gray-800 p-4 border-t border-gray-700">
                <div class="flex justify-between items-center mb-3">
                    <span id="mision-title-text" class="text-[10px] text-yellow-500 font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded">MISIÓN DE HOY:</span>
                    <span id="today-level-badge" class="text-[10px] bg-gray-700 px-2 py-1 rounded text-white font-black shadow-sm">ESPERANDO JUGADA...</span>
                </div>
                <div class="grid grid-cols-2 gap-3 text-center">
                    <div class="bg-black/50 p-2 rounded-lg border border-gray-600 shadow-inner">
                        <p id="label-deposit" class="text-[9px] text-gray-400 uppercase font-bold mb-1">Depositado Hoy</p>
                        <p id="today-deposit-text" class="text-sm font-black text-white">Bs 0.00</p>
                    </div>
                    <div class="bg-black/50 p-2 rounded-lg border border-gray-600 shadow-inner">
                        <p id="label-played" class="text-[9px] text-gray-400 uppercase font-bold mb-1">Jugado Hoy</p>
                        <p id="today-played-text" class="text-sm font-black text-orange-400">Bs 0.00</p>
                    </div>
                </div>
                <p class="text-[9px] text-gray-500 text-center mt-3 font-bold uppercase tracking-widest">
                    💡 Recuerda: Tu premio final será el del día que MENOS hayas jugado.
                </p>
                <p id="rollover-warning" class="text-[10px] text-red-400 text-center mt-2 font-black uppercase tracking-widest hidden animate-pulse border border-red-800 bg-red-900/30 p-1 rounded">
                    ⚠️ Depositaste: Juega ese saldo para asegurar tu día.
                </p>
            </div>
            <div class="bg-black/90 p-2 text-center">
                <button onclick="showRachaRules()" class="text-[10px] text-yellow-500 font-black uppercase tracking-widest hover:underline opacity-80 hover:opacity-100 transition">
                    📖 Ver Tabla de Premios y Reglas
                </button>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    injectRachaUI();
    
    setTimeout(() => {
        if (typeof window.switchMode === 'function') {
            const originalSwitchMode = window.switchMode;
            window.switchMode = function(mode) {
                originalSwitchMode(mode);
                let box = document.getElementById('racha-main-box');
                if (box) box.style.display = 'none';
            };
        }

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                initStreakMonitor(user.uid);
                protectWithdrawals(user.uid);
            }
        });
    }, 500); 
});

function initStreakMonitor(uid) {
    const todayStr = getSystemDateStr();

    // 1. ESPÍA DE DEPÓSITOS (Busca request_timestamp)
    dbRacha.ref('referencias_usadas').orderByChild('uid').equalTo(uid).on('value', s => {
        let dep = 0;
        if (s.exists()) {
            s.forEach(ref => {
                const data = ref.val();
                let timeVal = data.request_timestamp || data.timestamp || data.date || data.fecha || data.time; 
                let status = (data.status || '').toUpperCase();
                let tipo = (data.tipo || '').toUpperCase();
                
                if (status === 'APPROVED' || status === 'APROBADO' || tipo === 'MANUAL_ADMIN' || status === '') {
                    if (isToday(timeVal, todayStr)) {
                        let m = parseFloat(data.amount || data.amt || data.monto || 0);
                        if (!isNaN(m)) dep += m;
                    }
                }
            });
        }
        rachaState.deposito = dep;
        updateStreakUI(uid, todayStr);
    });

    // 2. ESPÍA DE BINGO (Inyecta los 500 Bs que faltan en el JSON)
    dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let jug = 0;
        if (s.exists()) {
            s.forEach(c => {
                const data = c.val();
                let timeVal = data.date || data.timestamp || data.request_timestamp || data.time;
                let isGratis = JSON.stringify(data).toUpperCase().includes('GRATIS');
                
                if(isToday(timeVal, todayStr) && !isGratis) {
                    let p = parseFloat(data.precio_carton || data.amount || data.monto);
                    jug += !isNaN(p) ? p : 500; 
                }
            });
        }
        rachaState.jugadoBingo = jug;
        updateStreakUI(uid, todayStr);
    });

    // 3. ESPÍA DE TORNEO
    dbRacha.ref(`bets_torneo_express/${todayStr}/${uid}`).on('value', s => {
        let jugT = 0;
        if (s.exists()) {
            s.forEach(c => {
                const data = c.val();
                let p = parseFloat(data.amount || data.monto || data.precio);
                jugT += !isNaN(p) ? p : 500;
            });
        }
        rachaState.jugadoTorneo = jugT;
        updateStreakUI(uid, todayStr);
    });
}

// ACTUALIZADOR VISUAL ANTI-CONGELAMIENTO
function updateStreakUI(uid, dateStr) {
    let depActual = rachaState.deposito;
    let jugActual = rachaState.jugadoTotal;

    // 500 Bs fijos por cartón para el cálculo
    let cartonesJugados = jugActual / 500;
    
    // Aprobación al 95% (475 Bs son suficientes para abrir el candado)
    let nivelHoy = 0;
    if (cartonesJugados >= 5.95) nivelHoy = 3;
    else if (cartonesJugados >= 2.95) nivelHoy = 2;
    else if (cartonesJugados >= 0.95) nivelHoy = 1;

    let diaSalvado = (cartonesJugados >= 0.95);

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3, last_update: "00-00-0000", last_active: "00-00-0000" };
        let isPenalized = (data.penalizado_hoy === dateStr);
        let updates = {};
        let isDirty = false;

        if (isPenalized && diaSalvado) {
            isPenalized = false;
            updates.penalizado_hoy = null; 
            data.dias = 0; 
            isDirty = true;
        }

        const dReal = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
        const isTomorrow = dReal.getHours() >= 20; 
        
        let titleEl = document.getElementById('mision-title-text');
        if(titleEl) titleEl.textContent = isTomorrow ? "MISIÓN DE MAÑANA:" : "MISIÓN DE HOY:";
        
        let lblDep = document.getElementById('label-deposit');
        if(lblDep) lblDep.textContent = isTomorrow ? "DEPOSITADO (MAÑANA)" : "DEPOSITADO HOY";
        
        let lblPlay = document.getElementById('label-played');
        if(lblPlay) lblPlay.textContent = isTomorrow ? "JUGADO (MAÑANA)" : "JUGADO HOY";

        const dCorte = new Date(dReal);
        if(isTomorrow) dCorte.setDate(dCorte.getDate() + 1); 
        const ayerDate = new Date(dCorte); ayerDate.setDate(ayerDate.getDate() - 1);
        const ayerStr = `${String(ayerDate.getDate()).padStart(2,'0')}-${String(ayerDate.getMonth()+1).padStart(2,'0')}-${ayerDate.getFullYear()}`;

        if (!isPenalized && data.dias > 0 && data.last_active !== dateStr && data.last_active !== ayerStr) {
            data.dias = 0;
            data.nivel_minimo = 3;
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = dateStr;
            isDirty = true;
        }

        let visualDay = data.dias;

        if (!isPenalized && diaSalvado) {
            visualDay = Math.min(7, data.dias + 1); 
            if (data.last_update !== dateStr) {
                let minLvl = data.dias === 0 ? nivelHoy : Math.min(data.nivel_minimo || 3, nivelHoy);
                updates.dias = visualDay;
                updates.nivel_minimo = minLvl;
                updates.last_update = dateStr;
                updates.last_active = dateStr;
                isDirty = true;
                data.dias = visualDay; 
                data.nivel_minimo = minLvl;
            } else if (data.last_update === dateStr) {
                let minLvl = data.dias === 1 ? nivelHoy : Math.min(data.nivel_minimo || 3, nivelHoy);
                if(data.nivel_minimo !== minLvl) {
                    updates.nivel_minimo = minLvl;
                    isDirty = true;
                    data.nivel_minimo = minLvl;
                }
            }
        } else if (!isPenalized && depActual > 0) {
            if (data.last_active !== dateStr) {
                updates.last_active = dateStr;
                isDirty = true;
            }
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }

        // TEXTOS SEGUROS
        let txtDep = document.getElementById('today-deposit-text');
        if(txtDep) txtDep.textContent = "Bs " + depActual.toLocaleString('es-VE', {minimumFractionDigits: 2});
        
        let txtPlay = document.getElementById('today-played-text');
        if(txtPlay) txtPlay.textContent = "Bs " + jugActual.toLocaleString('es-VE', {minimumFractionDigits: 2});

        let warnEl = document.getElementById('rollover-warning');
        if (warnEl) {
            if (depActual > 0 && jugActual < (depActual * 0.95)) warnEl.classList.remove('hidden');
            else warnEl.classList.add('hidden');
        }

        let badgeEl = document.getElementById('today-level-badge');
        let prizeEl = document.getElementById('projected-prize-text');
        let barEl = document.getElementById('streak-bar-7days');

        if (badgeEl && prizeEl && barEl) {
            if (isPenalized) {
                badgeEl.innerHTML = "<span class='text-red-400'>🚫 PENALIZADO (RACHA PERDIDA)</span>";
                prizeEl.innerHTML = `🚫 RACHA PERDIDA POR RETIRO 🚫`;
                barEl.className = "bg-red-600 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
            } else {
                barEl.className = "bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]";

                if (diaSalvado) {
                    if (nivelHoy === 3) {
                        badgeEl.innerHTML = "<span class='text-yellow-400'>🥇 ORO ASEGURADO</span>";
                        prizeEl.innerHTML = `🏆 ¡VAS POR $60 GRATIS SI JUEGAS LOS 7 DÍAS! 🏆`;
                    } else if (nivelHoy === 2) {
                        badgeEl.innerHTML = "<span class='text-gray-300'>🥈 PLATA ASEGURADO</span>";
                        prizeEl.innerHTML = `🚀 ¡VAS POR $30 GRATIS SI JUEGAS LOS 7 DÍAS! 🚀`;
                    } else {
                        badgeEl.innerHTML = "<span class='text-orange-400'>🥉 BRONCE ASEGURADO</span>";
                        prizeEl.innerHTML = `🔥 ¡VAS POR $10 GRATIS SI JUEGAS LOS 7 DÍAS! 🔥`;
                    }
                } else if (depActual > 0) {
                    badgeEl.innerHTML = "<span class='text-yellow-400 animate-pulse'>⏳ FALTA JUGAR</span>";
                    prizeEl.innerHTML = `⚠️ ¡JUEGA TU SALDO PARA ASEGURAR EL DÍA! ⚠️`;
                } else {
                    badgeEl.innerHTML = "<span class='text-gray-400'>🎯 ESPERANDO JUGADA...</span>";
                    let projected = data.dias > 0 ? (data.nivel_minimo === 3 ? 60 : (data.nivel_minimo === 2 ? 30 : 10)) : 60;
                    prizeEl.innerHTML = data.dias > 0 
                        ? `🎯 ¡JUEGA PARA SEGUIR POR TUS $${projected} GRATIS! 🎯`
                        : `🎯 ¡JUEGA DESDE 1 CARTÓN DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🎯`;
                }
            }
            barEl.style.width = ((visualDay / 7) * 100) + '%';
        }
        renderStreakDaysGrid(data.dias, isPenalized, diaSalvado, depActual);
    });
}

function renderStreakDaysGrid(diasCompletados, isPenalized, diaSalvado, depActual) {
    const grid = document.getElementById('streak-days-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    for(let i=1; i<=7; i++) {
        let icon = '🔒';
        let color = 'bg-gray-800 border-gray-700 text-gray-600';
        let subText = 'Día ' + i;

        if (i <= diasCompletados) {
            icon = '✅'; color = 'bg-green-600 border-white text-white shadow-[0_0_10px_rgba(34,197,94,0.6)]'; subText = 'Listo';
        } else if (i === diasCompletados + 1) {
            if (isPenalized) {
                icon = '🚫'; color = 'bg-red-600 border-white text-white animate-pulse'; subText = 'Perdido';
            } else if (diaSalvado) {
                icon = '✅'; color = 'bg-green-500 border-white text-white shadow-[0_0_15px_rgba(34,197,94,0.8)] scale-110'; subText = 'Asegurado';
            } else if (depActual > 0) {
                icon = '⏳'; color = 'bg-yellow-500 border-white text-black animate-pulse scale-110'; subText = 'Juega';
            } else {
                icon = '🎯'; color = 'bg-orange-500 border-white text-white shadow-[0_0_15px_rgba(249,115,22,0.8)] scale-110 animate-pulse'; subText = 'Hoy';
            }
        } else if (i === 7) {
            icon = '🎁'; color = 'bg-gray-800 border-gray-700 text-gray-500 opacity-50'; 
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

function protectWithdrawals(uid) {
    const form = document.getElementById('withdraw-form');
    if(!form) return;
    const oldSubmit = form.onsubmit;

    form.onsubmit = async (e) => {
        e.preventDefault();
        let dep = parseFloat(rachaState.deposito) || 0;
        let jug = parseFloat(rachaState.jugadoTotal) || 0;
        
        if(dep > 0 && jug < (dep * 0.95)) { 
            const warn = confirm("⚠️ ¡ALERTA DE PENALIZACIÓN! ⚠️\n\nIntentas retirar dinero depositado HOY sin haberlo jugado.\n\nSi continúas, PERDERÁS LA RACHA y volverás al DÍA 0.\n\n¿Deseas retirar de todas formas?");
            if(!warn) {
                let area = document.getElementById('withdraw-form-area');
                if(area) area.style.display='none';
                return;
            }
            const dateStr = getSystemDateStr();
            await dbRacha.ref(`users/${uid}/racha_data`).update({ dias: 0, nivel_minimo: 3, penalizado_hoy: dateStr });
        }
        if(oldSubmit) oldSubmit.call(form, e);
    };
}
