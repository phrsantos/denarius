var APP; // Firebase Class
var DATABASE;
var STORAGE = window.localStorage;
var USUARIO;

function change_screen(tela){

	$('.tela').css('display', 'none');
	$('.' + tela).css('display', 'block');
	//$('.' + tela).addClass('fadeIn animated');
	
}

function show_loading(){
	$('.loading').css('display', 'block');
}

function end_loading(){
	$('.loading').css('display', 'none');
}


function start_app(){

	var user = firebase.auth().currentUser;
	if (user) {
		console.log('trocar pra tela extrato');
		change_screen_extrato();

	} else {
		console.log('trocar pra tela login');
		change_screen_login();
	}

	

}

function firebase_start(){

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBDMZI-MwUTQeURX-ha_W_x-PG4R39tKJE",
    authDomain: "denarius-10cc4.firebaseapp.com",
    databaseURL: "https://denarius-10cc4.firebaseio.com",
    storageBucket: "denarius-10cc4.appspot.com",
  };
  firebase.initializeApp(config);

}

$(document).ready(function(){

	firebase_start();
	start_app();
	
});

function alerta(msg){
	return alert(msg);
}


function change_screen_login(){

	change_screen('login');

	if(STORAGE.getItem('user')){
		USUARIO = STORAGE.getItem('user');
		change_screen_extrato();
	}

	$('#choice-btn-login').on('click', function(){
		$('.login-escolha').addClass('esconder');
		$('.login-entrar').removeClass('esconder');
		$('.login').css('color', 'black');
		$('.login').css('background-color', 'white');
	});

	$('#choice-btn-cadastro').on('click', function(){
		$('.login-escolha').addClass('esconder');
		$('.login-cadastrar').removeClass('esconder');
		$('.login').css('color', 'black');
		$('.login').css('background-color', 'white');
	});


	$('#login-btn-entrar').on('click', function(){

		var email = $('#login-field-email').val();
		var senha = $('#login-field-senha').val();

		if(senha.length < 6)
			return alerta('A senha deve possuir 6 caracteres');

		show_loading();

		firebase.auth().onAuthStateChanged(function(user) {

			if (user) {

				STORAGE.setItem('user', get_usuario());
				USUARIO = get_usuario();

				change_screen_extrato();

				end_loading();

			} else {
		    	change_screen_login();

		    	end_loading();
			}

		});

		firebase.auth().signInWithEmailAndPassword(email, senha).catch(function(error) {
		  	// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;

			alerta(errorMessage);
			end_loading();

		  	// ...
		});





	});

	$('#cadastro-btn-entrar').on('click', function(){

		var nome  = $('#cadastro-field-nome').val();
		var email = $('#cadastro-field-email').val();
		var senha = $('#cadastro-field-senha').val();

		if(nome.length == 0)
			return alerta('Digite seu nome');

		if(email.length == 0)
			return alerta('Digite seu e-mail');

		if(senha.length < 6)
			return alerta('A senha deve possuir pelo menos 6 caracteres');

		show_loading();

		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			console.log('desloga');
		}, function(error) {
			// An error happened.
		});

		firebase.auth().createUserWithEmailAndPassword(email, senha).catch(function(error) {

			end_loading();
		  	
		  	// Lida com os erros
			var errorCode = error.code;
			var errorMessage = error.message;

			if(errorCode == 'auth/email-already-in-use')
				return alerta('Este e-mail pertence a outro usuário');

			if(errorCode == 'auth/invalid-email')
				return alerta('Este e-mail não é válido');

			if(errorCode == 'auth/weak-password')
				return alerta('Escolha uma senha mais difícil');

			return alerta('Falha desconhecida');



		});

		firebase.auth().onAuthStateChanged(function(user) {



			if (user) {
		   	
				user.updateProfile({
					displayName: nome
				}).then(function() {
					
					alerta('Usuário cadastrado com sucesso!');
					STORAGE.setItem('user', get_usuario());
					USUARIO = get_usuario();
					end_loading();

					change_screen_extrato();

				}, function(error) {
					end_loading();
					alerta('Falha ao atualizar nome do usuário!');
				});



			} else {
		    // No user is signed in.
			}

		});

		end_loading();

	});

}

function getData(){

	var tmp = new Date();
	return tmp.getDay() + '/' + tmp.getMonth() + '/' + tmp.getYear();

}

