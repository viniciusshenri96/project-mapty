'use strict';

class Workout {
  date = new Date();
  // Nunca devemos usar ID por conta propria, podemos ultilizar alguma biblioteca que faça isso
  // Date.now() da o carimbo de hora atual
  id = Date.now() + ''.slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // Esse comentário 'prettier ignore' podemos usar sempre que quisermos dizer ao Prettier para ignorar a próxima linha

    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    // this.running = 'running';
    // É perfeitamente normal chamar qualquer código no construtor
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60); // convertendo para horas (duration / 60min)
  }
}

// const run1 = new Running([39, -19], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -19], 27, 95);
// console.log(run1, cycling1);

////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Classe é só o planejamento, o plano.
class App {
  // Propriedades de instância privada
  #map;
  #mapEvent;
  // propriedade para guardar o workout no array
  #workout = [];

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

    // API do navegador para saber a localização atual do usuario, com dois Callback, uma de sucesso se conseguir a localização e a outra erro se caso não consiga a localização.
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

  _hideForm() {
    // Hide form + clear input fields

    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevantionField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // metodo para criar novo treino
  _newWorkout(e) {
    // Função para validação de inputs
    const validInputs = (...inputs) =>
      // o every só vai retornar verdadeiro se todos eles forem verdadeiro, ou seja para todos os elementos da matriz
      inputs.every(inp => Number.isFinite(inp));

    // Função para verificar numeros negativos
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Check if data is valid

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Guard Clause
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      // create object for list
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // Guard Clause
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      // create object for list
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //  Add new object to workout array
    this.#workout.push(workout);

    // o this aqui é o objeto atual
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    // Render workout on map as marker
    L.marker(workout.coords)
      .addTo(this.#map)
      // bindPopup cria um popup e vincula ele com o marcador
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();

    // console.log(workout.distance);
  }

  _renderWorkout(workout) {
    let html = `
       <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
      
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
    `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li> 
  `;

    form.insertAdjacentHTML('afterend', html);
  }
}

const app = new App();

// Tem que está no topo do escopo, porque é aqui q o aplicativo começa o carregamento do mapa
