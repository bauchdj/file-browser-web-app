if( !jsl ) {
	var jsl = {};
}

jsl.util = {};
	jsl.util.dbg = function () {

	var sz = "";
	var cache = [];
	for( var i = 0 ; i < arguments.length ; i++ ) {
		if( typeof arguments[i] === 'object' ) {
		sz += JSON.stringify(arguments[i], function(key, value) {
			if( typeof value === 'function' ) {
			return "FUNCTION";
			}
			if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) {
				return; // Circular reference found, discard key
			}
			// Store value in our collection
			cache.push(value);
			}
			return value;
		}, 2);
		}
		else {
		sz += arguments[i];
		}
	}
	console.log(sz);
	};

jsl.util.trim = function (s) {
	if( !s ) {
		return "";
	}
	if( !s.replace ) {
		return "" + s;
	}
	return s.replace(/^\s+|\s+$/g,'');
};

jsl.util.dumpStackTrace = function () {
	var getStackTrace = function() {
	var obj = {};
	if( Error && Error.captureStackTrace ) {
		Error.captureStackTrace(obj, getStackTrace);
		return obj.stack;
		};
		return " no stack trace";
	};
	console.log(getStackTrace());
};

jsl.dom = { addComments:false };
jsl.dom.uniqueId = 1000;
jsl.dom.DOMId = function () {
	jsl.dom.uniqueId++;
	return "d" + jsl.dom.uniqueId;
};

jsl.dom.init = function ( obj ) {
	document.onmousedown = function (e) {
		jsl.dom.mouseX = e.clientX;
		jsl.dom.mouseY = e.clientY;
				if( jsl.dom.popUpMenu ) {
					window.setTimeout( function () {
					jsl.dom.popUpMenu.parentNode.removeChild( jsl.dom.popUpMenu );
					delete jsl.dom.popUpMenu;
					}, 100 );
				}
	};
	jsl.dom.body = document.getElementsByTagName( "BODY" )[0];
};

jsl.dom.knownTags = {
	div:'text',
	span:'text',
	label:'text',
	a:'text',
	button:'text',
	img:'src',
	p:'text',
	h1:'text',
	h2:'text',
	h3:'text',
	h4:'text',
	h5:'text',
	h6:'text',
	form:'action',
	iframe:'name',
	input:'type',
	ul:'class',
	li:'class',
	i:'class',
	b:'class',
	table:'class',
	thead:'class',
	tbody:'class',
	tr:'class',
	th:'text',
	td:'text'
};

jsl.dom.recognizeTag = function (obj) {
	for( var t in jsl.dom.knownTags ) {
		if( obj[t] !== undefined ) {
			obj.tag = t;
			if( typeof obj[t] === 'string' ) {
				obj[jsl.dom.knownTags[t]] = obj[t];
			}
			else {
				//dbg( "set children:", obj[t]);
				obj.children = obj[t];
			}
			delete obj[t];
			break;
		}
	}
};

jsl.dom.highlightCanvas = function (dst, width, height) {
	if( !jsl.dom.hlCanvas ) {
		jsl.dom.hlCanvas = { tag:"canvas", width:width, height:height, style:{ left:0, top:0, display:"none" } };
		jsl.dom.add(dst, jsl.dom.hlCanvas);
		//jsl.dom.hlCanvas.el.style.position = "absolute";
		//jsl.dom.hlCanvas.el.style.left = "0px";
		//jsl.dom.hlCanvas.el.style.top = "0px";
		//jsl.dom.hlCanvas.el.style.display = "none";
	}
};

jsl.dom.scrollIntoView = function (elem) {
	var docViewTop = $(window).scrollTop();
	var docViewBottom = docViewTop + $(window).height();

	var elemTop = $(elem).offset().top;
	var elemBottom = elemTop + $(elem).height();

	if( !(elemBottom <= docViewBottom) && (elemTop >= docViewTop) ) {
		var pn = elem;
		while( pn && pn.parentNode ) {
			pn = pn.parentNode;
			console.log(pn.tagName);
			console.log(pn.style["overflow-y"]);
			if( pn.style["overflow-y"] === "auto" ) break;
		}
		if( pn.style["overflow-y"] === "auto" ) {
			pn.scrollTop += 70;
console.log("scrolled 70");
			jsl.dom.scrollIntoView(elem);
			for( var f in window.highlightIds ) {
				if( f.indexOf("main.links.") !== 0 ) { // main links do nto move
					var hlEl = window.highlightIds[f].highlightEl;
					if( hlEl ) {
						hlEl.style.top = (parseInt(hlEl.style.top) - 70) + "px";
					}
				}
			}
		}
	}
};

