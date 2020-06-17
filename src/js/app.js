import { buildData, filterObjects, filterNodes } from './data-builder';
import renderNetwork from './network-vis';
import renderHierarchy from './hierarchy-vis';

let data = {};

const init = (rawData) => {
  data.rawData = rawData;
  data.hierarchyFiltered = false;
  data.nodesFiltered = false;
  data.formattedData = buildData(rawData);
  data.hierarchy = data.formattedData.hierarchy;
  renderNetwork(data.formattedData.nodes, data.formattedData.edges);
  renderHierarchy(data.hierarchy);
};
const onNodeClicked = (currentNode, allChildren = []) => {
  if (currentNode.length > 0) {
    if (!data.nodesFiltered) {
      data.hierarchyFiltered = true;
      const nodeArray = [];
      nodeArray.push(currentNode[0]);
      renderHierarchy(filterObjects(data.rawData, currentNode.concat(allChildren)));
    }
  } else if (data.hierarchyFiltered) {
    renderHierarchy(data.hierarchy);
    data.hierarchyFiltered = false;
  }
};
$('#hierarchy').on('select_node.jstree', function (e, jstreeObject) {
  if (jstreeObject.event) {
    const filteredNodes = filterNodes(data.formattedData, data.rawData, jstreeObject);
    renderNetwork(filteredNodes, data.formattedData.edges);
    data.nodesFiltered = true;
  }
});
$('#hierarchy-vis').click(function (e) {
  if (e.target.id === 'hierarchy-vis') {
    if (data.nodesFiltered) {
      renderNetwork(data.formattedData.nodes, data.formattedData.edges);
      data.nodesFiltered = false;
    }
  }
});
export { init, onNodeClicked };
