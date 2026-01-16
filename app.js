
const key = '3af09ec2d54643bf8a6144323253011';

let locationCurrent = {};
const currentWeatherContent = document.querySelector('.current-weather');
const forecastContent = document.querySelector('.forecast');
const forecast12hours = document.querySelector('.forecast-12hours');
const forecast12hoursList = document.querySelector('.forecast-list');
const searchBarInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const mainBody = document.querySelector('body');
const flagImg = document.querySelector('.flag-img');



// Search Location
searchBtn.addEventListener('click', async (e) => {
  e.preventDefault(); // stops form from reloading (if in <form>)

  const inputValue = searchBarInput.value.trim();
  if (!inputValue) {
    alert('Please enter a location 🌍');
    return;
  }


  try {
    domCotent(true);
  } catch (err) {
    alert('Error fetching searched weather:', err);
  };
  searchBarInput.value = '';
});

searchBarInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchBtn.click();
});


async function getLocationSearch(keyword) {
  try {
    const res = await fetch(`http://api.weatherapi.com/v1/search.json?key=${key}&q=${keyword}`);
    const data = await res.json();
    return data[0];
  } catch (err) {
    console.log('ERROR for searching: ' + err);
  }
};

async function searchingQuery() {
  try {
    const inputValue = searchBarInput.value.trim();
    const locationData = await getLocationSearch(inputValue);
    if (!locationData) throw new Error('No results found');
    const query = `id:${locationData.id}`;
    return query;
  } catch (err) {
    alert(err);
    throw new Error('ERROR: ' + err);
  }
}
// Get Location
function getLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(console.log("Geolocation not supported"));
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          "latitude": pos.coords.latitude,
          "longitude": pos.coords.longitude,
        })
      },
      (err) => reject(err),
      options
    );
  });
}

const geoOptions = {
  maximumAge: 0,
  enableHighAccuracy: false,
  timeout: 10000,
};

async function geolocationQuery() {
  try {
    locationCurrent = await getLocation(geoOptions);
  } catch (err) {
    console.warn('Could not get location, using the default location...')
    locationCurrent = { latitude: 51.5074, longitude: -0.1278 };
  };
  const query = `${locationCurrent.latitude},${locationCurrent.longitude}`;
  return query;
}
// Fetch Data
async function fetchCurrentWeather(search) {
  let query = '';
  if (!search) query = await geolocationQuery();
  else query = await searchingQuery();
  try {
    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${query}&days=8&aqi=yes&alerts=yes`);
    weather = await response.json();
    return weather;
  } catch (err) {
    console.log('ERROR: ' + err);
  };
}

// Fetch the flag
async function fetchFlag(country) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${country}?fields=name,flags`);
    const restCountries = await response.json();
    return restCountries[0].flags.svg;
  } catch (err) {
    throw new Error(err);
  }
}




// print to DOM
function changeTheme(weather) {
  if (weather.current.is_day) {
    mainBody.classList.add('day');
    mainBody.classList.remove('night');
  } else {
    mainBody.classList.add('night');
    mainBody.classList.remove('day');
  }
}

function printCurrent(weather) {
  const date = new Date(weather.location.localtime).toString();
  const arrdate = date.split(' ');
  currentWeatherContent.innerHTML = `
      <h1 style>${arrdate[2]} ${arrdate[1]}, ${arrdate[0]}</h1>
      <h2 class="region">${weather.location.name}, ${weather.location.region}</h2>
      <img src = ${weather.current.condition.icon}>
      <div>
        <p class="current-temperature">${weather.current.temp_c}\u00B0C</p>
        <p class="weather">${weather.current.condition.text}</p>
      </div>
      <p class="humidity"><i class="fa-solid fa-droplet"></i>Humidity: ${weather.current.humidity}%</p>
      <p class="wind"><i class="fa-solid fa-wind"></i>Wind Speed: ${weather.current.wind_kph}km/h</p>`
};

function printForecast(weather) {
  const arr = weather.forecast.forecastday;
  for (let i = 1; i < arr.length; i++) {
    const date = new Date(arr[i].date).toString();
    const arrDate = date.split(' ');
    const weatherListItem = document.createElement('div');
    weatherListItem.innerHTML = `
    <div class = "forecast-element">
      <p>${arrDate[2]} ${arrDate[1]}</p>
      <img src= ${arr[i].day.condition.icon}>
      <p>${arr[i].day.avgtemp_c}\u00B0C<p>
    </div>
    `;
    forecastContent.appendChild(weatherListItem);
  };
}

function printCurrentDay(weather) {
  const localTime = new Date(weather.location.localtime);
  const hour = localTime.getHours();
  const forecastDays = weather.forecast.forecastday;
  const allhours = forecastDays.flatMap(day => day.hour);
  const hour12 = allhours.slice(hour, hour + 12);
  create12hours(hour12);
}
// makes following 12hours weather data array
function create12hours(hours) {
  for (let i = 0; i < hours.length; i++) {

    const listItem = document.createElement('li');

    listItem.innerHTML = `
    <div class="forecast-element">
      <p>${new Date(hours[i].time).getHours()}:</p>
      <img src= "${hours[i].condition.icon}">
      <p>${hours[i].temp_c}\u00B0C</p>
    </div>`;
    listItem.classList.add('list-item');
    forecast12hoursList.appendChild(listItem);
  }
}

async function addFlag(country) {
  const flag = await fetchFlag(country);
  flagImg.src = flag;
}



// main excution
// fetchCurrentWeather().then(weather => {
//   changeTheme(weather);
//   printCurrent(weather);
//   printForecast(weather);
//   printCurrentDay(weather);
//   return weather.location.country;
// }).then(country => {
//   addFlag(country);
// })

async function domCotent(search) {
  try {
    const weather = await fetchCurrentWeather(search);
    // Clear old content
    currentWeatherContent.innerHTML = '';
    forecastContent.innerHTML = '';
    forecast12hoursList.innerHTML = '';
    flagImg.src = '';
    changeTheme(weather);
    printCurrent(weather);
    printForecast(weather);
    printCurrentDay(weather);
    await addFlag(weather.location.country);
  } catch (err) {
    throw new Error(err);
  }
}

domCotent(!true);