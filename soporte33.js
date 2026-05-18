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
            <button onclick="cerrarChatSoporte()" class="hover:text-red-300 transition"><i class="fas fa-times text-lg"></i></button>
        </div>
        
        <!-- Área de mensajes -->
        <div id="chat-mensajes-area" class="flex-1 p-3 bg-gray-50 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
            <div class="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none w-11/12 shadow-sm">
                <p class="text-xs text-gray-700 font-bold mb-2">¡Hola! 🤖 ¿En qué podemos ayudarte el día de hoy?</p>
                
                <!-- BOTONES DE PRESELECCIÓN -->
                <div id="opciones-preseleccion" class="flex flex-col gap-2 mt-2 border-t border-gray-100 pt-2">
                    <button onclick="seleccionarOpcionChat('💳 Reportar un pago manual')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">💳 Reportar un pago manual</button>
                    <button onclick="seleccionarOpcionChat('💸 Duda sobre retiros')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">💸 Duda sobre retiros</button>
                    <button onclick="seleccionarOpcionChat('🎁 Pregunta sobre Racha/Bonos')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">🎁 Pregunta sobre Racha/Bonos</button>
                    <button onclick="seleccionarOpcionChat('💬 Hablar con un operador')" class="bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold p-2 rounded-lg text-left hover:bg-blue-100 transition shadow-sm">💬 Hablar con un operador</button>
                </div>
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

// 3. LÓGICA DE CHAT Y FIREBASE
let historialCargado = false;
let isFirstLoad = true;
let autoRespuestaEnviada = false;

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

    // Imprimir localmente rápido el mensaje del usuario
    const area = document.getElementById('chat-mensajes-area');
    area.insertAdjacentHTML('beforeend', `
        <div class="bg-blue-500 text-white p-2 rounded-lg rounded-tr-none w-10/12 shadow-sm self-end mb-2">
            <p class="text-xs">${texto}</p>
        </div>
    `);
    area.scrollTop = area.scrollHeight;

    const telefonoUser = document.getElementById('auth-phone') ? document.getElementById('auth-phone').value : user.phoneNumber;
    
    // Guardar en base de datos el mensaje del usuario
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

    // Lógica de Respuesta Automática y Horarios
    if (!autoRespuestaEnviada) {
        autoRespuestaEnviada = true; 
        
        setTimeout(() => {
            const horaActual = new Date().getHours();
            let mensajeAutomatico = "";

            // Si está entre las 9:00 AM (9) y las 10:59 PM (22)
            if (horaActual >= 9 && horaActual < 23) {
                mensajeAutomatico = "⏳ Hemos recibido tu solicitud. Un operador validará tus datos. <b>Tiempo estimado de respuesta: ~15 minutos.</b>";
            } else {
                // Fuera de horario
                mensajeAutomatico = "🌙 En este momento estamos fuera de nuestro horario de atención (9:00 AM a 11:00 PM). Tu solicitud fue registrada y serás el primero en ser atendido mañana a primera hora.";
            }

            // Guardar auto-respuesta en Firebase para que quede en el historial
            firebase.database().ref('soporte_chats/' + user.uid).push({
                remitente: 'admin',
                texto: mensajeAutomatico,
                fecha: firebase.database.ServerValue.TIMESTAMP
            });

        }, 1500); // 1.5 segundos de retraso para que se vea natural
    }
}

function cargarHistorialChat() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    historialCargado = true;
    const area = document.getElementById('chat-mensajes-area');
    
    // Escuchar mensajes nuevos en tiempo real
    firebase.database().ref('soporte_chats/' + user.uid).limitToLast(20).on('child_added', (snapshot) => {
        const msg = snapshot.val();
        
        // Evitamos que pinte de nuevo lo que acabamos de enviar nosotros localmente
        if(Date.now() - msg.fecha < 2000 && msg.remitente === 'usuario') return; 

        if (msg.remitente === 'admin') {
            area.insertAdjacentHTML('beforeend', `
                <div class="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none w-10/12 shadow-sm mb-2">
                    <p class="text-[10px] text-gray-400 font-bold mb-1">Soporte Texier</p>
                    <p class="text-xs text-gray-800">${msg.texto}</p>
                </div>
            `);
            
            // Si el chat está cerrado y no es la carga inicial, notificar
            if (!isFirstLoad && document.getElementById('modulo-chat-interno').style.display === 'none') {
                document.getElementById('notif-badge').classList.remove('hidden');
                reproducirSonidoNotificacion();
            }
        } else if (msg.remitente === 'usuario') {
            // Si cargamos un historial viejo, también ocultamos los botones de preselección
            const preselecciones = document.getElementById('opciones-preseleccion');
            if(preselecciones) preselecciones.style.display = 'none';

            // Si hay historial previo, asumimos que ya se le dio la auto-respuesta en el pasado
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

// 4. EL SECUESTRADOR DE WHATSAPP Y ERROR 5
function interceptarWhatsApp() {
    const botonesWhatsApp = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], #btn-support-manual');
    botonesWhatsApp.forEach(boton => {
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
}

// 5. DETECTOR DOBLE DE INICIO DE SESIÓN
function activarDetectorSesion() {
    const btnFlotante = document.getElementById('btn-flotante-soporte');
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            btnFlotante.classList.remove('hidden');
            if(!historialCargado) cargarHistorialChat(); 
        } else {
            btnFlotante.classList.add('hidden');
            cerrarChatSoporte();
        }
    });

    setInterval(() => {
        const loggedInArea = document.getElementById('logged-in-area');
        if (loggedInArea && loggedInArea.style.display !== 'none' && !loggedInArea.classList.contains('hidden')) {
            btnFlotante.classList.remove('hidden');
        }
    }, 1500);
}

// 6. INICIALIZADOR MÁGICO
window.addEventListener('load', () => {
    inyectarChatUI();
    activarDetectorSesion();
    setInterval(interceptarWhatsApp, 1000); 
});
