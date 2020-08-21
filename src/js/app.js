import { buildData, filterObjectsOnNodeClick, filterNodes } from './data-builder';
import renderNetwork from './network-vis';
import renderHierarchy from './hierarchy-vis';
import '../../node_modules/jquery-ui-dist/jquery-ui';
import '../../node_modules/jquery-ui-dist/jquery-ui.min.css';

// Needed for node search functionality
let allNodeNames = [];

let data = {};
const init = (rawData) => {
  data.rawData = rawData;
  data.hierarchyFiltered = false;
  data.nodesFiltered = false;
  data.formattedData = buildData(rawData);
  data.hierarchy = data.formattedData.hierarchy;
  data.renderedNetwork = renderNetwork(data.formattedData.nodes, data.formattedData.edges);
  data.formattedData.nodes.map((x) => {
    allNodeNames.push({ label: x.name, value: x.id });
  });
  renderHierarchy(data.hierarchy);
};
const onNodeClicked = (currentNode, allChildren = []) => {
  if (currentNode.length > 0) {
    if (!data.nodesFiltered) {
      data.hierarchyFiltered = true;
      const nodeArray = [];
      nodeArray.push(currentNode[0]);
      renderHierarchy(filterObjectsOnNodeClick(data.rawData, currentNode.concat(allChildren)));
    }
  } else if (data.hierarchyFiltered) {
    renderHierarchy(data.hierarchy);
    data.hierarchyFiltered = false;
  }
};

const onNetworkReset = () => {
  data.nodesFiltered = false;
  renderHierarchy(data.hierarchy);
};

const isNodesFiltered = () => {
  return data.nodesFiltered;
};

const isHierarchyFiltered = () => {
  return data.hierarchyFiltered;
};

$('#hierarchy').on('select_node.jstree', function (e, jstreeObject) {
  if (jstreeObject.event) {
    const filteredNodes = filterNodes(data.formattedData, data.rawData, jstreeObject);
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
});
$('#hierarchy-vis').click(function (e) {
  if (e.target.id === 'hierarchy-vis') {
    if (data.nodesFiltered) {
      data.renderedNetwork.resetNetwork();
      data.nodesFiltered = false;
    }
  }
});

$('#search-selector').autocomplete({
  source: allNodeNames,
  select: (event, ui) => {
    var label = ui.item.label;
    var value = ui.item.value;
    //store in session
    alert(value);
  },
});

$('#search-selector').change(function () {
  // alert($('#search-selector').val());
});

$('#network-search').submit(function (event) {
  event.preventDefault();
});

export { init, onNodeClicked, onNetworkReset, isNodesFiltered, isHierarchyFiltered };
