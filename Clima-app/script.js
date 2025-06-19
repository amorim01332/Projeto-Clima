const apiKey = "a09bce1f0a99e884fb1199fa83607e14";

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
