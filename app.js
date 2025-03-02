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
                    updateNextPrayer(results.data);
                    setInterval(() => updateNextPrayer(results.data), 1000);
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
                    console.log("todayPrayer[prayer]: ",  todayPrayer[prayer], "currentTime", currentTime, todayPrayer[prayer] === currentTime);
                    playAzan(prayer);
                }
            });
        }
    }, 60000);
}


function playAzan(prayer) {
    if (Notification.permission === "granted") {
        new Notification("Gebetszeit", {
            body: `Es ist Zeit für ${prayer}!`,
            icon: "azan.png"
        });
    } else {
        alert(`Es ist Zeit für ${prayer}!`);
    }
    document.getElementById("prayer-notification").textContent = `Es ist Zeit für ${prayer}!`;

   
    let azan = new Audio("azan.mp3");

    azan.play().catch(error => {
        console.log("Audio konnte nicht abgespielt werden:", error);
    });
    setTimeout(() => {
        document.getElementById("prayer-notification").textContent = "";
    }, 60000);
}

// Azan für eine Webseite aktivieren
document.addEventListener("DOMContentLoaded", function () {
    let enableAudioButton = document.getElementById("enableAudio");

    enableAudioButton.addEventListener("click", () => {
        let azan = new Audio("azan.mp3");
        azan.play().then(() => {
            console.log("Audio spielt für 3 Sekunden...");

            // Nach 3 Sekunden stoppen
            setTimeout(() => {
                azan.pause();
                azan.currentTime = 0; // Zurück zum Anfang setzen
                console.log("Audio gestoppt.");
            }, 3000);

        }).catch(error => {
            console.error("Fehler beim Abspielen des Audios:", error);
        });
    });

    enableAudioButton.style.display = "block";
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log("Service Worker registriert:", reg))
    .catch(err => console.log("Service Worker Fehler:", err));
}


function updateTime() {
    let now = new Date();
    let timeString = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    document.getElementById("current-time").textContent = `Aktuelle Zeit: ${timeString}`;
}
setInterval(updateTime, 1000);
updateTime(); 

function updateNextPrayer(prayerTimes) {
    let now = new Date();
    let currentDate = now.toLocaleDateString("de-DE"); // Format: "01.03.2025"
    let currentTime = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

    let todayPrayer = prayerTimes.find(row => row.Datum === currentDate);
    
    if (!todayPrayer) return; 

    let prayerNames = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];
    let nextPrayer = null;
    let nextPrayerTime = null;

    // Nächstes Gebet finden
    for (let prayer of prayerNames) {
        let prayerTime = todayPrayer[prayer]; // Nur HH:MM ohne Sekunden
        if (prayerTime > currentTime) {
            nextPrayer = prayer;
            nextPrayerTime = prayerTime;
            break; // Erstes zukünftiges Gebet gefunden -> Schleife beenden
        }
    }

    // Falls kein weiteres Gebet am heutigen Tag -> erstes Gebet von morgen nehmen
    if (!nextPrayer) {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        let tomorrowDate = tomorrow.toLocaleDateString("de-DE"); // Format: "01.03.2025"
        let tomorrowPrayer = prayerTimes.find(row => row.Datum === tomorrowDate);
        
        if (tomorrowPrayer) {
            nextPrayer = "Fajr";
            nextPrayerTime = tomorrowPrayer["Fajr"];
        }
    }

    if (nextPrayer && nextPrayerTime) {
        // Zeitdifferenz berechnen (in Minuten)
        let [nextHours, nextMinutes] = nextPrayerTime.split(":").map(Number);
        let nextPrayerDate = new Date();
        nextPrayerDate.setHours(nextHours, nextMinutes, 0, 0); // Sekunden und Millisekunden auf 0 setzen

        if (nextPrayerDate < now) {
            nextPrayerDate.setDate(nextPrayerDate.getDate() + 1); // Falls es morgen ist
        }

        let diffMs = nextPrayerDate - now;
        let hours = Math.floor(diffMs / (1000 * 60 * 60));
        let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        document.getElementById("nextPrayer").textContent = `Nächstes Gebet: ${nextPrayer} um ${nextPrayerTime}`;
        document.getElementById("remainingTime").textContent = `Verbleibende Zeit: ${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
}