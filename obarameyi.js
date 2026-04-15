/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (V9 - Lógica por Cartones)
   SIN BOLÍVARES | CORTES INDEPENDIENTES (6PM Torneo / 8PM Bingo)
   ============================================================ */

const dbRacha = firebase.database();

let streakState = {
    ticketsBingo: 0,
    ticketsTorneo: 0,
    get totalTickets() { return this.ticketsBingo + this.ticketsTorneo; }
};

// 1. Interfaz Premium (Basada en cantidad de cartones)
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    container.innerHTML = `
        <div id="racha-main-box" class="bg-gray-900 rounded-2xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mt-2 mb-6">
            
            <div class="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 p-4 text-center border-b border-gray-800 shadow-inner">
                <h3 id="projected-prize-text" class="font-black text-white text-lg tracking-tighter uppercase animate-pulse drop-shadow-lg leading-tight">
                    🎯 ¡JUEGA 1 CARTÓN DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🎯
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
            
            <div class="bg-gray-800 p-4 border-t border-gray-700 flex flex-col items-center">
                <div class="flex justify-between items-center w-full mb-3">
                    <span id="mision-title-text" class="text-[10px] text-yellow-500 font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded">ESTADO DE HOY:</span>
                    <span id="today-level-badge" class="text-[10px] bg-gray-700 px-2 py-1 rounded text-white font-black shadow-sm">ESPERANDO JUGADA...</span>
                </div>
                
                <div class="bg-black/50 p-3 rounded-lg border border-gray-600 shadow-inner w-full max-w-xs text-center mb-4">
                    <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">TOTAL CARTONES / TICKETS JUGADOS</p>
                    <div class="flex justify-center items-end gap-2">
                        <span id="today-played-tickets" class="text-4xl font-black text-orange-400 leading-none">0</span>
                        <span class="text-sm font-bold text-gray-500 pb-1">Hoy</span>
                    </div>
                </div>
                
                <div class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-[9px] text-center uppercase tracking-widest space-y-1">
                    <p class="text-yellow-400 font-black mb-2">🏆 TABLA DE PREMIOS (7 DÍAS SEGUIDOS) 🏆</p>
                    <p class="text-gray-300">Juega <b class="text-white">1 a 2 cartones</b> diarios ➔ <b class="text-green-400">$10 GRATIS</b></p>
                    <p class="text-gray-300">Juega <b class="text-white">3 a 5 cartones</b> diarios ➔ <b class="text-green-400">$30 GRATIS</b></p>
                    <p class="text-gray-300">Juega <b class="text-white">6 o más cartones</b> diarios ➔ <b class="text-green-400">$60 GRATIS</b></p>
                    <p class="text-gray-500 mt-2 lowercase text-[8px]">*El premio se calcula con el día que menos cartones jugaste.</p>
                </div>
            </div>
        </div>
    `;
}

// 2. Controladores de Fecha (Cortes independientes sin tocar el código principal)
function getCustomDateStr(offsetHours) {
    const d = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
    if(d.getHours() >= offsetHours) d.setDate(d.getDate() + 1); 
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

document.addEventListener('DOMContentLoaded', () => {
    injectRachaUI();
    renderStreakDaysGrid(0, false); 
    
    // Ocultar racha al entrar a un juego (Interceptando switchMode)
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
            if (user) {
                initStreakMonitor(user.uid);
            }
        });
    }, 500); 
});

// 3. Monitor Inteligente (Solo cuenta tickets)
async function initStreakMonitor(uid) {
    
    // Escuchar Bingo (Corte 8 PM = 20)
    dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let countB = 0;
        const bingoDate = getCustomDateStr(20); 
        if (s.exists()) {
            s.forEach(c => {
                // Cuenta solo si es de la fecha correspondiente y no fue regalado por el sistema
                if(c.val().date === bingoDate && c.val().payment_method !== 'GRATIS') countB++;
            });
        }
        streakState.ticketsBingo = countB;
        updateStreakUI(uid);
    });

    // Escuchar Torneo (Corte 6 PM = 18)
    // Usamos setInterval para revisar periódicamente la fecha activa por si cruza las 6pm mientras navega
    setInterval(() => checkTorneo(uid), 2000);
    checkTorneo(uid);
}

function checkTorneo(uid) {
    const torneoDate = getCustomDateStr(18);
    dbRacha.ref(`bets_torneo_express/${torneoDate}/${uid}`).once('value', s => {
        let countT = 0;
        if (s.exists()) {
            s.forEach(c => { countT++; }); // Cada nodo es un ticket
        }
        if (streakState.ticketsTorneo !== countT) {
            streakState.ticketsTorneo = countT;
            updateStreakUI(uid);
        }
    });
}

