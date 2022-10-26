'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// API do navegador para saber a localização atual do usuario, com dois Callback, uma de sucesso se conseguir a localização e a outra erro se caso não consiga a localização.

// Using the Geolocation API
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(
        `https://www.google.com.br/maps/@${latitude},${longitude},15z`
      );

      const coords = [latitude, longitude];

      // Displaying a Map Using Leaflet Library
      // L é como um namespace, algum objeto, é uma variavel global dentro de Leaflet

      const map = L.map('map').setView(coords, 13); // o segundo parametro, o numero 13 é o zoom

      // o mapa vem de pequenos blocos e esses blocos veem dessa URL
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(coords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    },
    function () {
      alert('Could not get your position');
    }
  );
