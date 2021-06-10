/* eslint-disable no-undef */
onload = async function() {
	const clockElement = this.document.getElementById("clock");
	setInterval(() => {
		const time = new Date().toLocaleTimeString();
		clockElement.innerHTML = time;
	}, 1000);
};