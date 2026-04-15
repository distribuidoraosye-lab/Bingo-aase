/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (V21 - REDISEÑO TOTAL)
   Normalización de Fechas, Diana Garantizada y Tabla Interactiva
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

// 1. INTERFAZ PREMIUM Y ANIMACIONES
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;
    if (document.getElementById('racha-main-box')) return;

    container.innerHTML = `
        <style>
            @keyframes pulse-cyan-racha {
                0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.6); }
                70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); }
                100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
            }
            @keyframes pulse-green-racha {
                0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
                70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }
            .anim-diana { animation: pulse-cyan-racha 1.5s infinite; }
            .anim-verde { animation: pulse-green-racha 1.5s infinite; }
        </style>

        <div id="racha-main-box" style="background-color: #111827; border-radius: 1rem; padding: 4px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 2px solid #eab308; margin-top: 8px; margin-bottom: 24px;">
            <div style="background: linear-gradient(to right, #b91c1c, #ea580c, #b91c1c); padding: 16px; text-align: center; border-bottom: 1px solid #1f2937;">
                <h3 style="font-weight: 900; color: white; font-size: 18px; text-transform: uppercase; margin: 0; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
                    🎯 ¡JUEGA 1 CARTÓN DIARIO Y GANA HASTA $60 AL DÍA 7! 🎯
                </h3>
            </div>
            
            <div style="padding: 20px; background-color: rgba(0,0,0,0.8);">
                <div style="width: 100%; background-color: #1f2937; border-radius: 9999px; height: 12px; border: 1px solid #374151; margin-bottom: 35px; position: relative;">
                    <div id="streak-bar-7days" style="background: linear-gradient(to right, #ea580c, #eab308, #22c55e); height: 100%; border-radius: 9999px; transition: width 1s ease; width: 0%; box-shadow: 0 0 10px rgba(234,179,8,0.5);"></div>
                </div>
                <div id="streak-days-grid" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 0 4px; margin-top: -20px;"></div>
            </div>
            
            <div style="background-color: #1f2937; padding: 16px; border-top: 1px solid #374151; display: flex; flex-direction: column; align-items: center;">
                <div style="background-color: rgba(0,0,0,0.5); padding: 16px; border-radius: 12px; border: 1px solid #4b5563; width: 100%; max-width: 320px; text-align: center; margin-bottom: 16px;">
                    <p style="font-size: 11px; color: #d1d5db; text-transform: uppercase; font-weight: 900; margin-bottom: 8px; letter-spacing: 0.1em;">
                        CARTONES PARA EL: <span id="master-date-display" style="color: white;">...</span>
                    </p>
                    <div style="display: flex; justify-content: center; align-items: flex-end; gap: 8px;">
                        <span id="today-played-tickets" style="font-size: 48px; font-weight: 900; color: #6b7280; line-height: 1; transition: all 0.3s ease;">0</span>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 12px;">
                    <span style="font-size: 10px; color: #eab308; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; background-color: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px;">ESTADO:</span>
                    <span id="today-level-badge" style="font-size: 10px; background-color: #374151; padding: 4px 8px; border-radius: 4px; color: white; font-weight: 900;">ESPERANDO...</span>
                </div>

                <div id="rules-box" style="width: 100%;"></div>
            </div>
        </div>
    `;
}

