function Tipo(codigo, tipo){

	this.codigo = codigo;
	this.tipo = tipo;

}

function get_tipo(codigo, tipos_array){

	console.log(tipos_array);

	if(!tipos_array)
		return '';

	for(var i = 0; i < tipos_array.length; i++)
		if(codigo == tipos_array[i].codigo)
			return tipos_array[i].tipo;


	return '';

}

function load_extrato(mes){

	show_loading();

	// Insere o calendário no menu do topo do App
	var meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
	var data  = new Date();
	var mes_ant = mes-1;
	var mes_pos = mes+1;

	if(mes_ant < 0)
		mes_ant = 11;

	if(mes_pos > 11)
		mes_pos = 0;

	$('.mes1').html( meses[mes_ant]);
	$('.mes2').html('<strong>' + meses[mes] + '</strong>');
	$('.mes3').html(meses[mes_pos]);

	$('.mes1').on('click', function(){
		load_extrato(mes_ant);
	});

	$('.mes2').on('click', function(){
		load_extrato(mes);
	});

	$('.mes3').on('click', function(){
		load_extrato(mes_pos);
	});


	var hoje = new Date();
	var mes_final = mes+2;
	var mes_atual = mes+1;
	var ano_atual = hoje.getFullYear();
	var ano_final = hoje.getFullYear();

	if(mes_final > 12){
		mes_final = 1;
		ano_final = ano_final+1;
	}

	var startDate = Date.parse(ano_atual + '-' + mes_atual + '-1'), endDate = Date.parse(ano_final + '-' + mes_final + '-1');

	if(get_usuario()){

		var resumo = 0, receitas = 0, despesas = 0;
		var tipo = [];

		var query = firebase.database().ref("tipo");
		query.once("value")
		  .then(function(snapshot) {

		    snapshot.forEach(function(childSnapshot) {

		    	var key = childSnapshot.key; // unique id
		    	var childData = childSnapshot.val();
		    	
		    	tipo.push(new Tipo(childSnapshot.key, childData.tipo));

		  	});
		});

		query = firebase.database().ref("extrato").orderByChild("usuario").equalTo(USUARIO);
		query.once("value")
		  .then(function(snapshot) {
		  	$('#extrato-lancamentos').html('');
		    snapshot.forEach(function(childSnapshot) {

		    	var key = childSnapshot.key; // unique id
		    	var childData = childSnapshot.val();
		    	if((childData.data >= startDate && childData.data < endDate ) || parseInt(childData.recorrencia) == 4){

			    	criar_linha_extrato(childData, tipo, childSnapshot.key);

			    	resumo += parseFloat(childData.valor);
			    	if(childData.valor > 0)
			    		receitas += parseFloat(childData.valor);
			    	else
			    		despesas += parseFloat(childData.valor * -1);

			    }

		  	});



		  	if(resumo > 0)
		  		$('#extrato-resumo').html('<span style="color:green;">R$ ' + (resumo.toFixed(2)).replace('.', ',') + '</span>');
		  	if(resumo < 0)
		  		$('#extrato-resumo').html('<span style="color:red;">R$ ' + (resumo.toFixed(2)).replace('.', ',') + '</span>');
		  	else
		  		$('#extrato-resumo').html('<span style="color:black;">R$ ' + (resumo.toFixed(2)).replace('.', ',') + '</span>');

		    $('#extrato-receitas').html('R$ ' + (receitas.toFixed(2)).replace('.', ','));
		    $('#extrato-despesas').html('R$ ' + (despesas.toFixed(2)).replace('.', ','));

		    $('.lancamento').click(function(e){
    
		    	var Elem = e.target;

		    	console.log('lancamento clicado');
		    	$( "#detalhes-gasto" ).removeClass('esconder');
		    	$( "#detalhes-gasto" ).popup('open');
		    	$('#detalhes-gasto-deletar').on('click', function(){

		    		deletar_lancamento($(Elem).children('.inner-key').val(), Elem);
		    	});

		    	$('#detalhes-gasto-editar').on('click', function(){
		    		change_screen_editar($(Elem).children('.inner-key').val());
		    	});


			});

		  	end_loading();
		});

	}
}

