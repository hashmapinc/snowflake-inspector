'use strict';

import * as app from './js/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/style.css';
import 'bootstrap';
import jstree from 'jstree';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import initModal from './js/new-visualization-modal.js';
import { csvStringToArray } from './js/new-visualization-modal';

// main
document.addEventListener('DOMContentLoaded', function () {
  initModal();
  loadSampleData();
});

const loadSampleData = () => {
  const URL = window.location.host + '/sample-data.csv';

  /*  
    If you have the external URL for the file, you could hardcode the URL like this -  fetch('http://snowflakeinspector.hashmapinc.com/sample-data.csv')
  */
  fetch('http://' + URL)
    .then((response) => response.text())
    .then((data) => {
      let lines = csvStringToArray(data);
      //remove 1st element which is the header of CSV file
      lines.shift();

      let queryResults = lines.map((line) => {
        return JSON.parse(line);
      });

      app.init(queryResults);
    });
};
