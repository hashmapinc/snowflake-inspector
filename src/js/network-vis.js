import { Network } from 'vis-network/peer/esm/vis-network';
import { DataSet, DataView } from 'vis-data/peer/esm/vis-data';
import { COLORS } from './constants';
import 'jstree/dist/themes/default/style.css';
import { onNodeClicked, onNetworkReset, isNodesFiltered, isHierarchyFiltered } from './app';
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

// create state arrays for making keeping track of highlighted nodes
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
      id: element.id,
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

  const showFilteredNodes = (filteredNodeIds) => {
    var view = new DataView(nodes, {
      filter: (item) => {
        return filteredNodeIds.indexOf(item.id) !== -1;
      },
    });

    network.setData({ nodes: view, edges: edges });
    network.redraw();
  };

  const resetNetwork = () => {
    network.setData(data);
  };

  /* This is collection of functions used for getting child nodes, parents, all connected nodes, highlighting them */
  const showLinkedNodes = (
    nodeId,
    parentsOnly = false,
    colorNodes = true,
    nodeObj = { children: [], parents: [], nodeArray: [] },
    edgeArray = [],
    direction = null
  ) => {
    let allChildren = [];
    let allParents = [];

    const selectNodesRecursively = (connectedNodes, direction, background, border) => {
      if (connectedNodes) {
        connectedNodes.forEach((child) => {
          if (nodeObj.nodeArray.indexOf(child) === -1) {
            nodeObj.nodeArray.push(child);
            if (direction === 'child' && nodeObj.children.indexOf(child) === -1) {
              nodeObj.children.push(child);
            }
            if (direction === 'parent' && nodeObj.parents.indexOf(child) === -1) {
              nodeObj.parents.push(child);
            }
            if (colorNodes) {
              nodes.update({
                id: child,
                color: {
                  background: background,
                  border: border,
                },
              });
            }

            showLinkedNodes(child, parentsOnly, colorNodes, nodeObj, edgeArray, direction);
          }
        });
      }
    };
    if (nodeId) {
      let childEdges, parentEdges;
      let connectedEdges = network.getConnectedEdges(nodeId);
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
        if (!parentsOnly) {
          selectNodesRecursively(childNodes, 'child', COLORS.childSelectedBackground, COLORS.childSelectedBorder);
        }
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

      if (parentEdges && parentEdges.length > 0 && colorNodes) {
        parentEdges.map((edge) => {
          edge.color = COLORS.parentEdge;
          edgeArray.push(edge);
        });
        edges.update(parentEdges);
      }
      if (childEdges && childEdges.length > 0 && colorNodes) {
        childEdges.map((edge) => {
          edge.color = COLORS.childEdge;
          edgeArray.push(edge);
        });
        edges.update(childEdges);
      }
    }
    return {
      nodeArray: nodeObj.nodeArray,
      edgeArray: edgeArray,
      allChildren: [].concat.apply([], nodeObj.children),
      allParents: [].concat.apply([], nodeObj.parents),
    };
  };

  // clear all the colors that was applied for highlighting
  const clearColorSelection = () => {
    if (oldClickedNodeIds && oldClickedNodeIds.length > 0) {
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
    if (oldClickedEdgeIds && oldClickedEdgeIds.length > 0) {
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
    // reset state after all the nodes highlighting is removed
    oldClickedNodeIds = [];
    oldClickedEdgeIds = [];
  };

  const highlightNodes = (nodes, clearSelection = true) => {
    if (clearSelection) clearColorSelection();
    let nodIds = [];

    nodes.map((node) => {
      nodIds.push(node.id);
    });
    network.selectNodes(nodIds);
  };

  //TODO: consolidate with network.on click handler
  const nodeSelectionEventHandler = (nodeId, connectedNodes) => {
    // Add to the list of highlighted nodes so that It can be tracked and cleared later.
    oldClickedNodeIds = oldClickedNodeIds.concat(
      connectedNodes.nodeArray.filter((item) => oldClickedNodeIds.indexOf(item) < 0)
    );

    oldClickedEdgeIds = oldClickedEdgeIds.concat(
      connectedNodes.edgeArray.filter((item) => oldClickedEdgeIds.indexOf(item) < 0)
    );

    onNodeClicked(nodeId, connectedNodes.allChildren);
  };

  //click handler
  network.on('select', (properties) => {
    clearColorSelection();
    const clickedId = properties.nodes[0];
    const connectedNodes = showLinkedNodes(clickedId);

    nodeSelectionEventHandler(properties.nodes, connectedNodes);
  });

  network.on('hoverNode', (params) => {
    network.canvas.body.container.style.cursor = 'pointer';
  });

  network.on('blurNode', (params) => {
    network.canvas.body.container.style.cursor = 'default';
  });

  network.on('click', (event) => {
    if (event.nodes.length === 0) {
      // when clicked on the empty canvas in the network area, reset the network
      if (event.edges.length === 0 && isNodesFiltered()) {
        network.setData(data);
        network.redraw();
        clearColorSelection();
        onNetworkReset();
      }
      if (isHierarchyFiltered) {
        onNodeClicked([]);
      }
    }
  });

  window.onresize = () => {
    network.fit();
  };

  return {
    showLinkedNodes: showLinkedNodes,
    showFilteredNodes: showFilteredNodes,
    resetNetwork: resetNetwork,
    highlightNodes: highlightNodes,
    nodeSelectionEventHandler: nodeSelectionEventHandler,
  };
};

export default renderNetwork;