function change_screen_extrato(){

	console.log('mostrando extrato');
	change_screen('extrato');
	show_loading();


	// Insere o calendário no menu do topo do App
	var data   = new Date();
	var mes   = data.getMonth();


	// fim calendario
	$('.menu-hover').css('display', 'none');

	$('#navbar-menu').on('click', function(){
		$('.menu-hover').css('display', 'block').addClass('animated bounceInDown');
	});

	$('#navbar-menu-hover').on('click', function(){
		$('.menu-hover').css('display', 'none').removeClass('bounceInDown').removeClass('animated');
	});

	$('#lancar-valor').on('click', function(){
		change_screen_cadastrar_valor();
	});

	load_extrato(mes);

	end_loading();


}

function deletar_lancamento(codigo, elem){


	var adaRef = firebase.database().ref('extrato/' + codigo );
	adaRef.remove()
	  .then(function() {
	    console.log("Remove succeeded.");
	    //$(elem).css('display', 'none');
	    $( "#detalhes-gasto" ).popup('close');
	    change_screen_extrato();
	  })
	  .catch(function(error) {
	    console.log("Remove failed: " + error.message)
	  });

}

function criar_linha_extrato(objeto, tipos_array, key){

	var preco;
	if(objeto.valor > 0)
		preco = '<span style="color:green;">R$ ' + objeto.valor + '</span>';
	else
		preco = '<span style="color:red;">R$ ' + objeto.valor + '</span>';

	var linha = '<div  class="lancamento"><input class="inner-key" type="hidden" value="' 
	+ key + '"><div class="lancamento-valor">'
	+preco+'</div>';

    linha += '<div class="lancamento-texto">';
    linha += '<span class="texto-principal">'+objeto.descricao+'</span>';
    linha += '<span class="descricao">'+get_tipo(objeto.tipo, tipos_array)+'</span></div><a href="#detalhes-gasto" data-rel="popup" class="link-normal" data-position-to="window"></a></div>';

	$('#extrato-lancamentos').append(linha);

	

}

function change_screen_perfil(){

	change_screen('perfil');
	show_loading();

	var user = firebase.auth().currentUser;

	// instancia o botao de deletar conta
	$('#perfil-deletar-conta').on('click', function(){
		user.delete().then(function() {
			log_out();
		}, function(error) {
			alerta('Falha ao deletar conta: ' + error);
		});
	});

	$('#navbar-perfil').on('click', function(){
		change_screen_extrato();
	});



	// Puxa as informações do usuário do Firebase
	
	var name, email, photoUrl, uid;

	if (user != null) {
	  	name = user.displayName;
	  	email = user.email;

	  	uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
	                   // this value to authenticate with your backend server, if
	                   // you have one. Use User.getToken() instead.

	    $('#perfil-field-nome').val(name);
	    $('#perfil-field-email').val(email);

	    $('#perfil-btn-salvar').on('click', function(){

	    	// Validação dos dados
	    	if($('#perfil-field-nome').val().length == 0)
	    		return alerta('Preencha seu nome');

	    	if($('#perfil-field-email').val().length < 10)
	    		return alerta('Preencha seu e-mail');

	    	
		    user.updateProfile({
				displayName: $('#perfil-field-nome').val(),
				email: $('#perfil-field-email').val()
			}).then(function() {

				// Update successful.
				if($('#perfil-field-senha').val().length == 0)
					return alerta('Informações atualizadas com sucesso!');
				else{
					user.updatePassword($('#perfil-field-senha').val()).then(function() {
						// Update successful.
						return alerta('Informações atualizadas com sucesso!');
					}, function(error) {
						// An error happened.
						return alerta('Falha ao atualizar informações: ' + error);
					});
				}

			}, function(error) {
				// An error happened.
				alerta(error);
			});



	    });

	    end_loading();
	}else{
		log_out();
	}

}

function change_screen_mais_info(){

	change_screen('mais-info');
	show_loading();

	// instancia o botao voltar do topo
	$('#navbar-mais-info').on('click', function(){
		change_screen_extrato();
	});

	end_loading();
	

}

