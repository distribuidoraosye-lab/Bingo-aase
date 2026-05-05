/* ============================================================
   BINGO TEXIER - MÓDULO RACHA (V39 - BLINDAJE TOTAL + CASHOUT)
   Lógica Pasiva + Vacuna + Multicarpeta + Transacción + Cashout
   ============================================================ */

const dbRacha = firebase.database();

let streakState = {
    ticketsBingo: 0,
    ticketsTorneo: 0,
    get totalTickets() { return this.ticketsBingo + this.ticketsTorneo; }
};

let currentMasterDate = null;
let bingoRef = null;
let torneoRef = null;
let syncTimer = null; 
let dateRef = null;
let tasaRachaGlobal = 600; // Tasa por defecto, se actualizará desde Firebase

// 1. INTERFAZ Y ESTILOS
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;
    if (!document.getElementById('racha-main-box')) {
        container.innerHTML = `
            <style>
                @keyframes pulse-cyan-racha { 0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); transform: scale(1.15); } 70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); transform: scale(1.2); } 100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); transform: scale(1.15); } }
                @keyframes pulse-green-racha { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); transform: scale(1.1); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); transform: scale(1.15); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); transform: scale(1.1); } }
                @keyframes glow-cashout { 0% { box-shadow: 0 0 5px #f97316; } 50% { box-shadow: 0 0 20px #ef4444; } 100% { box-shadow: 0 0 5px #f97316; } }
                .anim-diana { animation: pulse-cyan-racha 2s infinite; }
                .anim-verde { animation: pulse-green-racha 2s infinite; }
                .btn-cashout { background: linear-gradient(90deg, #f97316, #ef4444); animation: glow-cashout 2s infinite; transition: transform 0.2s; }
                .btn-cashout:active { transform: scale(0.95); }
            </style>
            <div id="racha-main-box" style="background-color: #111827; border-radius: 1rem; padding: 4px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 2px solid #eab308; margin-bottom: 24px; transition: opacity 0.3s ease;">
                <div style="background: linear-gradient(to right, #b91c1c, #ea580c, #b91c1c); padding: 14px; text-align: center; border-bottom: 1px solid #1f2937; border-radius: 0.8rem 0.8rem 0 0;">
                    <h3 style="font-weight: 900; color: white; font-size: 16px; text-transform: uppercase; margin: 0; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
                        🎯 RETO DE RACHA DIARIA 🎯
                    </h3>
                </div>
                <div style="padding: 20px; background-color: rgba(0,0,0,0.4);">
                    <div style="width: 100%; background-color: #1f2937; border-radius: 9999px; height: 10px; border: 1px solid #374151; margin-bottom: 35px; position: relative;">
                        <div id="streak-bar-7days" style="background: linear-gradient(to right, #ea580c, #eab308, #22c55e); height: 100%; border-radius: 9999px; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); width: 0%;"></div>
                    </div>
                    <div id="streak-days-grid" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 0 2px; margin-top: -20px;"></div>
                    
                    <!-- CONTENEDOR DEL BOTÓN DE CASHOUT -->
                    <div id="cashout-container" class="hidden mt-6 flex justify-center"></div>

                </div>
                <div style="background-color: #1f2937; padding: 16px; border-radius: 0 0 0.8rem 0.8rem; display: flex; flex-direction: column; align-items: center;">
                    <div style="background-color: rgba(0,0,0,0.5); padding: 12px; border-radius: 12px; border: 1px solid #4b5563; width: 100%; max-width: 300px; text-align: center; margin-bottom: 16px;">
                        <p style="font-size: 10px; color: #d1d5db; text-transform: uppercase; font-weight: 900; margin-bottom: 4px;">
                            JUGADAS PARA: <span id="master-date-display" style="color: #fbbf24;">--/--/----</span>
                        </p>
                        <span id="today-played-tickets" style="font-size: 42px; font-weight: 900; line-height: 1; transition: all 0.3s ease;">0</span>
                        <p id="today-level-badge" style="font-size: 11px; font-weight: 900; margin-top: 8px;"></p>
                    </div>
                    <div id="rules-box" style="width: 100%;"></div>
                </div>
            </div>
        `;
    }

    const originalSwitchMode = window.switchMode;
    if (typeof originalSwitchMode === 'function' && !window.switchModePatched) {
        window.switchMode = function(t) {
            originalSwitchMode(t);
            const rachaBox = document.getElementById('racha-main-box');
            if (rachaBox) {
                if (t === 'bingo' || t === 'animalitos') rachaBox.style.display = 'none';
                else rachaBox.style.display = 'block';
            }
        };
        window.switchModePatched = true;
    }
}