// 2. TRADUCTOR UNIVERSAL DE FECHAS (El mata-bugs)
function normalizeDate(str) {
    if (!str) return "00-00-0000";
    return String(str).replace(/\//g, '-').trim().split(' ');
}

function addDaysNatively(dateStr, daysToAdd) {
    let cleanStr = normalizeDate(dateStr);
    if (cleanStr === "00-00-0000") return "00-00-0000";
    let p = cleanStr.split('-');
    let d = new Date(parseInt(p), parseInt(p) - 1, parseInt(p), 12, 0, 0);
    d.setDate(d.getDate() + daysToAdd);
    let dd = String(d.getDate()).padStart(2, '0');
    let mm = String(d.getMonth() + 1).padStart(2, '0');
    let yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function getTimeFromStr(dateStr) {
    let cleanStr = normalizeDate(dateStr);
    if (cleanStr === "00-00-0000") return 0;
    let p = cleanStr.split('-');
    return new Date(parseInt(p), parseInt(p) - 1, parseInt(p), 12, 0, 0).getTime();
}

// 3. INICIO
function initRachaModule() {
    injectRachaUI();
    if (typeof window.switchMode === 'function' && !window.rachaSwitchPatched) {
        const originalSwitchMode = window.switchMode;
        window.switchMode = function(mode) {
            originalSwitchMode(mode);
            const rachaBox = document.getElementById('racha-main-box');
            if (rachaBox) rachaBox.style.display = 'none'; 
        };
        window.rachaSwitchPatched = true;
    }

    firebase.auth().onAuthStateChanged(user => {
        streakState.ticketsBingo = 0;
        streakState.ticketsTorneo = 0;
        if(bingoRef) { bingoRef.off(); bingoRef = null; }
        if(torneoRef) { torneoRef.off(); torneoRef = null; }
        
        const numEl = document.getElementById('today-played-tickets');
        if (numEl) numEl.textContent = '0';

        if (user) initStreakMonitor(user.uid);
    });
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initRachaModule); } 
else { initRachaModule(); }

// 4. MONITOR SÚPER ESTRICTO
function initStreakMonitor(uid) {
    dbRacha.ref('draw_status/date').on('value', snap => {
        const adminDate = snap.val(); 
        if(!adminDate) return;

        currentMasterDate = String(adminDate).trim();
        let cleanMaster = normalizeDate(currentMasterDate);
        
        const dateDisplay = document.getElementById('master-date-display');
        if(dateDisplay) dateDisplay.textContent = currentMasterDate.replace(/-/g, '/');

        if(bingoRef) bingoRef.off();
        if(torneoRef) torneoRef.off();

        // BINGO: Compara usando el Traductor Universal
        bingoRef = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
        bingoRef.on('value', s => {
            let countB = 0;
            if (s.exists()) {
                s.forEach(c => {
                    let val = c.val();
                    let ticketDate = normalizeDate(val.date);
                    if (ticketDate === cleanMaster && val.payment_method !== 'GRATIS') {
                        countB++;
                    }
                });
            }
            streakState.ticketsBingo = countB;
            updateStreakUI(uid);
        });

        // TORNEO
        torneoRef = dbRacha.ref(`bets_torneo_express/${currentMasterDate}/${uid}`);
        torneoRef.on('value', s => {
            streakState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
            updateStreakUI(uid);
        });
    });
}

// 5. LOGICA RACHA
function updateStreakUI(uid) {
    if(!currentMasterDate) return;
    
    const totalJugado = streakState.totalTickets;
    let nivelAlcanzadoHoy = 0;
    if (totalJugado >= 6) nivelAlcanzadoHoy = 3;
    else if (totalJugado >= 3) nivelAlcanzadoHoy = 2;
    else if (totalJugado >= 1) nivelAlcanzadoHoy = 1;

    let diaSalvado = (totalJugado >= 1);
    let ayerDateStr = addDaysNatively(currentMasterDate, -1);

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || {};
        let dias = parseInt(data.dias) || 0;
        let nivel_minimo = parseInt(data.nivel_minimo) || 3;
        let last_active = String(data.last_active || "00-00-0000");
        let fecha_inicio = String(data.fecha_inicio || "00-00-0000");
        
        let isDirty = false;
        let updates = {};

        // Limpieza de bugs viejos
        let isCorrupt = false;
        if (dias < 0 || dias > 7) isCorrupt = true;
        if (fecha_inicio.includes("NaN") || last_active.includes("NaN")) isCorrupt = true;
        if (fecha_inicio.includes("undefined") || last_active.includes("undefined")) isCorrupt = true;
        if (dias > 0 && fecha_inicio === "00-00-0000") isCorrupt = true;

        if (isCorrupt) {
            dias = 0; nivel_minimo = 3; last_active = "00-00-0000"; fecha_inicio = "00-00-0000";
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = "00-00-0000"; updates.fecha_inicio = "00-00-0000";
            isDirty = true;
        }

        if (dias > 0 && dias < 7 && last_active !== currentMasterDate && last_active !== ayerDateStr) {
            dias = 0; nivel_minimo = 3; last_active = "00-00-0000"; fecha_inicio = "00-00-0000";
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = "00-00-0000"; updates.fecha_inicio = "00-00-0000";
            isDirty = true;
        }

        let visualDay = dias;

        if (diaSalvado && dias < 7) {
            if (last_active !== currentMasterDate) {
                if (dias === 0) {
                    fecha_inicio = normalizeDate(currentMasterDate); 
                    updates.fecha_inicio = fecha_inicio;
                }
                visualDay = dias + 1;
                let minLvl = dias === 0 ? nivelAlcanzadoHoy : Math.min(nivel_minimo, nivelAlcanzadoHoy);
                updates.dias = visualDay; updates.nivel_minimo = minLvl; updates.last_active = currentMasterDate;
                isDirty = true;
                dias = visualDay; nivel_minimo = minLvl; last_active = currentMasterDate;
            } else {
                visualDay = dias;
                let minLvl = dias === 1 ? nivelAlcanzadoHoy : Math.min(nivel_minimo, nivelAlcanzadoHoy);
                if(nivel_minimo !== minLvl) {
                    updates.nivel_minimo = minLvl;
                    isDirty = true;
                    nivel_minimo = minLvl;
                }
            }
        } else if (dias === 7) {
            visualDay = 7;
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }
        
        renderVisuals(dias, last_active, fecha_inicio, diaSalvado, visualDay, nivelAlcanzadoHoy, nivel_minimo);
    });
}

