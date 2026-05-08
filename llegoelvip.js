/* ============================================================
   BINGO TEXIER - MÓDULO DATOS VIP (Inyectable)
   ============================================================ */

(function initVIPModule() {
    // 1. Inyectar CSS para animaciones y diseño
    const css = `
        @keyframes pulse-gold { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
        .btn-vip-unlocked { animation: pulse-gold 2s infinite; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #eab308; }
        .btn-vip-locked { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border: 1px solid #d1d5db; filter: grayscale(100%); }
        .logos-stack img { border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-left: -10px; }
        .logos-stack img:first-child { margin-left: 0; }
        .animal-vip-card { background: linear-gradient(to bottom, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

    // 2. Crear Contenedor del Botón
    const vipContainer = document.createElement('div');
    vipContainer.id = 'vip-module-container';
    vipContainer.className = 'mb-4 w-full cursor-pointer transition-transform transform active:scale-95';

    // 3. Crear el Modal HTML (Oculto por defecto)
    const modalHTML = `
        <div id="modal-vip-datos" class="hidden fixed inset-0 bg-black/90 z-[999999] flex items-center justify-center p-4">
            <div class="bg-gray-900 border-t-4 border-yellow-400 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                <button onclick="document.getElementById('modal-vip-datos').style.display='none'" class="absolute top-4 right-4 text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
                <div class="p-6 text-center">
                    <h3 class="text-2xl font-black text-yellow-400 uppercase tracking-widest mb-1"><i class="fas fa-star mr-2"></i>DATOS VIP</h3>
                    <p class="text-xs text-gray-400 font-bold mb-6">Proyecciones de Alta Probabilidad</p>
                    <div id="vip-content-area" class="space-y-6">
                        <!-- El contenido se inyecta aquí -->
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 4. Lógica de Fechas
    function parseDateStr(str) {
        if(!str) return new Date();
        const [d, m, y] = str.split('-');
        return new Date(y, m - 1, d);
    }

    function formatDateStr(dateObj) {
        return `${String(dateObj.getDate()).padStart(2,'0')}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${dateObj.getFullYear()}`;
    }

    // 5. Motor de Verificación
    async function checkUserPlayStatus() {
        if (!firebase.auth().currentUser) return;
        const uid = firebase.auth().currentUser.uid;
        
        // Usar la fecha base del sistema principal (francisca.js)
        const baseDateStr = window.currentDateStr || formatDateStr(new Date());
        const baseDateObj = parseDateStr(baseDateStr);
        
        const yesterdayObj = new Date(baseDateObj);
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yesterdayStr = formatDateStr(yesterdayObj);

        const tomorrowObj = new Date(baseDateObj);
        tomorrowObj.setDate(tomorrowObj.getDate() + 1);
        const tomorrowStr = formatDateStr(tomorrowObj);

        let playedToday = false;
        let playedYesterday = false;

        // A) VERIFICAR TORNEOS
        const tToday = await firebase.database().ref(`bets_torneo_express/${baseDateStr}/${uid}`).once('value');
        if (tToday.exists()) playedToday = true;

        const tYest = await firebase.database().ref(`bets_torneo_express/${yesterdayStr}/${uid}`).once('value');
        if (tYest.exists()) playedYesterday = true;

        // B) VERIFICAR BINGO HOY (En aprobados)
        if (!playedToday) {
            const bToday = await firebase.database().ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).once('value');
            if (bToday.exists()) {
                bToday.forEach(c => {
                    const v = c.val();
                    if (v.date === baseDateStr && v.payment_method !== 'GRATIS') playedToday = true;
                });
            }
        }

        // C) VERIFICAR BINGO AYER (En carpeta cerrada y en aprobados por si acaso)
        if (!playedYesterday) {
            // Revisar en la bóveda
            const bYestGrade = await firebase.database().ref(`bingo_to_grade/estelar/${yesterdayStr}/bets`).orderByChild('uid').equalTo(uid).once('value');
            if (bYestGrade.exists()) {
                bYestGrade.forEach(c => { if (c.val().payment_method !== 'GRATIS') playedYesterday = true; });
            }
            // Revisar en activos (por si se retrasó el cierre)
            if (!playedYesterday) {
                const bYestActive = await firebase.database().ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).once('value');
                if (bYestActive.exists()) {
                    bYestActive.forEach(c => {
                        const v = c.val();
                        if (v.date === yesterdayStr && v.payment_method !== 'GRATIS') playedYesterday = true;
                    });
                }
            }
        }

        renderButton(playedToday, playedYesterday, baseDateStr, tomorrowStr);
    }

    // 6. Renderizar el Botón
    function renderButton(playedToday, playedYesterday, todayStr, tomorrowStr) {
        const isUnlocked = playedToday || playedYesterday;
        const logos = `
            <div class="logos-stack flex mr-3">
                <img src="https://bingotexier.com/archivos/imagenes/b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png">
                <img src="https://bingotexier.com/archivos/imagenes/21e0b011b246a96b2561eeea537bcc519ab647a9.jpeg">
                <img src="https://i.imgur.com/MbtPoOD.png">
            </div>
        `;

        if (isUnlocked) {
            vipContainer.innerHTML = `
                <div class="btn-vip-unlocked rounded-2xl p-3 flex items-center justify-between shadow-lg">
                    <div class="flex items-center">
                        ${logos}
                        <div class="flex flex-col">
                            <span class="text-yellow-400 font-black text-sm uppercase tracking-wide">VER DATOS VIP GRATIS</span>
                            <span class="text-gray-400 text-[10px] font-bold">Lotto, Granjita y Selva Plus</span>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right text-yellow-500"></i>
                </div>
            `;
            vipContainer.onclick = () => openVIPModal(playedToday, playedYesterday, todayStr, tomorrowStr);
        } else {
            vipContainer.innerHTML = `
                <div class="btn-vip-locked rounded-2xl p-3 flex items-center justify-between opacity-80">
                    <div class="flex items-center">
                        ${logos}
                        <div class="flex flex-col">
                            <span class="text-gray-600 font-black text-[13px] uppercase tracking-wide"><i class="fas fa-lock mr-1"></i> DATOS VIP BLOQUEADOS</span>
                            <span class="text-gray-500 text-[9px] font-bold leading-tight mt-0.5">Haz una jugada en bingo o torneo<br>y desbloquea los datos gratis.</span>
                        </div>
                    </div>
                </div>
            `;
            vipContainer.onclick = () => {
                alert("🔒 Para ver los datos fijos VIP debes tener al menos 1 jugada paga (Bingo o Torneo) de Hoy o de Ayer.");
            };
        }

        // Inyectar arriba del user-dashboard
        const loggedInArea = document.getElementById('logged-in-area');
        const userDashboard = document.getElementById('user-dashboard');
        if (loggedInArea && userDashboard && !document.getElementById('vip-module-container')) {
            loggedInArea.insertBefore(vipContainer, userDashboard);
        }
    }

    // 7. Renderizar Modal con los Datos
    async function openVIPModal(playedToday, playedYesterday, todayStr, tomorrowStr) {
        document.getElementById('modal-vip-datos').style.display = 'flex';
        const contentArea = document.getElementById('vip-content-area');
        contentArea.innerHTML = '<div class="text-yellow-400"><i class="fas fa-spinner fa-spin text-3xl"></i><p class="mt-2 text-xs">Descifrando la bóveda...</p></div>';

        // Lógica de hora (Ocultar hoy si son más de las 7:00 PM)
        const now = new Date(Date.now() + (window.serverTimeOffset || 0));
        const hideToday = now.getHours() >= 19;

        let html = "";

        // Función auxiliar para maquetar
        const buildSection = (title, dataObj) => {
            if (!dataObj) return `<div class="bg-gray-800 p-4 rounded-xl border border-gray-700 text-gray-500 text-xs italic">Aún no se ha montado. Se avisará por el canal al ser subida.</div>`;
            
            let grid = '<div class="grid grid-cols-3 gap-2">';
            const loterias = [
                { id: 'lotto_activo', img: 'https://bingotexier.com/archivos/imagenes/b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png' },
                { id: 'la_granjita', img: 'https://bingotexier.com/archivos/imagenes/21e0b011b246a96b2561eeea537bcc519ab647a9.jpeg' },
                { id: 'selva_plus', img: 'https://i.imgur.com/MbtPoOD.png' }
            ];

            loterias.forEach(lot => {
                const num = dataObj[lot.id] || "";
                const animalInfo = (window.ANIMAL_MAP_LOTTO && window.ANIMAL_MAP_LOTTO[num]) ? window.ANIMAL_MAP_LOTTO[num] : {i:'❓', n:'??'};
                
                grid += `
                    <div class="animal-vip-card">
                        <img src="${lot.img}" class="w-6 h-6 rounded-full mx-auto mb-1 border border-gray-200">
                        <div class="text-2xl leading-none drop-shadow-md mb-1">${num ? animalInfo.i : '🔒'}</div>
                        <div class="text-lg font-black text-gray-800">${num || '-'}</div>
                        <div class="text-[9px] text-gray-500 font-bold uppercase truncate">${num ? animalInfo.n : 'Oculto'}</div>
                    </div>
                `;
            });
            grid += '</div>';

            return `
                <div class="mb-4">
                    <h4 class="text-left text-sm text-gray-300 font-bold mb-2 border-b border-gray-700 pb-1">${title}</h4>
                    ${grid}
                </div>
            `;
        };

        // Solicitar base de datos
        const dbRef = firebase.database().ref('datos_vip');
        const [snapToday, snapTomorrow] = await Promise.all([
            dbRef.child(todayStr).once('value'),
            dbRef.child(tomorrowStr).once('value')
        ]);

        const dataToday = snapToday.val();
        const dataTomorrow = snapTomorrow.val();

        // Mostrar "Hoy" solo si jugó ayer (o jugó hoy y aún no son las 7PM)
        if (!hideToday && (playedYesterday || playedToday)) {
            html += buildSection(`🎯 FIJOS PARA HOY (${todayStr})`, dataToday);
        }

        // Mostrar "Mañana" solo si jugó Hoy
        if (playedToday) {
            html += buildSection(`🚀 FIJOS PARA MAÑANA (${tomorrowStr})`, dataTomorrow);
        } else if (!playedToday && playedYesterday) {
            html += `
                <div class="bg-blue-900/30 border border-blue-800 rounded-xl p-4 mt-2">
                    <p class="text-[11px] text-blue-300 font-bold"><i class="fas fa-info-circle mr-1"></i> Para desbloquear los datos de MAÑANA (${tomorrowStr}), debes realizar al menos una jugada el día de hoy.</p>
                </div>
            `;
        }

        if (html === "") {
            html = `<p class="text-sm text-gray-400">No hay datos disponibles en este momento horario.</p>`;
        }

        contentArea.innerHTML = html;
    }

    // Inicializar escuchador de Autenticación
    if(typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // Pequeño delay para asegurar que variables globales como currentDateStr carguen
                setTimeout(checkUserPlayStatus, 1500); 
            } else {
                if (document.getElementById('vip-module-container')) document.getElementById('vip-module-container').remove();
            }
        });
    }

})();
