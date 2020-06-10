import { Network } from 'vis-network/peer/esm/vis-network';
import { DataSet } from 'vis-data/peer/esm/vis-data';
import { COLORS } from './constants';
import 'jstree/dist/themes/default/style.css';
import jstree from 'jstree';
import renderHierarchy from './hierarchy-vis';

// get vis div
const networkVisDiv = document.getElementById('network-vis');

// set vis options
const options = {
  nodes: {
    shadow: {
      enabled: true,
      color: COLORS.nodeShadow,
      size: 10,
      x: 5,
      y: 5,
    },
  },
  layout: {
    hierarchical: {
      enabled: true,
      nodeSpacing: 180,
      sortMethod: 'directed',
    },
  },
  physics: false,
  interaction: {
    hover: true,
  },
  edges: {
    color: {
      color: COLORS.edge,
      highlight: COLORS.edgeHighlight,
      hover: COLORS.hover,
      inherit: 'from',
      opacity: 1,
    },
  },
};

// create state arrays for click handling
let oldClickedNodeIds = [];
let oldClickedEdgeIds = [];

const getColor = (type) => {
  let color;
  if (type === 'ROLE') {
    color = COLORS.roleNode;
  } else if (type === 'USER') {
    color = COLORS.userNode;
  }
  return color;
};

const renderNetwork = (dataNodes, dataEdges) => {
  let nodes = new DataSet([]);

  dataNodes.forEach((element) => {
    nodes.add({
      id: element.name,
      label: element.name,
      shape: 'box',
      color: {
        border: COLORS.nodeBorder,
        background: getColor(element.type),
        highlight: {
          border: COLORS.hoverBorder,
          background: COLORS.highlight,
        },
        hover: {
          border: COLORS.hoverBorder,
          background: COLORS.hover,
        },
      },
      widthConstraint: { maximum: 150 },
      initialColor: getColor(element.type),
    });
  });
  // create an array with edges

  let edges = new DataSet(dataEdges);

  // provide the data in the vis format
  let data = {
    nodes: nodes,
    edges: edges,
  };

  // initialize network!
  let network = new Network(networkVisDiv, data, options);

  let getLinkedNodes = (nodeId, nodeArray = [], edgeArray = [], direction = null) => {
    const selectNodesRecursively = (connectedNodes, direction, background, border) => {
      if (connectedNodes) {
        connectedNodes.forEach((child) => {
          if (nodeArray.indexOf(child) === -1) {
            nodeArray.push(child);
            nodes.update({
              id: child,
              color: {
                background: background,
                border: border,
              },
            });
            getLinkedNodes(child, nodeArray, edgeArray, direction);
          }
        });
      }
    };
    if (nodeId) {
      let connectedEdges = network.getConnectedEdges(nodeId);
      let childEdges, parentEdges;
      if (direction === null) {
        [childEdges, parentEdges] = edges.get(connectedEdges).reduce(
          ([a, b], edge) => {
            if (edge.from === nodeId) {
              a.push(edge);
            }
            if (edge.to === nodeId) {
              b.push(edge);
            }
            return [a, b];
          },
          [[], []]
        );

        let parentNodes = network.getConnectedNodes(nodeId, 'from');
        let childNodes = network.getConnectedNodes(nodeId, 'to');
        selectNodesRecursively(parentNodes, 'parent', COLORS.parentSelectedBackground, COLORS.parentSelectedBorder);
        selectNodesRecursively(childNodes, 'child', COLORS.childSelectedBackground, COLORS.childSelectedBorder);
      } else if (direction === 'parent') {
        parentEdges = edges.get(childEdges).filter((edge) => {
          return edge.to === nodeId;
        });
        let parentNodes = network.getConnectedNodes(nodeId, 'from');
        selectNodesRecursively(parentNodes, 'parent', COLORS.parentSelectedBackground, COLORS.parentSelectedBorder);
      } else if (direction === 'child') {
        childEdges = edges.get(childEdges).filter((edge) => {
          return edge.from === nodeId;
        });
        let childNodes = network.getConnectedNodes(nodeId, 'to');
        selectNodesRecursively(childNodes, 'child', COLORS.childSelectedBackground, COLORS.childSelectedBorder);
      }

      if (parentEdges && parentEdges.length > 0) {
        parentEdges.map((edge) => {
          edge.color = COLORS.parentEdge;
          edgeArray.push(edge);
        });
        edges.update(parentEdges);
      }
      if (childEdges && childEdges.length > 0) {
        childEdges.map((edge) => {
          edge.color = COLORS.childEdge;
          edgeArray.push(edge);
        });
        edges.update(childEdges);
      }
    }
    return [nodeArray, edgeArray];
  };

  //click handler
  network.on('select', (properties) => {
    if (oldClickedNodeIds.length > 0) {
      let oldNodes = nodes.get(oldClickedNodeIds);
      oldNodes.forEach((node) => {
        node.color = {
          border: COLORS.nodeBorder,
          background: node.initialColor,
          highlight: {
            border: COLORS.hoverBorder,
            background: COLORS.highlight,
          },
          hover: {
            border: COLORS.hoverBorder,
            background: COLORS.hover,
          },
        };
      });
      nodes.update(oldNodes);
    }
    if (oldClickedEdgeIds.length > 0) {
      oldClickedEdgeIds.forEach((edge) => {
        edge.color = {
          color: COLORS.edge,
          highlight: COLORS.edgeHighlight,
          hover: COLORS.hover,
          inherit: 'from',
          opacity: 1,
        };
      });
      edges.update(oldClickedEdgeIds);
    }
    const clickedId = properties.nodes[0];
    const connectedNodes = getLinkedNodes(clickedId);

    oldClickedNodeIds = connectedNodes[0];
    oldClickedEdgeIds = connectedNodes[1];
  });

  network.on('hoverNode', (params) => {
    network.canvas.body.container.style.cursor = 'pointer';
  });
  network.on('blurNode', (params) => {
    network.canvas.body.container.style.cursor = 'default';
  });

  window.onresize = () => {
    network.fit();
  };
};

export default renderNetwork;
