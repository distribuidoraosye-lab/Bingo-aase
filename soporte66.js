// 1. INYECTAR LA INTERFAZ DEL CHAT Y EL BOTÓN FLOTANTE
function inyectarChatUI() {
    if (document.getElementById('modulo-chat-interno')) return;

    const chatHTML = `
    <!-- BOTÓN FLOTANTE -->
    <button id="btn-flotante-soporte" onclick="abrirChatSoporte()" class="fixed bottom-4 right-4 bg-blue-600 text-white px-5 py-3 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.5)] flex justify-center items-center gap-2 hover:bg-blue-700 hover:scale-105 transition-all z-[9999998] hidden animate-pulse border-2 border-blue-400">
        <i class="fas fa-headset text-xl"></i>
        <span class="font-black text-sm tracking-wide">Soporte</span>
        <span id="notif-badge" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">!</span>
    </button>

    <!-- VENTANA DE CHAT -->
    <div id="modulo-chat-interno" class="hidden fixed bottom-20 right-4 w-11/12 max-w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-[9999999]" style="height: 450px; display: none;">
        <!-- Cabecera -->
        <div class="bg-blue-600 p-3 flex justify-between items-center text-white">
            <div class="flex items-center gap-2">
                <i class="fas fa-headset text-xl"></i>
                <div>
                    <h3 class="font-black text-sm leading-none">Soporte en Vivo</h3>
                    <p class="text-[10px] text-blue-200">En línea (9am - 11pm)</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <!-- Botón Limpiar Chat -->
                <button onclick="borrarHistorialChat()" class="hover:text-yellow-300 transition" title="Limpiar y reiniciar chat"><i class="fas fa-trash-alt text-sm"></i></button>
                <button onclick="cerrarChatSoporte()" class="hover:text-red-300 transition"><i class="fas fa-times text-lg"></i></button>
            </div>
        </div>
        
        <!-- Área de mensajes -->
        <div id="chat-mensajes-area" class="flex-1 p-3 bg-gray-50 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
            <!-- El contenido se inyecta por JS -->
        </div>
        
        <!-- Área de envío -->
        <div class="p-2 border-t border-gray-200 bg-white flex gap-2">
            <input type="text" id="input-chat-usuario" placeholder="Escribe tu mensaje aquí..." class="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-lg text-xs outline-none focus:border-blue-500" onkeypress="if(event.key === 'Enter') enviarMensajeDesdeUsuario()">
            <button onclick="enviarMensajeDesdeUsuario()" class="bg-blue-600 text-white w-10 h-10 rounded-lg flex justify-center items-center hover:bg-blue-700 transition">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

// 2. SINTETIZADOR DE SONIDO (Bloop)
function reproducirSonidoNotificacion() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch(e) { console.log("Audio no soportado"); }
}

// 3. LÓGICA DE CHAT Y FIREBASE (Con control estricto de caché)
let historialCargado = false;
let isFirstLoad = true;
let autoRespuestaEnviada = false;
let currentChatListenerUid = null; // Guarda quién es el dueño del chat actual

// Función vital para resetear la pantalla al salir o al limpiar
window.limpiarChatLocal = function() {
    const area = document.getElementById('chat-mensajes-area');
    if(area) {
        area.innerHTML = `
            <div class="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none w-11/12 shadow-sm">
                <p class="text-xs text-gray-700 font-bold mb-2">¡Hola! 🤖 ¿En qué podemos ayudarte el día de hoy?</p>
                <div id="opciones-preseleccion" class="flex flex-col gap-2 mt-2 border-t border-gray-100 pt-2">
                    <button onclick="seleccionarOpcionChat('💳 Reportar un pago manual')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">💳 Reportar un pago manual</button>
                    <button onclick="seleccionarOpcionChat('💸 Duda sobre retiros')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">💸 Duda sobre retiros</button>
                    <button onclick="seleccionarOpcionChat('🎁 Pregunta sobre Racha/Bonos')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">🎁 Pregunta sobre Racha/Bonos</button>
                    <button onclick="seleccionarOpcionChat('💬 Hablar con un operador')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">💬 Hablar con un operador</button>
                </div>
            </div>
        `;
    }
    historialCargado = false;
    isFirstLoad = true;
    autoRespuestaEnviada = false;
};

// Función para que el usuario borre su propio historial
window.borrarHistorialChat = function() {
    if(confirm("¿Deseas vaciar este chat para iniciar una nueva consulta?")) {
        const user = firebase.auth().currentUser;
        if(user) {
            firebase.database().ref('soporte_chats/' + user.uid).remove(); // Lo borra de la BD
        }
        limpiarChatLocal(); // Lo borra de la pantalla
    }
};

window.abrirChatSoporte = function() {
    const ventana = document.getElementById('modulo-chat-interno');
    document.getElementById('notif-badge').classList.add('hidden'); 

    if(ventana.style.display === 'none' || ventana.style.display === '') {
        ventana.style.display = 'flex';
        if (!historialCargado) cargarHistorialChat(); 
    } else {
        ventana.style.display = 'none';
    }
};

window.cerrarChatSoporte = function() {
    document.getElementById('modulo-chat-interno').style.display = 'none';
};

window.seleccionarOpcionChat = function(textoOpcion) {
    const preselecciones = document.getElementById('opciones-preseleccion');
    if(preselecciones) preselecciones.style.display = 'none'; 
    enviarMensaje(textoOpcion);
};

window.enviarMensajeDesdeUsuario = function() {
    const input = document.getElementById('input-chat-usuario');
    const texto = input.value.trim();
    if (!texto) return;
    input.value = '';
    
    const preselecciones = document.getElementById('opciones-preseleccion');
    if(preselecciones) preselecciones.style.display = 'none'; 

    enviarMensaje(texto);
};

function enviarMensaje(texto) {
    const user = firebase.auth().currentUser;
    if (!user) return alert("Debes iniciar sesión para usar el soporte.");

    const area = document.getElementById('chat-mensajes-area');
    area.insertAdjacentHTML('beforeend', `
        <div class="bg-blue-500 text-white p-2 rounded-lg rounded-tr-none w-10/12 shadow-sm self-end mb-2">
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

    if (!autoRespuestaEnviada) {
        autoRespuestaEnviada = true; 
        
        setTimeout(() => {
            const horaActual = new Date().getHours();
            let mensajeAutomatico = "";

            if (horaActual >= 9 && horaActual < 23) {
                mensajeAutomatico = "⏳ Hemos recibido tu solicitud. Un operador revisará tu caso. <b>Tiempo estimado de respuesta: ~15 minutos.</b>";
            } else {
                mensajeAutomatico = "🌙 En este momento estamos fuera de nuestro horario de atención (9:00 AM a 11:00 PM). Tu solicitud fue registrada y serás el primero en ser atendido mañana a primera hora.";
            }

            firebase.database().ref('soporte_chats/' + user.uid).push({
                remitente: 'admin',
                texto: mensajeAutomatico,
                fecha: firebase.database.ServerValue.TIMESTAMP
            });

        }, 1500); 
    }
}

