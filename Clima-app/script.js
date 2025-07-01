const apiKey = "0870e67f14013eb25ed390c0b1c4985e";

const canvas = document.getElementById("rain-canvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

const raindrops = [];
for (let i = 0; i < 200; i++) {
  raindrops.push({
    x: Math.random() * width,
    y: Math.random() * height,
    length: Math.random() * 20 + 10,
    speed: Math.random() * 4 + 4,
  });
}

function drawRain() {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";

  for (let drop of raindrops) {
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x, drop.y + drop.length);
    ctx.stroke();

    drop.y += drop.speed;
    if (drop.y > height) {
      drop.y = -drop.length;
      drop.x = Math.random() * width;
    }
  }

  requestAnimationFrame(drawRain);
}

drawRain();

// ---- Função para API do Clima ----
async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Digite uma cidade!");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`;
  fetchData(url);
}

async function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;
      fetchData(url);
    });
  } else {
    alert("Geolocalização não suportada.");
  }
}

async function fetchData(url) {
  showLoader(true);
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 200) {
      showWeather(data);
      changeBackground(data.weather[0].main);
    } else {
      document.getElementById(
        "weatherResult"
      ).innerHTML = `<p>❌ Localização não encontrada</p>`;
    }
  } catch (error) {
    document.getElementById(
      "weatherResult"
    ).innerHTML = `<p>⚠️ Erro na conexão</p>`;
  }
  showLoader(false);
}

function showWeather(data) {
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const description = data.weather[0].description;

  document.getElementById("weatherResult").innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p><img src="${icon}" alt="clima"> ${description}</p>
    <p>🌡️ Temperatura: ${data.main.temp}°C</p>
    <p>🤔 Sensação: ${data.main.feels_like}°C</p>
    <p>💧 Umidade: ${data.main.humidity}%</p>
    <p>💨 Vento: ${data.wind.speed} km/h</p>
  `;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function showLoader(show) {
  const loader = document.getElementById("loader");
  loader.style.display = show ? "block" : "none";
}

function changeBackground(weatherMain) {
  document.body.className = "";
  document.getElementById("rain-canvas").style.display = "none";
  document.querySelector(".clouds").style.display = "none";

  if (weatherMain === "Clear") {
    document.body.classList.add("clear");
    document.querySelector(".clouds").style.display = "block";
  } else if (weatherMain === "Clouds") {
    document.body.classList.add("clouds-bg");
    document.querySelector(".clouds").style.display = "block";
  } else if (
    weatherMain === "Rain" ||
    weatherMain === "Drizzle" ||
    weatherMain === "Thunderstorm"
  ) {
    document.body.classList.add("rain-bg");
    document.getElementById("rain-canvas").style.display = "block";
  }
}

// ---- Eventos de Botões ----
document.getElementById("getWeather").addEventListener("click", getWeather);
document
  .getElementById("getLocationWeather")
  .addEventListener("click", getWeatherByLocation);
document
  .getElementById("toggleDarkMode")
  .addEventListener("click", toggleDarkMode);

document
  .getElementById("toggleForecast")
  .addEventListener("click", toggleForecast);

// Forecast functionality
function toggleForecast() {
  const forecastBox = document.getElementById("forecastBox");
  forecastBox.style.display =
    forecastBox.style.display === "block" ? "none" : "block";
}

async function get5DayForecast(city) {
  if (!city) return;

  showLoader(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      displayForecast(data);
    }
  } catch (error) {
    console.error("Erro na previsão:", error);
  }
  showLoader(false);
}

function displayForecast(data) {
  const forecastContent = document.getElementById("forecastContent");
  forecastContent.innerHTML = "";

  // Group by day
  const dailyForecasts = {};
  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString("pt-BR", { weekday: "long" });

    if (!dailyForecasts[dayKey]) {
      dailyForecasts[dayKey] = {
        date: date,
        temps: [],
        weather: item.weather[0],
        icon: item.weather[0].icon,
      };
    }

    dailyForecasts[dayKey].temps.push(item.main.temp);
  });

  // Get next 5 days
  const forecastDays = Object.values(dailyForecasts).slice(0, 5);

  forecastDays.forEach((day) => {
    const minTemp = Math.min(...day.temps).toFixed(1);
    const maxTemp = Math.max(...day.temps).toFixed(1);
    const dayName = day.date.toLocaleDateString("pt-BR", { weekday: "short" });

    const dayElement = document.createElement("div");
    dayElement.className = "forecast-day";
    dayElement.innerHTML = `
                    <div class="day-info">
                        <span>${dayName}</span>
                        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weather.description}">
                    </div>
                    <div class="day-temp">
                        ${maxTemp}° / ${minTemp}°
                    </div>
                `;

    forecastContent.appendChild(dayElement);
  });

  document.getElementById("forecastBox").style.display = "block";
}
// Event listener for forecast button
document.getElementById("getForecast").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value;
  get5DayForecast(city);
});
// Initial call to get weather by default location
getWeatherByLocation();
// Initial call to get 5-day forecast for default location