jsl.dom.highlight = function (id) {
	console.log("jsl.dom.highlight: " + id);
	if( !window.highlightIds[id] ) {
	//window.alert("ID missing: " + id);
		return setTimeout(function () {
			jsl.dom.highlight(id);
		}, 1000);
	}
try {
	var drawEllipse = function (ctx, rect) {
		jsl.util.dbg("drawEllipse: ", rect);
		var body = document.getElementsByTagName("BODY")[0];
		var hl = { div:"", style:{
			left:rect.left,
			top:rect.top,
			width:rect.width,	
			height:rect.height,	
			border:"2px red solid",
			borderRadius:9
		}};
		jsl.dom.add(body, hl);
		return hl.el;
/**
		var x = rect.left;
		var y = rect.top;
		var w = rect.width;
		var h = rect.height;
		var kappa = .5522848,
		ox = (w / 2) * kappa, // control point offset horizontal
		oy = (h / 2) * kappa, // control point offset vertical
		xe = x + w,			 // x-end
		ye = y + h,			 // y-end
		xm = x + w / 2,		 // x-middle
		ym = y + h / 2;		 // y-middle

		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		//ctx.closePath(); // not used correctly, see comments (use to close off open path)
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
**/
	};

	var drawSquare = function (ctx, rect) {
		ctx.beginPath();
		ctx.moveTo(rect.left, rect.top);
		ctx.lineTo(rect.left+rect.width, rect.top);
		ctx.lineTo(rect.left+rect.width, rect.top+rect.height);
		ctx.lineTo(rect.left, rect.top+rect.height);
		ctx.lineTo(rect.left, rect.top);
		ctx.lineWidth = 4;
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
	};

	var el = window.highlightIds[id].el;
	if( el ) {
		if( window.highlightIds[id].scroll ) {
			window.highlightIds[id].scroll(el);
		}
		else {
			jsl.dom.scrollIntoView(el);
		}

		var rect = {}, r = el.getBoundingClientRect();
		rect.left = r.left;
		rect.top = r.top;
		rect.width = r.width;
		rect.height = r.height;
		
		jsl.util.dbg(el.tagName, rect);
		//window.alert(JSON.stringify(rect));
	
		rect.left -= window.highlightIds[id].x;
		rect.width += (2*window.highlightIds[id].x);
		rect.top -= window.highlightIds[id].y;
		rect.height += (2*window.highlightIds[id].y);
	
		['left', 'width', 'top', 'height'].forEach(function (d) {
			if( window.highlightIds[id][d] ) {
				rect[d] += window.highlightIds[id][d];
			}
		});
		
		jsl.util.dbg(el.tagName, rect);
		jsl.dom.hlCanvas.el.style.display = "block";
		var ctx = jsl.dom.hlCanvas.el.getContext("2d");
		//drawSquare(ctx, rect);
		var hlEl = drawEllipse(ctx, rect);
		window.highlightIds[id].highlightEl = hlEl;
	}
}
catch (pe) {
	window.alert(pe);
}
};