// 2. FECHAS BLINDADAS
function normalizeDate(str) {
    if (!str) return "00-00-0000";
    let clean = String(str).replace(/\//g, '-').trim();
    let p = clean.split('-');
    let tempD = p.shift(); let tempM = p.shift(); let tempY = p.shift();
    if (tempD && tempM && tempY) {
        let d = tempD.length === 1 ? '0' + tempD : tempD;
        let m = tempM.length === 1 ? '0' + tempM : tempM;
        return d + '-' + m + '-' + tempY;
    }
    return clean;
}

function addDaysSafe(dateStr, daysToAdd) {
    let cleanStr = normalizeDate(dateStr);
    if (cleanStr === "00-00-0000") return "00-00-0000";
    let p = cleanStr.split('-');
    let extraidoD = p.shift(); let extraidoM = p.shift(); let extraidoY = p.shift();
    let d = parseInt(extraidoD, 10); let m = parseInt(extraidoM, 10) - 1; let y = parseInt(extraidoY, 10);
    let dateObj = new Date(y, m, d, 12, 0, 0);
    dateObj.setDate(dateObj.getDate() + daysToAdd);
    let dd = String(dateObj.getDate()).padStart(2, '0');
    let mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${dateObj.getFullYear()}`;
}

// 3. MONITOR FIREBASE Y MULTICARPETA
function initRachaModule() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            injectRachaUI();
            const rachaBox = document.getElementById('racha-main-box');
            if (rachaBox) rachaBox.style.display = 'block';
            
            // Leer Tasa de Cambio Global para la Racha
            dbRacha.ref('config/racha_config/tasa_pago_racha').on('value', snap => {
                if (snap.exists()) tasaRachaGlobal = parseFloat(snap.val());
            });

            if (dateRef) dateRef.off();
            dateRef = dbRacha.ref('draw_status/date');
            dateRef.on('value', snap => {
                currentMasterDate = normalizeDate(snap.val());
                if(currentMasterDate !== "00-00-0000") initStreakData(user.uid);
            });
        } else {
            streakState.ticketsBingo = 0; streakState.ticketsTorneo = 0; currentMasterDate = null;
            if(bingoRef) bingoRef.off(); if(window.bingoHistorialRef) window.bingoHistorialRef.off();
            if(torneoRef) torneoRef.off(); if(dateRef) dateRef.off();
            clearTimeout(syncTimer); 
            const rachaBox = document.getElementById('racha-main-box');
            if(rachaBox) rachaBox.style.display = 'none';
        }
    });
}

// LECTURA MULTICARPETA: ACTIVO + HISTORIAL + TORNEO
function initStreakData(uid) {
    const cleanMaster = currentMasterDate;
    const displayEl = document.getElementById('master-date-display');
    if (displayEl) displayEl.textContent = cleanMaster.replace(/-/g, '/');

    let ticketsVivos = 0;
    let ticketsHistorial = 0;

    const actualizarTotalBingo = () => {
        streakState.ticketsBingo = ticketsVivos + ticketsHistorial;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => { syncAndRender(uid); }, 600);
    };

    // 1. CARPETA BINGO ACTIVO
    if(bingoRef) bingoRef.off();
    bingoRef = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
    bingoRef.on('value', s => {
        ticketsVivos = 0;
        s.forEach(c => {
            let b = c.val();
            if (normalizeDate(b.date) === cleanMaster && b.payment_method !== 'GRATIS') ticketsVivos++;
        });
        actualizarTotalBingo();
    });

    // 2. CARPETA BINGO HISTORIAL (Blindaje anti-cierre)
    if(window.bingoHistorialRef) window.bingoHistorialRef.off();
    window.bingoHistorialRef = dbRacha.ref(`bingo_to_grade/estelar/${cleanMaster}/bets`).orderByChild('uid').equalTo(uid);
    window.bingoHistorialRef.on('value', s => {
        ticketsHistorial = 0;
        s.forEach(c => {
            let b = c.val();
            if (b.payment_method !== 'GRATIS') ticketsHistorial++;
        });
        actualizarTotalBingo();
    });

    // 3. CARPETA TORNEO
    if(torneoRef) torneoRef.off();
    torneoRef = dbRacha.ref(`bets_torneo_express/${cleanMaster}/${uid}`);
    torneoRef.on('value', s => {
        streakState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
        actualizarTotalBingo();
    });
}

// 4. TRANSACCIÓN SEGURA (Anti-Caché)
function syncAndRender(uid) {
    const totalHoy = streakState.totalTickets;
    const diaSalvado = (totalHoy >= 1);
    let nivelHoy = totalHoy >= 6 ? 3 : (totalHoy >= 3 ? 2 : (totalHoy >= 1 ? 1 : 0));

    dbRacha.ref(`users/${uid}/racha_data`).transaction(data => {
        let d = data || {};
        let dias = d.dias || 0;
        let nivel_minimo = d.nivel_minimo !== undefined ? d.nivel_minimo : 3;
        
        let last_active_raw = d.last_active || "00-00-0000";
        let esManual = last_active_raw.includes("_ADMIN");
        let last_active = last_active_raw.replace("_ADMIN", "");
        
        let fecha_inicio = d.fecha_inicio || "00-00-0000";
        let nivel_pico_hoy = d.nivel_pico_hoy || 0;
        let ayer = addDaysSafe(currentMasterDate, -1);

        // Vacuna de seguridad
        if (last_active.includes("191") || last_active.includes("190") || last_active.includes("189")) last_active = ayer;

        if (diaSalvado) {
            if (last_active === currentMasterDate) {
                if (nivelHoy !== nivel_pico_hoy) {
                    nivel_pico_hoy = Math.max(nivel_pico_hoy, nivelHoy);
                    if (dias === 1) nivel_minimo = nivel_pico_hoy;
                }
            } else if (last_active === ayer || esManual) {
                nivel_minimo = Math.min(nivel_minimo, nivel_pico_hoy || 3);
                if (dias === 0) fecha_inicio = currentMasterDate;
                dias++;
                last_active = currentMasterDate;
                nivel_pico_hoy = nivelHoy;
                if (dias === 1) nivel_minimo = nivel_pico_hoy;
            } else {
                dias = 1; fecha_inicio = currentMasterDate; last_active = currentMasterDate;
                nivel_pico_hoy = nivelHoy; nivel_minimo = nivelHoy;
            }
        } else {
            if (dias > 0 && last_active === ayer) {
                let nuevoMinimo = Math.min(nivel_minimo, nivel_pico_hoy || 3);
                if (nuevoMinimo !== nivel_minimo) nivel_minimo = nuevoMinimo;
            }
        }

        // Siempre debe devolver el objeto completo
        return { dias, last_active, fecha_inicio, nivel_pico_hoy, nivel_minimo };

    }, (error, committed, snapshot) => {
        if (error) { console.error("Error actualizando racha", error); return; }
        if (committed) {
            let finalData = snapshot.val() || {};
            let activeRow = diaSalvado ? nivelHoy : 0; 
            renderVisuals(finalData.dias, finalData.last_active, finalData.fecha_inicio, diaSalvado, nivelHoy, activeRow, finalData.nivel_minimo, uid);
        }
    });
}

function renderVisuals(dias, last_active, fecha_inicio, diaSalvado, nivelHoy, activeRow, nivelMinimo, uid) {
    const totalHoy = streakState.totalTickets;
    const cleanMaster = currentMasterDate;
    
    // UI Central
    const numEl = document.getElementById('today-played-tickets');
    if(numEl) {
        numEl.textContent = totalHoy;
        numEl.style.color = diaSalvado ? "#4ade80" : "#22d3ee";
        numEl.style.textShadow = diaSalvado ? "0 0 15px rgba(74, 222, 128, 0.5)" : "0 0 15px rgba(34, 211, 238, 0.5)";
    }
    const badgeEl = document.getElementById('today-level-badge');
    if(badgeEl) {
        badgeEl.innerHTML = diaSalvado ? "✅ DÍA COMPLETADO" : "🎯 FALTA JUGADA DE HOY";
        badgeEl.style.color = diaSalvado ? "#4ade80" : "#22d3ee";
    }
    
    // Tabla de reglas
    const rulesBox = document.getElementById('rules-box');
    if(rulesBox) {
        rulesBox.innerHTML = `
            <div style="width: 100%; background-color: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; font-size: 10px;">
                <p style="color: #facc15; font-weight: 900; text-align: center; margin-bottom: 8px; text-transform: uppercase;">Tabla de Premios (Al día 7)</p>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${renderPremioRow(1, "Juega de 1 a 2 cartones diarios", "$10", activeRow)}
                    ${renderPremioRow(2, "Juega de 3 a 5 cartones diarios", "$30", activeRow)}
                    ${renderPremioRow(3, "Juega 6 o más cartones diarios", "$60", activeRow)}
                </div>
            </div>
        `;
    }

    // Grid de días (Barra)
    const grid = document.getElementById('streak-days-grid');
    if(grid) {
        grid.innerHTML = '';
        let startPoint = cleanMaster;
        if (dias > 0) {
            let offset = diaSalvado ? (dias - 1) : dias;
            startPoint = addDaysSafe(cleanMaster, -offset);
        }
        
        for (let i = 0; i < 7; i++) {
            let currentSlotDate = addDaysSafe(startPoint, i); 
            let isToday = (currentSlotDate === cleanMaster);
            let isPast = (i < dias) && !isToday;
            let icon = '🔒'; let style = 'background: #1f2937; border: 2px solid #374151; color: #4b5563;'; let anim = '';
            if (isToday) {
                if (diaSalvado) { icon = '✅'; style = 'background: #16a34a; border: 2px solid #4ade80; color: white; transform: scale(1.1); box-shadow: 0 0 10px #16a34a;'; anim = 'anim-verde'; }
                else { icon = '🎯'; style = 'background: rgba(34, 211, 238, 0.1); border: 2px solid #22d3ee; color: #22d3ee;'; anim = 'anim-diana'; }
            } else if (isPast) { icon = '✅'; style = 'background: #065f46; border: 2px solid #059669; color: #a7f3d0;'; }
            else if (i === 6) { icon = '🎁'; style = 'border: 2px dashed #4338ca; color: #818cf8;'; }
            grid.innerHTML += `<div style="display: flex; flex-direction: column; align-items: center; width: 14%;"><div class="${anim}" style="width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.5s; ${style}">${icon}</div><span style="font-size: 9px; margin-top: 6px; color: white; font-weight: bold;">DÍA ${i + 1}</span></div>`;
        }
    }
    
    let porcentajeBarra = (Math.min(dias, 7) / 7) * 100;
    const bar = document.getElementById('streak-bar-7days');
    if(bar) bar.style.width = porcentajeBarra + '%';

    // === LÓGICA DEL BOTÓN CASHOUT ===
    renderCashoutButton(dias, nivelMinimo, uid);
}

function renderPremioRow(lvl, texto, monto, activeRow) {
    let isSelected = (activeRow === lvl);
    let style = isSelected ? 'background: rgba(34,197,94,0.2); border: 1px solid #4ade80;' : 'opacity: 0.5; border: 1px solid transparent;';
    return `<div style="display: flex; flex-direction: column; padding: 6px 8px; border-radius: 4px; gap: 3px; ${style}"><div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: white; font-weight: bold; font-size: 10px;">${texto}</span><span style="color: #4ade80; font-weight: 900; font-size: 12px;">${monto}</span></div></div>`;
}

// 5. CÁLCULO Y RENDERIZADO DEL CASHOUT
function calcularMontoCashout(dias, nivel) {
    let basePremioDolares = 0;
    if (nivel === 1) basePremioDolares = 10;
    else if (nivel === 2) basePremioDolares = 30;
    else if (nivel === 3) basePremioDolares = 60;
    
    if (basePremioDolares === 0) return 0;

    let penalizacion = 0;
    if (dias === 3) penalizacion = 0.50; // Día 3
    else if (dias === 4) penalizacion = 0.45; // Día 4
    else if (dias === 5) penalizacion = 0.40; // Día 5
    else if (dias === 6) penalizacion = 0.38; // Día 6

    if (penalizacion === 0) return 0;

    let gananciaAcumulada = (basePremioDolares / 7) * dias;
    let totalDolares = gananciaAcumulada * penalizacion;
    
    return totalDolares * tasaRachaGlobal;
}

function renderCashoutButton(dias, nivelMinimo, uid) {
    const container = document.getElementById('cashout-container');
    if(!container) return;

    if (dias >= 3 && dias <= 6) {
        let montoBolivares = calcularMontoCashout(dias, nivelMinimo);
        
        if (montoBolivares > 0) {
            container.innerHTML = `
                <button id="btn-cashout-racha" onclick="ejecutarCashoutRacha('${uid}', ${montoBolivares})" class="btn-cashout w-full max-w-[280px] p-3 rounded-xl border border-red-300 shadow-xl flex flex-col items-center justify-center cursor-pointer">
                    <span class="text-white font-black text-lg drop-shadow-md tracking-wide">¡COBRA Bs ${montoBolivares.toFixed(2)} YA!</span>
                    <span class="text-red-100 text-[10px] font-bold mt-1 tracking-wider uppercase">Adelanta tu racha y llévate esto ya</span>
                </button>
            `;
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    } else {
        container.classList.add('hidden');
    }
}

// 6. ACCIÓN DEL CASHOUT (PAGO Y REINICIO SEGURO)
window.ejecutarCashoutRacha = async (uid, montoBs) => {
    if(!confirm(`¿Seguro que quieres cobrar ${montoBs.toFixed(2)} Bs ahora?\n\nTu racha se reiniciará al Día 0.`)) return;

    const btn = document.getElementById('btn-cashout-racha');
    if(btn) { 
        btn.disabled = true; 
        btn.innerHTML = `<span class="text-white font-black text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>PROCESANDO...</span>`; 
    }

    try {
        // 1. Sumar saldo al usuario (Transacción segura)
        await dbRacha.ref(`users/${uid}/balance`).transaction(bal => (bal || 0) + montoBs);

        // 2. Limpiar la racha (Reiniciar progreso a 0)
        const resetData = {
            dias: 0,
            last_active: "00-00-0000",
            fecha_inicio: "00-00-0000",
            nivel_pico_hoy: 0,
            nivel_minimo: 3
        };
        await dbRacha.ref(`users/${uid}/racha_data`).update(resetData);

        // 3. Registrar en Logs para el Admin
        await dbRacha.ref(`logs_cashout_racha`).push({
            uid: uid,
            monto_bs: montoBs,
            tasa_usada: tasaRachaGlobal,
            fecha: new Date().toISOString(),
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        alert(`✅ ¡Cashout exitoso! Se han sumado ${montoBs.toFixed(2)} Bs a tu saldo.`);
        
        // El sistema se actualizará solo gracias a los listeners de Firebase
        
    } catch (error) {
        alert("❌ Error al procesar el Cashout: " + error.message);
        if(btn) { 
            btn.disabled = false; 
            btn.innerHTML = `<span class="text-white font-black text-sm">REINTENTAR</span>`; 
        }
    }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRachaModule);
else initRachaModule();
