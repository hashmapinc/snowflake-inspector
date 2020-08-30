import { buildData, filterObjectsOnNodeClick, filterNodes } from './data-builder';
import renderNetwork from './network-vis';
import renderHierarchy from './hierarchy-vis';

let data = {};

const init = (rawData) => {
  data.rawData = rawData;
  data.hierarchyFiltered = false;
  data.nodesFiltered = false;
  data.formattedData = buildData(rawData);
  data.hierarchy = data.formattedData.hierarchy;
  data.renderedNetwork = renderNetwork(data.formattedData.nodes, data.formattedData.edges);
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

$('#fileinput').on('change', (e) => {
  const defaultFileInputLabel = 'Download your query results as a CSV and upload here';

  // get the file name
  let fileName = null;
  try {
    fileName = e.target.files[0].name;
  } catch (error) {
  }

  // generate file input label value
  const fileInputLabel = fileName || defaultFileInputLabel;

  // replace the file input label
  $('#fileinput-label').html(fileInputLabel);
})

export { init, onNodeClicked, onNetworkReset, isNodesFiltered, isHierarchyFiltered };