jsl.terms = {
	"Home / Intro":{
		sp:"Introducción"
	},
	Dashboard:{
		sp:"Tablero"
	},
	"iOS Policies":{
		sp:"iOS Políticas"
	},
	"Android Policies":{
		sp:"Androide Políticas"
	},
	"Groups and Users":{
		sp:"Grupos y usuarios"
	},
	"Users":{
		sp:"Usuarios"
	},
	"Groups":{
		sp:"Grupos"
	},
	"Devices":{
		sp:"Dispositivos"
	},
	"Support / Feedback":{
		sp:"Apoyo"
	},
	"How To Pages":{
		sp:"Instrucciones"
	},
	"Preferences":{
		sp:"Preferencias"
	},
	"Current page":{
		sp:"Página actual"
	},
	"Records per page":{
		sp:"Registros por página"
	},
	"Remove sort":{
		sp:"Eliminar orden"
	},
	"Sort":{	
		sp:"Ordenar"
	},
	"Please enter password":{
		sp:"Por favor, ingrese contraseña"
	},
	"Passwords do not match":{
		sp:"Las contraseñas no coinciden"
	},
	"An error occurred.":{
		sp:"Ocurrió un error."
	},
	"Success":{
		sp:"Éxito"
	},
	"You will receive an email shortly with a link to reset your password.": {
		sp:"En breve recibirá un correo electrónico con un enlace para restablecer su contraseña."
	},
	"User not found, please check the email address.":{
		sp:"Usuario no encontrado, verifique la dirección de correo electrónico."
	},
	"Admin only":{
		sp:"Solo administrador"
	},
	"Only an account administrator can edit billing information.":{
		sp:"Solo un administrador de cuenta puede editar la información de facturación."
	},
	"Expiration Format":{
		sp:"Formato de vencimiento"
	},
	"Please enter the Credit Card Expiration in the format of MM/YY":{
		sp:"Ingrese el vencimiento de la tarjeta de crédito en el formato de MM / AA"
	},
	"Invalid Verification Code":{
		sp:"Código de verificación invalido"
	},
	"Invalid email or password.":{
		sp:"Correo electrónico o contraseña no válidos"
	},
	"Please enter email":{
		sp:"Por favor, ingrese su correo electrónico"
	},
	"Please enter password":{
		sp:"Por favor, ingrese contraseña"
	},
	"Please enter an email address.":{
		sp:"Por favor introduzca una dirección de correo eléctronico."
	},
	"Invalid password.":{
		sp:"Contraseña invalida."
	},
	"The file upload failed.":{
		sp:"La carga del archivo falló."
	},
	"Android Enterprise Required":{
		sp:"Se requiere Android Enterprise"
	},
	Status:{
		sp:"Estado"
	},
	Actions:{
		sp:"Comportamiento"
	},
	"URL for Apple Configurator":{
		sp:"URL para Apple Configurator"
	},
	"This control allows you to choose from all of the various settings, profiles and applications that make up this policy.":{
		sp:"Este control le permite elegir entre todas las diversas configuraciones, perfiles y aplicaciones que conforman esta política."
	},
	"Settings":{
		sp:"Configuraciones"
	},
	"Home Page":{
		sp:"Página de inicio"
	},
	"Please select another home page before removing this page.":{
		sp:"Seleccione otra página de inicio antes de eliminar esta página."
	},
	Required:{
		sp:"Necesario"
	},
	"Name and email are required":{
		sp:"Nombre y correo electrónico son obligatorios"
	},
	"Not Applicable":{
		sp:"No aplica"
	},
	"Vendor Configuration is not used by Always On VPNs.":{
		sp:"La configuración del proveedor no es utilizada por las VPN de Always On."
	},
	Error:{
		sp:"Error"
	},
	"The token upload failed.":{
		sp:"La carga del token ha fallado."
	},
	Missing:{
		sp:"Desaparecido"
	},
	"The URL is missing":{
		sp:"Falta la URL"
	},
	Clipboard:{
		sp:"Portapapeles"
	},
	"The MDM URL has been copied to your clipboard":{
		sp:"La URL de MDM se ha copiado en su portapapeles"
	},
	"Welcome, What Now?":{
		sp:"Bienvenido que ahora"
	},
	"Description":{
		sp:"Descripción"
	},
	"Statistics":{
		sp:"Estadísticas"
	},
	"Label and package are required.":{
		sp:"Se requiere etiqueta y paquete."
	},
	"Please move apps so that they fit within the new settings first.":{
		sp:"Mueva las aplicaciones para que se ajusten primero a la nueva configuración."
	},
	"The contact upload failed.":{
		sp:"La carga del contacto falló."
	},
	"Token Expiration":{
		sp:"Vencimiento del token"
	},
	"The token upload failed.":{
		sp:"La carga del token ha fallado."
	},
	"Incompatible":{
		sp:"Incompatible"
	},
	"Multi User and Supervised Mode are not compatible.	Supervised Mode is being turned off.":{
		sp:"El modo multiusuario y supervisado no son compatibles. El modo supervisado se está desactivando."
	},
	"Multi User and Supervised Mode are not compatible.	Multi User is being turned off.":{
		sp:"El modo multiusuario y supervisado no son compatibles. Multi Usuario se está apagando."
	},
	"Maintenance":{
		sp:"Mantenimiento"
	},
	"EzMDM is undergoing scheduled maintenance .. we will be back online in a few minutes":{
		sp:"EzMDM se encuentra en mantenimiento programado. Volveremos a estar en línea en unos minutos."
	},
	"The book upload failed.":{
		sp:"La carga del libro ha fallado."
	},
	"Supervised Only":{
		sp:"Solo supervisado"
	},
	"This feature is only available for Android devices and iOS devices that are supervised.":{
		sp:"Esta función solo está disponible para dispositivos Android y dispositivos iOS supervisados."
	},
	"Missing Code":{
		sp:"Código faltante"
	},
	"The Bypass Code is missing for this device. Without a code, no Activation Lock exists.":{
		sp:"Falta el código de omisión para este dispositivo. Sin un código, no existe el bloqueo de activación."
	},
	Cleared:{
		sp:"Despejado"
	},
	"The Activation Lock has been removed.":{
		sp:"Se ha eliminado el bloqueo de activación."
	},
	"App Inconsistencies":{
		sp:"Inconsistencias de la aplicación"
	},
	"Either a Message or Phone Number is required.":{
		sp:"Se requiere un mensaje o un número de teléfono."
	},
	"Android device identity is missing.	Apps from Play will not install.":{
		sp:"Falta la identidad del dispositivo Android. Las aplicaciones de Play no se instalarán."
	},
	"The MDM URL has been copied to your clipboard":{
		sp:"La URL de MDM se ha copiado en su portapapeles"
	},
	"Geocoding operation failed.":{
		sp:"La operación de geocodificación ha fallado."
	},
	"The LDAP sync initiated successfully":{
		sp:"La sincronización LDAP se inició correctamente"
	},
	Reason:{
		sp:"Razón"
	},
	"The LDAP sync failed.	Please check your LDAP settings":{
		sp:"La sincronización LDAP falló. Por favor verifique su configuración LDAP"
	},
	"The user upload failed.":{
		sp:"La carga del usuario falló."
	},
	"Not Allowed":{
		sp:"No permitido"
	},
	"You cannot disable your own ability to login":{
		sp:"No puede deshabilitar su propia capacidad para iniciar sesión"
	},
	"The user will receive an email with a new password.":{
		sp:"El usuario recibirá un correo electrónico con una nueva contraseña."
	},
	"Update API Key":{
		sp:"Actualizar clave de API"
	},
	"If you update the API Key, the current API Key will become invalid.	Do you still wish to update the API Key?":{
		sp:"Si actualiza la clave API, la clave API actual no será válida. ¿Todavía desea actualizar la clave API?"
	},
	"Create and download a new Certificate Signing Request?": {
		sp:"¿Crear y descargar una nueva solicitud de firma de certificado?"
	},
	"Clone Policy":{
		sp:"Política de clonación"
	},
	"Create a clone of this policy?":{
		sp:"¿Crear un clon de esta política?"
	},
	"Enterprise Enrollment":{
		sp:"Inscripción empresarial"
	},
	"Confirm Unenroll":{
		sp:"Confirmar cancelación de inscripción"
	},
	"Remove Logo":{
		sp:"Eliminar logotipo"
	},
	"Remove the custom logo?":{
		sp:"¿Eliminar el logotipo personalizado?"
	},
	"Show Logo":{
		sp:"Mostrar logotipo"
	},
	"Show the custom logo?":{
		sp:"Mostrar el logotipo personalizado?"
	},
	"Wifi Only":{
		sp:"Sólo wifi"
	},
	"Make this app available only on Wifi?":{
		sp:"¿Esta aplicación está disponible solo en Wifi?"
	},
	"Send Message":{
		sp:"Enviar mensaje"
	},
	"Do you really want to deactivate this device?":{
		sp:"¿Realmente quieres desactivar este dispositivo?"
	},
	"Do you really want to activate this device?":{
		sp:"¿Realmente quieres activar este dispositivo?"
	},
	"Restart this device now?":{
		sp:"¿Reiniciar este dispositivo ahora?"
	},
	"Disable App?":{
		sp:"¿Deshabilitar aplicación?"
	},
	"Disabling the wrong app can disable the device.	Do not do this unless you are sure.	Do you wish to continue?":{
		sp:"Deshabilitar la aplicación incorrecta puede deshabilitar el dispositivo. No haga esto a menos que esté seguro. ¿Desea continuar?"
	},
	"Clear Passcode":{
		sp:"Borrar contraseña"
	},
	"Reboot":{
		sp:"Reinicia"
	},
	"Reboot this device?":{
		sp:"Reinicia este dispositivo"
	},
	"Unlock":{
		sp:"Desbloquear"
	},
	"Remove the Activation Lock from the device?":{
		sp:"¿Eliminar el bloqueo de activación del dispositivo?"
	},
	"Restart this device now?":{
		sp:"¿Reiniciar este dispositivo ahora?"
	},
	"Shutdown this device now?":{
		sp:"¿Apagar este dispositivo ahora?"
	},
	"Wipe Device":{
		sp:"Limpiar dispositivo"
	},
	"Factory Reset this device?	Warning: Information may be lost!": {
		sp:"¿Restablecer de fábrica este dispositivo? Advertencia: ¡se puede perder información!"
	},
	"You can click this icon to factory reset the device.":{
		sp:"Puede hacer clic en este icono para restablecer de fábrica el dispositivo"
	},
	"Note: the device must be able to receive a Push Notification which will not happen if the device is offline.":{
		sp:"Nota: el dispositivo debe poder recibir una notificación push que no sucederá si el dispositivo está fuera de línea."
	},
	"Move Geofence":{
		sp:"Mover Geofence"
	},
	"Move geofence to the center of the map?":{
		sp:"Mover geofence al centro del mapa?"
	},
	"Missing Snapshot":{
		sp:"Instantánea faltante"
	},
	"Invite Users":{
		sp:"Invitar a usuarios"
	},
	"Invite users of this group to enroll?":{
		sp:"¿Invitar a los usuarios de este grupo a inscribirse?"
	},
	"Invite only users not previously invited?":{
		sp:"¿Invitar solo a usuarios no invitados anteriormente?"
	},
	"Disable user's ability to login to the console?":{
		sp:"¿Deshabilitar la capacidad del usuario para iniciar sesión en la consola?"
	},
	"Invite user to enroll a device?":{
		sp:"¿Invitar al usuario a inscribir un dispositivo?"
	},
	"Reset user's password?":{
		sp:"Restablecer contraseña del usuario?"
	},
	"Send enrollment invitations to all users of this group?":{
		sp:"¿Enviar invitaciones de inscripción a todos los usuarios de este grupo?"
	},
	"Remove Work Profile or Factory Reset the device":{
		sp:"Eliminar perfil de trabajo o restablecer de fábrica el dispositivo"
	},
	"Enable location services for this device": {
		sp:"Habilitar servicios de ubicación para este dispositivo"
	},
	"You can click this icon to view the settings and configuration received from the device.":{
		sp:"Puede hacer clic en este icono para ver la configuración y la configuración recibidas del dispositivo."
	},
	"You can click this icon to send the device a Push Notification that causes the device to contact EzMDM for its new settings.":{
		sp:"Puede hacer clic en este icono para enviar al dispositivo una Notificación Push que haga que el dispositivo se contacte con EzMDM para su nueva configuración."
	},
	"You can click this icon to access more actions":{
		sp:"Puede hacer clic en este icono para acceder a más acciones."
	},
	"Assign device to another user": {
		sp:"Asignar dispositivo a otro usuario"
	},
	"Lock this device":{
		sp:"Bloquear este dispositivo"
	},
	"Remove Work Profile or Factory Reset the device":{
		sp:"Eliminar perfil de trabajo o restablecer de fábrica el dispositivo"
	},
	"Enable location services for this device":{
		sp:"Habilitar servicios de ubicación para este dispositivo"
	},
	"Show Apple Business Manager device list":{
		sp:"Mostrar la lista de dispositivos de Apple Business Manager"
	},
	"Sync devices with Apple Business Manager":{
		sp:"Sincronizar dispositivos con Apple Business Manager"
	},
	"Enroll this iOS device": {
		sp:"Inscriba este dispositivo iOS"
	},
	"Export these devices":{
		sp:"Exportar estos dispositivos"
	},
	"Click this button to configure this list":{
		sp:"Haga clic en este botón para configurar esta lista"
	},
	"Click this button to refresh the list.":{
		sp:"Haga clic en este botón para actualizar la lista."
	},
	"Factory Reset the device":{
		sp:"Restablecimiento de fábrica del dispositivo"
	},
	"Disable location services for this device":{
		sp:"Deshabilitar los servicios de ubicación para este dispositivo"
	},
	"Click this button to add a new record to this list.":{
		sp:"Haga clic en este botón para agregar un nuevo registro a esta lista."
	},
	"Click this button to edit the list. This is how you remove a record from the list.":{
		sp:"Haga clic en este botón para editar la lista. Así es como elimina un registro de la lista."
	},
	"View overview of this policy":{
		sp:"Ver descripción general de esta política"
	},
	"Clone this policy":{
		sp:"Clonar esta política"
	},
	"Create a snapshot of this policy": {
		sp:"Crear una instantánea de esta política"
	},
	"Click this button to reveal what items are included in the policy":{
		sp:"Haga clic en este botón para revelar qué elementos están incluidos en la política."
	},
	"There is no Policy Snapshot for this policy":{
		sp:"No hay una instantánea de política para esta política"
	},
	"Click this button to search for a user":{
		sp:"Haga clic en este botón para buscar un usuario."
	},
	"Show map of all devices":{
		sp:"Mostrar mapa de todos los dispositivos"
	}
};

