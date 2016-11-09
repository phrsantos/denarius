function push_object(tabela, object){

	var ref = new Firebase("https://denarius-10cc4.firebaseio.com");
	ref.child(tabela).push(object);

}

