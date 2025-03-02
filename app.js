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
                    console.log("todayPrayer[prayer]: ",  todayPrayer[prayer], "currentTime", currentTime, todayPrayer[prayer] === currentTime);
                    playAzan(prayer);
                }
            });
        }
    }, 30000);
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

function playTest(prayer) {
    alert(`Es ist Zeit für ${prayer}!`);
    let azan = new Audio("azan.mp3");
    azan.play();
    console.log("azan soll abgespielt", azan);
    
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

