import { buildData, filterNodes } from './data-builder';
import renderNetwork from './network-vis';
import renderHierarchy from './hierarchy-vis';

let data = {};

const init = (rawData) => {
  data.rawData = rawData;
  data.filtered = false;
  const formattedData = buildData(rawData);
  data.nodes = formattedData.nodes;
  data.edges = formattedData.edges;
  data.hierarchy = formattedData.hierarchy;
  renderNetwork(data.nodes, data.edges);
  renderHierarchy(data.hierarchy);
};
const onNodeClicked = (currentNode, allChildren = []) => {
  if (currentNode.length > 0) {
    data.filtered = true;
    const nodeArray = [];
    nodeArray.push(currentNode[0]);
    renderHierarchy(filterNodes(data.rawData, currentNode.concat(allChildren)));
  } else if (data.filtered) {
    renderHierarchy(data.hierarchy);
    data.filtered = false;
  }
};
export { init, onNodeClicked };
