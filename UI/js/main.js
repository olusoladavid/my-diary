// Responsive side menu

const closeMenuButton = document.querySelector('.js-close-menu');
const openMenuButton = document.querySelector('.js-open-menu');

const hideSideBar = (e) => {
	document.querySelector('.js-nav-list').style.display = "none";	
};

const showSideBar = (e) => {
	document.querySelector('.js-nav-list').style.display = "block";	
};

const toggleSideBar = (e) => {
	if (document.documentElement.clientWidth > 768) {
		document.querySelector('.js-nav-list').style.display = "block";		
	}
	else {
		document.querySelector('.js-nav-list').style.display = "none";	
	}
};

if (closeMenuButton) closeMenuButton.addEventListener('click', hideSideBar);
if (openMenuButton) openMenuButton.addEventListener('click', showSideBar);
window.addEventListener('resize', toggleSideBar);

// General form functions

const loginForm = document.querySelector('.js-form-login');

const processSubmit = (e) => {
	e.preventDefault();
	const button = document.querySelector('.js-login-button');
	startProgress(button);
	setTimeout(() => {window.location.href = './stories.html';}, 1000);
};

const startProgress = (button) => {
	button.innerHTML = '';
	button.classList.add('button--loading');
};

const stopProgress = (button, label) => {
	button.innerHTML = label;
	button.classList.remove('button--loading');
};

if (loginForm) loginForm.addEventListener('submit', processSubmit);

// Story functions

let editMode = false;

const modal= document.querySelector(".js-modal");
const storyDeleteBtn = document.querySelector(".js-delete-story");
const storyEditBtn = document.querySelector(".js-edit-story");
const modalCancelBtn = document.querySelector(".js-cancel-modal");
const modalConfirmBtn = document.querySelector(".js-confirm-modal");
const favBtn = document.querySelector(".js-icon-heart");

const showDeleteModal = (e) => {
	modal.style.display ='block';
};
const hideDeleteModal = (e) => {
	modal.style.display ='none';
};

const confirmDelete = (e) =>{
	// DELETE fetch operation
	modal.style.display ='none';
};

const toggleFavorite = (e) => {
	e.target.classList.toggle('icon--heart-active')
};

const editStory = (e) => {
	const el = document.querySelector(".js-story-content");
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
};

if (storyDeleteBtn) storyDeleteBtn.addEventListener('click', showDeleteModal);
if (storyEditBtn) storyEditBtn.addEventListener('click', editStory);
if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', confirmDelete);
if (modalCancelBtn) modalCancelBtn.addEventListener('click', hideDeleteModal);
if (favBtn) favBtn.addEventListener('click', toggleFavorite);