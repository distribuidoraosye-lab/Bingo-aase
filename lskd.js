const dbRacha = firebase.database();
const TASA_BASE = 500;

let estadoRacha = {
    deposito: 0,
    bingo: 0,
    torneo: 0,
    get jugado() { return this.bingo + this.torneo; }
};

let activeUser = null;
let currentListeners = [];

function getFechaHoyFormateada() {
    let d = new Date();
    if (d.getHours() >= 20) d.setDate(d.getDate() + 1);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function esRegistroDeHoy(timestampOCadena) {
    if (!timestampOCadena) return false;
    let d;
    if (typeof timestampOCadena === 'number') {
        d = new Date(timestampOCadena);
    } else if (typeof timestampOCadena === 'string') {
        if (timestampOCadena.includes('-')) {
            let partes = timestampOCadena.split(' ').split('-');
            if (partes.length === 3) d = new Date(`${partes}/${partes}/${partes}`);
        } else if (timestampOCadena.includes('/')) {
            let partes = timestampOCadena.split(' ').split('/');
            if (partes.length === 3) d = new Date(`${partes}/${partes}/${partes}`);
        } else if (!isNaN(parseInt(timestampOCadena))) {
            d = new Date(parseInt(timestampOCadena));
        }
    }
    if (!d || isNaN(d.getTime())) return false;
    
    if (d.getHours() >= 20) d.setDate(d.getDate() + 1);
    let stringConvertido = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    return stringConvertido === getFechaHoyFormateada();
}

function renderUIHTML() {
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
                <button onclick="document.getElementById('modal-rules-racha').style.display='none'" class="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full border-2 border-white shadow-lg">X</button>
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

function arrancarRacha() {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) return;
        if (activeUser !== user.uid) {
            activeUser = user.uid;
            currentListeners.forEach(l => l.ref.off('value', l.callback));
            currentListeners = [];
            estadoRacha.deposito = 0;
            estadoRacha.bingo = 0;
            estadoRacha.torneo = 0;
            espiarBaseDeDatos(user.uid);
            protegerRetiros(user.uid);
        }
    });
}

function espiarBaseDeDatos(uid) {
    // Espiar Depósitos
    const refDep = dbRacha.ref('referencias_usadas').orderByChild('uid').equalTo(uid);
    const cbDep = refDep.on('value', snap => {
        try {
            let total = 0;
            snap.forEach(child => {
                let d = child.val();
                let status = (d.status || '').toUpperCase();
                let tipo = (d.tipo || '').toUpperCase();
                if (status === 'APPROVED' || status === 'APROBADO' || tipo === 'MANUAL_ADMIN') {
                    let ts = d.request_timestamp || d.timestamp || d.date || d.fecha || d.time;
                    if (esRegistroDeHoy(ts)) {
                        total += parseFloat(d.amount || d.amt || d.monto || 0);
                    }
                }
            });
            estadoRacha.deposito = total;
            calcularYGuardar(uid);
        } catch(e){}
    });
    currentListeners.push({ref: refDep, callback: cbDep});

    // Espiar Bingo
    const refBin = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
    const cbBin = refBin.on('value', snap => {
        try {
            let total = 0;
            snap.forEach(child => {
                let d = child.val();
                let esGratis = JSON.stringify(d).toUpperCase().includes('GRATIS');
                if (!esGratis) {
                    let ts = d.date || d.timestamp || d.request_timestamp || d.time;
                    if (esRegistroDeHoy(ts)) {
                        let p = parseFloat(d.precio_carton || d.amount || d.monto);
                        total += isNaN(p) ? TASA_BASE : p;
                    }
                }
            });
            estadoRacha.bingo = total;
            calcularYGuardar(uid);
        } catch(e){}
    });
    currentListeners.push({ref: refBin, callback: cbBin});

    // Espiar Torneo
    let hoyTorneo = getFechaHoyFormateada();
    const refTor = dbRacha.ref(`bets_torneo_express/${hoyTorneo}/${uid}`);
    const cbTor = refTor.on('value', snap => {
        try {
            let total = 0;
            snap.forEach(child => {
                let d = child.val();
                let p = parseFloat(d.amount || d.monto || d.precio);
                total += isNaN(p) ? TASA_BASE : p;
            });
            estadoRacha.torneo = total;
            calcularYGuardar(uid);
        } catch(e){}
    });
    currentListeners.push({ref: refTor, callback: cbTor});
}

