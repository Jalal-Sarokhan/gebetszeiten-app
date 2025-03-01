document.addEventListener("DOMContentLoaded", function () {
    fetch("gebetszeiten_2025.csv") // CSV laden
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const tableBody = document.querySelector("#prayer-table tbody");
                    results.data.forEach(row => {
                        let tr = document.createElement("tr");
                        Object.values(row).forEach(value => {
                            let td = document.createElement("td");
                            td.textContent = value;
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    });
                    checkPrayerTimes(results.data);
                }
            });
        });
});

function checkPrayerTimes(prayerTimes) {
    setInterval(() => {
        let now = new Date();
        let currentTime = now.getHours() + ":" + now.getMinutes();
        let today = now.toISOString().split("T")[0];

        let todayPrayer = prayerTimes.find(row => row.Datum === today);
        if (todayPrayer) {
            Object.keys(todayPrayer).forEach(key => {
                if (todayPrayer[key] === currentTime) {
                    playAzan();
                }
            });
        }
    }, 60000); // Alle 60 Sekunden prüfen
}

function playAzan() {
    let azan = new Audio("azan.mp3");
    azan.play();
}
