import buildData from './data-builder';
import renderNetwork from './network-vis';
import renderHierarchy from './hierarchy-vis';

let data = {};

const init = (rawData) => {
  const formattedData = buildData(rawData);
  data.nodes = formattedData.nodes;
  data.edges = formattedData.edges;
  data.hierarchy = formattedData.hierarchy;
  renderNetwork(data.nodes, data.edges);
  renderHierarchy(data.hierarchy);
};
export { init };
