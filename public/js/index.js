import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updatedata } from './updateSettings';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutButton = document.querySelector('.nav__el--logout');
//const userDataForm = document.querySelector('form-user-data');

if(mapBox) {
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
displayMap(locations);
}

if(loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if(logoutButton) {
    logoutButton.addEventListener('click', logout);
}

// if(userDataForm)
//     console.log('Form update is here')
//     userDataForm.addEventListener('submit', e => {
//         console.log('Form update is clicked')
//         e.preventDefault();
//         const name = document.getElementById('name').value;
//         const email = document.getElementById('email').value;
//         updatedata(name, email)
//     })