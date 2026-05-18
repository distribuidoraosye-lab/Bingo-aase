// 1. INYECTAR LA INTERFAZ DEL CHAT Y EL BOTÓN FLOTANTE
function inyectarChatUI() {
    if (document.getElementById('modulo-chat-interno')) return;

    const chatHTML = `
    <!-- BOTÓN FLOTANTE (Solo visible al iniciar sesión) -->
    <button id="btn-flotante-soporte" onclick="abrirChatSoporte()" class="fixed bottom-4 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.5)] flex justify-center items-center hover:bg-blue-700 hover:scale-105 transition-all z-[9999998] hidden">
        <i class="fas fa-comments text-2xl"></i>
    </button>

    <!-- VENTANA DE CHAT -->
    <div id="modulo-chat-interno" class="hidden fixed bottom-20 right-4 w-11/12 max-w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-[9999999]" style="height: 400px; display: none;">
        <!-- Cabecera -->
        <div class="bg-blue-600 p-3 flex justify-between items-center text-white">
            <div class="flex items-center gap-2">
                <i class="fas fa-headset text-xl"></i>
                <div>
                    <h3 class="font-black text-sm leading-none">Soporte en Vivo</h3>
                    <p class="text-[10px] text-blue-200">En línea (9am - 11pm)</p>
                </div>
            </div>
            <button onclick="cerrarChatSoporte()" class="hover:text-red-300 transition"><i class="fas fa-times text-lg"></i></button>
        </div>
        
        <!-- Área de mensajes -->
        <div id="chat-mensajes-area" class="flex-1 p-3 bg-gray-50 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
            <div class="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none w-10/12 shadow-sm">
                <p class="text-xs text-gray-700 font-bold">¡Hola! \u{1F916} ¿En qué podemos ayudarte el día de hoy? Si es sobre un pago, recuerda indicarnos los últimos 5 dígitos de referencia, banco y monto.</p>
            </div>
        </div>
        
        <!-- Área de envío -->
        <div class="p-2 border-t border-gray-200 bg-white flex gap-2">
            <input type="text" id="input-chat-usuario" placeholder="Escribe tu mensaje aquí..." class="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-lg text-xs outline-none focus:border-blue-500">
            <button onclick="enviarMensajeDesdeUsuario()" class="bg-blue-600 text-white w-10 h-10 rounded-lg flex justify-center items-center hover:bg-blue-700 transition">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

// 2. FUNCIONES PARA ABRIR/CERRAR Y ENVIAR
window.abrirChatSoporte = function() {
    const ventana = document.getElementById('modulo-chat-interno');
    if(ventana.style.display === 'none') {
        ventana.style.display = 'flex';
        cargarHistorialChat(); 
    } else {
        ventana.style.display = 'none';
    }
};

window.cerrarChatSoporte = function() {
    document.getElementById('modulo-chat-interno').style.display = 'none';
};

window.enviarMensajeDesdeUsuario = function() {
    const input = document.getElementById('input-chat-usuario');
    const texto = input.value.trim();
    if (!texto) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Debes iniciar sesión para usar el soporte.");
        return;
    }

    input.value = '';
    const area = document.getElementById('chat-mensajes-area');
    area.insertAdjacentHTML('beforeend', `
        <div class="bg-blue-500 text-white p-2 rounded-lg rounded-tr-none w-10/12 shadow-sm self-end">
            <p class="text-xs">${texto}</p>
        </div>
    `);
    area.scrollTop = area.scrollHeight;

    const telefonoUser = document.getElementById('auth-phone') ? document.getElementById('auth-phone').value : user.phoneNumber;
    
    firebase.database().ref('soporte_chats/' + user.uid).push({
        remitente: 'usuario',
        texto: texto,
        fecha: firebase.database.ServerValue.TIMESTAMP
    });

    firebase.database().ref('soporte_tickets/' + user.uid).update({
        telefono: telefonoUser || 'Desconocido',
        estado: 'pendiente',
        ultimo_mensaje: texto,
        fecha_actualizacion: firebase.database.ServerValue.TIMESTAMP
    });
};

function cargarHistorialChat() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const area = document.getElementById('chat-mensajes-area');
    // Para no duplicar eventos, limpiamos primero y volvemos a cargar (simplificado para el inyector)
    area.innerHTML = `
        <div class="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none w-10/12 shadow-sm mb-2">
            <p class="text-xs text-gray-700 font-bold">¡Hola! \u{1F916} ¿En qué podemos ayudarte el día de hoy?</p>
        </div>`;
        
    firebase.database().ref('soporte_chats/' + user.uid).limitToLast(20).once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            if (msg.remitente === 'admin') {
                area.insertAdjacentHTML('beforeend', `
                    <div class="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none w-10/12 shadow-sm mb-2">
                        <p class="text-xs text-gray-700"><b>Soporte:</b> ${msg.texto}</p>
                    </div>
                `);
            } else if (msg.remitente === 'usuario') {
                area.insertAdjacentHTML('beforeend', `
                    <div class="bg-blue-500 text-white p-2 rounded-lg rounded-tr-none w-10/12 shadow-sm self-end mb-2">
                        <p class="text-xs">${msg.texto}</p>
                    </div>
                `);
            }
        });
        area.scrollTop = area.scrollHeight;
    });
}

// 3. EL SECUESTRADOR DE WHATSAPP (Mantenemos esto activo por si acaso)
function interceptarWhatsApp() {
    const botonesWhatsApp = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], #btn-support-manual');
    botonesWhatsApp.forEach(boton => {
        if (!boton.dataset.secuestrado) {
            boton.removeAttribute('href');
            boton.removeAttribute('target');
            if (boton.id === 'btn-support-manual') {
                boton.innerHTML = '<i class="fas fa-headset mr-2"></i> Reportar por Chat Interno';
                boton.className = "hidden block w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-2 text-center text-sm shadow-md";
            }
            boton.onclick = function(e) {
                e.preventDefault();
                // Si la ventana está cerrada, la abrimos
                document.getElementById('modulo-chat-interno').style.display = 'flex';
                cargarHistorialChat();
            };
            boton.dataset.secuestrado = "true";
        }
    });
}

// 4. DETECTOR DE INICIO DE SESIÓN
function activarDetectorSesion() {
    firebase.auth().onAuthStateChanged(function(user) {
        const btnFlotante = document.getElementById('btn-flotante-soporte');
        if (btnFlotante) {
            if (user) {
                // El usuario inició sesión -> Mostramos el botón de soporte
                btnFlotante.classList.remove('hidden');
            } else {
                // No hay sesión -> Ocultamos el botón y cerramos el chat por seguridad
                btnFlotante.classList.add('hidden');
                cerrarChatSoporte();
            }
        }
    });
}

// 5. INICIALIZADOR MÁGICO
window.addEventListener('load', () => {
    inyectarChatUI();
    activarDetectorSesion(); // Activamos la escucha de Firebase Auth
    setInterval(interceptarWhatsApp, 1000); 
});
