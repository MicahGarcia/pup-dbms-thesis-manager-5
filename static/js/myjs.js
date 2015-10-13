$(function(){
	var keywords = [];
	$('#keyup_lister').hide();
	$('#hidden_id').hide();
	$("form input[name='guestbook_name']").hide()

	function onFormSubmit(event) {
		var data = $(event.target).serializeArray();
		var thesis_data = {};
		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			var value = data[i].value;
			thesis_data[key] = value; 
		}
		var thesis_create_api = '/api/handler';
		$.post(thesis_create_api, thesis_data, function(response)
		{
			if (response.status == 'OK')
			{	
				alert('Thesis successfully created.');
				$(location).attr('href', '/thesis/list');
				return true;
			}
			else
			{
				alert(response.status);
				return false;
			}
		})
		return false;
	}

	function editThesisFormSubmit(event) {
		var data = $(event.target).serializeArray();
		var thesis_data = {};
		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			var value = data[i].value;
			thesis_data[key] = value; 
		}
		var hid_id = $('#hidden_id').text()
		var thesis_edit = 'thesis/edit/'+hid_id;
		$.post(thesis_edit, thesis_data, function(response)
		{
			if (response.status == 'OK')
			{	
				alert('Thesis successfully edited.');
				$(location).attr('href', '/thesis/list');
				return true;
			}
			else
			{
				alert(response.status);
				return false;
			}
		})
		return false;
	}

	function onRegFormSubmit(event) {
		var data = $(event.target).serializeArray();
		var user_data = {};
		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			var value = data[i].value;
			user_data[key] = value; 
		}
		var register_api = '/register';
		$.post(register_api, user_data, function(response)
		{	
			if (response.status == 'OK')
			{
				alert('Registration successful!');
				$(location).attr('href', '/');
				return true;
			}
			else alert(response.status);
		})
		return false;
	}

	function loadAllThesis(event) 
	{
		$('ul.thesis_list').empty()
		year = $('#filter_year').val()
		adviser = $('#filter_adviser').val()
		university = $('#filter_university').val()
		var thesis_list_api = '/api/handler';
		$.get(thesis_list_api, {'year': year,'university':university,'adviser':adviser} ,function(response)
		{
			if (response.status == 'OK')
			{
				response.data.forEach(function(thesis) {
				var thesis_info = thesis.thesis_year + "   |   " + thesis.thesis_title + "   |   " + thesis.f_first_name + " " + thesis.f_last_name + "    |   " + thesis.thesis_creator_fname + " " + thesis.thesis_creator_lname;
				$('ul.thesis_list').append('<li>'+thesis_info+' <a class="mybtn" href=\'/thesis/edit/'+thesis.self_id+'\'>Edit</a><a class=\'mybtn\' href=\'/thesis/delete/'+thesis.self_id+'\'>Delete</a></li>');
				return false;
				})
			}
			else 
			{$('ul.thesis_list').append('<li>No thesis found<li>');return false;}
		})
	}
	//function for getting related thesis after submitting keywords
	function getRelated (event)
	{	
		//always empty <ul> at start for searching related thesis
		$('#rel_th_ul').empty();
		//get val of thesis title for server not to search for the same thesis
		var x = $("[name='thesis_title']",'#form2').val();
		var get_related_api = '/api/getRelated'
		$.post(get_related_api, JSON.stringify({ "keywords": keywords,"x":x}), function(response)
		{	
			if (response.status == 'OK')
			{	
				//if dont got related thesis
				if ($.isEmptyObject(response.rel))
				{
					$('#rel_th_ul').prepend("\"No related thesis found.\"");
				}

				//show all related thesis
				for(var index in response.rel) 
				{
				    var header = response.rel[index]['thesis_university'] + "<div style='float:right'>" +response.rel[index]['thesis_year'] + "</div><br>" + response.rel[index]['thesis_college'] + "<br>" + response.rel[index]['thesis_department'];
				    var title = response.rel[index]['thesis_title'];
				    //for loop to find the words and make it bolded
				    for (i = 0; i < keywords.length; i++)
				    {
				    	if (title.search(keywords[i]) != -1)
				    	{
				    	var start_index = title.search(keywords[i]);
				    	var end_index = start_index + (keywords[i].length - 1);
						title = title.slice(0,start_index) + "<b>" + keywords[i] + "</b>" + title.slice(end_index + 1);
				    	}
				    }
				    $('#rel_th_ul').prepend("<a class='mybtn' href='/thesis/edit/"+response.rel[index]['id']+"'><li>><div>"+header+"</div><div>"+title+"</div></li></a><hr>");
				}
				return false;
			}
			else alert('Error 192.168.1.11, Database error');
		})
	}

	function search (event)
	{	
		$('#searched').empty();
		var y = $("#searcher").val().toLowerCase();
		var searcher_api = '/api/searcher'
		$.post(searcher_api, JSON.stringify({ "y": y,}), function(response)
		{
			if (response.status == 'OK')
			{	
				if ($.isEmptyObject(response.searched))
				{
					$('#searched').prepend("\"No match found.\"");
				}

				for(var index in response.searched) 
				{
					if (response.searched[index]['thesis_title'])
					{
						var header = response.searched[index]['university'] + "<div style='float:right'>" +response.searched[index]['thesis_year'] + "</div><br>" + response.searched[index]['college'] + "<br>" + response.searched[index]['department'];
						var title = response.searched[index]['thesis_title'];
						$('#searched').prepend("<a class='mybtn' href='/thesis/edit/"+response.searched[index]['id']+"'><li>><div>"+header+"</div><div>"+title+"</div></li></a><hr>");
					}
					else
					{
						var name = response.searched[index]['student.s_first_name'] + " " + response.searched[index]['student.s_middle_name'] + " " + response.searched[index]['student.s_last_name'];
						$('#searched').prepend("<a class='mybtn' href='/student/page/"+response.searched[index]['id']+"'><li>" + name + "</li></a><hr>");
					}

				}
				return false;
			}
			else alert('Error 192.168.1.11, Database error');
		})		
	}

	function find (event)
	{
		title = $(this).val().toLowerCase();
		find_thesis_api = '/api/find_thesis'
		$.get(find_thesis_api, {'title':title} ,function(response)
		{
			if (response.status == 'OK')
			{	
				if (title != '')
				{
					counter = 0;
					$('#keyup_lister').empty()
					$('#keyup_lister').show()
					for (var index in response.finder)
					{
						counter++;
						$('#keyup_lister').append("<div><input type='checkbox' name='thesis"+counter+"' value='"+response.finder[index]['thesis_title']+"'></input>"+response.finder[index]['thesis_title']+"</div>")
					}
				}
				else $('#keyup_lister').hide();
			}
			else
			{
				alert('Error 192.168.1.11, Database error');
			}
			return false;
		})
	}

	$(document).on('click', '.mybtn',function(){
		$(this).closest('li').remove();
	});
	//function for keywords checkboxes
	$('.keywords_cb').change(function() {
		s = $(this).attr('value');
	    if ($(this).prop('checked')) 
	    {
	    	keywords.push(s)
	    }
	    else {
			var index = keywords.indexOf(s);
			if (index >= 0) {
			  keywords.splice( index, 1 );
			}
	    }
	});
	

	function createFaculty(event) {
		var data = $(event.target).serializeArray();
		var faculty_data = {};
		var thesis = []
		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			if (key.indexOf('thesis') > -1)
			{
				var title = data[i].value;
				thesis.push(title)
			}
			var value = data[i].value;
			faculty_data[key] = value;
		}
		pic_path = $("form#fac_create input[name='f_picture']").val()
		var faculty_create = '/faculty/create';
		$.post(faculty_create, JSON.stringify({ "faculty_data": faculty_data,"thesis":thesis,"pic_path":pic_path}), function(response)
		{	
			if (response.status == 'OK')
			{
				alert("Faculty successfully created.");
				$(location).attr('href', '/thesis/list');
				return true;
			}
			else
			{
				alert(response.status);
			}
		})
		return false;
	}

	function createStudent(event) {
		var data = $(event.target).serializeArray();
		var student_data = {};
		var thesis = []

		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			if (key.indexOf('thesis') > -1)
			{
				var title = data[i].value;
				thesis.push(title)
			}
			var value = data[i].value;
			student_data[key] = value;
		}
		pic_path = $("form#stud_create input[name='s_picture']").val()
		
		var student_create = '/student/create';
		$.post(student_create, JSON.stringify({ "student_data": student_data,"thesis":thesis,"pic_path":pic_path}), function(response)
		{	
			if (response.status == 'OK')
			{
				alert("student successfully created.");
				$(location).attr('href', '/thesis/list');
				return true;
			}
			else
			{
				alert(response.status);
			}
		})
		return false;
	}

	function createUniversity(event) {
		var data = $(event.target).serializeArray();
		var univ_data = {};

		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			var value = data[i].value;
			univ_data[key] = value;
		}
		
		var univ_create = '/university/create';
		$.post(univ_create, univ_data, function(response)
		{	
			if (response.status == 'OK')
			{
				alert("university successfully created.");
				$(location).attr('href', '/thesis/list');
				return true;
			}
			else
			{
				alert(response.status);
			}
		})
		return false;
	}

	function createCollege(event) {
		var data = $(event.target).serializeArray();
		var col_data = {};

		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			var value = data[i].value;
			col_data[key] = value;
		}
		
		var col_create = '/college/create';
		$.post(col_create, col_data, function(response)
		{	
			if (response.status == 'OK')
			{
				alert("College successfully created.");
				$(location).attr('href', '/thesis/list');
				return true;
			}
			else
			{
				alert(response.status);
			}
		})
		return false;
	}

	function createDepartment(event) {
		var data = $(event.target).serializeArray();
		var dept_data = {};

		for (var i = 0; i < data.length; i++) {
			var key = data[i].name;
			var value = data[i].value;
			dept_data[key] = value;
		}
		
		var dept_create = '/department/create';
		$.post(dept_create, dept_data, function(response)
		{	
			if (response.status == 'OK')
			{
				alert("department successfully created.");
				$(location).attr('href', '/thesis/list');
				return true;
			}
			else
			{
				alert(response.status);
			}
		})
		return false;
	}
	
	$('form#form2').submit(editThesisFormSubmit);
	$('#list_thesis').click(loadAllThesis);
	$('#submit_kwords').click(getRelated);
	$('form#form1').submit(onFormSubmit);
	$('form#registration').submit(onRegFormSubmit);
	$('#search_btn').click(search);
	$('#thesisfinder').keyup(find);
	$('form#fac_create').submit(createFaculty);
	$('form#stud_create').submit(createStudent);
	$('form#univ_create').submit(createUniversity);
	$('form#col_create').submit(createCollege);
	$('form#dept_create').submit(createDepartment);
});