var GlobalData = {
	currentHomePage : null,
	DEFAULT_MODAL_BODY : '<i class="fa fa-5x fa-refresh fa-spin"></i>'
};

// enable caching
$.ajaxSetup({
	cache : true
});

// load the document
$(document).ready(function() {
	GlobalData.homePageDiv = $('#home-page');
	GlobalData.bottomBar = $('#bottom-bar');
	GlobalData.navBar = $('#nav-bar');
	GlobalData.accessModal = $("#access-modal");

	// load top and bottom panels
	loadNavBar();
	loadBottomBar();

	// Bind the hash change event.
	$(window).bind('hashchange', handleHashChange);

	// clear hash on modal hide
	GlobalData.accessModal.on('hidden.bs.modal', handleModalHide);

	// load page content
	handleHashChange();
});

// Load Navigation bar
function loadNavBar() {
	GlobalData.navBar.load('/nav-bar', function(data, status) {
		if (status !== 'success')
			console.log(data);
	});
}

// Load Bottom Bar
function loadBottomBar() {
	GlobalData.bottomBar.load('/bottom-bar', function(data, status) {
		if (status !== 'success')
			console.log(data);
	});
}

function loadElement(elem, url, scriptUrl, callback) {
	elem.load(url, function(data, status) {
		if (status != 'success') {
			console.log(data);
			return;
		}
		$.getScript(scriptUrl, function(data, status) {
			if (status !== 'success')
				console.log(data);
			else if (callback)
				callback();
		});
	});
}

// Show Home page
function loadHomePage(id) {
	loadElement(GlobalData.homePageDiv, '/' + id, '/scripts/' + id + '.js',
			function() {
				GlobalData.currentHomePage = id;
			});
}

// Show Modal Form
function loadForm(id, title, small) {
	// select elements
	var modal = GlobalData.accessModal;
	var modalDialog = modal.find('.modal-dialog');
	var modalTitle = modal.find('.modal-title');
	var body = modal.find('.modal-body');
	// set modal size
	if (small)
		modalDialog.addClass("modal-sm");
	else
		modalDialog.removeClass("modal-sm");
	// set modal title
	modalTitle.html(title);
	// show modal
	modal.modal('show');
	// load body from server
	body.html(GlobalData.DEFAULT_MODAL_BODY);
	loadElement(body, '/forms/' + id, '/scripts/forms/' + id + '.js');
}

// load registration form
function includeRegForm() {
	var regForm = $('#register-form-wrapper');
	if (regForm) {
		loadElement(regForm, '/forms/register', '/scripts/forms/register.js');
	}
}

function focusRegForm() {
	var elem = $('#register-modal-content');
	var form = elem.find('#registerForm');
	var uname = form.find('input[name="uname"]');
	// focus on the form
	uname.focus();
	// animate to bring user attention
	for (var i = 0; i < 3; ++i) {
		elem.animate({
			marginTop : '+=10px'
		}, 100);
		elem.animate({
			marginTop : '-=10px'
		}, 100);
	}
}

function hideForm() {
	GlobalData.accessModal.modal('hide');
}

function handleModalHide() {
	window.history.go(-1);
	// disable reload of page , a it causes multiple times same popup
	// document.location.reload(true);
}

function reloadPage() {
	document.location.reload(true);
}

