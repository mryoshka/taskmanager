;(function() {

	let employers = new XMLHttpRequest();
	employers.open('GET', 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users?limit=15', true)
	
	let all_tasks = new XMLHttpRequest();
	all_tasks.open('GET', 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks', true);
	
	employers.send();
	all_tasks.send();

	let date_var = -2;

	Date.todayFormatted = function() {
		let date = new Date();
		return `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
	}();

	const dates = function(date, change) {
    	const dates = document.querySelector('.plan__dates');
		date.setDate(date.getDate()+change);	
    	[...dates.children].splice(1).forEach((el,i) => {
			let date_data = `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    		el.dataset.date = date_data;
    		el.innerText = date.toLocaleDateString('ru-RU').substring(0,5);
    		if (date_data === Date.todayFormatted) { 
    			el.innerText += '\nсегодня'; 
    			el.style.backgroundColor = '#eee';
    		} else el.style.backgroundColor = '';
    		date.setDate(date.getDate()+1); 
    	});
    };

    const employers_set = function(emps) {
    	const lines = document.querySelector('.plan__lines');
    	for (let emp of emps) {
    		const line = document.createElement('div');
    		line.className = 'plan__lines__line';
    		const emp_name = document.createElement('div');
    		emp_name.className = 'plan__lines__line__name';
    		emp_name.setAttribute('executor', emp.id);
    		emp_name.innerText = emp.firstName;
    		lines.append(line);
    		line.append(emp_name);
    	}
    };

    const items = function() {
    	[...document.querySelectorAll('.plan__dates__date')].splice(1).forEach(date => {
    		document.querySelectorAll('.plan__lines__line').forEach(el => {
	    		const item = document.createElement('div');
	    		const datedata = date.dataset.date;
	    		item.className = 'plan__lines__line__item';
	    		item.dataset.date = datedata;
    			el.append(item);
				if (datedata === Date.todayFormatted) item.style.backgroundColor = '#eee';
    		});
    	});
    };

    const onetask = function(task, executor = null, dropdate = null) {
    	if (task.executor !== null || executor !== null) {
			let place = document.querySelector(`.plan__lines__line__name[executor='${executor !== null ? executor : task.executor}']`).parentNode.children;
			for (let el of place) {
				if (!el.classList.contains('plan__lines__line__name')) {
					let el_date = re_date(el.dataset.date);
					let start = dropdate !== null ? re_date(dropdate) : re_date(task.planStartDate);
					let end = dropdate !== null ? re_date(dropdate) : re_date(task.planEndDate);
    				if (el_date >= start && el_date <= end) {
	    				const newtasktime = document.createElement('div');
	   					newtasktime.className = 'task-active';
	   					newtasktime.innerText = task.subject;
						el.append(newtasktime);
    					let worktime = 8;
    					let child_count = el.children.length;
    					for (let child of el.children) {
    						let time = child_count === 3 ? ~~(worktime/2) : Math.round(worktime/child_count);
    						child.style.height = el.children.length === 1 ? '148px' : (150/(el.children.length)-2)+'px';
    						child.innerText = el.children.length < 5 ? `${child.innerText.match(/(.+)\d?/g)[0]}\n${time} ч` : child.innerText.match(/(.+)\d?/g)[0] || child.innerText ;
    						child.dataset.tooltip = `Время: ${time}ч\u000D\u000AСтатус: ${task.status}\u000D\u000AОписание:${task.description}\u000D\u000AАвтор:${task.creationAuthor}`;
    						worktime -= time;
    						child_count--;
    					}
    				}
    			}
			}   			
		} 
		else {
			let backlog = document.querySelector('.backlog__tasks');
			let backlog_task = document.createElement('div');
			backlog_task.className = 'backlog__tasks__item';
			backlog_task.setAttribute('task-id', task.id);
			backlog_task.setAttribute('draggable', 'true');
			backlog.append(backlog_task);
			backlog_task.innerHTML = `<div class="backlog__tasks__item__title bold">${task.subject}</div><div class="backlog__tasks__item__desc">Описание: ${task.description}</div><div class="backlog__tasks__item__etc">Автор: ${task.creationAuthor}<br>Дата создания: ${task.creationDate}</div>`
		}
    };

    const manytasks = function(tasks) {
    	for (let task of tasks) {
    		onetask(task);
    	}
    };

    const drag_n_drop = function() {
    	
    	const lines = document.querySelector('.plan__lines');
    	const backlogtasks = document.querySelector('.backlog__tasks');
    	let task_to_drop, dropdone;

    	const start = function(e) {
    		setTimeout(()=> { e.target.classList.add('hide') }, 1);
    		task_to_drop = e.target;
    	};
    	const end = function(e) {
			dropdone === true ? e.target.remove() : e.target.classList.remove('hide');
			dropdone = false;
    	};
    	const over = function(e) {
			e.preventDefault();
    	};
    	const enter = function(e) {
    		e.preventDefault();	
    		if (!e.target.classList.contains('plan__lines__line')) {
				e.target.classList.contains('plan__lines__line__name') && e.target.classList.add('grow');
	    		e.target.parentNode.classList.contains('plan__lines__line__item') ? e.target.parentNode.classList.add('shadow') : e.target.classList.add('shadow');
    		}
    	};
    	const leave = function(e) {
			if (!e.target.classList.contains('plan__lines__line')) {
				e.target.classList.contains('plan__lines__line__name') && e.target.classList.remove('grow');
				e.target.parentNode.classList.contains('plan__lines__line__item') ? e.target.parentNode.classList.remove('shadow') : e.target.classList.remove('shadow');
			}
    	};
    	const drop = function(e) {
    		let task_obj = all_tasks.filter(el => el.id === task_to_drop.getAttribute('task-id'))[0];
    		e.target.classList.contains('plan__lines__line__name')
    			? onetask(task_obj, e.target.getAttribute('executor')) 
    			: !e.target.classList.contains('task-active')
    				? onetask(task_obj, e.target.parentNode.firstChild.getAttribute('executor'), e.target.dataset.date)
    				: onetask(task_obj, e.target.parentNode.parentNode.firstChild.getAttribute('executor'), e.target.parentNode.dataset.date);
			e.target.classList.remove('grow');
			e.target.parentNode.classList.remove('shadow');
			e.target.classList.remove('shadow');
			dropdone = true;
			task_to_drop = null;
    	};

		lines.addEventListener('dragover', over);
		lines.addEventListener('dragenter', enter);
		lines.addEventListener('dragleave', leave);
		lines.addEventListener('drop', drop);
			
    	backlogtasks.addEventListener('dragstart', start);
    	backlogtasks.addEventListener('dragend', end);

    }();

	const change_week = function(e) {
		e.preventDefault();
		clear_lines_area();	
		date_var = e.target.classList.contains('plan__nav__prev') ? date_var-7 : date_var+7;
		dates(new Date(), date_var); 
		employers_set(employers);
		items();
		manytasks(all_tasks);
	};

	function re_date(date) {
    	let parts = date.split('-');
		return new Date(parts[0], parts[1] - 1, parts[2]); 
    };

    function clear_lines_area() {
    	document.querySelector('.plan__lines').innerHTML = '';
    };


	dates(new Date(), date_var); 
			
	employers.onreadystatechange = function() {
		if (employers.readyState != 4) return;
		if (employers.status != 200) {
			alert(employers.status + ': ' + employers.statusText);
		} else {
			employers = JSON.parse(employers.responseText);
			employers_set(employers);
			items();
		}
	};
	
	all_tasks.onreadystatechange = function() {
		if (all_tasks.readyState != 4) return;
		document.querySelector('.loading').style.display = 'none';
		if (all_tasks.status != 200) {
			alert(all_tasks.status + ': ' + all_tasks.statusText);
		} else {
			all_tasks = JSON.parse(all_tasks.responseText);
			manytasks(all_tasks);
		}
	};
	

    document.querySelector('.backlog__search__input').addEventListener('input', function(e) {
    	e.preventDefault();
    	document.querySelectorAll('.backlog__tasks__item').forEach(el => el.style.display = RegExp(this.value, 'i').test(el.firstChild.outerText) ? 'block' : 'none');
    });
	
	document.querySelector('.plan__nav__prev').addEventListener('click', change_week);
		
	document.querySelector('.plan__nav__next').addEventListener('click', change_week);

})();
