var moment = require("moment");
var _ = require("lodash");

var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: "http://localhost:9200"
});

const DRIVERS = [
  "Estella Maestas",
  "Alona Norden",
  "Marry Caudillo",
  "Lashay Tinner",
  "Neville Shelburne",
  "Lizzie Hutson",
  "Yukiko Morones",
  "Phoebe Lando",
  "Guillermina Nolting",
  "Olive Mcneese",
  "Gidget Holston",
  "Sharlene Prigge"
];

const TEAMS = ["pink", "blue", "yellow", "green"];

/*
race number (YYYY-MM-DD-HHmm)

lap number (25)
position (random 1-4, depends on current position)
time (milliseconds 3000-6000)

*/

const LAPS = 25;
const SAMPLES = 5;
const THROTTLE = true;

function run() {
  let lap = 1;
  let race = new Date().valueOf();
  let sample = 1;
  let lastTime = 4500;

  function getLapTime() {
    const maybeTime = lastTime + Math.random() * 1000 - 500;
    if (maybeTime < 3000 || maybeTime > 7000)
      return Math.random() * 3000 + 3000;
    return maybeTime;
  }

  function runLap() {
    const time = getLapTime();
    lastTime = time;
    setTimeout(function() {
      const date = new Date();
      const driverIndex = race % DRIVERS.length;
      const driver = DRIVERS[race % DRIVERS.length];
      const team = TEAMS[race % TEAMS.length];
      const doc = {
        driver,
        team,
        race,
        lap,
        time: Math.round((time / 1000 + driver.length / 10) * 1000) / 1000,
        speed:
          Math.round(
            5.9 / (time / 1000 + driver.length / 10 + Math.random()) * 1000
          ) / 1000,
        position: Math.floor(Math.random() * 4) + 1,
        id: `${date.valueOf()}__${race}__${lap}__${sample}`,
        "@timestamp": date.toISOString()
      };

      console.log(doc);
      index(doc, "races", "races", doc.id);

      // Set lap, race, driver
      if (sample >= SAMPLES) {
        sample = 1;
        if (lap >= LAPS) {
          lap = 1;
          race = new Date().valueOf();
        } else {
          lap = lap + 1;
        }
      } else {
        sample = sample + 1;
      }

      runLap();
    }, THROTTLE ? time / SAMPLES : 10);
  }

  runLap();
}

function index(doc, index, type, id) {
  console.log(`${index}/${type}/${id}`);
  return client.index({ index: index, type: type, id: id, body: doc });
}

run();
