let searchPlace = document.querySelector(".search-bar input")
let searchBtn = document.querySelector(".fa-magnifying-glass")
let searchViaLocationBtn = document.querySelector(".fa-location-crosshairs")
let button = document.querySelector('button')
let chart
const temp = [], time = []
const apiKey = '103473e0d6744466f46fa7b579546b11';

const fetchWeatherData = async (endpoint, cityName)  => {
    let URL = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${cityName}&appid=${apiKey}&units=imperial`
    let response = await fetch(URL);
    return response.json()
}

const fetchLocationData = async (lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    let response = await fetch(url);
    let data = await response.json();
    return data.name
}

const createGraph = (xAxis, yAxis) => {
    if (chart) 
        chart.destroy();
    
    chart = new Chart(document.getElementById('graph'), {
    type: "line",
    data: {
        labels: xAxis,
        datasets: [{
            label: "Temperature",
            data: yAxis,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#38bdf8',
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: 'black' 
                },
                grid: {
                    color: 'rgba(255,255,255,0.15)'
                }
            },
            y: {
                ticks: {
                    color: 'black'
                },
                grid: {
                    color: 'rgba(255,255,255,0.15)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'black' 
                }
            }
        }
    }});
}

const upadateForecastInfo = async (endpoint, cityName, date) => {
    const forecast = await fetchWeatherData(endpoint, cityName)

    temp.length = 0, time.length = 0
    for(var idx = 1; idx <= 9; idx++){
        temp.push(forecast.list[idx].main.temp)
        let y = forecast.list[idx].dt_txt.split(' ')[1]
        y = y.split(':')[0]
        if(y == '00') time.push(12 + " AM")
        else if(y < 13) time.push(Number(y) + " AM")
        else time.push(Number(y - 12) + " PM")
    }
    time[0] = '  Now'
    createGraph(time, temp)

    let temperature = forecast.list[1].main.temp
    document.querySelector(".temp-report-col2-row1 h2").innerText = temperature + '°'
    let days = document.querySelectorAll('.next-week-forecast-items')
    
    let index = 0
    days.forEach((day, idx) => {
        day.querySelector('h3').innerText = new Date(date + idx * 86400000).toLocaleString("en-US", {
            weekday: "short"
        })
        for(; index < 40; index++){
            let time = forecast.list[index].dt_txt.split(' ')
            if(time[1] == '00:00:00'){
                let min = forecast.list[index].main.temp_min
                let max = forecast.list[index].main.temp_max
                while(index < 39 && forecast.list[++index].dt_txt.split(' ')[1] != '00:00:00'){
                    if(forecast.list[index].dt_txt.split(' ')[1] == '03:00:00'){
                        let weatherCode = forecast.list[index].weather[0].icon
                        let extension = 'svg'
                        weatherCode = weatherCode.slice(0, -1);
                        if(weatherCode == '04') weatherCode = '02'
                        if(weatherCode == '03') extension ='png'
                        
                        day.querySelector('img').src = `assets/weather/${weatherCode}.${extension}`
                    }
                    min = Math.min(forecast.list[index].main.temp_min, min)
                    max = Math.max(forecast.list[index].main.temp_max, max)
                }
                let p = day.querySelectorAll('p')
                p[0].innerText = min + '°'
                p[1].innerText = max + '°'
                if(idx == 0){
                    let p = document.querySelectorAll('.temp-report-col2-row2 p')
                    p[0].innerText = min + '°'
                    p[1].innerText = max + '°'
                }
                break
            }
        }
    })
    let weatherCode = forecast.list[1].weather[0].icon
    let extension = 'svg'
    
    weatherCode = weatherCode.slice(0, -1);
    if (weatherCode == '04') weatherCode = '02'
    if (weatherCode == '03') extension = 'png'
    document.querySelector('.right-now-image').src = `assets/weather/${weatherCode}.${extension}`
    document.querySelector('.today img').src = `assets/weather/${weatherCode}.${extension}`
}
const updateWeatherInfo = async (endpoint, cityName) => {
    let Weather = await fetchWeatherData(endpoint, cityName)
    
    if(Weather.cod != 200){
        document.querySelector('.start').classList.add('confidenciality')
        document.querySelector('.main-container').classList.add('confidenciality')
        document.querySelector('.foundnt').classList.remove('confidenciality')
        return
    }
    
    document.querySelector('.start').classList.add('confidenciality')
    document.querySelector('.foundnt').classList.add('confidenciality')
    document.querySelector('.main-container').classList.remove('confidenciality')
    document.querySelector('button').innerText = "°F"

    let countryCode = Weather.sys.country
    let nameOfCountry
    for(let key in countries){
        if(key == countryCode){
            nameOfCountry = countries[key]
            break
        }
    }
    document.querySelector('.location h2').innerText = ` ${Weather.name}, ${nameOfCountry}`
    let description = Weather.weather[0].description
    document.querySelector('.summary p').innerText = `${description[0].toUpperCase() + description.slice(1)}`
    document.querySelector('#date').innerText = new Date(Weather.dt * 1000).toLocaleString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    document.querySelector('#sunrise').innerText = 'Sunrise ' + new Date(Weather.sys.sunrise * 1000).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    document.querySelector('#sunset').innerText = 'Sunset ' + new Date(Weather.sys.sunset * 1000).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    
    let feelsLike = Weather.main.feels_like
    document.querySelector('.temp-report-col2-row3 p').innerText = 'Feels like '+ feelsLike + '°'
    document.querySelector('#Humidity').innerText = "Humidity " + Weather.main.humidity + '%'
    if (Weather.rain?.["1h"] !== undefined)
        document.querySelector('#Pop').innerText = "Precipitation " + Weather.rain['1h'] * 100 + '%'
    document.querySelector('#Wind').innerText = "Wind speed " + (Weather.wind.speed).toFixed(2) + " MpH"

    upadateForecastInfo('forecast', cityName, Weather.dt * 1000)
}

searchBtn.addEventListener("click", (evt) => {
    if(searchPlace.value != '')
        updateWeatherInfo('weather', searchPlace.value);
    searchPlace.value = '';
});

searchPlace.addEventListener('keydown', (evt) => {
    let key = evt.key;
    if(searchPlace.value != '' && key == 'Enter'){
        updateWeatherInfo('weather', searchPlace.value);
        searchPlace.value = '';
    }
})

searchViaLocationBtn.addEventListener('click', (evt) =>  {
    navigator.geolocation.getCurrentPosition(async (position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        let location = await fetchLocationData(latitude, longitude)
        updateWeatherInfo('weather', location)
    },
    (error) => {
        console.log("Location error:", error.message);
    })
})
button.addEventListener('click', (evt) => {
    if(button.innerText == '°F'){
        document.querySelectorAll('.conversion').forEach((node, idx) => {
            let str = node.innerText
            str = str.slice(0, -1)
            if(idx == 3) {
                str = str.split(' ')[2];
                node.innerText = 'Feels like ' + (5 * (Number(str) - 32) / 9).toFixed(2) + '°'
            }
            else {
                str = str.split(' ')[0];
                node.innerText = (5 * (Number(str) - 32) / 9).toFixed(2) + '°'
            }
        })
        let mph = Number(document.querySelector('#Wind').innerText.split(' ')[2])
        document.querySelector('#Wind').innerText = 'Wind speed ' + (mph * 1.60934).toFixed(2) + ' KpH'
        temp.forEach((t, idx) => {
            temp[idx] = (5 * (Number(t) - 32) / 9).toFixed(2)
        })
        chart.data.datasets[0].data = temp;
        chart.update();
        button.innerText = '°C'
    }
    else {
        document.querySelectorAll('.conversion').forEach((node, idx) => {
            let str = node.innerText
            str = str.slice(0, -1)
            if(idx == 3) {
                str = str.split(' ')[2];
                node.innerText = 'Feels like ' + ((9 * Number(str) / 5) + 32).toFixed(2) + '°'
            }
            else {
                str = str.split(' ')[0];
                node.innerText = ((9 * Number(str) / 5) + 32).toFixed(2) + '°'
            }
        })
        let kph = Number(document.querySelector('#Wind').innerText.split(' ')[2])
        document.querySelector('#Wind').innerText = 'Wind speed ' + (kph * 0.621371).toFixed(2) + ' MpH'
        temp.forEach((t, idx) => {
            temp[idx] = ((9 * Number(t) / 5) + 32).toFixed(2)
        })
        chart.data.datasets[0].data = temp;
        chart.update();
        button.innerText = '°F'
    }
})