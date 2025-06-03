async function loadCoordinates() {
	const response = await fetch("./coordinates.json");
	const json = await response.json();
	return json;
};

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
		const projectNames = projects[1].map((project) => project["dc_project"]);
		const projectLatitude = projects[1][0]["lat"];
		const projectLongitude = projects[1][0]["lon"];
		const coordinates = [projectLatitude, projectLongitude];
		const result = { name: projectNames, coordinates: coordinates };
		return result;
	});

	orderedDcProjects.forEach((project) => {
		const marker = L.marker(project.coordinates).addTo(myMap);
		marker.bindPopup(
			`<b>Number of data centers</b>: ${project.name.length}<br><b>DC project:</b> ${project.name}`
		);
	});
}

dcProjectsMap();
