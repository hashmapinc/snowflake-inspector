import { buildData, filterObjectsOnNodeClick, filterNodes } from './data-builder';
import renderNetwork from './network-vis';
import renderHierarchy from './hierarchy-vis';
import '../../node_modules/jquery-ui-dist/jquery-ui';
import '../../node_modules/jquery-ui-dist/jquery-ui.min.css';
import { initFilterByPrivileges, setPrivilegeHeader } from './privilege';
import { PRIVILEGE_HEADER } from './constants';

let data = {};
let state = {
  jstreeObject: null,
  selectedprivileges: [],
  selectedNodeIds: [],
  objectSelected: false,
  nodeSelected: false,
  privilegeAutocoplete: null,
};

const init = (rawData) => {
  // clear old data if any
  data = {};

  resetPrivilegeFilter();

  data.rawData = rawData;
  data.hierarchyFiltered = false;
  data.nodesFiltered = false;
  data.formattedData = buildData(rawData);
  data.hierarchy = data.formattedData.hierarchy;
  data.privileges = data.formattedData.privileges;
  data.renderedNetwork = renderNetwork(data.formattedData.nodes, data.formattedData.edges);
  renderHierarchy(data.hierarchy);
  initializeSearch();
  state.privilegeAutocoplete = initFilterByPrivileges(data.privileges);
};

const saveState = (newState) => {
  if (newState.jstreeObject) state.jstreeObject = newState.jstreeObject;
  if (newState.selectedNodeIds) state.selectedNodeIds = newState.selectedNodeIds;

  // undefined check is needed because if not used, both 'undefined' and 'false' values would block the if statement.
  if (typeof newState.objectSelected !== 'undefined') state.objectSelected = newState.objectSelected;

  if (typeof newState.nodeSelected !== 'undefined') state.nodeSelected = newState.nodeSelected;

  if (state.objectSelected) setPrivilegeHeader(PRIVILEGE_HEADER.NODES.id);
  if (state.nodeSelected) setPrivilegeHeader(PRIVILEGE_HEADER.OBJECTS.id);
};

const filterByPrivilege = (privileges) => {
  state.selectedprivileges = privileges;
  if (state.nodeSelected) onNodeClicked(state.selectedNodeIds);
  if (state.objectSelected) onHierarchyClicked(null, state.jstreeObject);
};

const onNodeClicked = (currentNodeIds, allChildren = []) => {
  if (currentNodeIds.length > 0) {
    saveState({ selectedNodeIds: currentNodeIds.concat(allChildren), nodeSelected: true, objectSelected: false });

    // Manually deselect when a node is clicked, otherwise previously clicked object makes jquery fire object on click function.
    $('#hierarchy').jstree().deselect_all(true);

    data.hierarchyFiltered = true;

    // Filter objects based on currently clicked node and theyir children before rendering the Object hierarchy
    renderHierarchy(
      filterObjectsOnNodeClick(data.rawData, currentNodeIds.concat(allChildren), state.selectedprivileges)
    );

    if (data.hierarchyFiltered) {
      $('#filter-card').show();
    }
  } else if (data.hierarchyFiltered) {
    renderHierarchy(data.hierarchy);
    data.hierarchyFiltered = false;
    resetPrivilegeFilter();
  }
};

const onNetworkReset = () => {
  data.nodesFiltered = false;
  renderHierarchy(data.hierarchy);
  resetPrivilegeFilter();
};

const isNodesFiltered = () => {
  return data.nodesFiltered;
};

const isHierarchyFiltered = () => {
  return data.hierarchyFiltered;
};

