async function loadCoordinates() {
	const response = await fetch("./coordinates.json");
	const json = await response.json();
	return json;
};

function sum(array) {
	const convertedValues = array.map((surface) => {
		const valueInt = parseInt(surface);
		if (valueInt === NaN) { return 0 } else { return valueInt }
	});
	const result = convertedValues.reduce((total, current) => { return total + current; }, 0);
	return result
}

function sumSurfaces(surfacesArray) {
	const result = sum(surfacesArray);
	if (result === 0 || isNaN(result)) { return "No documented surface yet." } else { return `${result} m²` }
}

function sumPowers(powersArray) {
	const result = sum(powersArray);
	if (result === 0 || isNaN(result)) { return "No documented power yet." } else { return `min. ${result} MW` }
}

function formatNames(namesArray) {
	const string = namesArray.join(", \n<br>");
	return string
}

function parseDelivery(deliveryString) {
	if (deliveryString === "" || deliveryString === "à venir" || deliveryString === "NR") { return "No documented delivery date yet" } else { return deliveryString }
}
async function dcProjectsMap() {
	const dcProjects = await loadCoordinates();
	const franceCenterLat = 46.227638;
	const franceCenterLng = 2.213749;

	const container = document.getElementById("map-container");
	const map = document.createElement("div");
	map.setAttribute("id", "map");
	container?.append(map);
	const options = {
		center: L.latLng(franceCenterLat, franceCenterLng),
		zoom: 6
	};
	const myMap = L.map("map", options);
	L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
	}).addTo(myMap);

	const flattenedArray = dcProjects.flat(1);
	const groupedDcProjects = Object.groupBy(flattenedArray, ({ lat }) => lat);
	const iterableGroups = Object.entries(groupedDcProjects);
	const orderedDcProjects = iterableGroups.map((projects) => {
		const projectNames = projects[1].map((project) => {
			const name = `${project["dc_project"]["name"]} (${parseDelivery(project["dc_project"]["planned_delivery"])})`;
			return name
		});
		const formattedNames = formatNames(projectNames);
		const projectSurfaces = projects[1].map((project) => project["dc_project"]["surface"]);
		const totalSurface = sumSurfaces(projectSurfaces);
		const projectPowers = projects[1].map((project) => project["dc_project"]["power"]);
		const totalPower = sumPowers(projectPowers);
		const projectLatitude = projects[1][0]["lat"];
		const projectLongitude = projects[1][0]["lon"];
		const coordinates = [projectLatitude, projectLongitude];
		const result = { number: projectNames.length, name: formattedNames, surface: totalSurface, power: totalPower, coordinates: coordinates };
		return result;
	});

	orderedDcProjects.forEach((project) => {
		const marker = L.marker(project.coordinates).addTo(myMap);
		marker.bindPopup(
			`<b>Number of data centers</b>: ${project.number}<br><b>DC project name(s) (planned delivery date):</b><br> ${project.name}<br><b>DC project total surface</b>: ${project.surface}<br><b>DC project total power</b>: ${project.power}`
		);
	});
}

dcProjectsMap();
