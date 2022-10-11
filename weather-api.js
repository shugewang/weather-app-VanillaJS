const API_Key = `4e099ef8ca0714524e8a03e26a50ff05`;

const convertToCelciusFromKelvin = (kelvin) => Math.round(kelvin - 273.15);
const convertToFahrenheitFromKelvin = (kelvin) =>
	Math.round(((kelvin - 273.15) * 9) / 5 + 32);

const getWeatherForecastForLocation = async (
	locationName,
	longitude,
	latitude
) => {
	const response = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_Key}`
	);
	const data = await response.json();
	console.log("Data", data);
	const {
		main: { feels_like, temp },
		weather,
	} = data;
	const { icon, description } = weather[0];

	return {
		locationName,
		longitude,
		latitude,
		temperatureData: {
			feelsLike: {
				kelvin: feels_like,
				celcius: convertToCelciusFromKelvin(feels_like),
				fahrenheit: convertToFahrenheitFromKelvin(feels_like),
			},
			kelvin: temp,
			celcius: convertToCelciusFromKelvin(temp),
			fahrenheit: convertToFahrenheitFromKelvin(temp),
		},
		weatherCondition: {
			img: `http://openweathermap.org/img/wn/${icon}@2x.png`,
			description,
		},
	};
};

const renderWeatherData = async (weatherData) => {
	const {
		latitude,
		longitude,
		locationName,
		temperatureData: { celcius, fahrenheit },
		weatherCondition,
	} = weatherData;

	const latitudeElement = document.getElementById("latitudeId");
	latitudeElement.innerHTML = latitude;
	const longitudeElement = document.getElementById("longitudeId");
	longitudeElement.innerHTML = longitude;
	const locationNameElement = document.getElementById("locationName");
	locationNameElement.innerHTML = locationName.toUpperCase();

	const celciusElement = document.getElementById("celcius");
	celciusElement.innerHTML = `${celcius} &#8451/`;
	const fahrenheitElement = document.getElementById("fahrenheit");
	fahrenheitElement.innerHTML = `${fahrenheit} &#8457`;

	const weatherConditionElement = document.getElementById("weatherCondition");
	weatherConditionElement.innerHTML = "";
	const weatherImg = document.createElement("img");
	weatherImg.src = weatherCondition.img;
	weatherImg.alt = weatherCondition.description;
	weatherImg.classList.add("weatherIcon");
	weatherConditionElement.appendChild(weatherImg);

	const weatherDescription = document.createElement("p");
	weatherDescription.innerHTML = weatherCondition.description.toUpperCase();
	weatherDescription.classList.add("weatherDescription");
	weatherConditionElement.appendChild(weatherDescription);
};

const getWeatherData = async (locationName) => {
	const response = await fetch(
		`https://api.openweathermap.org/geo/1.0/direct?q=${locationName}&appid=${API_Key}`
	);

	const data = await response.json();
	const { lon: longitude, lat: latitude } = data[0];
	console.log(`Geo for ${locationName}`, longitude, latitude);
	if (!longitude || !latitude) {
		throw new Error(`Failed to get Geo location for ${locationName}`);
	}

	const weatherData = await getWeatherForecastForLocation(
		locationName,
		longitude,
		latitude
	);
	renderWeatherData(weatherData);
	return weatherData;
};

const handleSubmit = (evt) => {
	evt.preventDefault();
	//alert('worked');
	const chosenLocationField = document.getElementById("locationId");
	const statusMessage = document.getElementById("statusMessage");
	const chosenLocation = chosenLocationField.value;

	if (!chosenLocation) {
		statusMessage.innerHTML = "Please enter a location";
	} else {
		statusMessage.innerHTML = "";
	}

	if (chosenLocation.length > 3) {
		// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
		try {
			const weatherData = getWeatherData(chosenLocation);
		} catch (e) {
			statusMessage.innerHTML = e.message;
		}
	}
};

const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", handleSubmit);