// Filter nodes when the item on jstree is
const onHierarchyClicked = (e, jstreeObject) => {
  if (jstreeObject.event) {
    const filteredNodes = filterNodes(data.formattedData, data.rawData, jstreeObject, state.selectedprivileges);
    data.renderedNetwork.resetNetwork();
    let combinedNodeList = [];
    filteredNodes.map((node) => {
      combinedNodeList.push(node.id);
      data.renderedNetwork.showLinkedNodes(node.id, true, false).allParents.map((id) => {
        if (combinedNodeList.indexOf(id) === -1) {
          combinedNodeList.push(id);
        }
      });
    });

    data.renderedNetwork.showFilteredNodes(combinedNodeList);
    data.renderedNetwork.highlightNodes(filteredNodes);
    data.nodesFiltered = true;
  }
};

$('#hierarchy').on('select_node.jstree', function (e, jstreeObject) {
  saveState({ jstreeObject: jstreeObject, objectSelected: true, nodeSelected: false });
  onHierarchyClicked(e, jstreeObject);
  if (data.nodesFiltered) {
    $('#filter-card').show();
  }
});

$('#hierarchy-vis').on('click', function (e) {
  if (e.target.id === 'hierarchy-vis') {
    if (data.nodesFiltered) {
      data.renderedNetwork.resetNetwork();
      data.nodesFiltered = false;
      resetPrivilegeFilter();
    }
  }
});

const resetPrivilegeFilter = () => {
  $('#filter-card').hide();
  if ($('#hierarchy').jstree(true)) {
    $('#hierarchy').jstree().deselect_all(true);
  }

  if (state.privilegeAutocoplete) {
    state.privilegeAutocoplete.reset();
  }
  state.jstreeObject = null;
  state.selectedprivileges = [];
  state.selectedNodeIds = [];
  state.nodeSelected = false;
  state.objectSelected = false;
};

// Provide data for search functionality to the jQuery functions.
const initializeSearch = () => {
  let allNodeNames = [];
  // Nodes are each items on the network on the home page. They are either Roles or Users. Extracting names and Id's from each node for autosuggest
  data.formattedData.nodes.map((x) => {
    allNodeNames.push({ label: x.name, value: x.id });
  });

  $('#search-selector').autocomplete({
    source: allNodeNames,
    select: (event, ui) => {
      event.preventDefault();
      $('#search-selector').val(ui.item.label);
      $('#search-selector').data('key', ui.item.value);
      searchNode(ui.item.value);
    },
  });

  $('#network-search').submit(function (event) {
    event.preventDefault();
    let searchString = $('#search-selector').val();
    if (searchString) {
      // When searched, users see name of the noe, but node object with ID and name is needed to actually search.
      let searchObj = allNodeNames.filter((node) => node.label === searchString);

      if (searchObj && searchObj.length > 0) {
        searchNode(searchObj[0].value);
      }
    }
  });
};

const searchNode = (searchId) => {
  data.renderedNetwork.resetNetwork();

  let connectedNodeIds = [searchId];
  let connectedNodes = data.renderedNetwork.showLinkedNodes(searchId);

  // Add all the connected nodes to the searched node. Needed for filtering and highlighting searched node
  connectedNodes.nodeArray.map((id) => {
    if (connectedNodeIds.indexOf(id) === -1) {
      connectedNodeIds.push(id);
    }
  });
  data.renderedNetwork.showFilteredNodes(connectedNodeIds);
  data.renderedNetwork.highlightNodes([{ id: searchId }], false);
  data.renderedNetwork.nodeSelectionEventHandler([searchId], connectedNodes);

  data.nodesFiltered = true;
};

$('#fileinput').on('change', (event) => {
  const defaultFileInputLabel = 'Download your query results as a CSV and upload here';

  // get the file name
  let fileName = null;
  try {
    fileName = event.target.files[0].name;
  } catch (error) {}

  // generate file input label value
  const fileInputLabel = fileName || defaultFileInputLabel;

  // replace the file input label
  $('#fileinput-label').html(fileInputLabel);
});

export { init, onNodeClicked, onNetworkReset, isNodesFiltered, isHierarchyFiltered, filterByPrivilege };
