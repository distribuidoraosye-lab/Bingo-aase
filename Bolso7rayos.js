/* ============================================================
   MODULO DE BOLSOS / SANES (VISTA USUARIO) - INYECCION DINAMICA
   ============================================================ */

const modalesHTML = `
    <div id="modal-verificacion-bolso" class="hidden modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; align-items: center; justify-content: center;">
        <div class="modal-content" style="background: white; width: 95%; max-width: 450px; border-radius: 15px; display: flex; flex-direction: column;">
            <div class="bg-blue-600 p-4 rounded-t-xl text-white flex justify-between items-center">
                <h3 class="font-bold text-lg"><i class="fas fa-user-shield mr-2"></i> Verificacion Requerida</h3>
                <button onclick="document.getElementById('modal-verificacion-bolso').style.display='none'" class="text-white"><i class="fas fa-times text-xl"></i></button>
            </div>
            <div class="p-4 bg-white text-gray-700 max-h-[70vh] overflow-y-auto">
                <p class="text-sm font-bold text-gray-600 mb-4 text-center">Para participar en los Bolsos VIP, necesitamos verificar tu identidad.</p>
                <div class="flex justify-center gap-4 mb-6">
                    <div class="flex flex-col items-center">
                        <div class="w-20 h-16 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center mb-2"><i class="fas fa-id-card text-2xl text-gray-400"></i></div>
                        <span class="text-[10px] font-bold text-gray-500 uppercase">Foto Cedula</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-20 h-16 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center mb-2"><i class="fas fa-user-circle text-2xl text-gray-400"></i></div>
                        <span class="text-[10px] font-bold text-gray-500 uppercase">Selfie c/ Cedula</span>
                    </div>
                </div>
                <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4 text-xs text-gray-700">
                    <p class="font-bold text-yellow-800 mb-1"><i class="fas fa-exclamation-triangle mr-1"></i> REGLAS DEL BOLSO:</p>
                    <ul class="list-disc pl-4 space-y-1">
                        <li>El compromiso es estricto. La mora genera 2$ de multa diaria.</li>
                        <li>La primera cuota se cobra al entrar, directo de tu saldo Bingo (Tasa Euro BCV).</li>
                        <li>El organizador garantiza el bolso. Cero riesgos.</li>
                    </ul>
                </div>
                <button onclick="sendWhatsAppVerification()" class="w-full bg-green-500 text-white font-black py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"><i class="fab fa-whatsapp text-xl"></i> ENVIAR POR WHATSAPP</button>
            </div>
        </div>
    </div>

    <div id="modal-bolsos-mercado" class="hidden modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; align-items: center; justify-content: center;">
        <div class="modal-content h-[85vh] flex flex-col" style="background: white; width: 95%; max-width: 450px; border-radius: 15px;">
            <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-t-xl text-yellow-900 shadow-md flex justify-between items-center">
                <div>
                    <h3 class="font-black text-lg leading-none tracking-wide"><i class="fas fa-sack-dollar mr-2"></i>MERCADO DE BOLSOS</h3>
                    <p class="text-[10px] text-yellow-100 mt-1 font-bold uppercase tracking-widest">Ahorro Seguro Texier</p>
                </div>
                <button onclick="document.getElementById('modal-bolsos-mercado').style.display='none'" class="text-yellow-900 hover:text-white"><i class="fas fa-times text-2xl"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 bg-gray-100">
                <div id="lista-bolsos-mercado" class="space-y-4"></div>
            </div>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', modalesHTML);

window.openBolsosModal = async () => {
    if (!auth.currentUser) return alert("Debes iniciar sesi\u00F3n primero.");
    const uid = auth.currentUser.uid;
    const btn = document.getElementById('btn-open-bolsos');
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Cargando...';
    try {
        const userSnap = await db.ref(`users/${uid}`).once('value');
        const userData = userSnap.val() || {};
        if (userData.bolso_verificado === true) {
            document.getElementById('modal-bolsos-mercado').style.display = 'flex';
            loadBolsos();
        } else {
            document.getElementById('modal-verificacion-bolso').style.display = 'flex';
        }
    } catch (error) { console.error(error); } 
    finally {
        if (btn) btn.innerHTML = '<span class="absolute top-0 right-0 bg-yellow-400 text-green-900 text-[9px] font-black px-3 py-1 rounded-bl-lg animate-pulse shadow-sm">AHORRO SEGURO</span><i class="fas fa-sack-dollar text-3xl mb-2 text-yellow-300 drop-shadow-md"></i><br><span class="font-black tracking-wider text-lg">BOLSOS VIP / SANES</span>';
    }
};

window.sendWhatsAppVerification = () => {
    if (!auth.currentUser) return;
    const nombre = auth.currentUser.displayName || 'Usuario';
    const mensaje = `\u00A1Hola Texier! Quiero verificarme para participar en los Bolsos VIP. Mi nombre de usuario es: *${nombre}*. Env\u00EDo mi foto de c\u00E9dula y selfie:`;
    window.open(`https://wa.me/584220153364?text=${encodeURIComponent(mensaje)}`, '_blank');
    document.getElementById('modal-verificacion-bolso').style.display = 'none';
};