function calcularYGuardar(uid) {
    try {
        let dep = estadoRacha.deposito;
        let jug = estadoRacha.jugado;
        let porcentajeJugado = dep > 0 ? (jug / dep) : 0;
        let salvado = (jug > 0 && jug >= (dep * 0.95)) || (jug >= TASA_BASE * 0.95 && dep === 0);
        
        let nivelHoy = 1; 
        if (jug >= TASA_BASE * 5.95) nivelHoy = 3;
        else if (jug >= TASA_BASE * 2.95) nivelHoy = 2;

        dbRacha.ref(`users/${uid}/racha_data`).once('value', snap => {
            let data = snap.val() || { dias: 0, nivel_minimo: 3, last_update: "00", last_active: "00" };
            let hoyStr = getFechaHoyFormateada();
            
            let dReal = new Date();
            let isMañana = dReal.getHours() >= 20;
            let dCorte = new Date(dReal);
            if(isMañana) dCorte.setDate(dCorte.getDate() + 1);
            let ayerDate = new Date(dCorte); ayerDate.setDate(ayerDate.getDate() - 1);
            let ayerStr = `${String(ayerDate.getDate()).padStart(2,'0')}-${String(ayerDate.getMonth()+1).padStart(2,'0')}-${ayerDate.getFullYear()}`;

            let castigado = data.penalizado_hoy === hoyStr;
            let updates = {};
            let guardar = false;

            if (castigado && salvado) {
                castigado = false;
                updates.penalizado_hoy = null;
                data.dias = 0;
                guardar = true;
            }

            if (!castigado && data.dias > 0 && data.last_active !== hoyStr && data.last_active !== ayerStr) {
                data.dias = 0;
                data.nivel_minimo = 3;
                updates.dias = 0;
                updates.nivel_minimo = 3;
                updates.last_active = hoyStr;
                guardar = true;
            }

            let visualDay = data.dias;

            if (!castigado && salvado) {
                visualDay = Math.min(7, data.dias + 1);
                if (data.last_update !== hoyStr) {
                    let minLvl = data.dias === 0 ? nivelHoy : Math.min(data.nivel_minimo || 3, nivelHoy);
                    updates.dias = visualDay;
                    updates.nivel_minimo = minLvl;
                    updates.last_update = hoyStr;
                    updates.last_active = hoyStr;
                    guardar = true;
                    data.dias = visualDay;
                    data.nivel_minimo = minLvl;
                } else if (data.last_update === hoyStr) {
                    let minLvl = data.dias === 1 ? nivelHoy : Math.min(data.nivel_minimo || 3, nivelHoy);
                    if (data.nivel_minimo !== minLvl) {
                        updates.nivel_minimo = minLvl;
                        guardar = true;
                        data.nivel_minimo = minLvl;
                    }
                }
            } else if (!castigado && dep > 0 && data.last_active !== hoyStr) {
                updates.last_active = hoyStr;
                guardar = true;
            }

            if (guardar) dbRacha.ref(`users/${uid}/racha_data`).update(updates);

            actualizarPantalla(dep, jug, visualDay, salvado, castigado, data, nivelHoy);
        });
    } catch(e){}
}