// 6. RENDERIZADO VISUAL EXTREMO
function renderVisuals(dias, last_active, fecha_inicio, diaSalvado, visualDay, nivelAlcanzadoHoy, nivel_minimo) {
    const totalJugado = streakState.totalTickets;
    let cleanMasterDate = normalizeDate(currentMasterDate);
    
    // A. Número Gigante Animado
    const numEl = document.getElementById('today-played-tickets');
    if(numEl) {
        numEl.textContent = totalJugado;
        if (diaSalvado) {
            numEl.style.color = "#4ade80"; 
            numEl.style.textShadow = "0 0 15px rgba(34,197,94,0.9)";
        } else {
            numEl.style.color = "#22d3ee"; 
            numEl.style.textShadow = "0 0 20px rgba(34,211,238,1)";
        }
    }

    const badgeEl = document.getElementById('today-level-badge');
    const rulesBox = document.getElementById('rules-box');

    if (!badgeEl || !rulesBox) return;

    if (visualDay === 7 && last_active === currentMasterDate) {
        let premioGanado = "$10";
        if (nivel_minimo === 2) premioGanado = "$30";
        if (nivel_minimo === 3) premioGanado = "$60";

        badgeEl.innerHTML = "<span style='color: #4ade80;'>🎉 ¡RETO COMPLETADO! 🎉</span>";
        rulesBox.innerHTML = `
            <div style="background-color: #111827; border: 1px solid #374151; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 16px;">
                <span style="font-size: 36px;">🎁</span>
                <p style="color: #4ade80; font-weight: 900; text-align: center; font-size: 13px; line-height: 1.2;">¡HAS GANADO ${premioGanado} GRATIS!</p>
                <p style="color: #d1d5db; text-align: center; line-height: 1.4; font-size: 10px;">Espera la entrega de tu premio por parte de la administración. Una vez lo recibas, tu racha se reiniciará a 0 para volver a jugar.</p>
            </div>
        `;
    } else {
        if (diaSalvado) badgeEl.innerHTML = "<span style='color: #4ade80;'>✅ DÍA ASEGURADO</span>";
        else if (dias === 0) badgeEl.innerHTML = "<span style='color: #f87171;'>❌ SIN RACHA</span>";
        else badgeEl.innerHTML = "<span style='color: #22d3ee;'>🎯 JUEGA PARA ASEGURAR</span>";
        
        // LA NUEVA TABLA DE PREMIOS DINÁMICA
        let activeLvl = diaSalvado ? nivelAlcanzadoHoy : 0;
        
        // Estilos para iluminar la meta alcanzada
        let styleLvl1 = (activeLvl === 1) ? 'background: rgba(34,197,94,0.15); border: 1px solid #4ade80; transform: scale(1.02); box-shadow: 0 0 10px rgba(34,197,94,0.3);' : 'opacity: 0.6;';
        let styleLvl2 = (activeLvl === 2) ? 'background: rgba(34,197,94,0.15); border: 1px solid #4ade80; transform: scale(1.02); box-shadow: 0 0 10px rgba(34,197,94,0.3);' : 'opacity: 0.6;';
        let styleLvl3 = (activeLvl === 3) ? 'background: rgba(34,197,94,0.15); border: 1px solid #4ade80; transform: scale(1.02); box-shadow: 0 0 10px rgba(34,197,94,0.3);' : 'opacity: 0.6;';
        
        // Si no ha jugado nada (0), todo en opacidad normal para invitarlo a jugar
        if(activeLvl === 0) { styleLvl1 = styleLvl2 = styleLvl3 = 'opacity: 0.9;'; }

        let mensajeParticipacion = "";
        if (diaSalvado) {
            mensajeParticipacion = `<div style="margin-top: 12px; padding: 8px; background-color: rgba(34,197,94,0.1); border: 1px dashed #4ade80; border-radius: 6px; text-align: center;">
                <p style="color: #4ade80; margin: 0; font-size: 9px; font-weight: bold; line-height: 1.3;">✨ CON TU JUGADA DE HOY ESTÁS PARTICIPANDO POR EL PREMIO MARCADO EN VERDE ✨</p>
            </div>`;
        }

        rulesBox.innerHTML = `
            <div style="width: 100%; background-color: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">
                <p style="color: #facc15; font-weight: 900; margin-bottom: 12px; text-align: center;">🏆 TABLA DE PREMIOS (AL DÍA 7) 🏆</p>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 6px; margin-bottom: 6px; transition: all 0.3s; ${styleLvl1}">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 16px; margin-top: 2px;">🥉</span> 
                        <div style="display: flex; flex-direction: column;">
                            <p style="color: white; margin:0; font-weight: 600;">1 A 2 CARTONES</p>
                            <span style="font-size: 8px; color: #9ca3af; text-transform: none; margin-top: 2px;">Juega y completa tu racha diaria de 1 a 2 cartones y al 7mo día te llevas $10.</span>
                        </div>
                    </div>
                    <b style="color: #4ade80; white-space: nowrap; margin-left: 8px;">$10 GRATIS</b>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 6px; margin-bottom: 6px; transition: all 0.3s; ${styleLvl2}">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 16px; margin-top: 2px;">🥈</span> 
                        <div style="display: flex; flex-direction: column;">
                            <p style="color: white; margin:0; font-weight: 600;">3 A 5 CARTONES</p>
                            <span style="font-size: 8px; color: #9ca3af; text-transform: none; margin-top: 2px;">Juega y completa tu racha diaria de 3 a 5 cartones y al 7mo día te llevas $30.</span>
                        </div>
                    </div>
                    <b style="color: #4ade80; white-space: nowrap; margin-left: 8px;">$30 GRATIS</b>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 6px; transition: all 0.3s; ${styleLvl3}">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 16px; margin-top: 2px;">🥇</span> 
                        <div style="display: flex; flex-direction: column;">
                            <p style="color: white; margin:0; font-weight: 600;">6 O MÁS</p>
                            <span style="font-size: 8px; color: #9ca3af; text-transform: none; margin-top: 2px;">Juega y completa tu racha diaria de 6 o más cartones y al 7mo día te llevas $60.</span>
                        </div>
                    </div>
                    <b style="color: #4ade80; white-space: nowrap; margin-left: 8px;">$60 GRATIS</b>
                </div>

                ${mensajeParticipacion}
            </div>
        `;
    }

    // C. Dibujar la cuadrícula (Candados Garantizados)
    const grid = document.getElementById('streak-days-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    let baseDateForGrid = (dias === 0 || fecha_inicio === "00-00-0000") ? currentMasterDate : fecha_inicio;
    let timeCurrentMaster = getTimeFromStr(cleanMasterDate);

    for(let i=0; i<7; i++) {
        let slotDateStr = addDaysNatively(baseDateForGrid, i); 
        let shortDate = slotDateStr.substring(0, 5).replace('-', '/'); 
        
        let cleanSlot = normalizeDate(slotDateStr);
        let timeSlot = getTimeFromStr(cleanSlot);
        let isTargetDay = (cleanSlot === cleanMasterDate);

        let icon = '🔒'; 
        let customStyle = 'background-color: #1f2937; border: 2px solid #374151; color: #9ca3af;'; 
        let animClass = '';

        if (dias > 0 && timeSlot < timeCurrentMaster && !isTargetDay) {
            // DÍAS PASADOS COMPLETADOS
            icon = '✅'; 
            customStyle = 'background-color: #22c55e; border: 2px solid #4ade80; color: white; box-shadow: 0 0 10px rgba(34,197,94,0.8);';
        } else if (isTargetDay) {
            // DÍA OBJETIVO - DIANA O CHECK (NUNCA CANDADO)
            if (diaSalvado) {
                icon = '✅'; 
                customStyle = 'background-color: #22c55e; border: 2px solid #bbf7d0; color: white; transform: scale(1.2);';
                animClass = 'anim-verde';
            } else {
                icon = '🎯'; 
                customStyle = 'background-color: rgba(34, 211, 238, 0.1); border: 2px solid #22d3ee; color: #22d3ee; transform: scale(1.25);';
                animClass = 'anim-diana';
            }
        } else if (i === 6) { 
            // EL REGALO FINAL (Solo Icono)
            icon = '🎁'; 
            customStyle = 'background-color: #1f2937; border: 2px solid #374151; color: white; font-size: 18px;'; 
        }

        grid.innerHTML += `
            <div style="display: flex; flex-direction: column; align-items: center; margin-top: 12px;">
                <div class="${animClass}" style="width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: all 0.5s ease; z-index: 10; ${customStyle}">
                    ${icon}
                </div>
                <span style="font-size: 11px; margin-top: 8px; color: white; font-weight: bold; text-align: center; text-shadow: 1px 1px 2px black;">${dias === 0 ? '--/--' : shortDate}</span>
            </div>`;
    }

    // E. Barra de progreso
    let barFillPercentage = (visualDay / 7) * 100;
    const bar = document.getElementById('streak-bar-7days');
    if(bar) bar.style.width = barFillPercentage + '%';
}