window.loadBolsos = () => {
    const uid = auth.currentUser.uid;
    const container = document.getElementById('lista-bolsos-mercado');
    if (!container) return;
    container.innerHTML = '<p class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>Buscando bolsos...</p>';

    db.ref('bolsos').on('value', s => {
        container.innerHTML = '';
        if (!s.exists()) return container.innerHTML = '<p class="text-center text-gray-500 text-sm py-8 font-bold">No hay bolsos disponibles en este momento.</p>';

        s.forEach(child => {
            const bolsoId = child.key; const b = child.val();
            if (b.status !== 'abierto') return;

            const participantes = b.participantes || {};
            const ocupados = Object.keys(participantes).length;
            const disponibles = b.cupos_totales - ocupados;
            let misCupos = [];
            Object.entries(participantes).forEach(([key, p]) => { if(p.uid === uid) misCupos.push(p); });

            const isFull = disponibles <= 0;
            let cardHtml = `<div class="bg-white p-4 rounded-xl shadow-md border-2 ${misCupos.length > 0 ? 'border-green-500' : (isFull ? 'border-gray-300' : 'border-yellow-400')} mb-4 relative overflow-hidden">`;

            if (misCupos.length > 0) { cardHtml += `<div class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg"><i class="fas fa-check"></i> PARTICIPANDO (${misCupos.length})</div>`; } 
            else if (isFull) { cardHtml += `<div class="absolute inset-0 bg-gray-100/60 z-10 flex items-center justify-center"><span class="bg-gray-800 text-white font-black px-4 py-2 rounded-lg transform -rotate-12 border-2 border-gray-600 shadow-xl">LLENO</span></div>`; }

            cardHtml += `<h3 class="font-black text-gray-800 text-lg mb-1">${b.nombre}</h3><div class="flex justify-between items-center mb-3"><span class="text-xs font-bold text-gray-500">Premio: <span class="text-green-600 font-black">$${b.premio_usd}</span></span><span class="text-xs font-bold text-gray-500">Cuota: <span class="text-blue-600 font-black">$${b.costo_usd}</span></span></div><div class="bg-gray-50 p-2 rounded-lg mb-3 flex justify-between items-center border border-gray-200"><span class="text-[10px] font-bold text-gray-500 uppercase">Cupos Ocupados</span><span class="text-xs font-black ${isFull ? 'text-gray-500' : 'text-orange-600'}">${ocupados} / ${b.cupos_totales}</span></div>`;

            if (misCupos.length > 0) {
                cardHtml += `<div class="mt-2 pt-2 border-t border-gray-200 space-y-2 relative z-20">`;
                misCupos.forEach((miCupo, index) => {
                    const estado = miCupo.solvente === false ? `<span class="text-red-600 font-bold text-[10px]"><i class="fas fa-exclamation-circle mr-1"></i>En Mora</span>` : `<span class="text-green-600 font-bold text-[10px]"><i class="fas fa-check-circle mr-1"></i>Al D\u00EDa</span>`;
                    const turnoInfo = miCupo.turno ? `Turno #${miCupo.turno}` : `Esperando Sorteo`;
                    cardHtml += `<div class="bg-blue-50 p-2 rounded flex justify-between items-center border border-blue-100"><div><p class="text-[10px] font-bold text-gray-700">Mi Cupo ${index + 1}</p><p class="text-xs font-black text-blue-800">${turnoInfo}</p></div><div class="text-right">${estado}</div></div>`;
                });
                if(!isFull) cardHtml += `<button onclick="joinBolso('${bolsoId}', '${b.nombre}', ${disponibles}, ${b.costo_usd})" class="w-full mt-2 bg-yellow-100 text-yellow-800 font-bold py-2 rounded-lg text-xs border border-yellow-300">Reservar Otro Cupo</button>`;
                cardHtml += `</div>`;
            } else if (!isFull) {
                cardHtml += `<button onclick="joinBolso('${bolsoId}', '${b.nombre}', ${disponibles}, ${b.costo_usd})" class="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black py-3 rounded-lg shadow-md transition">PARTICIPAR AHORA</button>`;
            }

            cardHtml += `</div>`;
            container.innerHTML += cardHtml;
        });
    });
};

