if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        console.log("Benachrichtigungen:", permission);
    });
}


document.addEventListener("DOMContentLoaded", function () {
    fetch("gebetszeiten_2025.csv")
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                delimiter: ";",
                skipEmptyLines: true,
                complete: function (results) {

                    const prayerTimes = results.data; // alle Daten für Berechnung behalten

                    // 1️⃣ Heute
                    updateDayTable(prayerTimes, "today");

                    // 2️⃣ Morgen
                    updateDayTable(prayerTimes, "tomorrow");

                    // Funktionen für nächste Gebetszeiten
                    checkPrayerTimes(prayerTimes);
                    updateNextPrayer(prayerTimes);
                    setInterval(() => updateNextPrayer(prayerTimes), 1000);
                }
            });
        });
});

// Funktion für Tagesanzeige
function updateDayTable(prayerTimes, day) {
    let tableBody, targetDate;

    if (day === "today") {
        tableBody = document.querySelector("#prayer-table tbody");
        const today = new Date();
        targetDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
    } else if (day === "tomorrow") {
        tableBody = document.querySelector("#prayer-table-tomorrow tbody");
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        targetDate = `${tomorrow.getDate()}.${tomorrow.getMonth() + 1}.${tomorrow.getFullYear()}`;
    }

    const dayRow = prayerTimes.find(row => row.Datum === targetDate);

    tableBody.innerHTML = "";

    if (!dayRow) {
        tableBody.innerHTML = `<tr><td colspan="7">Keine Gebetszeiten für ${day} gefunden</td></tr>`;
        return;
    }

    // Optional: für Morgen eine Überschrift einfügen
    if (day === "tomorrow") {
        const headerRow = document.createElement("tr");
        const headerCell = document.createElement("td");
        headerCell.textContent = "الغد";
        headerCell.colSpan = 7;
        headerCell.style.textAlign = "center";
        headerCell.style.fontWeight = "bold";
        headerRow.appendChild(headerCell);
        tableBody.appendChild(headerRow);
    }
     // Optional: für Heute eine Überschrift einfügen
    if (day === "today") {
        const headerRow = document.createElement("tr");
        const headerCell = document.createElement("td");
        headerCell.textContent = "اليوم";
        headerCell.colSpan = 7;
        headerCell.style.textAlign = "center";
        headerCell.style.fontWeight = "bold";
        headerRow.appendChild(headerCell);
        tableBody.appendChild(headerRow);
    }

    // Gebetszeiten einfügen
    const tr = document.createElement("tr");
    Object.values(dayRow).forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
    });
    tableBody.appendChild(tr);
}


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


function updateTime() {
    let now = new Date();
    let timeString = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    document.getElementById("current-time").textContent = `Aktuelle Zeit: ${timeString}`;
}
setInterval(updateTime, 1000);
updateTime(); 
function updateYear() { 
    let year = new Date().getFullYear();
    document.getElementById("current-year").textContent = `Gebetszeiten für: ${year}`;
}
updateYear(); 

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
