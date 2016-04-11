'use strict';

const NeuralNetwork = require('brain').NeuralNetwork;
const async = require('async');
const pad = require('pad');
const fs = require('fs');
const readFileSync = fs.readFileSync;
const _ = require('lodash');
const jsonfile = require('jsonfile');

class PsychicMeme {
  constructor(options) {
    this.options = options || {};

    if (this.options.obj) {
      this.net = new NeuralNetwork();
      for (let baseKey in this.options.obj) {
        if (baseKey === 'options') {
          continue;
        }
        if (baseKey === 'net') {
          var tmp = this.net.fromJSON(this.options.obj.net);
        } else {
          this[baseKey] = this.options.obj[baseKey];
        }
      }
    } else {
      this.net = new NeuralNetwork();
      this.trainingData = createTrainingData();
      this.train();
    }
  }

  train(trainCallback) {
    console.log(this.net.train(this.trainingData, {
      errorThresh: 0.005,
      iterations: this.options.iterations || 1,
      log: true,
      logPeriod: 10,
      learningRate: 0.3
    }));
  }
}

// Training Data format
// Returns [ { input: [ Integer ], output: [ Integer ] } ];
function createTrainingData() {
  const fileEmotionMap = {
    '0200': 'happy',
    '0333': 'happy',
    '0003': 'not happy',
    '1000': 'not happy'
  };

  function mapEmotion(emotion) {
    switch (emotion) {
      case 'happy': return [0];
      case 'not happy': return [1];
      default: return [1];
    }
  }

  var result = [];
  for (let key in fileEmotionMap) {
    result.push({
      input: normalizedBinaryData(readFile(key)).result,
      output: mapEmotion(fileEmotionMap[key])
    });
  }

  return result;
}

// Returns a Buffer object
function readFile(id) {
  return readFileSync(`./images/data-set-${id}.jpg`);
}

// Returns an Integer array 4096 length
function normalizedBinaryData(buffer) {
  const MAX_SIZE = 4096;

  function dec2bin(dec){
      return (dec >>> 0).toString(2);
  }

  var result = _.range(MAX_SIZE).map(() => { return 0; });
  var bits = '';

  const ITTER_COUNT = Math.min(MAX_SIZE, buffer.length);
  for (let i = 0; i < ITTER_COUNT; i++) {
    const BIT_LEN = 8;
    let binaryString = pad(dec2bin(buffer[i]), BIT_LEN, '0');
    bits += binaryString;
    for (let j = 0; j < BIT_LEN; j++) {
      result[(BIT_LEN * i) + (j % BIT_LEN)] = +binaryString[j];
    }
  }

  return { result, bits };
}

function createNetwork(options) {
  var ps = new PsychicMeme(options);

  fs.writeFileSync('./bin/network.json', JSON.stringify(ps));
}

function readNetwork(options) {
  var psJSON = require('./bin/network.json');
  var ps = new PsychicMeme({ obj: psJSON });

  if (options.fileId) {
    console.log(`For: ${options.fileId}`);

    let input = normalizedBinaryData(readFile(options.fileId)).result;
    console.log(`Result: ${['happy', 'not happy'][Math.round(ps.net.run(input))]}`);
  } else {
    console.error(`No file ID specified!`);
  }
}

// Main ROUTINE
((args) => {
  let startDate = new Date();
  console.log(`Hello: available commands 'create', 'run'`);
  console.log();

  const MODE = args[0];
  switch (MODE) {
    case 'create':
      createNetwork({
        iterations: args[1]
      });
      break;
    case 'run':
      readNetwork({
        fileId: args[1]
      });
      break;
  }


  console.log();
  console.log(`-----`);

  let timeSeconds = (new Date() - startDate) / 1000;
  console.log(`Finished in ${timeSeconds} seconds.`);
})(process.argv.slice(2));