jsl.language = "en";

jsl.cw = function (from) {
	var o = jsl.terms[from];
	if( !o ) return from;
	if( !o[jsl.language] ) return from;
	return o[jsl.language];
};

jsl.dom.add = function ( pnode, obj, beforeRef ) {
	//jsl.util.dbg("ADD:", obj);
	try {
		if( !jsl.dom.body ) {
			jsl.dom.init();
		}
	
		//dbg("subParse", obj);
		if( typeof obj === 'string' && obj.substring(0,8) === 'function' ) {
			var fn;
			eval("fn = " + obj);
			dbg("FN:", typeof fn);
			obj = fn();
		}
	
		var rc, onRender, addText = true, i = 0, ch, tn;
		
		if( obj === undefined ) {
			pnode.id = "this is the node";
		dbg( "jsl.dom.subParse: object is undefined:", pnode.tagName );
			jsl.util.dumpStackTrace();
		return;
	}

		if( typeof obj === "function" ) {
			var dv = { tag:"DIV", id:gui.DOMId() };
			jsl.dom.subParse( pnode, dv );
			obj( dv );
			return;
		}

		var highlightId = obj.highlightId;
		delete obj.highlightId;

		if( obj.onrender ) {
			//console.log( "ONRENDER: " + obj.id );
			onRender = obj.onrender;
			delete obj.onrender;
		}

		if( !obj.el ) {
			var comment = false;
			if( jsl.dom.addComments ) {
				if( obj.comment ) {
					comment = document.createComment( " " + obj.comment + " " );
					if( beforeRef ) {
						pnode.insertBefore( comment, beforeRef );
					}
					else {
						pnode.appendChild( comment );
					}
				}
			}
			delete obj.comment;

			if( !obj.tag ) {
				jsl.dom.recognizeTag(obj);
			}
			var sztag = obj.tag ? obj.tag.toUpperCase() : "notag";
			if( jsl.dom.constructors[sztag] ) { // do we have a specific constructor
				rc = jsl.dom.constructors[sztag]( obj );	
			}
			else if( obj.tag ) {
				rc = jsl.dom.createElement( obj.tag, {}, obj );	
			}
			else {
				dbg( "object has no tag" );
				if( comment ) {
					obj.comment = comment;
				}
				return;
			}

			if( comment ) {
				obj.comment = comment;
			}
		}
		else {
			rc = obj.el;
			addText = false;
		}
	
		if( highlightId ) {
			//console.log("highlightId: " + JSON.stringify(highlightId));
			if( !window.highlightIds ) {
				window.highlightIds = {};
			}
			if( typeof highlightId === 'string' ) {
				window.highlightIds[highlightId] = {
					el:rc, x:0, y:0
				};
				if( rc.tagName === "SPAN" ) {
					window.highlightIds[highlightId].x = 7;
					window.highlightIds[highlightId].y = 7;
				}
			}
			else {
				window.highlightIds[highlightId.id] = highlightId;
				window.highlightIds[highlightId.id].el = rc;
			}
		}
	
		if( beforeRef ) {
			pnode.insertBefore( rc, beforeRef );
		}
		else {
		try {
				pnode.appendChild( rc );
		}
		catch(ae) {
		console.log( "error = " + ae );
		for( var f in pnode ) {
			console.log( "pnode["+f+"] = " + pnode[f]);
		}
		console.log( "pnode.tagName = " + pnode.tagName );
		return;
		}
		}

		if( obj.siblings ) {
			for( i = 0 ; i < obj.siblings.length ; i++ ) {
				ch = jsl.dom.subParse( pnode, obj.siblings[i] );
			}
		}

		if( obj.children && typeof obj.children.forEach === 'function' ) {
			obj.children.forEach(function (c) {
				if( c ) {
					ch = jsl.dom.subParse(rc, c);
				}
			});
			// add the text to the SPAN inside the LI of a tab .. rather than to the LI itself
			if( addText && obj.text !== undefined && obj.text !== null ) {
				tn = document.createTextNode( jsl.cw(obj.text) );
				if( rc.childNodes[0] ) {
					rc.childNodes[0].appendChild( tn );
				}
				else {
					rc.appendChild( tn );
				}
			}
		}
		else if( addText && obj.tag != "OPTION" && obj.text !== undefined && obj.text !== null ) {
			tn = document.createTextNode( jsl.cw(obj.text) );
			rc.appendChild( tn );
		}

		if( onRender ) {
			onRender( rc );
			obj.rerender = onRender;
		}
} catch (e) { 
	console.log( "subParse, caught: " + e ); 
	throw("JSL parse");
}
};