function cargarHistorialChat() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    historialCargado = true;
    const area = document.getElementById('chat-mensajes-area');
    
    firebase.database().ref('soporte_chats/' + user.uid).limitToLast(20).on('child_added', (snapshot) => {
        const msg = snapshot.val();
        
        if(Date.now() - msg.fecha < 2000 && msg.remitente === 'usuario') return; 

        if (msg.remitente === 'admin') {
            area.insertAdjacentHTML('beforeend', `
                <div class="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none w-10/12 shadow-sm mb-2">
                    <p class="text-[10px] text-gray-400 font-bold mb-1">Soporte Texier</p>
                    <p class="text-xs text-gray-800">${msg.texto}</p>
                </div>
            `);
            
            if (!isFirstLoad && document.getElementById('modulo-chat-interno').style.display === 'none') {
                document.getElementById('notif-badge').classList.remove('hidden');
                reproducirSonidoNotificacion();
            }
        } else if (msg.remitente === 'usuario') {
            const preselecciones = document.getElementById('opciones-preseleccion');
            if(preselecciones) preselecciones.style.display = 'none';

            autoRespuestaEnviada = true;

            area.insertAdjacentHTML('beforeend', `
                <div class="bg-blue-500 text-white p-2 rounded-lg rounded-tr-none w-10/12 shadow-sm self-end mb-2">
                    <p class="text-xs">${msg.texto}</p>
                </div>
            `);
        }
        area.scrollTop = area.scrollHeight;
    });

    setTimeout(() => { isFirstLoad = false; }, 1500);
}

