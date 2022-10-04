let desiredQueueCountBeforeAlert = 999999;
let desiredQueueTimeBeforeAlert = 999999;

let localUrl = "https://127.0.0.1:36075";
let remoteUrl = "https://grobb.lol";

/* Returns promise with GrobbLol body data */
function getGrobbLolData() {
    const fetchPromise = fetch("https://grobb.lol/");
    return fetchPromise.then(response => {
        return response.text();
    })
    .then(output => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(output, 'text/html');
        return doc;
    })

}

/* Parses GrobLol data into most recent queue time/size */
function parseGrobbLolData(el) {
    //Very manually tuned process - this is because there's no class/ID for the section.
    let queueCount = el.childNodes[1].childNodes[2].childNodes[5].childNodes[1].childNodes[1].childNodes[3].childNodes[1].cells[2].outerText;
    let queueTime = el.childNodes[1].childNodes[2].childNodes[5].childNodes[1].childNodes[1].childNodes[3].childNodes[1].cells[3].outerText;
    return {"queueCount": queueCount, "queueTime": queueTime};
}

/*
    Check all the enabled alerts and trigger them.
 */
function alertQueue() {
    if (document.getElementById("sirenEnabled")) {
        exampleAudio();
    }
    if (document.getElementById("notificationsEnabled")) {
        exampleNotification();
    }
    if (document.getElementById("browserAlertEnabled")) {
        exampleAlert();
    }
    // This is a canary variable I'm using to check on the first iteration
    // If the queue is too big.
    canary = 1;
    clearInterval();
}

function exampleAlert() {
    alert('The queue is getting long! You should log in!')
}

function exampleNotification() {

    Notification.requestPermission().then((result) => {
        if (result === 'granted') {
            new Notification('Grobbulus Queue Alert!', {
                body: "The queue is getting long! You should log in!",
                icon: "https://img.icons8.com/fluency/48/000000/high-priority.png"
            });
        }
    });
}

function exampleAudio() {
    const audio = new Audio('https://upload.wikimedia.org/wikipedia/commons/5/5c/Singapore_Public_Warning_System_siren.ogg');
    audio.play();
}

/**
 * Starts 15min background task of checking Grobb.lol.
 */
function initializeCheckEvery15Minutes() {
    if (typeof interval === 'undefined') {
        // Run once since setInterval doesn't immediately run.
        // If this canary changes from -1 to 1 (magic numbers bad >:[ ) then a result was found and we need no interval.
        var canary = -1;
        grobbLolDataFlow();
        if (canary === -1) {
            var interval = setInterval(() => grobbLolDataFlow(), 15 * 60 * 1000);
        }
    }
}

/**
 * Clear the background task to check Grobb.lol
 */
function clearInterval() {
    if (typeof interval  !== 'undefined') {
        clearInterval(interval);
    }
}

/**
 * Whole data flow.
 */
function grobbLolDataFlow() {
    getGrobbLolData().then(result => {
        let parsedData = parseGrobbLolData(result);
        let queueCount = parsedData["queueCount"];
        let queueTime = parsedData["queueTime"];
        if (queueTime == "N/A") {
            queueTime = 0;
        }
        if (queueCount > desiredQueueCountBeforeAlert || queueTime > desiredQueueTimeBeforeAlert) {
            alertQueue();
        }
    });
}

/**
 * Set user values.
 */
function setDesiredValues() {
    let maxQueueCountElement = document.getElementById("maxQueueCount");
    let maxQueueTimeElement = document.getElementById("maxQueueTime");
    if(maxQueueCountElement.value != '') {
        desiredQueueCountBeforeAlert = maxQueueCountElement.value;
    } else {
        desiredQueueCountBeforeAlert = 999999;
    }
    if(maxQueueTimeElement.value != '') {
        desiredQueueTimeBeforeAlert = maxQueueTimeElement.value;
    } else {
        desiredQueueTimeBeforeAlert = 999999;
    }
}

/**
 * Button handler.
 */
function startAlert() {
    if (document.getElementById("notificationsEnabled").value) {
        Notification.requestPermission().then( () => {
            setDesiredValues();
            initializeCheckEvery15Minutes();
        });
    } else {
        setDesiredValues();
        initializeCheckEvery15Minutes();
    }
}