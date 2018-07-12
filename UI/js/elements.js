const hideSideBar = (e) => {
	document.querySelector('nav ul').style.display = "none";	
};

const showSideBar = (e) => {
	document.querySelector('nav ul').style.display = "block";	
};

const toggleSideBar = (e) => {
	if (document.documentElement.clientWidth > 768) {
		document.querySelector('nav ul').style.display = "block";		
	}
	else {
		document.querySelector('nav ul').style.display = "none";	
	}
};

const processSubmit = (e) => {
	e.preventDefault();
	const button = document.querySelector('.form-submit');
	button.innerHTML = '';
	button.classList.add('btn-loading');
	setTimeout(() => {window.location.href = './stories.html';}, 1000);
};

const initApp = (e) => {
	try {
		document.querySelector('.close-menu').addEventListener('click', hideSideBar);
		document.querySelector('.menu-icon').addEventListener('click', showSideBar);
		window.addEventListener('resize', toggleSideBar);
	}
	catch(err) {
		//SideBar not present
	}

	try {
		document.querySelector('.login-form').addEventListener('submit', processSubmit);
	}
	catch(err) {
		//submittable form not present
	}
};

document.addEventListener('DOMContentLoaded', initApp);

/* story functions */

let editMode = false;

try {
	const _bar = document.querySelector(".form-delete");
	const _bar2 = document.querySelector(".form-Not");
	const modal_content = document.querySelector("div.modal_content");
	const close_button = document.querySelector(".form-sure");
	const _like =document.querySelector(".icon .heart");
	const _edit = document.querySelector(".form-sub");
	const close_menu = document.querySelector('.close-menu');

	_bar.addEventListener('click', () => {
		modal_content.style.display ='block';
	});
	_bar2.addEventListener('click', () => {
		modal_content.style.display ='none';
	});

//closing the modal_content
close_button.addEventListener('click', () =>{
	modal_content.style.display ='none';
});

_like.addEventListener('click', () => {
	_like.style.color ='red';
	_like.classList.add("scale");
});

_edit.addEventListener('click', (e) => {
	const el = document.getElementById("full-story-content");
	if (!editMode) {
		const range = document.createRange();
		const sel = window.getSelection();
		range.setStart(el.childNodes[0], 0);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
		el.focus();
		e.target.innerHTML = "Save";
		editMode = true;
	}
	else {
		/* perform fetch operation */
		e.target.innerHTML = "Edit";
		editMode = false;
		window.focus();
	}
});
}

catch(err) {
	// Story not available
}