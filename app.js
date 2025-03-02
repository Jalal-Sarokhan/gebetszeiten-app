if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        console.log("Benachrichtigungen:", permission);
    });
}

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
        let currentDate = now.toLocaleDateString("de-DE"); // Format: "01.03.2025"
        let currentTime = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

        let todayPrayer = prayerTimes.find(row => row.Datum === currentDate);
        if (todayPrayer) {
            ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"].forEach(prayer => {
                if (todayPrayer[prayer] === currentTime) {
                    playAzan(prayer);
                }
            });
        }
    }, 60000);
}


function playAzan(prayer) {
    if (Notification.permission === "granted") {
        new Notification(`Gebetszeit`, { body: `Es ist Zeit für ${prayer}!`, icon: "icon.png" });
    }
    document.getElementById("prayer-notification").textContent = `Es ist Zeit für ${prayer}!`;
    let azan = new Audio("azan.mp3");
    azan.play();
    azan.onended = () => {
        document.getElementById("prayer-notification").textContent = "";
    };
}



function updateTime() {
    let now = new Date();
    let timeString = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    document.getElementById("current-time").textContent = `Aktuelle Zeit: ${timeString}`;
}
setInterval(updateTime, 1000);
updateTime(); 