// 4. Lógica de Niveles y Actualización en Firebase
function updateStreakUI(uid) {
    const totalJugado = streakState.totalTickets;
    
    let nivelAlcanzadoHoy = 0;
    if (totalJugado >= 6) { nivelAlcanzadoHoy = 3; }
    else if (totalJugado >= 3) { nivelAlcanzadoHoy = 2; }
    else if (totalJugado >= 1) { nivelAlcanzadoHoy = 1; }

    let diaSalvado = (totalJugado >= 1);

    // Utilizamos la fecha base del Bingo (8PM) para controlar el día activo de la racha
    const masterDate = getCustomDateStr(20);

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3, last_update: "00-00-0000", last_active: "00-00-0000" };
        let isDirty = false;
        let updates = {};

        const dReal = new Date(Date.now() + (typeof serverTimeOffset !== 'undefined' ? serverTimeOffset : 0));
        const isTomorrow = dReal.getHours() >= 20; 
        
        document.getElementById('mision-title-text').textContent = isTomorrow ? "ESTADO DE MAÑANA:" : "ESTADO DE HOY:";

        // Calcular ayer
        const dCorte = new Date(dReal);
        if(isTomorrow) dCorte.setDate(dCorte.getDate() + 1); 
        const ayerDate = new Date(dCorte); ayerDate.setDate(ayerDate.getDate() - 1);
        const ayerStr = `${String(ayerDate.getDate()).padStart(2,'0')}-${String(ayerDate.getMonth()+1).padStart(2,'0')}-${ayerDate.getFullYear()}`;

        // Perder la racha por no jugar (si no jugó hoy, ni jugó ayer, se resetea)
        if (data.dias > 0 && data.last_active !== masterDate && data.last_active !== ayerStr) {
            data.dias = 0;
            data.nivel_minimo = 3;
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = masterDate;
            isDirty = true;
        }

        let visualDay = data.dias;
        let barFillPercentage = (visualDay / 7) * 100;

        if (diaSalvado) {
            visualDay = Math.min(7, data.dias + 1); 
            barFillPercentage = (visualDay / 7) * 100;
            
            if (data.last_update !== masterDate) {
                // Nuevo día salvado
                let minLvl = data.dias === 0 ? nivelAlcanzadoHoy : Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                updates.dias = visualDay;
                updates.nivel_minimo = minLvl;
                updates.last_update = masterDate;
                updates.last_active = masterDate;
                isDirty = true;
                data.dias = visualDay; 
                data.nivel_minimo = minLvl;
            } else if (data.last_update === masterDate) {
                // Subiendo de nivel en el mismo día
                let minLvl = data.dias === 1 ? nivelAlcanzadoHoy : Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                if(data.nivel_minimo !== minLvl) {
                    updates.nivel_minimo = minLvl;
                    isDirty = true;
                    data.nivel_minimo = minLvl;
                }
            }
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }

        // Actualizar visuales
        document.getElementById('today-played-tickets').textContent = totalJugado;

        const badgeEl = document.getElementById('today-level-badge');
        const titleEl = document.getElementById('projected-prize-text');

        document.getElementById('streak-bar-7days').className = "bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.4)]";

        if (diaSalvado) {
            if (nivelAlcanzadoHoy === 3) {
                badgeEl.innerHTML = "<span class='text-yellow-400'>🥇 ORO ASEGURADO</span>";
                titleEl.innerHTML = `🏆 ¡VAS POR $60 GRATIS SI JUEGAS LOS 7 DÍAS! 🏆`;
            } else if (nivelAlcanzadoHoy === 2) {
                badgeEl.innerHTML = "<span class='text-gray-300'>🥈 PLATA ASEGURADO</span>";
                titleEl.innerHTML = `🚀 ¡VAS POR $30 GRATIS SI JUEGAS LOS 7 DÍAS! 🚀`;
            } else {
                badgeEl.innerHTML = "<span class='text-orange-400'>🥉 BRONCE ASEGURADO</span>";
                titleEl.innerHTML = `🔥 ¡VAS POR $10 GRATIS SI JUEGAS LOS 7 DÍAS! 🔥`;
            }
        } else {
            badgeEl.innerHTML = "<span class='text-gray-400'>🎯 ESPERANDO JUGADA...</span>";
            let projected = data.dias > 0 ? (data.nivel_minimo === 3 ? 60 : (data.nivel_minimo === 2 ? 30 : 10)) : 60;
            titleEl.innerHTML = data.dias > 0 
                ? `🎯 ¡JUEGA PARA SEGUIR POR TUS $${projected} GRATIS! 🎯`
                : `🎯 ¡JUEGA 1 CARTÓN DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🎯`;
        }

        document.getElementById('streak-bar-7days').style.width = barFillPercentage + '%';
        renderStreakDaysGrid(data.dias, diaSalvado);
    });
}

function renderStreakDaysGrid(diasCompletados, diaSalvado) {
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
            if (diaSalvado) {
                icon = '✅'; color = 'bg-green-500 border-white text-white shadow-[0_0_15px_rgba(34,197,94,0.8)] scale-110'; subText = 'Asegurado';
            } else {
                icon = '🎯'; color = 'bg-orange-500 border-white text-white shadow-[0_0_15px_rgba(249,115,22,0.8)] scale-110 animate-pulse'; subText = 'Hoy';
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
                <span class="text-[8px] font-black mt-1 uppercase ${i <= diasCompletados + 1 ? 'text-white' : 'text-gray-600'} text-center">${subText}</span>
            </div>
        `;
    }
}