function actualizarPantalla(dep, jug, dias, salvado, castigado, data, nivelHoy) {
    let depEl = document.getElementById('today-deposit-text');
    let jugEl = document.getElementById('today-played-text');
    if(depEl) depEl.textContent = "Bs " + dep.toLocaleString('es-VE', {minimumFractionDigits: 2});
    if(jugEl) jugEl.textContent = "Bs " + jug.toLocaleString('es-VE', {minimumFractionDigits: 2});

    let warn = document.getElementById('rollover-warning');
    if(warn) {
        if(dep > 0 && jug < (dep * 0.95)) warn.classList.remove('hidden');
        else warn.classList.add('hidden');
    }

    let badge = document.getElementById('today-level-badge');
    let prize = document.getElementById('projected-prize-text');
    let bar = document.getElementById('streak-bar-7days');
    
    let dReal = new Date();
    let isMañana = dReal.getHours() >= 20;
    let tit = document.getElementById('mision-title-text');
    if(tit) tit.textContent = isMañana ? "MISIÓN DE MAÑANA:" : "MISIÓN DE HOY:";

    if (badge && prize && bar) {
        if (castigado) {
            badge.innerHTML = "<span class='text-red-400'>🚫 PENALIZADO (RACHA PERDIDA)</span>";
            prize.innerHTML = `🚫 RACHA PERDIDA POR RETIRO 🚫`;
            bar.className = "bg-red-600 h-full rounded-full";
        } else {
            bar.className = "bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full";
            if (salvado) {
                if (nivelHoy === 3) { badge.innerHTML = "<span class='text-yellow-400'>🥇 ORO ASEGURADO</span>"; prize.innerHTML = `🏆 ¡VAS POR $60 GRATIS! 🏆`; }
                else if (nivelHoy === 2) { badge.innerHTML = "<span class='text-gray-300'>🥈 PLATA ASEGURADO</span>"; prize.innerHTML = `🚀 ¡VAS POR $30 GRATIS! 🚀`; }
                else { badge.innerHTML = "<span class='text-orange-400'>🥉 BRONCE ASEGURADO</span>"; prize.innerHTML = `🔥 ¡VAS POR $10 GRATIS! 🔥`; }
            } else if (dep > 0) {
                badge.innerHTML = "<span class='text-yellow-400'>⏳ FALTA JUGAR</span>"; prize.innerHTML = `⚠️ ¡JUEGA TU SALDO! ⚠️`;
            } else {
                badge.innerHTML = "<span class='text-gray-400'>🎯 ESPERANDO JUGADA...</span>";
                let p = data.dias > 0 ? (data.nivel_minimo===3 ? 60 : (data.nivel_minimo===2 ? 30 : 10)) : 60;
                prize.innerHTML = `🎯 ¡JUEGA DESDE 1 CARTÓN Y GANA HASTA $${p}! 🎯`;
            }
        }
        bar.style.width = ((dias / 7) * 100) + '%';
    }

    let grid = document.getElementById('streak-days-grid');
    if(grid) {
        grid.innerHTML = '';
        for(let i=1; i<=7; i++) {
            let icon = '🔒', color = 'bg-gray-800 text-gray-600', text = 'Día '+i;
            if (i <= dias) { icon = '✅'; color = 'bg-green-600 text-white shadow-lg'; text = 'Listo'; }
            else if (i === dias + 1) {
                if (castigado) { icon = '🚫'; color = 'bg-red-600 text-white animate-pulse'; text = 'Perdido'; }
                else if (salvado) { icon = '✅'; color = 'bg-green-500 text-white scale-110'; text = 'Asegurado'; }
                else if (dep > 0) { icon = '⏳'; color = 'bg-yellow-500 text-black animate-pulse scale-110'; text = 'Juega'; }
                else { icon = '🎯'; color = 'bg-orange-500 text-white animate-pulse scale-110'; text = 'Hoy'; }
            } else if (i === 7) { icon = '🎁'; color = 'bg-gray-800 text-gray-500 opacity-50'; }
            
            grid.innerHTML += `
                <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full border-2 border-white ${color} flex items-center justify-center text-xs transition-all duration-500">${icon}</div>
                    <span class="text-[8px] font-black mt-1 uppercase ${i <= dias + 1 && !castigado ? 'text-white' : 'text-gray-600'} text-center">${text}</span>
                </div>`;
        }
    }
}

function protegerRetiros(uid) {
    let form = document.getElementById('withdraw-form');
    if(!form) return;
    let old = form.onsubmit;
    form.onsubmit = async (e) => {
        e.preventDefault();
        let dep = estadoRacha.deposito, jug = estadoRacha.jugado;
        if(dep > 0 && jug < (dep * 0.95)) { 
            if(!confirm("⚠️ ¡ALERTA!\nIntentas retirar sin jugar tu depósito de hoy.\nPERDERÁS LA RACHA y volverás al DÍA 0.\n¿Deseas retirar de todas formas?")) return;
            await dbRacha.ref(`users/${uid}/racha_data`).update({ dias: 0, nivel_minimo: 3, penalizado_hoy: getFechaHoyFormateada() });
        }
        if(old) old.call(form, e);
    };
}

document.addEventListener('DOMContentLoaded', () => { injectRachaUI(); setTimeout(arrancarRacha, 500); });