function change_screen_editar(codigo){

	change_screen('cadastrar-valor');
	show_loading();

	// bindamos os eventos de voltar
	$('#cadastrar-btn-cancelar').on('click', function(){

		$('#cadastrar-valor-voltar').unbind('click');
		
		$('#cadastrar-descricao').val('');
		$('#cadastrar-valor').val('');
		$('#cadastrar-carteira-descricao').val('');
		$('#cadastrar-carteira option:selected').prop("selected", false);
		$('#cadastrar-tipo option:selected').prop("selected", false);
		$('#cadastrar-recorrencia option:selected').prop("selected", false);

		change_screen_extrato();
	});

	$('#cadastrar-valor-voltar').on('click', function(){

		$('#cadastrar-valor-voltar').unbind('click');
		
		$('#cadastrar-descricao').val('');
		$('#cadastrar-valor').val('');
		$('#cadastrar-carteira-descricao').val('');
		$('#cadastrar-carteira option:selected').prop("selected", false);
		$('#cadastrar-tipo option:selected').prop("selected", false);
		$('#cadastrar-recorrencia option:selected').prop("selected", false);

		change_screen_extrato();

	});

	// Puxa as informações do lancamento no banco de dados
	var adaRef = firebase.database().ref('extrato/' + codigo);
	$('#cadastrar-carteira-descricao').css('display', 'none');

	adaRef.once('value', function(snap) {

      console.log(snap.val()); // returns `null`

      var obj = snap.val();

      if(!obj)
      	change_screen_extrato();

      $('#cadastrar-descricao').val(obj.descricao);
      $('#cadastrar-valor').val(obj.valor);
      $('#cadastrar-recorrencia option[value="'+obj.recorrencia+'"]').prop('selected', true);

      var tmp = new Date(obj.data);
      $('#cadastrar-data').val(tmp.getDay() + '/' + tmp.getMonth() + '/' + tmp.getFullYear());

      console.log(tmp.getDay() + '/' + tmp.getMonth() + '/' + tmp.getFullYear());

      // 1 Preparação do Formulário

		$('#cadastrar-tipo option').remove();
		var tipo = [];
		var query = firebase.database().ref("tipo");
		query.once("value")
		.then(function(snapshot) {

			snapshot.forEach(function(childSnapshot) {

				console.log(childSnapshot.val());

			    	var childData = childSnapshot.val();
			    	if(childSnapshot.key == obj.tipo)
			    		$('#cadastrar-tipo').append('<option selected value="' + childSnapshot.key + '">' + childData.tipo + '</option>');
			    	else
			    		$('#cadastrar-tipo').append('<option value="' + childSnapshot.key + '">' + childData.tipo + '</option>');

			    });

			end_loading();

		});
		$('#cadastrar-carteira').html('<option value="">Geral</option>');

		var query = firebase.database().ref("carteira/");
		query.once("value")
		.then(function(snapshot) {

			snapshot.forEach(function(childSnapshot) {

				console.log(childSnapshot.val());

			    	var childData = childSnapshot.val();
			    	if(childSnapshot.key == obj.carteira)
			    		$('#cadastrar-carteira').append('<option selected value="' + childSnapshot.key + '">' + childData.descricao + '</option>');
			    	else
			    		$('#cadastrar-carteira').append('<option value="' + childSnapshot.key + '">' + childData.descricao + '</option>');

			    });

		});

		$('#cadastrar-carteira').append('<option value="-1">Cadastrar Carteira</option>');



		$("#cadastrar-tipo").selectmenu('refresh', true); 
		$("#cadastrar-carteira").selectmenu('refresh', true);
		$("#cadastrar-recorrencia").selectmenu('refresh', true);

		$('#cadastrar-carteira').change(function(){
			if(parseInt($('#cadastrar-carteira').val()) == -1)
				$('#cadastrar-carteira-descricao').css('display', '');
			else
				$('#cadastrar-carteira-descricao').css('display', 'none');
		});

		// Fim

		$('#cadastrar-btn-salvar').on('click', function(){

			var carteira_final, valor = $('#cadastrar-valor').val().replace(',', '.');
			var carteira = $('#cadastrar-carteira option:selected');

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

	      	var tmp = $('#cadastrar-data').val().split('/');
			var data_f = new Date(tmp[2]+'-'+tmp[1]+'-'+tmp[0]);

			firebase.database().ref('extrato/' + codigo).set({
			    descricao: $('#cadastrar-descricao').val(),
			    recorrencia: $('#cadastrar-recorrencia option:selected').val(),
			    tipo : $('#cadastrar-tipo option:selected').val(),
			    valor: valor,
			    //carteira: carteira_final,
			    data: obj.data,
			    usuario: obj.usuario
		  	});

		  	change_screen_extrato();
		});


      $('#cadastrar-recorrencia [value='+obj.recorrencia+']').attr('selected', true);
      
    });

	




	$( "#detalhes-gasto" ).addClass('esconder');
	$( "#detalhes-gasto" ).popup('close');
	//$('#cadastrar-descricao').val();

	
	

}