jsl.dom.createElement = function ( tag, to, po ) {
	try {
		po.el = document.createElement( tag );
		this.applyDefaultSettings( po, to );
		this.applyProperties( po.el, po );
		return po.el;
	} catch( e ) { 
		dump(to);
		console.log( "jsl.dom.createElement Error: [" + tag + "]" + e ); 
	}
};

jsl.dom.applyDefaultSettings = function ( dst, src ) {
		var f;
		for( f in src ) {
			if( dst[f] === undefined ) {
				dst[f] = src[f];
			}
		}
};

jsl.dom.numericProperties = {
			width:true,
			minWidth:true,
			maxWidth:true,
			height:true,
			minHeight:true,
			maxHeight:true,
			left:true,
			top:true,
			right:true,
			bottom:true,
			fontSize:true,
			paddingLeft:true,
			paddingTop:true,
			paddingRight:true,
			paddingBottom:true,
			marginLeft:true,
			marginTop:true,
			marginRight:true,
			marginBottom:true,
			borderRadius:true, mozBorderRadius:true, webkitBorderRadius:true,
			borderWidth:true
};

jsl.dom.applyProperties = function ( rc, po ) { // dst, src

		var positionProperties = {
			left:true,
			top:true,
			right:true,
			bottom:true
		};
					
		var f, lf, tpo;
		var func = function (pf) {
			var lastClick = 0;
			return function (e) {
				//thought .. e.stopPropagation();
					var now = (new Date()).getTime();
				if( now - lastClick > 800 ) {
					lastClick = now;
		 		tpo[pf](e);
				}
			};
		};

		if( po.ondoubleclick ) {
			var dc = po.ondoubleclick;
			var sc = po.onclick;
			delete po.ondoubleclick;
			delete po.onclick;
			rc.onclick = (function () {
				var last = 0;
				var clicks = 0;
				var cancelled = false;
				return function () {
					var now = (new Date()).getTime();
					if( now - last > 500 ) {
						last = 0;
					}
					if( last == 0 ) {
						clicks++;
						window.setTimeout(function () {
							if( !cancelled && sc ) {
								sc();
							}
						}, 500);
						last = now;
						return;
					}
					last = now;
					clicks++;
					if( clicks == 2 && dc ) {
						cancelled = true;
						clicks = 0;
						last = 0;
						dc();
						window.setTimeout(function () {
							cancelled = false;	
						}, 500);
					}	
				};
			})();
		}

		for( f in po ) {
			if( f == "style" ) {
				if( !rc.style ) {
					rc.style = {};
				}
				var s, sobj = po["style"];
				for( s in sobj ) {
					if( jsl.dom.numericProperties[s] && typeof sobj[s] === 'number' ) {
						rc.style[s] = sobj[s] + 'px';
					}
					else {
						rc.style[s] = sobj[s];
					}

					if( positionProperties[s] ) {
						if( po.style.position === undefined ) {
							rc.style.position = 'absolute';
						}
					}
				}
			}
			else if( f === "text" || f === "buttons" || f === "button" ) {
				//this.mydbg( "skipping " + f );
			}
			else if( f.substring(0,2) == "on" && typeof po[f] === "function" ) {
				tpo = po;
				rc[f] = func( f );
			}
			else if( f.indexOf( "Helper" ) != -1 ||
				 f == "tag" || f == "children" || f == "options" || f == "el" ) {
				//this.mydbg( "skipping " + f );
			}
			else if( typeof po[f] == "function" ) {
				//this.mydbg( "skipping function " + f );
			}
			else if( typeof po[f] == "object" ) {
				//this.mydbg( "skipping object " + f );
			}
/** TODO ?
			else if( this.utilIsArray( po[f] ) ) {
				//this.mydbg( "skipping array " + f );
			}
**/
			else if( f === "title" ) {
				var t = jsl.cw(po[f]);
				if( jsl.language === "sp" && t === po[f] ) {
					console.log("TRANSLATE: " + t);
				}
				rc.setAttribute(f, t);
			}
			else if( f === "checked" ) {
				rc.checked = po[f];
			}
			else {
				/*if( typeof po[f] == "object" ) {
					//for( lf in po[f] ) { this.mydbg( lf + " = " + po[f][lf] ); }
				}*/
				//this.dbg( "calling set attribute: " + f + " = " + po[f] );
				rc.setAttribute( f, po[f] );
			}
		}
		return rc;
};