function handleHashChange() {
	var anchor = (window.location.hash.match(/#[^?]+/g) || [ "" ])[0];
	switch (anchor) {
	case '#login':
		loadForm('login', 'Sign In', true);
		break;
	case '#confirm':
		loadForm('confirm', 'Confirm Email', true);
		break;
	case '#change-pass':
		loadForm('change-pass', 'Change Password', true);
		break;
	case '#add-child':
		loadForm('add-child', 'Add New Child', true);
		break;
	case '#edit-child':
		loadForm('add-child', 'Edit Child', true);
		break;
	case '#add-phone':
		loadForm('add-phone', 'Add New Phone', true);
		break;
	case '#add-vaccine':
		loadForm('add-vaccine', 'Add Vaccine', true);
		break;
	case '#edit-vaccine':
		loadForm('add-vaccine', 'Edit Vaccine', true);
		break;
	case '#add-dose':
		loadForm('add-dose', 'Add Dose', true);
		break;
	case '#edit-dose':
		loadForm('add-dose', 'Edit Dose', true);
		break;
	case '#profile':
		loadHomePage('profile');
		break;
	case '#children':
		loadHomePage('children');
		break;
	case '#view-child':
		loadHomePage('view-child');
		break;
	case '#users':
		loadHomePage('users');
		break;
	case '#vaccines':
		loadHomePage('vaccines');
		break;
	case '#takens':
		loadHomePage('takens');
		break;
	default:
		loadHomePage('home-page');
		break;
	}
	selectNavBar(anchor);
}

function selectNavBar(anchor) {
	var navbar = $('#nav-bar');

	if (anchor == '#children')
		navbar.find('#children-li').addClass('active');
	else
		navbar.find('#children-li').removeClass('active');

	if (anchor == '#users')
		navbar.find('#users-li').addClass('active');
	else
		navbar.find('#users-li').removeClass('active');

	if (anchor == '#vaccines')
		navbar.find('#vaccines-li').addClass('active');
	else
		navbar.find('#vaccines-li').removeClass('active');

	if (anchor == '#takens')
		navbar.find('#takens-li').addClass('active');
	else
		navbar.find('#takens-li').removeClass('active');

	if (anchor == '#view-child')
		navbar.find('#view-child-li').addClass('active');
	else
		navbar.find('#view-child-li').removeClass('active');
}

// Read a page's GET URL variables and return them as an associative array.
function getDataFromUrl() {
	try {
		var search = (window.location.hash.match(/\?.*/g) || [ "?" ])[0];
		return JSON.parse(decodeURIComponent(search.slice(1)));
	} catch (ex) {
		return null;
	}
}
function formatSpan(span) {
	// divide into components
	span /= (24 * 3600 * 1000);
	var years = Math.floor(span / 365);
	span -= years * 365;
	var months = Math.floor(span / 31);
	span -= months * 31;
	var days = Math.floor(span);
	// calculate return value
	var ret = "";
	if (years > 0)
		ret += years + " year" + (years > 1 ? "s " : " ");
	if (months > 0)
		ret += months + " month" + (months > 1 ? "s " : " ");
	if (days > 0)
		ret += days + " day" + (days > 1 ? "s " : " ");
	return ret.trim() || "0 day";
}

/**
 * Send a submit request to server
 * 
 * @param form
 *            Form to submit
 * @param url
 *            URL to submit to
 * @param callback
 *            gets called when success
 * @param submitButton
 *            The submit button element
 * @param submitText
 *            Text to display when sending submit request
 * @param failed
 *            Method to call on failure
 */
function submitPostRequest(form, url, callback, submitText, submitButton,
		failed) {
	// gather elements
	var errBox = form.find('#error-box');
	if (!submitText)
		submitText = 'Submitting...';
	if (!submitButton)
		submitButton = form.find(':submit');
	// set submit button text
	var txt = submitButton.val();
	submitButton.val(submitText);
	submitButton.attr('disabled', true);
	// send a post request
	$.post(url, form.serialize()).done(function(data) {
		if (data) {
			errBox.text(data);
			if (failed)
				failed();
		} else if (callback) {
			callback();
		}
	}).fail(function(data) {
		console.log(data);
		switch (data.status / 100) {
		case 4:
			errBox.text('Connection Failed!');
			break;
		case 5:
			errBox.text('Internal Server Error!');
			break;
		default:
			errBox.text('Unknown Error!');
			break;
		}
		if (failed)
			failed();
	}).always(function() {
		submitButton.val(txt);
		submitButton.attr('disabled', false);
	});
}

/**
 * Calculate age from birthday
 * 
 * @param bday
 *            Birthday in unix timestamp
 * @returns {string} return age like- "10 days" or "2 years 3 months"
 */
function getAge(bday) {
	var date = new Date();
	return formatSpan((date.getTime() - bday));
}

function chileSearchFun() {
	var input, filter, ul, li, a, i;
	// var children = $('#mySearch');
	input = document.getElementById("mySearch");
	filter = input.value.toUpperCase();

	var elms = document.querySelectorAll("#name");
	for (var i = 0; i < elms.length; i++) {

		if (!elms[i].textContent.toUpperCase().startsWith(filter)) {
			if (elms[i].parentElement.parentElement.parentElement.id
					.startsWith('child-')) {
				elms[i].parentElement.parentElement.parentElement.style.display = 'none';
			}
			// confirm("child
			// name---"+elms[i].parentElement.parentElement.parentElement.parentElement.parentElement.id);
			if (elms[i].parentElement.parentElement.parentElement.parentElement.parentElement.id
					.startsWith('child-tab-')) {
				elms[i].parentElement.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
			}

		} else {
			if (elms[i].parentElement.parentElement.parentElement.id
					.startsWith('child-')) {
				elms[i].parentElement.parentElement.parentElement.style.display = '';
			}
			// confirm("child
			// name---"+elms[i].parentElement.parentElement.parentElement.parentElement.parentElement.id);
			if (elms[i].parentElement.parentElement.parentElement.parentElement.parentElement.id
					.startsWith('child-tab-')) {
				elms[i].parentElement.parentElement.parentElement.parentElement.parentElement.style.display = 'contents';
			}
		}
	}

	var elms1 = document.querySelectorAll('[id^="child-li-"]');
	for (var i = 0; i < elms1.length; i++) {

		if (!elms1[i].firstChild.textContent.trim().toUpperCase().startsWith(
				filter)) {
			// confirm("child first name---" +
			// elms1[i].firstChild.textContent.trim());
			elms1[i].style.display = 'none';

		} else {
			elms1[i].style.display = 'block';

		}
	}
	var tbl = document.getElementById('takens-table');
	var rows = tbl.getElementsByTagName('tr');
	// confirm("rows---" + rows.length);
	for (var row = 0; row < rows.length; row++) {
		var cols = rows[row].children;
		// confirm("ROW NUM---" + row);
		// confirm("cols---" + cols.length);
		for (var col = 1; col < cols.length; col++) {
			var cell = cols[col];
			if (row == 0) {
				if (col > 1) {
					if (!cell.textContent.trim().toUpperCase().startsWith(
							filter)) {

						//cell.style.visibility = 'collapse';
						cell.style.display = 'none';

					} else {
						//cell.style.visibility = 'visible';
						cell.style.display = 'block';
					}
				}
			} else {
				if (cols.length > 1) {
					// confirm("row"+row+"col:"+col+"head val---" +
					// rows[0].children[col+1].textContent.trim().toUpperCase()+"--val:"+(rows[0].children[col+1].textContent.trim().toUpperCase()
					// .startsWith(filter)));
					if (!rows[0].children[col + 1].textContent.trim()
							.toUpperCase().startsWith(filter)) {

						//cell.style.visibility = 'collapse';
						cell.style.display = 'none';
					} else {
						//cell.style.visibility = 'visible';
						cell.style.display = 'block';
					}

				}
			}
		}
	}
}