function change_screen_cadastrar_valor(){

	change_screen('cadastrar-valor');

	$('#cadastrar-descricao').val('');
	$('#cadastrar-valor').val('');
	$('#cadastrar-tipo option:selected').prop("selected", false);
	$('#cadastrar-recorrencia option:selected').prop("selected", false);

	$('#cadastrar-carteira-descricao').css('display', 'none');

	var h = new Date();
	$('#cadastrar-data').val(h.getDay() + '/' + h.getMonth() + '/' + h.getYear());

	$('#cadastrar-carteira').change(function(){
		if(parseInt($('#cadastrar-carteira').val()) == -1)
			$('#cadastrar-carteira-descricao').css('display', '');
		else
			$('#cadastrar-carteira-descricao').css('display', 'none');
	});

	// 1 Preparação do Formulário

	$('#cadastrar-tipo').html('');
	var tipo = [];
	var query = firebase.database().ref("tipo");
	query.once("value")
	.then(function(snapshot) {

		snapshot.forEach(function(childSnapshot) {

		    	var childData = childSnapshot.val();
		    	$('#cadastrar-tipo').append('<option value="' + childSnapshot.key + '">' + childData.tipo + '</option>');

		    });
	});

	$('#cadastrar-carteira').html('');
	$('#cadastrar-carteira').append('<option value="">Geral</option>');
	var query = firebase.database().ref("carteira");
	query.once("value")
	.then(function(snapshot) {

		snapshot.forEach(function(childSnapshot) {

		    	var childData = childSnapshot.val();
		    	$('#cadastrar-carteira').append('<option value="' + childSnapshot.key + '">' + childData.carteira + '</option>');

		    });
	});

	$('#cadastrar-carteira').append('<option value="-1">Cadastrar Nova</option>');

	$("#cadastrar-tipo").selectmenu('refresh', true); 
	$("#cadastrar-carteira").selectmenu('refresh', true); 

	// Fim

	var stop = false;
	$('#cadastrar-btn-salvar').click(function(event) {
        
        event.preventDefault();

		var descricao, valor, tipo, recorrencia, sinal, carteira, carteira_d;

		descricao   = $('#cadastrar-descricao').val();
		valor       = $('#cadastrar-valor').val().replace(',', '.');
		tipo        = $('#cadastrar-tipo option:selected').val();
		recorrencia = $('#cadastrar-recorrencia option:selected').val();
		carteira    = $('#cadastrar-carteira option:selected').val();
		carteira_d  = $('#cadastrar-carteira-descricao').val();

		if(parseInt(carteira) == -1){
			if(carteira_d.length == 0)
				return alert('Preencha o nome da nova carteira');
		}

		var tmp = $('#cadastrar-data').val();
		var data = new Date(tmp);

		if(descricao.length == 0)
			return alerta('Descreva seu lançamento');

		if(isNaN(valor))
			return alerta('O valor deve ser numérico');

		if(valor == 0)
			return alerta('O valor deve ser maior ou menor que zero');

		show_loading();


		// Puxa as informações do lancamento no banco de dados
		var adaRef = firebase.database().ref('tipo/' + tipo);

		adaRef.once('value', function(snap) {

			var carteira_final;

			// Cadastra a nova carteira, se necessário
			if(parseInt(carteira) == -1){

				var ref = firebase.database().ref();
				carteira_final = ref.child('carteira').push({
					usuario:get_usuario(),
					descricao: carteira_d, 
					data: firebase.database.ServerValue.TIMESTAMP
				}).key;

			}else
				carteira_final = carteira;
			
	      	console.log(snap.val()); // returns `null`

	      	var obj = snap.val();
	      	if(obj.sinal == '-'){
	      		if(valor > 0)
	      			valor = valor * -1;
	      	}else if(valor < 0)
	      			valor = valor * -1;

	      	var ref = firebase.database().ref();
			var insert = ref.child('extrato').push({
				usuario:get_usuario(),
				descricao: descricao, 
				valor:parseFloat(valor), 
				tipo: tipo, 
				carteira: carteira_final,
				recorrencia:recorrencia,
				data: data.getTime()
				//data: firebase.database.ServerValue.TIMESTAMP
			}).key;

			if(insert){

				$('#cadastrar-btn-salvar').unbind('click');

				$('#cadastrar-descricao').val('');
				$('#cadastrar-valor').val('');
				$('#cadastrar-tipo option:selected').prop("selected", false);
				$('#cadastrar-recorrencia option:selected').prop("selected", false);

				change_screen_extrato();

				end_loading();

			}else
				end_loading();


		    if(!obj){
		      	
		      	alerta('falha ao obter dados');
		    	return change_screen_extrato();
		    }

	      
	  	});

	});

	$('#cadastrar-btn-cancelar').on('click', function(){

		$('#cadastrar-descricao').val('');
		$('#cadastrar-valor').val('');
		$('#cadastrar-tipo option:selected').prop("selected", false);
		$('#cadastrar-recorrencia option:selected').prop("selected", false);

		$('#cadastrar-btn-cancelar').unbind('click');

		change_screen_extrato();
	});

	$('#cadastrar-valor-voltar').on('click', function(){

		$('#cadastrar-valor-voltar').unbind('click');
		
		$('#cadastrar-descricao').val('');
		$('#cadastrar-valor').val('');
		$('#cadastrar-tipo option:selected').prop("selected", false);
		$('#cadastrar-recorrencia option:selected').prop("selected", false);

		change_screen_extrato();
	});

}


function log_out(){

	STORAGE.removeItem('user');
	firebase.auth().signOut();

	$('.login-escolha').removeClass('esconder');
	$('.login-cadastrar').addClass('esconder');
	$('.login-entrar').addClass('esconder');
	$('.login').css('color', 'white');
	$('.login').css('background-color', 'black');


	change_screen_login();

}

function get_usuario(){

	var user = firebase.auth().currentUser;

	if(STORAGE.getItem('user'))
		return STORAGE.getItem('user');

	if (user) 
		return user.uid;
	else
		return false;
			

}