jsl.dom.addOptionsToSelect = function (sel,ar) {
	var textField, idField, i;

	var createOption = function (text, id) {
		var opt = document.createElement("OPTION");
		opt.value = ''+id;
		opt.text = ''+text;
		return opt;
	};

	if( sel.optionsHelper ) {
	textField = sel.optionsHelper.text;
	idField = sel.optionsHelper.id;
	if( sel.el ) { // after subParse
		for( i = 0 ; i < ar.length ; i++ ) {
		sel.el.options[i] = createOption( ar[i][textField], ar[i][idField] );
		if( sel.value == ar[i][idField] ) {
			sel.el.selectedIndex = i;
		}
		}
	}
	else {
		for( i = 0 ; i < ar.length ; i++ ) {
		sel.options.push( ar[i] );
		}
	}
	}
	else {
	for( i = 0 ; i < ar.length ; i++ ) {
			if( typeof ar[i] !== 'object' ) {
			sel.el.options[i] = createOption( ar[i], ar[i] );
			if( sel.value == ar[i] ) {
			sel.el.selectedIndex = i;
			}
			}
			else {
				var optId = typeof ar[i].id !== undefined ? ar[i].id : ar[i]._id;
			sel.el.options[i] = createOption( ar[i].text || ar[i].name, optId );
			if( sel.value === optId ) {
			sel.el.selectedIndex = i;
			}
		}
	}
	}
};

