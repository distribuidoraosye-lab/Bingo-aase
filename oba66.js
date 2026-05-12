/* ============================================================
   MÓDULO: JUGADAS GRATIS POR HORA (TORNEO EXPRESS)
   ============================================================ */

(function() {
    // --- 1. CONSTANTES Y VARIABLES GLOBALES DEL MÓDULO ---
    const HORAS_TORNEO = [
        { label: '01:00 PM', h: 13 }, { label: '02:00 PM', h: 14 },
        { label: '03:00 PM', h: 15 }, { label: '04:00 PM', h: 16 },
        { label: '05:00 PM', h: 17 }, { label: '06:00 PM', h: 18 }
    ];
    let misCartonesCount = 0;
    let jugadasLocales = {}; 
    let jugadasGuardadas = {}; 
    let slotActivoEdicion = null; 

    // --- 2. INYECCIÓN DEL HTML (BANNER Y MODALES) ---
    function inyectarInterfaz() {
        // A. Inyectar Banner en el área del Torneo Express
        const targetArea = document.getElementById('torneo-express-area');
        if (targetArea && !document.getElementById('banner-jugadas-hora')) {
            const bannerHtml = `
                <div id="banner-jugadas-hora" class="mb-4 bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-1 shadow-lg transform transition hover:scale-[1.02] cursor-pointer animate-pulse-fast border-2 border-green-300" onclick="window.abrirPanelJugadasHora()">
                    <div class="bg-black/20 p-3 rounded-lg flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="bg-yellow-400 p-2 rounded-full shadow-inner relative">
                                <i class="fas fa-gift text-green-900 text-xl"></i>
                                <span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                            </div>
                            <div>
                                <h4 class="text-white font-black text-sm tracking-wide leading-tight">JUGADAS GRATIS CADA HORA</h4>
                                <p class="text-[10px] text-green-100 font-bold uppercase mt-0.5">Acierta y gana $5 por cartón</p>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-white opacity-70"></i>
                    </div>
                </div>
            `;
            targetArea.insertAdjacentHTML('afterbegin', bannerHtml);
        }

        // B. Inyectar Modales en el Body
        if (!document.getElementById('modal-jugadas-hora')) {
            const modalHtml = `
                <div id="modal-jugadas-hora" class="hidden fixed inset-0 bg-black/90 z-[999999] flex items-center justify-center">
                    <div class="bg-gray-100 w-full max-w-md h-[90vh] md:h-[85vh] rounded-2xl flex flex-col relative overflow-hidden shadow-2xl">
                        <div class="bg-gradient-to-r from-green-600 to-teal-700 p-4 shadow-md z-10 flex justify-between items-center text-white">
                            <div>
                                <h3 class="font-black text-lg leading-none"><i class="fas fa-gift mr-1"></i> JUGADAS POR HORA</h3>
                                <p class="text-[10px] text-green-100 font-bold uppercase mt-1">Lotto Activo (1 PM a 6 PM)</p>
                            </div>
                            <button onclick="window.cerrarPanelJugadasHora()" class="text-white hover:text-green-200"><i class="fas fa-times text-2xl"></i></button>
                        </div>
                        
                        <div class="bg-white p-3 border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
                            <span class="text-xs font-bold text-gray-500 uppercase">Tus Cartones Activos:</span>
                            <span id="jh-cartones-count" class="bg-green-100 text-green-800 font-black px-3 py-1 rounded border border-green-300 text-sm">0</span>
                        </div>

                        <div id="jh-horas-list" class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-gray-100 pb-20">
                            <div class="text-center py-10 text-gray-400 text-xs italic">Cargando tus jugadas...</div>
                        </div>

                        <div class="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20">
                            <button id="btn-guardar-jh" onclick="window.guardarJugadasHora()" class="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 text-sm">
                                <i class="fas fa-save mr-2"></i> CONFIRMAR JUGADAS
                            </button>
                        </div>
                    </div>
                </div>

                <div id="modal-selector-animal" class="hidden fixed inset-0 bg-black/80 z-[9999999] flex items-end justify-center sm:items-center">
                    <div class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[80vh] shadow-2xl animate-bounce-in">
                        <div class="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h4 class="font-bold text-gray-700 text-sm">Elige para las <span id="lbl-hora-select" class="text-green-600 font-black">--</span></h4>
                            <button onclick="window.cerrarSelectorAnimal()" class="text-gray-400 hover:text-gray-700"><i class="fas fa-times text-xl"></i></button>
                        </div>
                        <div class="p-2 overflow-y-auto custom-scrollbar flex-1 bg-white">
                            <div id="jh-animal-grid" class="grid grid-cols-4 sm:grid-cols-5 gap-2"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    }

    // --- 3. LÓGICA DE DATOS FIREBASE ---
    function escucharMisTickets() {
        if (!auth.currentUser || !torneoDateStr) return;
        const uid = auth.currentUser.uid;
        
        db.ref(`bets_torneo_express/${torneoDateStr}/${uid}`).on('value', snap => {
            misCartonesCount = snap.exists() ? Object.keys(snap.val()).length : 0;
            const countDisplay = document.getElementById('jh-cartones-count');
            if(countDisplay) countDisplay.textContent = misCartonesCount;
            
            if (document.getElementById('modal-jugadas-hora') && !document.getElementById('modal-jugadas-hora').classList.contains('hidden')) {
                renderizarListaHoras();
            }
        });

        db.ref(`torneo_hourly_picks/${torneoDateStr}/${uid}`).on('value', snap => {
            jugadasGuardadas = snap.exists() ? snap.val() : {};
            jugadasLocales = JSON.parse(JSON.stringify(jugadasGuardadas));
            if (document.getElementById('modal-jugadas-hora') && !document.getElementById('modal-jugadas-hora').classList.contains('hidden')) {
                renderizarListaHoras();
            }
        });
    }

    // --- 4. CONTROLADORES DE INTERFAZ (Exportados a Window) ---
    window.abrirPanelJugadasHora = () => {
        if(misCartonesCount === 0) {
            return alert("⚠️ Debes comprar al menos 1 ticket del Torneo Express para desbloquear estas jugadas gratis.");
        }
        document.getElementById('modal-jugadas-hora').classList.remove('hidden');
        renderizarListaHoras();
    };

    window.cerrarPanelJugadasHora = () => {
        document.getElementById('modal-jugadas-hora').classList.add('hidden');
    };

    function renderizarListaHoras() {
        const container = document.getElementById('jh-horas-list');
        container.innerHTML = '';
        const now = new Date(Date.now() + serverTimeOffset);

        HORAS_TORNEO.forEach(bloque => {
            let limitTime = new Date(now);
            limitTime.setHours(bloque.h - 1, 50, 0, 0); 
            const estaBloqueada = now > limitTime;

            const picksUsuario = jugadasLocales[bloque.label] || [];
            let slotsHtml = '';
            
            for (let i = 0; i < misCartonesCount; i++) {
                const pickNum = picksUsuario[i]; 
                
                if (pickNum) {
                    const animalInfo = window.ANIMAL_MAP_LOTTO ? window.ANIMAL_MAP_LOTTO[pickNum] : {i:'❓', n:'?'};
                    slotsHtml += `
                        <div onclick="window.abrirSelectorAnimal('${bloque.label}', ${i}, ${estaBloqueada})" class="w-14 h-16 bg-white border-2 border-green-500 rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-sm relative hover:bg-green-50 transition ${estaBloqueada ? 'opacity-70 grayscale' : ''}">
                            <span class="text-xl">${animalInfo.i}</span>
                            <span class="text-[10px] font-black text-green-700 mt-1">${pickNum}</span>
                            ${estaBloqueada ? '<div class="absolute -top-2 -right-2 bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"><i class="fas fa-lock text-white text-[9px]"></i></div>' : ''}
                        </div>
                    `;
                } else {
                    slotsHtml += `
                        <div onclick="window.abrirSelectorAnimal('${bloque.label}', ${i}, ${estaBloqueada})" class="w-14 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition ${estaBloqueada ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}">
                            <i class="fas ${estaBloqueada ? 'fa-lock' : 'fa-plus'} text-gray-400"></i>
                        </div>
                    `;
                }
            }

            let statusBadge = estaBloqueada 
                ? '<span class="bg-gray-200 text-gray-600 text-[9px] font-bold px-2 py-1 rounded"><i class="fas fa-lock mr-1"></i> Cerrado</span>'
                : '<span class="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded"><i class="fas fa-door-open mr-1"></i> Abierto</span>';

            const imgSrc = window.LOTTO_IMGS ? window.LOTTO_IMGS['Lotto Activo'] : '';

            container.innerHTML += `
                <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-2 relative">
                    <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                        <div class="flex items-center gap-2">
                            <img src="${imgSrc}" class="w-5 h-5 rounded-full shadow-sm">
                            <h4 class="font-black text-gray-700 text-sm">${bloque.label}</h4>
                        </div>
                        ${statusBadge}
                    </div>
                    <div class="flex flex-wrap gap-2 pt-1">
                        ${slotsHtml}
                    </div>
                </div>
            `;
        });
    }

    window.abrirSelectorAnimal = (horaStr, slotIndex, estaBloqueada) => {
        if (estaBloqueada) return alert("⏳ Este sorteo ya cerró (el límite es 10 minutos antes de la hora). No puedes editarlo.");
        
        slotActivoEdicion = { hora: horaStr, index: slotIndex };
        document.getElementById('lbl-hora-select').textContent = horaStr;
        
        const grid = document.getElementById('jh-animal-grid');
        grid.innerHTML = '';
        
        const keys = ['0','00', ...Array.from({length:36},(_,i)=>(i+1).toString())];
        keys.forEach(k => {
            const a = window.ANIMAL_MAP_LOTTO ? window.ANIMAL_MAP_LOTTO[k] : {n:`Num ${k}`, i:"❓"};
            const btn = document.createElement('button');
            btn.className = "bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center hover:bg-green-100 hover:border-green-400 transition active:scale-95";
            btn.innerHTML = `<span class="text-2xl mb-1">${a.i}</span><span class="text-[10px] font-black text-gray-800">${k}</span><span class="text-[8px] text-gray-500 truncate w-full text-center">${a.n}</span>`;
            
            btn.onclick = () => window.seleccionarAnimalParaSlot(k);
            grid.appendChild(btn);
        });

        document.getElementById('modal-selector-animal').classList.remove('hidden');
    };

    window.cerrarSelectorAnimal = () => {
        document.getElementById('modal-selector-animal').classList.add('hidden');
        slotActivoEdicion = null;
    };

    window.seleccionarAnimalParaSlot = (animalNum) => {
        if (!slotActivoEdicion) return;
        const { hora, index } = slotActivoEdicion;
        
        if (!jugadasLocales[hora]) jugadasLocales[hora] = [];
        
        while (jugadasLocales[hora].length <= index) {
            jugadasLocales[hora].push(null);
        }
        
        jugadasLocales[hora][index] = animalNum;
        
        window.cerrarSelectorAnimal();
        renderizarListaHoras(); 
    };

    window.guardarJugadasHora = async () => {
        const btn = document.getElementById('btn-guardar-jh');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> GUARDANDO...';
        btn.disabled = true;

        try {
            const uid = auth.currentUser.uid;
            const now = new Date(Date.now() + serverTimeOffset);
            let jugadasValidasParaGuardar = {};

            HORAS_TORNEO.forEach(bloque => {
                let limitTime = new Date(now);
                limitTime.setHours(bloque.h - 1, 50, 0, 0); 
                const estaBloqueada = now > limitTime;

                if (!estaBloqueada) {
                    const picksLimpios = (jugadasLocales[bloque.label] || []).filter(v => v !== null);
                    if (picksLimpios.length > 0) jugadasValidasParaGuardar[bloque.label] = picksLimpios;
                } else {
                    if (jugadasGuardadas[bloque.label]) jugadasValidasParaGuardar[bloque.label] = jugadasGuardadas[bloque.label];
                }
            });

            await db.ref(`torneo_hourly_picks/${torneoDateStr}/${uid}`).set(jugadasValidasParaGuardar);
            
            btn.innerHTML = '<i class="fas fa-check mr-2"></i> ¡GUARDADO EXITOSO!';
            btn.className = "w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg transition text-sm";
            
            setTimeout(() => {
                window.cerrarPanelJugadasHora();
                btn.innerHTML = '<i class="fas fa-save mr-2"></i> CONFIRMAR JUGADAS';
                btn.className = "w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 text-sm";
                btn.disabled = false;
            }, 1500);

        } catch (e) {
            alert("Error al guardar: " + e.message);
            btn.innerHTML = '<i class="fas fa-save mr-2"></i> REINTENTAR';
            btn.disabled = false;
        }
    };

    // --- 5. INICIALIZADOR PRINCIPAL ---
    // Esperamos a que la página base haya cargado un poco
    setTimeout(() => {
        inyectarInterfaz();
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged(user => {
                if (user) {
                    setTimeout(escucharMisTickets, 1500); 
                }
            });
        }
    }, 1000);

})();
