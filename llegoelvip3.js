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

    // Diccionario Local Seguro (Usando Unicode para los iconos)
    const localAnimalMap = {
        "0": { i: "\uD83D\uDC2C", n: "Delf\u00EDn" },
        "00": { i: "\uD83D\uDC33", n: "Ballena" },
        "1": { i: "\uD83D\uDC0F", n: "Carnero" }, "01": { i: "\uD83D\uDC0F", n: "Carnero" },
        "2": { i: "\uD83D\uDC02", n: "Toro" }, "02": { i: "\uD83D\uDC02", n: "Toro" },
        "3": { i: "\uD83D\uDC1B", n: "Ciemp\u00EDes" }, "03": { i: "\uD83D\uDC1B", n: "Ciemp\u00EDes" },
        "4": { i: "\uD83E\uDD82", n: "Alacr\u00E1n" }, "04": { i: "\uD83E\uDD82", n: "Alacr\u00E1n" },
        "5": { i: "\uD83E\uDD81", n: "Le\u00F3n" }, "05": { i: "\uD83E\uDD81", n: "Le\u00F3n" },
        "6": { i: "\uD83D\uDC38", n: "Rana" }, "06": { i: "\uD83D\uDC38", n: "Rana" },
        "7": { i: "\uD83E\uDD9C", n: "Perico" }, "07": { i: "\uD83E\uDD9C", n: "Perico" },
        "8": { i: "\uD83D\uDC01", n: "Rat\u00F3n" }, "08": { i: "\uD83D\uDC01", n: "Rat\u00F3n" },
        "9": { i: "\uD83E\uDD85", n: "\u00C1guila" }, "09": { i: "\uD83E\uDD85", n: "\u00C1guila" },
        "10": { i: "\uD83D\uDC2F", n: "Tigre" },
        "11": { i: "\uD83D\uDC08", n: "Gato" },
        "12": { i: "\uD83D\uDC0E", n: "Caballo" },
        "13": { i: "\uD83D\uDC12", n: "Mono" },
        "14": { i: "\uD83D\uDD4A\uFE0F", n: "Paloma" },
        "15": { i: "\uD83E\uDD8A", n: "Zorro" },
        "16": { i: "\uD83D\uDC3B", n: "Oso" },
        "17": { i: "\uD83E\uDD83", n: "Pavo" },
        "18": { i: "\uD83E\uDDCF", n: "Burro" },
        "19": { i: "\uD83D\uDC10", n: "Chivo" },
        "20": { i: "\uD83D\uDC37", n: "Cerdo" },
        "21": { i: "\uD83D\uDC13", n: "Gallo" },
        "22": { i: "\uD83D\uDC2B", n: "Camello" },
        "23": { i: "\uD83E\uDD93", n: "Cebra" },
        "24": { i: "\uD83E\uDD8E", n: "Iguana" },
        "25": { i: "\uD83D\uDC14", n: "Gallina" },
        "26": { i: "\uD83D\uDC2E", n: "Vaca" },
        "27": { i: "\uD83D\uDC36", n: "Perro" },
        "28": { i: "\uD83E\uDD85", n: "Zamuro" },
        "29": { i: "\uD83D\uDC18", n: "Elefante" },
        "30": { i: "\uD83D\uDC0A", n: "Caim\u00E1n" },
        "31": { i: "\uD83D\uDC00", n: "Lapa" },
        "32": { i: "\uD83D\uDC3F\uFE0F", n: "Ardilla" },
        "33": { i: "\uD83D\uDC1F", n: "Pescado" },
        "34": { i: "\uD83E\uDD8C", n: "Venado" },
        "35": { i: "\uD83E\uDD92", n: "Jirafa" },
        "36": { i: "\uD83D\uDC0D", n: "Culebra" }
    };

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

        const tToday = await firebase.database().ref(`bets_torneo_express/${baseDateStr}/${uid}`).once('value');
        if (tToday.exists()) playedToday = true;

        const tYest = await firebase.database().ref(`bets_torneo_express/${yesterdayStr}/${uid}`).once('value');
        if (tYest.exists()) playedYesterday = true;

        if (!playedToday) {
            const bToday = await firebase.database().ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).once('value');
            if (bToday.exists()) {
                bToday.forEach(c => {
                    const v = c.val();
                    if (v.date === baseDateStr && v.payment_method !== 'GRATIS') playedToday = true;
                });
            }
        }

        if (!playedYesterday) {
            const bYestGrade = await firebase.database().ref(`bingo_to_grade/estelar/${yesterdayStr}/bets`).orderByChild('uid').equalTo(uid).once('value');
            if (bYestGrade.exists()) {
                bYestGrade.forEach(c => { if (c.val().payment_method !== 'GRATIS') playedYesterday = true; });
            }
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
                alert("\uD83D\uDD12 Para ver los datos fijos VIP debes tener al menos 1 jugada paga (Bingo o Torneo) de Hoy o de Ayer.");
            };
        }

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

        const now = new Date(Date.now() + (window.serverTimeOffset || 0));
        const hideToday = now.getHours() >= 19;

        let html = "";

        const buildSection = (title, dataObj) => {
            if (!dataObj) return `<div class="bg-gray-800 p-4 rounded-xl border border-gray-700 text-gray-500 text-xs italic">A\u00FAn no se ha montado. Se avisar\u00E1 por el canal al ser subida.</div>`;
            
            let grid = '<div class="grid grid-cols-3 gap-2">';
            const loterias = [
                { id: 'lotto_activo', img: 'https://bingotexier.com/archivos/imagenes/b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png' },
                { id: 'la_granjita', img: 'https://bingotexier.com/archivos/imagenes/21e0b011b246a96b2561eeea537bcc519ab647a9.jpeg' },
                { id: 'selva_plus', img: 'https://i.imgur.com/MbtPoOD.png' }
            ];

            loterias.forEach(lot => {
                let num = dataObj[lot.id] || "";
                num = num.toString().trim(); // Convertir a string por seguridad
                
                // Buscar en mapa local
                let animalInfo = localAnimalMap[num];
                
                // Fallback seguro
                if (!animalInfo) {
                    animalInfo = {i: '\u2753', n: 'Desconocido'};
                }
                
                grid += `
                    <div class="animal-vip-card">
                        <img src="${lot.img}" class="w-6 h-6 rounded-full mx-auto mb-1 border border-gray-200">
                        <div class="text-2xl leading-none drop-shadow-md mb-1">${num ? animalInfo.i : '\uD83D\uDD12'}</div>
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

        const dbRef = firebase.database().ref('datos_vip');
        const [snapToday, snapTomorrow] = await Promise.all([
            dbRef.child(todayStr).once('value'),
            dbRef.child(tomorrowStr).once('value')
        ]);

        const dataToday = snapToday.val();
        const dataTomorrow = snapTomorrow.val();

        if (!hideToday && (playedYesterday || playedToday)) {
            html += buildSection(`\uD83C\uDFAF FIJOS PARA HOY (${todayStr})`, dataToday);
        }

        if (playedToday) {
            html += buildSection(`\uD83D\uDE80 FIJOS PARA MA\u00D1ANA (${tomorrowStr})`, dataTomorrow);
        } else if (!playedToday && playedYesterday) {
            html += `
                <div class="bg-blue-900/30 border border-blue-800 rounded-xl p-4 mt-2">
                    <p class="text-[11px] text-blue-300 font-bold"><i class="fas fa-info-circle mr-1"></i> Para desbloquear los datos de MA\u00D1ANA (${tomorrowStr}), debes realizar al menos una jugada el d\u00EDa de hoy.</p>
                </div>
            `;
        }

        if (html === "") {
            html = `<p class="text-sm text-gray-400">No hay datos disponibles en este momento horario.</p>`;
        }

        contentArea.innerHTML = html;
    }

    if(typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setTimeout(checkUserPlayStatus, 1500); 
            } else {
                if (document.getElementById('vip-module-container')) document.getElementById('vip-module-container').remove();
            }
        });
    }

})();
