const fs = require('fs');
const csvParser = require('fast-csv');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

normalize(inputFile);

function normalize(file) {

  let dataArr = [];
  let minTimestamp = Number.MAX_SAFE_INTEGER;

  csvParser
    .fromPath(file, {delimiter: ' '})
    .on("data", data => {
      let start = data[3];
      if (start < minTimestamp) minTimestamp = start;
      dataArr.push(data);
    })
    .on("end", function () {
      dataArr.forEach(data => {
        let task = data[0];
        let id = data[1];
        let resource = data[2];
        let start = data[3];
        let end = data[4];
        let time = data[5];
        let downloaded = data[6];
        let executed = data[7];
        let uploaded = data[8];
        let type = data[9];

        let normalized_start = start - minTimestamp;
        let normalized_end = end - minTimestamp;
        fs.appendFileSync(outputFile,`${task} ${id} ${resource} ${normalized_start} ${normalized_end}`
        + ` ${time} ${downloaded} ${executed} ${uploaded} ${type}\n`, console.err);
      })
    });
}
