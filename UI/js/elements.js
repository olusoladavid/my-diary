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
