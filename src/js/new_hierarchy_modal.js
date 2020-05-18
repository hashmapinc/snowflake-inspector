import {render} from './hierarchy_vis.js'

import hierarchy_data_query from '../data/hierarchy_data_query.sql';

// handle modal submit
function on_new_hierarchy_submit() {
  // remove old warnings
  $("#invalid-hierarchy-query-results-warning").hide();
  $("#empty-hierarchy-query-results-warning").hide();

  // get query results
  let query_results = $('textarea#hierarchy-data-input').val().trim();

  // validate results
  if (query_results === "") {
    $("#empty-hierarchy-query-results-warning").show();
    return;
  }

  // parse the text into a hierarchy array
  if (query_results.startsWith("GRANTS")) {
    const index = query_results.indexOf('[');
    query_results = query_results.substring(index);
  } else if (!query_results.startsWith('[')) {
    $("#invalid-hierarchy-query-results-warning").show();
    return;
  }

  // plot the hierarchy
  $('#create-hierarchy-vis-modal').modal('toggle');
  try {
    render(JSON.parse(query_results));
  } catch (error) {
    alert("Whoops! We couldn't parse your results. Please double check your query and try again. Please submit feedback if you believe this is a bug.");
  }
}

// handle copy button select
function on_copy_hierarchy_query_click() {
  // Select the query element and copy it's contents
  $("#hierarchy-data-query").select();
  document.execCommand("copy");

  // change the copy button text to show the copy happened
  $("#copy-hierarchy-query-button").text('Copied!')
  setTimeout(() => {
    $("#copy-hierarchy-query-button").text('Copy to clipboard')
  }, 1500);
}

export default function init_modal() {
  // add SQL query to the modal
  document.getElementById("hierarchy-data-query").innerHTML = hierarchy_data_query;

  // wire up event listeners
  $('#visualize-new-hierarchy-button').click(on_new_hierarchy_submit);
  $('#copy-hierarchy-query-button').click(on_copy_hierarchy_query_click);
}