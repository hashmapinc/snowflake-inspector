import { Network } from 'vis-network/peer/esm/vis-network';
import { DataSet } from 'vis-data/peer/esm/vis-data';
import { colors } from './constants';
import 'jstree/dist/themes/default/style.css';
import jstree from 'jstree';
import renderHierarchy from './hierarchy-vis';

// get vis div
const hierarchy_vis_div = document.getElementById('network-vis');

// set vis options
const options = {
  nodes: {
    shadow: {
      enabled: true,
      color: colors.nodeShadow,
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
      color: colors.edge,
      highlight: colors.edgeHighlight,
      hover: colors.hover,
      inherit: 'from',
      opacity: 1,
    },
  },
};

// create state arrays for click handling
let oldClickedNodeIds = [];
let oldClickedEdgeIds = [];

const getColor = function (type) {
  let color;
  if (type === 'ROLE') {
    color = colors.roleNode;
  } else if (type === 'USER') {
    color = colors.userNode;
  }
  return color;
};

export function render(json) {
  let nodes = new DataSet([]);
  let hierarchy = [];
  let database = {};
  let schema = {};
  let category = {};
  let item = {};
  json.forEach((element) => {
    if (
      element.GRANTED_ON_TYPE === 'ROLE' &&
      element.GRANTED_TO_NAME !== 'SECURITYADMIN' &&
      element.PRIVILEGE !== 'OWNERSHIP'
    ) {
      try {
        nodes.add({
          id: element.GRANTED_TO_NAME,
          label: element.GRANTED_TO_NAME,
          shape: 'box',
          color: {
            border: colors.nodeBorder,
            background: getColor(element.GRANTED_TO_TYPE),
            highlight: {
              border: colors.hoverBorder,
              background: colors.highlight,
            },
            hover: {
              border: colors.hoverBorder,
              background: colors.hover,
            },
          },
          widthConstraint: { maximum: 150 },
          initialColor: getColor(element.GRANTED_TO_TYPE),
        });
      } catch (error) {
        //errors if there are duplicate items
        console.log('Encountered error: ' + error);
      }
      try {
        nodes.add({
          id: element.GRANTED_ON_NAME,
          label: element.GRANTED_ON_NAME,
          shape: 'box',
          color: {
            border: colors.nodeBorder,
            background: getColor(element.GRANTED_ON_TYPE),
            highlight: {
              border: colors.peach,
              background: colors.highlight,
            },
            hover: {
              border: colors.hoverBorder,
              background: colors.hover,
            },
          },
          widthConstraint: { maximum: 150 },
          initialColor: getColor(element.GRANTED_ON_TYPE),
        });
      } catch (error) {
        //errors if there are duplicate items
        console.log('Encountered error: ' + error);
      }
    } else if (element.GRANTED_ON_DATABASE) {
      const index = hierarchy.findIndex((db) => db.text === element.GRANTED_ON_DATABASE);
      database = index !== -1 ? hierarchy[index] : { text: element.GRANTED_ON_DATABASE, children: [] };

      if (element.GRANTED_ON_SCHEMA) {
        let schemaIndex = database.children.findIndex((schema) => schema.text === element.GRANTED_ON_SCHEMA);
        schema =
          schemaIndex !== -1 ? database.children[schemaIndex] : { text: element.GRANTED_ON_SCHEMA, children: [] };

        if (element.GRANTED_ON_TYPE && element.GRANTED_ON_TYPE !== 'SCHEMA') {
          let categoryIndex = schema.children.findIndex((category) => category.text === element.GRANTED_ON_TYPE);
          category =
            categoryIndex !== -1 ? schema.children[categoryIndex] : { text: element.GRANTED_ON_TYPE, children: [] };
          categoryIndex === -1 ? schema.children.push(category) : (schema.children[categoryIndex] = category);

          let itemIndex = category.children.findIndex((item) => item.text === element.GRANTED_ON_NAME);
          item = itemIndex !== -1 ? category.children[itemIndex] : { text: element.GRANTED_ON_NAME, children: [] };
          itemIndex === -1 ? category.children.push(item) : (category.children[itemIndex] = item);
        }

        schemaIndex === -1 ? database.children.push(schema) : (database.children[schemaIndex] = schema);
      }
      index === -1 ? hierarchy.push(database) : (hierarchy[index] = database);
    }
  });

  renderHierarchy(hierarchy);
  // create an array with edges
  let x = [];

  json.forEach((element) => {
    if (element.GRANTED_TO_NAME !== 'SECURITYADMIN' && element.PRIVILEGE !== 'OWNERSHIP') {
      x.push({
        from: element.GRANTED_TO_NAME,
        to: element.GRANTED_ON_NAME,
        arrows: 'to',
      });
    }
  });

  let edges = new DataSet(x);

  // provide the data in the vis format
  let data = {
    nodes: nodes,
    edges: edges,
  };

  // initialize network!
  let network = new Network(hierarchy_vis_div, data, options);

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
        selectNodesRecursively(parentNodes, 'parent', colors.parentSelectedBackground, colors.parentSelectedBorder);
        selectNodesRecursively(childNodes, 'child', colors.childSelectedBackground, colors.childSelectedBorder);
      } else if (direction === 'parent') {
        parentEdges = edges.get(childEdges).filter((edge) => {
          return edge.to === nodeId;
        });
        let parentNodes = network.getConnectedNodes(nodeId, 'from');
        selectNodesRecursively(parentNodes, 'parent', colors.parentSelectedBackground, colors.parentSelectedBorder);
      } else if (direction === 'child') {
        childEdges = edges.get(childEdges).filter((edge) => {
          return edge.from === nodeId;
        });
        let childNodes = network.getConnectedNodes(nodeId, 'to');
        selectNodesRecursively(childNodes, 'child', colors.childSelectedBackground, colors.childSelectedBorder);
      }

      if (parentEdges && parentEdges.length > 0) {
        parentEdges.map((edge) => {
          edge.color = colors.parentEdge;
          edgeArray.push(edge);
        });
        edges.update(parentEdges);
      }
      if (childEdges && childEdges.length > 0) {
        childEdges.map((edge) => {
          edge.color = colors.childEdge;
          edgeArray.push(edge);
        });
        edges.update(childEdges);
      }
    }
    return [nodeArray, edgeArray];
  };

  //click handler
  network.on('select', function (properties) {
    if (oldClickedNodeIds.length > 0) {
      let oldNodes = nodes.get(oldClickedNodeIds);
      oldNodes.forEach((node) => {
        node.color = {
          border: colors.nodeBorder,
          background: node.initialColor,
          highlight: {
            border: colors.hoverBorder,
            background: colors.highlight,
          },
          hover: {
            border: colors.hoverBorder,
            background: colors.hover,
          },
        };
      });
      nodes.update(oldNodes);
    }
    if (oldClickedEdgeIds.length > 0) {
      oldClickedEdgeIds.forEach((edge) => {
        edge.color = {
          color: colors.edge,
          highlight: colors.edgeHighlight,
          hover: colors.hover,
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

  window.onresize = function () {
    network.fit();
  };
}