// 4. EL SECUESTRADOR SUPREMO DE WHATSAPP
function interceptarWhatsApp() {
    const enlaces = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp.com"], #btn-support-manual');
    enlaces.forEach(boton => {
        if (!boton.dataset.secuestrado) {
            boton.removeAttribute('href');
            boton.removeAttribute('target');
            if (boton.id === 'btn-support-manual') {
                boton.innerHTML = '<i class="fas fa-headset mr-2"></i> Reportar por Chat Interno';
                boton.className = "hidden block w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-2 text-center text-sm shadow-md animate-pulse";
            }
            boton.onclick = function(e) {
                e.preventDefault();
                abrirChatSoporte();
            };
            boton.dataset.secuestrado = "true";
        }
    });

    const botonesDinamicos = document.querySelectorAll('button, div.swal2-confirm, div.swal-button, .swal2-html-container a');
    botonesDinamicos.forEach(btn => {
        const onclk = btn.getAttribute('onclick') || '';
        const htmlLower = btn.innerHTML.toLowerCase();
        
        if (!btn.dataset.secuestrado && (onclk.includes('wa.me') || onclk.includes('api.whatsapp') || (htmlLower.includes('whatsapp') && (htmlLower.includes('retiro') || htmlLower.includes('soporte') || htmlLower.includes('contactar'))))) {
            if(btn.tagName === 'A') {
                btn.removeAttribute('href');
                btn.removeAttribute('target');
            }
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation(); 
                abrirChatSoporte();
            };
            btn.dataset.secuestrado = "true";
        }
    });
}

if (!window.whatsappIntercepted) {
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
        if (url && (url.includes('wa.me') || url.includes('api.whatsapp.com') || url.includes('whatsapp.com'))) {
            abrirChatSoporte();
            return null; 
        }
        return originalWindowOpen.call(window, url, target, features);
    };
    window.whatsappIntercepted = true;
}

// 5. DETECTOR DOBLE DE INICIO DE SESIÓN CON CORRECCIÓN DE CACHÉ
function activarDetectorSesion() {
    const btnFlotante = document.getElementById('btn-flotante-soporte');
    
    // Inyectamos el HTML base la primera vez que se carga el script
    limpiarChatLocal();

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            btnFlotante.classList.remove('hidden');
            
            // CORRECCIÓN DEL CACHÉ: Si entra un usuario diferente, borramos la memoria
            if (currentChatListenerUid !== user.uid) {
                if (currentChatListenerUid) {
                    firebase.database().ref('soporte_chats/' + currentChatListenerUid).off('child_added');
                }
                limpiarChatLocal(); // Limpia la pantalla
                currentChatListenerUid = user.uid; // Actualiza el dueño del teléfono
            }

            if(!historialCargado) cargarHistorialChat(); 

        } else {
            // CUANDO CIERRAN SESIÓN: Desconectamos todo.
            btnFlotante.classList.add('hidden');
            cerrarChatSoporte();
            
            if (currentChatListenerUid) {
                firebase.database().ref('soporte_chats/' + currentChatListenerUid).off('child_added');
                currentChatListenerUid = null;
            }
            limpiarChatLocal(); // Destruye el historial de la pantalla
        }
    });

    setInterval(() => {
        const loggedInArea = document.getElementById('logged-in-area');
        if (loggedInArea && loggedInArea.style.display !== 'none' && !loggedInArea.classList.contains('hidden')) {
            btnFlotante.classList.remove('hidden');
        }
    }, 1500);
}

// 6. INICIALIZADOR MÁGICO Y OJO DE HALCÓN
window.addEventListener('load', () => {
    inyectarChatUI();
    activarDetectorSesion();
    
    interceptarWhatsApp();
    setInterval(interceptarWhatsApp, 1000); 

    const observer = new MutationObserver(() => {
        interceptarWhatsApp();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