window.joinBolso = async (bolsoId, nombreBolso, disponibles, costoUsd) => {
    if (!auth.currentUser) return;
    if (disponibles <= 0) return alert("Este bolso ya est\u00E1 lleno.");

    const uid = auth.currentUser.uid; 
    const nombre = auth.currentUser.displayName || 'Usuario';

    try {
        // 1. Obtener la tasa configurada por el admin
        const tasaSnap = await db.ref('config/tasa_euro').once('value');
        const tasa = tasaSnap.val();
        
        if (!tasa) {
            return alert("\u26A0\uFE0F El sistema no tiene una tasa configurada actualmente. Contacta a soporte.");
        }

        const costoBs = costoUsd * tasa;

        const confirmMsg = `\u00BFEst\u00E1s seguro de apartar 1 cupo en el ${nombreBolso}?\n\nAl confirmar, se descontar\u00E1n Bs ${costoBs.toFixed(2)} ($${costoUsd} a tasa ${tasa}) de tu saldo como pago de la PRIMERA CUOTA. \u00A1Aseg\u00FArate de tener saldo!`;
        
        if (!confirm(confirmMsg)) return;

        // 2. Verificar si el usuario tiene saldo suficiente
        const userRef = db.ref(`users/${uid}`);
        const userSnap = await userRef.once('value');
        const saldoActual = userSnap.val().balance || 0;

        if (saldoActual < costoBs) {
            return alert(`\u274C Saldo Insuficiente. Necesitas Bs ${costoBs.toFixed(2)} pero tienes Bs ${saldoActual.toFixed(2)}.`);
        }

        // 3. Descontar el saldo y agregarlo al bolso
        await userRef.child('balance').transaction(c => (c || 0) - costoBs);
        
        await db.ref(`bolsos/${bolsoId}/participantes`).push({ 
            uid: uid, 
            name: nombre, 
            cuotas_pagadas: 1, // Entra con la primera pagada
            solvente: true, 
            fecha_ingreso: firebase.database.ServerValue.TIMESTAMP 
        });
        
        alert("\u2705 \u00A1\u00C9xito! Tienes tu cupo reservado y tu primera cuota est\u00E1 pagada.");
    } catch (error) { 
        console.error(error);
        alert("Ocurri\u00F3 un error: " + error.message); 
    }
};
