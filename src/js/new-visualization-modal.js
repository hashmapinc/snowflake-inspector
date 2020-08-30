import * as app from './app';

import dataQuery from '../data/data_query.sql';

let queryResults = null;
// handle modal submit
function onNewVisSubmit() {
  $('#fileinput').trigger('change');
  // remove old warnings
  hideAllWarnings();
  if (!queryResults) {
    if ($('#fileinput').val()) {
      $('#invalid-query-results-warning').show();
    } else {
      $('#empty-query-results-warning').show();
    }
  } else {
    try {
      app.init(queryResults);
      $('#create-vis-modal').modal('toggle');
    } catch (error) {
      $('#invalid-query-results-warning').show();
      alert('Please submit feedback if you believe this is a bug.');
    }
  }
}
//hide warning on modal open
$('#create-vis-modal').on('shown.bs.modal', function (e) {
  hideAllWarnings();
});

function hideAllWarnings() {
  $('#invalid-query-results-warning').hide();
  $('#empty-query-results-warning').hide();
}
// handle copy button select
function onCopyQueryClick() {
  // Select the query element and copy it's contents
  $('#data-query').select();
  document.execCommand('copy');

  // change the copy button text to show the copy happened
  $('#copy-query-button').text('Copied!');
  setTimeout(() => {
    $('#copy-query-button').text('Copy to clipboard');
  }, 1500);
}

export default function initModal() {
  // add SQL query to the modal
  document.getElementById('data-query').innerHTML = dataQuery;

  hideAllWarnings();

  // wire up event listeners
  $('#new-vis-button').click(onNewVisSubmit);
  $('#copy-query-button').click(onCopyQueryClick);
}

const csvStringToArray = (strData) => {
  const objPattern = new RegExp('(\\,|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^\\,\\r\\n]*))', 'gi');
  // Create an array to hold our individual pattern
  // matching groups.
  let arrMatches = null,
    // Create an array to hold our data. Give the array
    // a default empty first row.
    arrData = [[]];
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    if (arrMatches[1].length && arrMatches[1] !== '\\') arrData.push([]);
    arrData[arrData.length - 1].push(arrMatches[2] ? arrMatches[2].replace(new RegExp('""', 'g'), '"') : arrMatches[3]);
  }
  return arrData;
};

function readSingleFile(evt) {
  let f = evt.target.files[0];
  if (f) {
    let r = new FileReader();
    r.onload = function (e) {
      let contents = e.target.result;
      let lines = csvStringToArray(contents);
      //remove 1st element
      const firstElement = lines.shift();

      try {
        if (firstElement[0] === 'GRANT_OBJ') {
          queryResults = lines.map((line) => {
            return JSON.parse(line);
          });
          hideAllWarnings();
        } else {
          hideAllWarnings();
          $('#invalid-query-results-warning').show();
          queryResults = null;
        }
      } catch (error) {
        queryResults = null;
        hideAllWarnings();

        $('#invalid-query-results-warning').show();
        alert('Please submit feedback if you believe this is a bug.');
      }
    };
    r.readAsText(f);
  } else {
    alert('Failed to load file');
  }
}

$('#fileinput').on('change', readSingleFile);
