import {render} from './hierarchy_vis.js'

import hierarchy_data_query from '../data/hierarchy_data_query.sql';

// handle modal submit
function on_new_hierarchy_submit(e) {
  e.preventDefault();
  $('#create-hierarchy-vis-modal').modal('toggle');
  let text = $('textarea#hierarchy-data-input').val();
  render(JSON.parse(text));
}

// handle copy button select
function on_copy_hierarchy_query_click() {
  // Write the query to the clipboard
  navigator.clipboard.writeText(hierarchy_data_query)

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