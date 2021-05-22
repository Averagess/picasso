
onload = function() {
    const clockElement = document.getElementById("clock")
    setInterval(() => {
        const time = new Date().toLocaleTimeString();
        clockElement.innerHTML = time;
    }, 1000)
}