import * as app from './app';

import dataQuery from '../data/data_query.sql';

// handle modal submit
function onNewVisSubmit() {
  // remove old warnings
  $('#invalid-query-results-warning').hide();
  $('#empty-query-results-warning').hide();

  // get query results
  let queryResults = $('textarea#data-input').val().trim();

  // validate results
  if (queryResults === '') {
    $('#empty-query-results-warning').show();
    return;
  }

  // parse the text into a hierarchy array
  if (queryResults.startsWith('GRANTS')) {
    const index = queryResults.indexOf('[');
    queryResults = queryResults.substring(index);
  } else if (!queryResults.startsWith('[')) {
    $('#invalid-query-results-warning').show();
    return;
  }

  // plot the visualization
  $('#create-vis-modal').modal('toggle');
  try {
    app.init(JSON.parse(queryResults));
  } catch (error) {
    alert(
      "Whoops! We couldn't parse your results. Please double check your query and try again. Please submit feedback if you believe this is a bug."
    );
  }
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

  // wire up event listeners
  $('#new-vis-button').click(onNewVisSubmit);
  $('#copy-query-button').click(onCopyQueryClick);
}
