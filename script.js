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

// Classe é só o planejamento, o plano.
class App {
  // Propriedades de instância privada
  #map;
  #mapEvent;

  // o construtor é executado assim que um novo objeto é criado a partir dessa classe
  constructor() {
    // o construtor vai acionar o _getPosition()
    this._getPosition();

    // Rendering Workout Input Form
    form.addEventListener('submit', this._newWorkout.bind(this));

    // O evento change é acionado para os elementos input , select e textarea quando o usuário modifica o valor do elemento. Ao contrário do evento de entrada, o evento de alteração não é necessariamente acionado para cada alteração no valor de um elemento.
    inputType.addEventListener('change', this._toggleElevantionField);
  }

  _getPosition() {
    // Using the Geolocation API

    if (navigator.geolocation)
      // O proprio javaScript vai chamar as callback
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert('Could not get your position');
      });
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    // Displaying a Map Using Leaflet Library
    // L é como um namespace, algum objeto, é uma variavel global dentro de Leaflet

    this.#map = L.map('map').setView(coords, 13); // o segundo parametro, o numero 13 é o zoom
    // o mapa vem de pequenos blocos e esses blocos veem dessa URL
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Displaying a Map Marker
    // Evento de mapa especial, evento criado pelo Leaflet

    // Handlich clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    // melhor para a experiencia do usuario, focar no elemento imediamente
    inputDistance.focus();
  }

  _toggleElevantionField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // metodo para criar novo treino
  _newWorkout(e) {
    e.preventDefault();

    // Clear imput fieds
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';
    // Display Marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      // bindPopup cria um popup e vincula ele com o marcador
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();
console.log(app);

// Tem que está no topo do escopo, porque é aqui q o aplicativo começa o carregamento do mapa
