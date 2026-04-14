/* ============================================================
   BINGO TEXIER - MÓDULO RACHA (V11 - FUERZA BRUTA)
   Escáner absoluto de fechas, cero congelamientos, anti-errores.
   ============================================================ */

const dbRacha = firebase.database();
let configTasa = 500; // Tasa base indestructible

let rachaState = {
    deposito: 0,
    bingo: 0,
    torneo: 0,
    get jugadoTotal() { return this.bingo + this.torneo; }
};

let activeUid = null;
let currentListeners = [];

function clearListeners() {
    currentListeners.forEach(l => l.ref.off('value', l.callback));
    currentListeners = [];
}

// 0. SINCRONIZAR TASA
dbRacha.ref('config/racha_config/tasa_cambio').on('value', s => {
    if(s.exists()) {
        let val = parseFloat(s.val());
        if(!isNaN(val) && val > 0) configTasa = val;
    }
});

// 1. FECHA DEL SISTEMA (Regla 8 PM)
function getSystemDateStr() {
    let d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
    if(d.getHours() >= 20) d.setDate(d.getDate() + 1);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

// 2. ESCÁNER DE FUERZA BRUTA (Indestructible)
function isRecordFromTodayBruteForce(dataObj, todayStr) {
    if (!dataObj) return false;
    
    // Escaneo de texto (busca en TODO el objeto)
    let asString = JSON.stringify(dataObj);
    if (asString.includes(todayStr)) return true;
    let slashed = todayStr.replace(/-/g, '/');
    if (asString.includes(slashed)) return true;
    
    // Escaneo de milisegundos (request_timestamp, etc)
    let isToday = false;
    Object.values(dataObj).forEach(val => {
        if (typeof val === 'number' && val > 1700000000000) { 
            let d = new Date(val);
            if(d.getHours() >= 20) d.setDate(d.getDate() + 1);
            let dStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
            if (dStr === todayStr) isToday = true;
        }
    });
    return isToday;
}

// 3. INYECTAR LA INTERFAZ VISUAL
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

        <div id="modal-rules-racha" class="hidden fixed inset-0 bg-black/95 z- flex items-center justify-center p-4">
            <div class="bg-gray-900 border-2 border-yellow-500 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full border-2 border-white shadow-lg"><i class="fas fa-times"></i></button>
                <h3 class="text-yellow-500 font-black text-2xl text-center mb-4 tracking-tighter uppercase">REGLAS CLARAS</h3>
                <div class="space-y-3 text-xs text-gray-300">
                    <p><b class="text-white uppercase">¿CÓMO GANAR?</b><br>El premio final se basa en el nivel del día que MENOS hayas apostado en la semana.</p>
                    <div class="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-inner">
                        <p class="mb-2"><b class="text-orange-400">🥉 Nivel Bronce:</b> Juega 1 cartón diario x 7 días ➔ <b class="text-green-400 font-black">Cobras $10</b></p>
                        <p class="mb-2"><b class="text-gray-300">🥈 Nivel Plata:</b> Juega 3 cartones diarios x 7 días ➔ <b class="text-green-400 font-black">Cobras $30</b></p>
                        <p><b class="text-yellow-400">🥇 Nivel Oro:</b> Juega 6 cartones diarios x 7 días ➔ <b class="text-green-400 font-black">Cobras $60</b></p>
                    </div>
                    <p><b class="text-red-400 uppercase">⚠️ REGLA ESTRICTA:</b><br>Si depositas, debes jugar ese saldo antes de solicitar retiro. Si retiras sin apostar lo depositado, pierdes la racha y vuelves al Día 0.</p>
                </div>
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="w-full mt-6 bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest">Entendido</button>
            </div>
        </div>
    `;
}

window.showRachaRules = () => { document.getElementById('modal-rules-racha').style.display = 'flex'; };

// 4. INICIALIZACIÓN PRINCIPAL
document.addEventListener('DOMContentLoaded', () => {
    injectRachaUI();
    
    setTimeout(() => {
        if (typeof window.switchMode === 'function') {
            const originalSwitchMode = window.switchMode;
            window.switchMode = function(mode) {
                originalSwitchMode(mode);
                const rachaBox = document.getElementById('racha-main-box');
                if (rachaBox) rachaBox.style.display = 'none';
            };
        }

        firebase.auth().onAuthStateChanged(user => {
            if (!user) {
                activeUid = null;
                clearListeners();
                document.getElementById('today-deposit-text').textContent = "Bs 0.00";
                document.getElementById('today-played-text').textContent = "Bs 0.00";
                renderStreakDaysGrid(0, false, false, 0);
                return;
            }
            
            if (activeUid !== user.uid) {
                activeUid = user.uid;
                clearListeners();
                rachaState.deposito = 0;
                rachaState.bingo = 0;
                rachaState.torneo = 0;
                initStreakMonitors(user.uid);
                protectWithdrawals(user.uid);
            }
        });
    }, 500); 
});

// 5. LOS ESPÍAS DE BASE DE DATOS (Anti-Errores)
function initStreakMonitors(uid) {
    const todayStr = getSystemDateStr();

    // ESPÍA 1: DEPÓSITOS
    const refDep = dbRacha.ref('referencias_usadas').orderByChild('uid').equalTo(uid);
    const cbDep = refDep.on('value', snap => {
        try {
            let sumaDep = 0;
            if(snap.exists()) {
                snap.forEach(child => {
                    let data = child.val();
                    let status = (data.status || '').toUpperCase();
                    // Solo sumamos si está Aprobado o si es recarga manual
                    if (status === 'APPROVED' || status === 'APROBADO' || data.tipo === 'MANUAL_ADMIN' || status === '') {
                        if (isRecordFromTodayBruteForce(data, todayStr)) {
                            let m = parseFloat(data.amount || data.amt || data.monto || 0);
                            if(!isNaN(m)) sumaDep += m;
                        }
                    }
                });
            }
            rachaState.deposito = sumaDep;
            procesarRacha(uid, todayStr);
        } catch (error) { console.error("Error Leyendo Depósitos:", error); }
    });
    currentListeners.push({ref: refDep, callback: cbDep});

    // ESPÍA 2: BINGO 
    const refBin = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
    const cbBin = refBin.on('value', snap => {
        try {
            let sumaBin = 0;
            let tasaSegura = (!isNaN(configTasa) && configTasa > 0) ? configTasa : 500;
            
            if(snap.exists()) {
                snap.forEach(child => {
                    let data = child.val();
                    // Filtramos si dice gratis
                    let isGratis = JSON.stringify(data).toUpperCase().includes('GRATIS');
                    if (isRecordFromTodayBruteForce(data, todayStr) && !isGratis) {
                        let precio = parseFloat(data.precio_carton || data.amount || data.monto);
                        sumaBin += !isNaN(precio) ? precio : tasaSegura;
                    }
                });
            }
            rachaState.bingo = sumaBin;
            procesarRacha(uid, todayStr);
        } catch (error) { console.error("Error Leyendo Bingo:", error); }
    });
    currentListeners.push({ref: refBin, callback: cbBin});

    // ESPÍA 3: TORNEO (Directo a la carpeta de hoy)
    const refTor = dbRacha.ref(`bets_torneo_express/${todayStr}/${uid}`);
    const cbTor = refTor.on('value', snap => {
        try {
            let sumaTor = 0;
            let tasaSegura = (!isNaN(configTasa) && configTasa > 0) ? configTasa : 500;
            
            if(snap.exists()) {
                snap.forEach(child => {
                    let data = child.val();
                    let precio = parseFloat(data.amount || data.monto || data.precio);
                    sumaTor += !isNaN(precio) ? precio : tasaSegura;
                });
            }
            rachaState.torneo = sumaTor;
            procesarRacha(uid, todayStr);
        } catch (error) { console.error("Error Leyendo Torneo:", error); }
    });
    currentListeners.push({ref: refTor, callback: cbTor});
}

// 6. PROCESAMIENTO MATEMÁTICO 100% SEGURO
function procesarRacha(uid, todayStr) {
    try {
        let tasaActiva = (typeof configTasa === 'number' && configTasa > 0) ? configTasa : 500;
        
        let depActual = rachaState.deposito;
        let jugActual = rachaState.jugadoTotal;

        let cartonesJugados = jugActual / tasaActiva;

        // APROBACIÓN AL 95% (Mata el error de decimales)
        let nivelHoy = 0;
        if (cartonesJugados >= 5.95) nivelHoy = 3;
        else if (cartonesJugados >= 2.95) nivelHoy = 2;
        else if (cartonesJugados >= 0.95) nivelHoy = 1;

        let salvoElDia = (cartonesJugados >= 0.95);

        dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
            let data = s.val() || { dias: 0, nivel_minimo: 3, last_update: "00-00-0000", last_active: "00-00-0000" };
            let isPenalized = (data.penalizado_hoy === todayStr);
            let updates = {};
            let isDirty = false;

            if (isPenalized && salvoElDia) {
                isPenalized = false;
                updates.penalizado_hoy = null;
                data.dias = 0;
                isDirty = true;
            }

            const dReal = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
            const isTomorrow = dReal.getHours() >= 20; 
            
            const misionTitle = document.getElementById('mision-title-text');
            if (misionTitle) {
                misionTitle.textContent = isTomorrow ? "MISIÓN DE MAÑANA:" : "MISIÓN DE HOY:";
                document.getElementById('label-deposit').textContent = isTomorrow ? "DEPOSITADO (MAÑANA)" : "DEPOSITADO HOY";
                document.getElementById('label-played').textContent = isTomorrow ? "JUGADO (MAÑANA)" : "JUGADO HOY";
            }

            const dCorte = new Date(dReal);
            if(isTomorrow) dCorte.setDate(dCorte.getDate() + 1); 
            const ayerDate = new Date(dCorte); ayerDate.setDate(ayerDate.getDate() - 1);
            const ayerStr = `${String(ayerDate.getDate()).padStart(2,'0')}-${String(ayerDate.getMonth()+1).padStart(2,'0')}-${ayerDate.getFullYear()}`;

            if (!isPenalized && data.dias > 0 && data.last_active !== todayStr && data.last_active !== ayerStr) {
                data.dias = 0;
                data.nivel_minimo = 3;
                updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = todayStr;
                isDirty = true;
            }

            let visualDay = data.dias;

            if (!isPenalized && salvoElDia) {
                visualDay = Math.min(7, data.dias + 1);
                if (data.last_update !== todayStr) {
                    let minLvl = data.dias === 0 ? nivelHoy : Math.min(data.nivel_minimo || 3, nivelHoy);
                    updates.dias = visualDay;
                    updates.nivel_minimo = minLvl;
                    updates.last_update = todayStr;
                    updates.last_active = todayStr;
                    isDirty = true;
                    data.dias = visualDay;
                    data.nivel_minimo = minLvl;
                } else if (data.last_update === todayStr) {
                    let minLvl = data.dias === 1 ? nivelHoy : Math.min(data.nivel_minimo || 3, nivelHoy);
                    if(data.nivel_minimo !== minLvl) {
                        updates.nivel_minimo = minLvl;
                        isDirty = true;
                        data.nivel_minimo = minLvl;
                    }
                }
            } else if (!isPenalized && depActual > 0) {
                if (data.last_active !== todayStr) {
                    updates.last_active = todayStr;
                    isDirty = true;
                }
            }

            if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }

            // EVITAR CONGELAMIENTO AL IMPRIMIR PANTALLA
            const depText = document.getElementById('today-deposit-text');
            const playText = document.getElementById('today-played-text');
            if (depText && playText) {
                depText.textContent = "Bs " + depActual.toLocaleString('es-VE', {minimumFractionDigits: 2});
                playText.textContent = "Bs " + jugActual.toLocaleString('es-VE', {minimumFractionDigits: 2});
            }

            const warnEl = document.getElementById('rollover-warning');
            const badgeEl = document.getElementById('today-level-badge');
            const titleEl = document.getElementById('projected-prize-text');
            const barBox = document.getElementById('streak-bar-7days');
            
            if (warnEl && badgeEl && titleEl && barBox) {
                const barFillPercentage = (visualDay / 7) * 100;

                if (depActual > 0 && jugActual < (depActual * 0.95)) { 
                    warnEl.classList.remove('hidden');
                } else {
                    warnEl.classList.add('hidden');
                }

                if (isPenalized) {
                    badgeEl.innerHTML = "<span class='text-red-400'>🚫 PENALIZADO (RACHA PERDIDA)</span>";
                    titleEl.innerHTML = `🚫 RACHA PERDIDA POR RETIRO SIN JUGAR 🚫`;
                    barBox.className = "bg-red-600 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
                } else {
                    barBox.className = "bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]";

                    if (salvoElDia) {
                        if (nivelHoy === 3) {
                            badgeEl.innerHTML = "<span class='text-yellow-400'>🥇 ORO ASEGURADO</span>";
                            titleEl.innerHTML = `🏆 ¡VAS POR $60 GRATIS SI JUEGAS LOS 7 DÍAS! 🏆`;
                        } else if (nivelHoy === 2) {
                            badgeEl.innerHTML = "<span class='text-gray-300'>🥈 PLATA ASEGURADO</span>";
                            titleEl.innerHTML = `🚀 ¡VAS POR $30 GRATIS SI JUEGAS LOS 7 DÍAS! 🚀`;
                        } else {
                            badgeEl.innerHTML = "<span class='text-orange-400'>🥉 BRONCE ASEGURADO</span>";
                            titleEl.innerHTML = `🔥 ¡VAS POR $10 GRATIS SI JUEGAS LOS 7 DÍAS! 🔥`;
                        }
                    } else if (depActual > 0) {
                        badgeEl.innerHTML = "<span class='text-yellow-400 animate-pulse'>⏳ FALTA JUGAR</span>";
                        titleEl.innerHTML = `⚠️ ¡JUEGA TU SALDO PARA ASEGURAR EL DÍA! ⚠️`;
                    } else {
                        badgeEl.innerHTML = "<span class='text-gray-400'>🎯 ESPERANDO JUGADA...</span>";
                        let projected = data.dias > 0 ? (data.nivel_minimo === 3 ? 60 : (data.nivel_minimo === 2 ? 30 : 10)) : 60;
                        titleEl.innerHTML = data.dias > 0 
                            ? `🎯 ¡JUEGA PARA SEGUIR POR TUS $${projected} GRATIS! 🎯`
                            : `🎯 ¡JUEGA DESDE 1 CARTÓN DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🎯`;
                    }
                }
                barBox.style.width = barFillPercentage + '%';
            }
            renderStreakDaysGrid(data.dias, isPenalized, salvoElDia, depActual);
        });
    } catch (error) {
        console.error("Error Crítico de UI Racha:", error);
    }
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
            const warn = confirm("⚠️ ¡ALERTA DE PENALIZACIÓN! ⚠️\n\nIntentas retirar dinero depositado HOY sin haberlo jugado por completo.\n\nSi continúas, PERDERÁS LA RACHA y volverás al DÍA 0.\n\n¿Deseas retirar de todas formas?");
            if(!warn) {
                document.getElementById('withdraw-form-area').style.display='none';
                return;
            }
            const dateStr = getSystemDateStr();
            await dbRacha.ref(`users/${uid}/racha_data`).update({ dias: 0, nivel_minimo: 3, penalizado_hoy: dateStr });
        }
        if(oldSubmit) oldSubmit.call(form, e);
    };
}
