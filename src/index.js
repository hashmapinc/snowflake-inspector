'use strict';

import sample_data from './data/sample-data.json';
import * as app from './js/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/style.css';
import 'bootstrap';
import jstree from 'jstree';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import initModal from './js/new-visualization-modal.js';

// main
document.addEventListener('DOMContentLoaded', function () {
  initModal();
  //load sample data
  app.init(sample_data);
});