jsl.dom.constructors = {

	DEFAULT: function ( tag, to, po ) {
	var rc = jsl.dom.createElement( tag, to, po );
	if( po.add === undefined ) {
		po.add = function ( pobj ) {
		this.subParse( po.el, pobj );
		};
	}
	return rc;
	}

	,IMG: function (po) {
		var rc;
		if( po.width ) {
			rc = new Image( po.width, po.height );
		}
		else if( po.style && po.style.width && typeof po.style.width == 'number' ) {
			rc = new Image( po.style.width, po.style.height );
		}
		else {
			rc = document.createElement( 'IMG' );
		}
		rc.id = po.id;
		rc.src = po.src;
		rc.border = 0;
		po.el = rc;
		if( po.onclick ) {
			rc.onclick = po.onclick;
		}
		if( po.onerror ) {
			rc.onerror = po.onerror;
		}
		if( po.onload ) {
			rc.onload = po.onload;
		}
		if( po.usemap ) {
			rc.useMap = po.usemap;
		}
		jsl.dom.applyProperties( rc, po );
		return rc;
	}

	,A: function ( po ) {
		var to = { href:"#!" };
		if( po.onclick ) {
			var onclick = po.onclick;
			po.onclick = function (e) {
				if( e ) {
					e.preventDefault();
				}
				onclick();
			};
		}
		var rc = jsl.dom.createElement( "A", to, po );
		return rc;
	}

	,SELECT: function ( po ) {
	var textField, idField, i, rc = this.DEFAULT( "SELECT", {}, po );

	if( po.options ) {
		jsl.dom.addOptionsToSelect( po, po.options );
	}
	return rc;
	}

	,OPTION: function ( po ) {
	var rc = new Option( po.text, po.value );
	return rc;
	}
};

jsl.dom.getElementLeftPosition = function ( obj ) {
	var curleft = 0;
	if( obj.offsetParent !== null ) {
	while( obj.offsetParent !== null ) {
		curleft += obj.offsetLeft;
			console.log("CL: " + curleft+ " -- " + obj.tagName + ", " + obj.className + ", " + obj.offsetLeft);
		obj = obj.offsetParent;
	}
	}
	else if( obj.x !== null ) {
	curleft += obj.x;
	}
	return curleft;
};

jsl.dom.getElementTopPosition = function ( obj ) {
	var curTop = 0;
	if( obj.offsetParent !== null ) {
	while( obj.offsetParent !== null ) {
		curTop += obj.offsetTop;
		obj = obj.offsetParent;
	 }
	}
	else if( obj.x !== null ) {
	curTop += obj.x;
	}
	return curTop;
};

jsl.dom.subParse = jsl.dom.add;


