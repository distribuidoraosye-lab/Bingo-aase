/* ============================================================
   BINGO TEXIER - MÓDULO BONO BIENVENIDA (RULETA EMOCIONAL V6) + DATOS VIP
   - Limpieza de Caché al cerrar sesión (Evita cruces)
   - Filtro Infalible por Fecha de Creación (CreationTime)
   - Módulo VIP inyectado pasivamente (Lee Racha Data)
   ============================================================ */

const dbBono = firebase.database();

let bonoState = {
    ticketsBingo: 0,
    ticketsTorneo: 0,
    get totalTickets() { return this.ticketsBingo + this.ticketsTorneo; }
};

let currentBonoDate = null;
let syncTimerBono = null; 
let bonoUserUid = null;
let currentBonoPhone = "";

// -------------------------------------------------------------
// SECCIÓN 1: BONO DE BIENVENIDA (LÓGICA DE FECHAS REESCRITA DE CERO)
// -------------------------------------------------------------

function normalizeDateBono(str) {
    if (!str) return "00-00-0000";
    let clean = String(str).replace(/\//g, '-').trim();
    let p = clean.split('-');
    if (p.length === 3) {
        // Asegura que siempre devuelva el formato estricto DD-MM-YYYY
        return `${p.padStart(2, '0')}-${p.padStart(2, '0')}-${p}`;
    }
    return clean;
}

function addDaysSafeBono(dateStr, daysToAdd) {
    let cleanStr = normalizeDateBono(dateStr);
    if (cleanStr === "00-00-0000") return "00-00-0000";
    
    let p = cleanStr.split('-');
    let d = parseInt(p, 10); 
    let m = parseInt(p, 10) - 1; // Javascript los meses van de 0 a 11
    let y = parseInt(p, 10);
    
    // Se pone a mediodía para que los cambios de hora (Daylight Saving) no resten un día
    let dateObj = new Date(y, m, d, 12, 0, 0); 
    dateObj.setDate(dateObj.getDate() + daysToAdd);
    
    let dd = String(dateObj.getDate()).padStart(2, '0');
    let mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    let yyyy = dateObj.getFullYear();
    
    return `${dd}-${mm}-${yyyy}`;
}

// 2. INTERFAZ: RULETA Y BÓVEDA REDISEÑADA
function injectBonoUI() {
    const container = document.getElementById('welcome-bonus-module-container');
    if (!container) return;

    if (!document.getElementById('boveda-bienvenida-box')) {
        const css = `
            @keyframes parpadeo-luces { 0%, 100% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; } 50% { border-color: #ef4444; box-shadow: 0 0 40px #ef4444; } }
            @keyframes confetti-fall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
            .luces-casino { animation: parpadeo-luces 0.5s infinite; }
            .slice-bienvenida { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 60px; height: 50%; margin-left: -30px; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; font-weight: 900; font-size: 16px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }
            .confetti { position: fixed; width: 10px; height: 10px; background-color: #facc15; z-index: 9999999; animation: confetti-fall 3s linear infinite; }
        `;
        document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

        container.innerHTML = `
            <div id="modal-ruleta-bienvenida" class="hidden fixed inset-0 flex items-center justify-center" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
                <div class="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl w-11/12 max-w-sm relative text-center border-4 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.6)] overflow-hidden" style="z-index: 9999999 !important;">
                    <h3 class="relative z-10 text-2xl font-black text-yellow-400 mb-1 animate-pulse">¡REGALO DE BIENVENIDA!</h3>
                    <p class="relative z-10 text-xs text-gray-300 mb-6 font-bold uppercase tracking-widest">Gira y descubre tu bono por ser nuevo</p>
                    
                    <div class="relative z-10 mx-auto w-72 h-72 mb-6">
                        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-white text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"><i class="fas fa-caret-down"></i></div>
                        
                        <div id="rueda-bienvenida" class="w-full h-full rounded-full border-8 border-gray-800 luces-casino overflow-hidden relative" style="background: conic-gradient(#eab308 0 45deg, #10b981 45deg 90deg, #ef4444 90deg 135deg, #3b82f6 135deg 180deg, #eab308 180deg 225deg, #10b981 225deg 270deg, #ef4444 270deg 315deg, #8b5cf6 315deg 360deg);">
                            <div class="slice-bienvenida" style="transform: rotate(22.5deg);">$5</div>
                            <div class="slice-bienvenida" style="transform: rotate(67.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(112.5deg);">$20</div>
                            <div class="slice-bienvenida" style="transform: rotate(157.5deg);">$50</div>
                            <div class="slice-bienvenida" style="transform: rotate(202.5deg);">$5</div>
                            <div class="slice-bienvenida" style="transform: rotate(247.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(292.5deg);">$20</div>
                            <div class="slice-bienvenida" style="transform: rotate(337.5deg);">$100</div>
                            
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-16 h-16 bg-black rounded-full border-4 border-yellow-400 z-10 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]"><i class="fas fa-gift text-yellow-400 text-2xl animate-pulse"></i></div>
                            </div>
                        </div>
                    </div>

                    <button id="btn-girar-bienvenida" onclick="iniciarGiroBienvenida()" class="relative z-10 w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.8)] transition uppercase text-xl mb-2 transform active:scale-95">
                        ¡GIRAR RULETA!
                    </button>
                </div>
            </div>

            <div id="modal-premio-bienvenida" class="hidden fixed inset-0 flex items-center justify-center" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
                <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-[0_0_50px_rgba(255,255,255,0.2)]" style="z-index: 9999999 !important;">
                    <div class="text-6xl mb-2">&#x1F389;</div>
                    <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none mb-2">¡Bono Desbloqueado!</h2>
                    <p class="text-sm font-bold text-gray-500 mb-4">Te acabas de ganar este bono exclusivo por ser un usuario nuevo.</p>
                    
                    <div class="bg-green-100 border-2 border-green-500 rounded-xl p-4 mb-4 shadow-inner">
                        <span class="text-5xl font-black text-green-600 drop-shadow-sm" id="texto-monto-ganado">$5.00</span>
                    </div>

                    <div class="text-left bg-gray-100 border border-gray-300 rounded-lg p-3 mb-5">
                        <p class="text-xs font-black text-gray-700 uppercase mb-2 border-b border-gray-300 pb-1"><i class="fas fa-list-ol mr-1 text-blue-500"></i> Pasos para cobrarlo:</p>
                        <ul class="text-xs text-gray-600 font-bold space-y-2">
                            <li><span class="text-red-500 mr-1">1.</span>Tu número <b><span id="display-phone-reglas" class="text-gray-900 text-[14px]"></span></b> debe estar unido a nuestro CANAL de WhatsApp.</li>
                            <li><span class="text-red-500 mr-1">2.</span>Debes activar tu cuenta jugando 1 cartón diario durante 3 días seguidos.</li>
                        </ul>
                    </div>
                    
                    <button id="btn-aceptar-reto" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase text-lg">
                        ACEPTAR RETO
                    </button>
                </div>
            </div>

            <div id="boveda-bienvenida-box" style="display: none; background: linear-gradient(135deg, #1e3a8a, #172554); border: 2px solid #3b82f6; border-radius: 0.8rem; padding: 16px; margin-bottom: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); text-align: center;">
                <h3 style="color: #4ade80; font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">¡GANASTE <span id="boveda-bienvenida-monto">$5.00</span>!</h3>
                
                <p style="font-size: 11px; color: #d1d5db; margin: 8px 0; font-weight: bold; line-height: 1.3;">
                    Juega 3 días para cobrar tu bono de bienvenida.<br>
                    <span style="color: #facc15; font-size: 12px; display: block; margin-top: 4px; padding: 4px; background: rgba(0,0,0,0.3); border-radius: 4px;">&#x1F3AF; ¡También sumas para tu Racha, PREMIO DOBLE!</span>
                </p>
                
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.2);">
                    <p id="boveda-bienvenida-status" style="font-size: 13px; color: white; font-weight: bold; margin: 0;">Progreso: <span id="boveda-bienvenida-dias" style="color: #4ade80; font-size: 16px; font-weight: 900;">0</span> de 3 días</p>
                </div>
                
                <button id="btn-cobrar-bienvenida" style="display: none; width: 100%; margin-top: 12px; background: #fbbf24; color: #78350f; font-weight: 900; border: none; padding: 12px; border-radius: 8px; font-size: 14px; text-transform: uppercase; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.1s;">
                    <i class="fab fa-whatsapp text-lg mr-1"></i> Reclamar Pago
                </button>
            </div>
        `;

        document.getElementById('btn-aceptar-reto').addEventListener('click', function() {
            if(bonoUserUid) {
                dbBono.ref(`users/${bonoUserUid}/bono_bienvenida`).set({
                    status: 'active',
                    prize: window.premioBienvenidaMonto || 5,
                    dias: 0,
                    last_active: "00-00-0000",
                    fecha_inicio: currentBonoDate
                });
            }
            document.getElementById('modal-premio-bienvenida').style.display = 'none';
            document.querySelectorAll('.confetti').forEach(e => e.remove());
            location.reload();
        });

        document.getElementById('btn-cobrar-bienvenida').addEventListener('click', function() {
            let msg = `Hola Administrador. Soy un Usuario Nuevo y acabo de completar mi reto de 3 días para el Bono Doble. Mi número de registro es ${currentBonoPhone} y ya estoy unido al Canal. Solicito la revisión para cobrar mi Bono.`;
            window.open(`https://wa.me/584221773102?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }
}

// 3. LÓGICA DE GIRO
window.iniciarGiroBienvenida = function() {
    const btn = document.getElementById('btn-girar-bienvenida');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> GIRANDO...';
    btn.classList.add('opacity-50', 'cursor-not-allowed');

    const rueda = document.getElementById('rueda-bienvenida');
    rueda.classList.remove('luces-casino'); 
    rueda.style.transition = 'transform 6.5s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    let premioValor = 5;
    let anguloPremio = 360 - 22.5; 
    
    window.premioBienvenidaMonto = premioValor;

    const rotacionTotal = (8 * 360) + anguloPremio;
    rueda.style.transform = `rotate(${rotacionTotal}deg)`;

    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}

    setTimeout(() => {
        lanzarConfeti();
        setTimeout(() => {
            document.getElementById('modal-ruleta-bienvenida').style.display = 'none';
            document.getElementById('texto-monto-ganado').textContent = `$${premioValor}.00`;
            document.getElementById('display-phone-reglas').textContent = currentBonoPhone;
            document.getElementById('modal-premio-bienvenida').style.display = 'flex';
        }, 1500); 
    }, 6500); 
}

function lanzarConfeti() {
    const colors = ['#ef4444', '#3b82f6', '#facc15', '#10b981', '#a855f7'];
    for(let i=0; i<50; i++) {
        let conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
        conf.style.animationDelay = (Math.random() * 1) + 's';
        document.body.appendChild(conf);
    }
}

// 4. INICIALIZACIÓN CON LIMPIEZA DE CACHÉ
function initBonoModule() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            bonoUserUid = user.uid;
            injectBonoUI();

            dbBono.ref(`users/${bonoUserUid}/phone`).once('value').then(snap => {
                currentBonoPhone = snap.val() || "Tu número";
            });
            
            dbBono.ref('draw_status/date').on('value', snap => {
                currentBonoDate = normalizeDateBono(snap.val());
                if(currentBonoDate !== "00-00-0000") {
                    procesarFiltroYLogica(user);
                    
                    // Inicializar el Módulo VIP si existe la fecha
                    initVipModule(user.uid, currentBonoDate);
                }
            });
        } else {
            bonoUserUid = null;
            currentBonoPhone = "";
            bonoState.ticketsBingo = 0;
            bonoState.ticketsTorneo = 0;
            if (syncTimerBono) clearTimeout(syncTimerBono);
            
            const boveda = document.getElementById('boveda-bienvenida-box');
            if (boveda) boveda.style.display = 'none';
            
            const vipBtn = document.getElementById('vip-fixed-module');
            if (vipBtn) vipBtn.remove();
        }
    });
}

async function procesarFiltroYLogica(userObj) {
    const uid = userObj.uid;
    const snapBono = await dbBono.ref(`users/${uid}/bono_bienvenida`).once('value');
    
    if (snapBono.exists() && snapBono.val().status === 'old_user') return;
    if (snapBono.exists() && snapBono.val().status === 'claimed') {
        const box = document.getElementById('boveda-bienvenida-box');
        if(box) box.style.display = 'none';
        return;
    }

    if (!snapBono.exists()) {
        const creationTime = new Date(userObj.metadata.creationTime).getTime();
        const now = Date.now();
        const horasDeCreado = (now - creationTime) / (1000 * 60 * 60);

        if (horasDeCreado > 48) {
            await dbBono.ref(`users/${uid}/bono_bienvenida`).set({ status: 'old_user' });
            return;
        } else {
            document.getElementById('modal-ruleta-bienvenida').style.display = 'flex';
            return;
        }
    }

    monitorBonoData(uid, snapBono.val());
}

function monitorBonoData(uid, dataBono) {
    dbBono.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let count = 0;
        s.forEach(c => {
            let b = c.val();
            if (normalizeDateBono(b.date) === currentBonoDate && b.payment_method !== 'GRATIS') count++;
        });
        bonoState.ticketsBingo = count;
        clearTimeout(syncTimerBono);
        syncTimerBono = setTimeout(() => { calcularDiasBono(uid, dataBono); }, 800);
        
        if (vipData.uid === uid) renderVipButton();
    });

    dbBono.ref(`bets_torneo_express/${currentBonoDate}/${uid}`).on('value', s => {
        bonoState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
        clearTimeout(syncTimerBono);
        syncTimerBono = setTimeout(() => { calcularDiasBono(uid, dataBono); }, 800);
        
        if (vipData.uid === uid) renderVipButton();
    });
}

function calcularDiasBono(uid, data) {
    let dias = data.dias || 0;
    let last_active = data.last_active || "00-00-0000";
    let ayer = addDaysSafeBono(currentBonoDate, -1);
    let jugoHoy = (bonoState.totalTickets >= 1);
    let updates = {};

    if (data.status === 'active') {
        if (jugoHoy) {
            if (last_active === ayer) {
                dias++;
                last_active = currentBonoDate;
                updates = { dias: dias, last_active: last_active };
                if (dias >= 3) {
                    updates.status = 'completed';
                    data.status = 'completed';
                }
            } else if (last_active !== currentBonoDate) {
                dias = 1;
                last_active = currentBonoDate;
                updates = { dias: dias, last_active: last_active };
            }
        } else {
            if (dias > 0 && last_active !== ayer && last_active !== currentBonoDate) {
                dias = 0;
                updates = { dias: 0 };
            }
        }

        if (Object.keys(updates).length > 0) {
            dbBono.ref(`users/${uid}/bono_bienvenida`).update(updates);
        }
    }

    renderBovedaBienvenida(data.prize || 5, dias, data.status);
}

function renderBovedaBienvenida(prize, dias, status) {
    const box = document.getElementById('boveda-bienvenida-box');
    const mDisplay = document.getElementById('boveda-bienvenida-monto');
    const sText = document.getElementById('boveda-bienvenida-status');
    const dProgreso = document.getElementById('boveda-bienvenida-dias');
    const btnReclamar = document.getElementById('btn-cobrar-bienvenida');

    box.style.display = 'block';
    mDisplay.textContent = `$${prize}.00`;
    
    if (status === 'completed') {
        box.style.border = "2px solid #4ade80"; 
        sText.innerHTML = "&#x2705; ¡RETO COMPLETADO! Reclama tu premio ahora.";
        sText.style.color = "#4ade80";
        btnReclamar.style.display = 'block';
        btnReclamar.classList.add('animate-pulse');
    } else {
        dProgreso.textContent = Math.min(dias, 3);
        btnReclamar.style.display = 'none';
    }
}

// -------------------------------------------------------------
// SECCIÓN 2: DATOS VIP (INYECCIÓN PASIVA)
// -------------------------------------------------------------

let vipData = {
    uid: null,
    masterDate: null,
    ayerDate: null,
    mananaDate: null,
    rachaLastActive: "00-00-0000",
    modalOpen: false,
    currentTab: 'hoy'
};

const VIP_LOTTERIES = [
    { id: 'lotto_activo', name: 'Lotto Activo', img: 'https://i.imgur.com/1N4iJDd.jpeg' },
    { id: 'la_granjita', name: 'La Granjita', img: 'https://i.imgur.com/5OGJW5l.jpeg' },
    { id: 'selva_plus', name: 'Selva Plus', img: 'https://i.imgur.com/w9gBlAn.jpeg' }
];

const VIP_ANIMAL_MAP = {
    '0': { n: "Delfín", i: "\u{1F42C}" }, '00': { n: "Ballena", i: "\u{1F433}" }, '1': { n: "Carnero", i: "\u{1F40F}" },
    '2': { n: "Toro", i: "\u{1F402}" }, '3': { n: "Ciempiés", i: "\u{1F41B}" }, '4': { n: "Alacrán", i: "\u{1F982}" },
    '5': { n: "León", i: "\u{1F981}" }, '6': { n: "Rana", i: "\u{1F438}" }, '7': { n: "Perico", i: "\u{1F99C}" },
    '8': { n: "Ratón", i: "\u{1F401}" }, '9': { n: "Águila", i: "\u{1F985}" }, '10': { n: "Tigre", i: "\u{1F405}" },
    '11': { n: "Gato", i: "\u{1F408}" }, '12': { n: "Caballo", i: "\u{1F40E}" }, '13': { n: "Mono", i: "\u{1F412}" },
    '14': { n: "Paloma", i: "\u{1F54A}" }, '15': { n: "Zorro", i: "\u{1F98A}" }, '16': { n: "Oso", i: "\u{1F43B}" },
    '17': { n: "Pavo", i: "\u{1F983}" }, '18': { n: "Burro", i: "\u{1F434}" }, '19': { n: "Chivo", i: "\u{1F410}" },
    '20': { n: "Cochino", i: "\u{1F416}" }, '21': { n: "Gallo", i: "\u{1F413}" }, '22': { n: "Camello", i: "\u{1F42A}" },
    '23': { n: "Cebra", i: "\u{1F993}" }, '24': { n: "Iguana", i: "\u{1F98E}" }, '25': { n: "Gallina", i: "\u{1F414}" },
    '26': { n: "Vaca", i: "\u{1F404}" }, '27': { n: "Perro", i: "\u{1F415}" }, '28': { n: "Zamuro", i: "\u{1F985}" },
    '29': { n: "Elefante", i: "\u{1F418}" }, '30': { n: "Caimán", i: "\u{1F40A}" }, '31': { n: "Lapa", i: "\u{1F9AB}" },
    '32': { n: "Ardilla", i: "\u{1F43F}" }, '33': { n: "Pescado", i: "\u{1F41F}" }, '34': { n: "Venado", i: "\u{1F98C}" },
    '35': { n: "Jirafa", i: "\u{1F992}" }, '36': { n: "Culebra", i: "\u{1F40D}" }
};

function initVipModule(uid, masterDate) {
    vipData.uid = uid;
    // masterDate ya viene limpio como DD-MM-YYYY desde la función reescrita
    vipData.masterDate = masterDate;
    vipData.ayerDate = addDaysSafeBono(masterDate, -1);
    vipData.mananaDate = addDaysSafeBono(masterDate, 1);

    dbBono.ref(`users/${uid}/racha_data/last_active`).on('value', snap => {
        let raw = snap.val() || "00-00-0000";
        vipData.rachaLastActive = raw.replace("_ADMIN", "");
        renderVipButton();
        if(vipData.modalOpen) renderVipContent(vipData.currentTab);
    });

    injectVipModuleUI();
}

function injectVipModuleUI() {
    if (document.getElementById('vip-fixed-module')) return;
    
    const loggedInArea = document.getElementById('logged-in-area');
    const userDashboard = document.getElementById('user-dashboard');
    
    if (!loggedInArea || !userDashboard) return;

    const btnContainer = document.createElement('div');
    btnContainer.id = 'vip-fixed-module';
    btnContainer.className = 'mb-4 w-full';
    btnContainer.innerHTML = `<div id="vip-btn-wrapper"></div>`;
    
    loggedInArea.insertBefore(btnContainer, userDashboard);

    const modalHtml = `
        <div id="modal-vip-datos" class="hidden fixed inset-0 flex items-center justify-center" style="display: none; background: rgba(0,0,0,0.9); z-index: 999999 !important;">
            <div class="bg-gray-50 rounded-2xl w-11/12 max-w-md relative flex flex-col max-h-[85vh] shadow-2xl border-t-4 border-yellow-400">
                
                <div class="bg-slate-900 p-4 rounded-t-xl flex justify-between items-center shadow-md relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 text-yellow-500/20 text-6xl"><i class="fas fa-star"></i></div>
                    <div class="relative z-10">
                        <h3 class="font-black text-white text-lg tracking-wider flex items-center"><i class="fas fa-gem text-yellow-400 mr-2"></i> FIJOS VIP</h3>
                        <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Datos exclusivos del sistema</p>
                    </div>
                    <button onclick="closeVipModal()" class="text-gray-400 hover:text-white relative z-10 w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full"><i class="fas fa-times"></i></button>
                </div>

                <div class="flex bg-slate-800 p-1 shadow-inner">
                    <button id="vip-tab-hoy" onclick="switchVipTab('hoy')" class="flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all text-white bg-slate-600 shadow border border-slate-500">
                        HOY <span id="vip-lbl-hoy" class="text-[9px] font-normal block text-gray-300">--/--</span>
                    </button>
                    <button id="vip-tab-manana" onclick="switchVipTab('manana')" class="flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all text-gray-400 hover:text-gray-200 border border-transparent">
                        MAÑANA <span id="vip-lbl-manana" class="text-[9px] font-normal block text-gray-500">--/--</span>
                    </button>
                </div>

                <div id="vip-modal-body" class="p-4 overflow-y-auto custom-scrollbar bg-gray-50 flex-1">
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function checkVipPermissions() {
    let jugoAyer = (vipData.rachaLastActive === vipData.ayerDate);
    let jugoHoyPorRacha = (vipData.rachaLastActive === vipData.masterDate);
    let jugoHoyEnVivo = (bonoState.totalTickets > 0);

    let jugoHoy = jugoHoyPorRacha || jugoHoyEnVivo;

    return {
        canSeeHoy: jugoAyer || jugoHoy,
        canSeeManana: jugoHoy,
        nivel: jugoHoy ? 2 : (jugoAyer ? 1 : 0)
    };
}

function renderVipButton() {
    const wrapper = document.getElementById('vip-btn-wrapper');
    if (!wrapper) return;

    const perms = checkVipPermissions();
    let btnHtml = "";
    
    let logosHtml = `<div class="flex -space-x-2 mt-1 justify-center">`;
    VIP_LOTTERIES.forEach(lotto => {
        logosHtml += `<img src="${lotto.img}" class="w-6 h-6 rounded-full border border-gray-400 shadow-sm opacity-90">`;
    });
    logosHtml += `</div>`;

    if (perms.nivel === 0) {
        btnHtml = `
            <div onclick="openVipModal()" class="w-full bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-3 shadow-md border border-gray-600 flex items-center cursor-pointer transition transform hover:scale-[1.02]">
                <div class="bg-gray-900 rounded-full w-10 h-10 flex items-center justify-center text-yellow-500 shadow-inner shrink-0 relative">
                    <i class="fas fa-lock text-lg"></i>
                    <div class="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full animate-ping"></div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-tight">Juega Bingo o Torneo hoy y</p>
                    <h4 class="text-sm font-black text-white uppercase tracking-tight">Desbloquea Fijos de Mañana <span class="bg-white text-gray-900 px-1 rounded text-[10px]">GRATIS</span></h4>
                </div>
                <div class="shrink-0 ml-2">
                    ${logosHtml}
                </div>
            </div>
        `;
    } else {
        let logosDesbloqueados = logosHtml.replace(/border-gray-400/g, 'border-yellow-300').replace(/opacity-90/g, '');
        btnHtml = `
            <div onclick="openVipModal()" class="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl p-3 shadow-[0_5px_15px_rgba(249,115,22,0.4)] border-b-4 border-red-700 flex items-center cursor-pointer transition transform hover:scale-[1.02] relative overflow-hidden">
                <div class="absolute top-0 right-0 opacity-20"><i class="fas fa-star text-6xl transform translate-x-2 -translate-y-2"></i></div>
                <div class="bg-white rounded-full w-10 h-10 flex items-center justify-center text-orange-500 shadow-lg shrink-0 z-10">
                    <i class="fas fa-unlock-alt text-xl"></i>
                </div>
                <div class="ml-3 flex-1 z-10">
                    <h4 class="text-sm font-black text-white uppercase tracking-tight" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">⭐ VER DATOS FIJOS VIP</h4>
                    <p class="text-[10px] font-bold text-yellow-100 uppercase tracking-widest leading-tight drop-shadow-md">Tus datos están listos</p>
                </div>
                <div class="shrink-0 ml-2 z-10 bg-black/20 p-1 rounded-lg">
                    ${logosDesbloqueados}
                </div>
            </div>
        `;
    }

    wrapper.innerHTML = btnHtml;
}

window.openVipModal = function() {
    if (!vipData.masterDate) return;
    document.getElementById('vip-lbl-hoy').textContent = vipData.masterDate.substring(0,5);
    document.getElementById('vip-lbl-manana').textContent = vipData.mananaDate.substring(0,5);
    
    vipData.modalOpen = true;
    document.getElementById('modal-vip-datos').style.display = 'flex';
    
    const perms = checkVipPermissions();
    if (perms.canSeeManana) switchVipTab('manana');
    else switchVipTab('hoy');
}

window.closeVipModal = function() {
    vipData.modalOpen = false;
    document.getElementById('modal-vip-datos').style.display = 'none';
}

window.switchVipTab = function(tab) {
    vipData.currentTab = tab;
    
    const btnHoy = document.getElementById('vip-tab-hoy');
    const btnManana = document.getElementById('vip-tab-manana');
    
    if (tab === 'hoy') {
        btnHoy.className = "flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all text-white bg-slate-600 shadow border border-slate-500";
        btnManana.className = "flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all text-gray-400 hover:text-gray-200 border border-transparent";
    } else {
        btnManana.className = "flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all text-white bg-slate-600 shadow border border-slate-500";
        btnHoy.className = "flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all text-gray-400 hover:text-gray-200 border border-transparent";
    }

    renderVipContent(tab);
}

function renderVipContent(tab) {
    const body = document.getElementById('vip-modal-body');
    const perms = checkVipPermissions();
    
    let hasAccess = false;
    let fbDate = null;
    let humanDate = null;

    if (tab === 'hoy') {
        hasAccess = perms.canSeeHoy;
        fbDate = vipData.masterDate;
        humanDate = "HOY " + vipData.masterDate.substring(0,5);
    } else {
        hasAccess = perms.canSeeManana;
        fbDate = vipData.mananaDate;
        humanDate = "MAÑANA " + vipData.mananaDate.substring(0,5);
    }

    if (!hasAccess) {
        body.innerHTML = `
            <div class="flex flex-col items-center justify-center h-48 text-center p-4">
                <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-3xl mb-4 shadow-inner">
                    <i class="fas fa-lock"></i>
                </div>
                <h4 class="font-black text-gray-700 text-lg uppercase leading-tight mb-2">Dato Bloqueado</h4>
                <p class="text-xs text-gray-500 font-bold mb-4">Debes jugar un cartón de Bingo o Torneo <b class="text-red-500">HOY</b> para ver los datos fijos de ${tab === 'hoy' ? 'esta fecha' : 'mañana'}.</p>
                <button onclick="closeVipModal()" class="bg-gray-800 text-white text-xs font-bold py-2 px-6 rounded-lg shadow uppercase">Entendido</button>
            </div>
        `;
        return;
    }

    body.innerHTML = `
        <div class="flex flex-col items-center justify-center h-48">
            <i class="fas fa-circle-notch fa-spin text-3xl text-yellow-500 mb-2"></i>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Buscando en la nube...</p>
        </div>
    `;

    dbBono.ref(`datos_vip/${fbDate}`).once('value').then(snap => {
        if (!snap.exists()) {
            body.innerHTML = `
                <div class="flex flex-col items-center justify-center h-48 text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <i class="fas fa-hourglass-half text-4xl text-orange-400 mb-3"></i>
                    <h4 class="font-black text-gray-700 text-sm uppercase leading-tight mb-2">Aún no disponibles</h4>
                    <p class="text-xs text-gray-500 font-bold">Aún no se han subido los datos fijos para <b class="text-orange-500">${humanDate}</b>. Vuelve más tarde para que los veas.</p>
                </div>
            `;
            return;
        }

        const data = snap.val();
        let listHtml = `<div class="text-center mb-4"><span class="bg-yellow-100 text-yellow-700 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-300">Datos para ${humanDate}</span></div>`;
        listHtml += `<div class="space-y-3">`;

        VIP_LOTTERIES.forEach(lotto => {
            let animalKey = data[lotto.id];
            let info = animalKey ? VIP_ANIMAL_MAP[animalKey] : null;

            if (info) {
                listHtml += `
                    <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <img src="${lotto.img}" class="w-10 h-10 rounded-full border border-gray-300 shadow-sm">
                            <div>
                                <h4 class="font-black text-gray-800 text-sm uppercase italic">${lotto.name}</h4>
                                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dato Fijo VIP</p>
                            </div>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex flex-col items-center min-w-[70px] shadow-inner">
                            <span class="text-2xl drop-shadow-sm leading-none">${info.i}</span>
                            <span class="text-[10px] font-black text-yellow-700 mt-1 uppercase">${animalKey}-${info.n}</span>
                        </div>
                    </div>
                `;
            } else {
                listHtml += `
                    <div class="bg-gray-100 p-3 rounded-xl border border-gray-200 border-dashed flex items-center justify-between opacity-70">
                        <div class="flex items-center gap-3">
                            <img src="${lotto.img}" class="w-10 h-10 rounded-full border border-gray-300 grayscale">
                            <div>
                                <h4 class="font-bold text-gray-500 text-sm uppercase italic">${lotto.name}</h4>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 font-bold uppercase"><i class="fas fa-clock mr-1"></i> Esperando</div>
                    </div>
                `;
            }
        });

        listHtml += `</div>`;
        
        listHtml += `
            <div class="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3 rounded-xl text-center">
                <p class="text-[10px] font-bold text-green-700 uppercase"><i class="fas fa-check-circle mr-1"></i> Recuerda jugar todos los días para no perder tu acceso VIP y sumar a tu racha.</p>
            </div>
        `;

        body.innerHTML = listHtml;

    }).catch(err => {
        body.innerHTML = `<p class="text-center text-red-500 text-xs font-bold mt-10">Error de conexión. Intenta de nuevo.</p>`;
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBonoModule);
else initBonoModule();

// === FIN DEL ARCHIVO ===
