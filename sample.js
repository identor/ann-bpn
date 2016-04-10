'use strict';

const brain = require('brain');
const async = require('async');
const pad = require('pad');

class PsychicMemeTraining {
  constructor(Firebase, $firebaseArray) {
    this.net = new NeuralNetwork();
    this.ref = new Firebase('https://psychic-meme.firebaseio.com');
    this.trainingData = $firebaseArray(this.ref.child('trainingData'));
  }

  train(trainCallback) {
    let inputs = [];
    let outputs = [];
    this.trainingData.$loaded().then(() => {
      eachSeries(this.trainingData, (item, callback) => {
        let binaryArr = [];
        getBlob(item.img, data => {
          var reader = new FileReader();
          reader.addEventListener('loadend', function() {
            let b64str = _arrayBufferToBase64(reader.result);
            for (let i = 0; i < b64str.length; i++) {
              pad(8, dec2bin(b64str.charCodeAt(i)), '0').split('').forEach(bDigit => {
                binaryArr.push(+bDigit);
              });
            }
            inputs.push(binaryArr);
            outputs.push(mapEmotion(item.emotion));
            callback();
          });
          reader.readAsArrayBuffer(data);
        });
      }, () => {
        let finalTrainingData = inputs.map((input, index) => {
          // normalize data set to 4544
          let trimInput = input => {
            return input.slice(0, 4544);
          };

          return {
            input: trimInput(input),
            output: outputs[index]
          };
        })
        console.log(finalTrainingData[0].input.length, finalTrainingData[0].output);
        console.log(finalTrainingData[1].input.length, finalTrainingData[0].output);
        console.log(finalTrainingData[2].input.length, finalTrainingData[0].output);
        console.log(finalTrainingData[3].input.length, finalTrainingData[0].output);
        console.log(finalTrainingData[4].input.length, finalTrainingData[0].output);
        console.log(this.net.train(finalTrainingData, {
          errorThresh: 0.005,
          iterations: 20000,
          log: true,
          logPeriod: 10,
          learningRate: 0.3
        }));
      });
    });
  }


  static factory(Firebase, $firebaseArray) {
    'ngInject';
    return new PsychicMemeTraining(Firebase, $firebaseArray);
  }
}

function mapEmotion(emotion) {
  switch (emotion) {
    case 'happy': return [0];
    case 'normal': return [1];
    default: return [1];
  }
}

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function getBlob(imgUrl, callback) {
  var oReq = new XMLHttpRequest();
  oReq.open('GET', imgUrl, true);
  oReq.responseType = 'blob';

  oReq.onload = function(oEvent) {
    var blob = oReq.response;
    callback(blob);
  };

  oReq.send();
}

