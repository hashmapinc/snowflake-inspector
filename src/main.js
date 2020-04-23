'use strict';

var nodes = new vis.DataSet([]);

// create an array with edges
var edges = new vis.DataSet([]);

// create a network
var container = document.getElementById('mynetwork');

// provide the data in the vis format
var data = {
  nodes: nodes,
  edges: edges
};
var options = {
  layout:{
    //improvedLayout: true,
    hierarchical: {
      nodeSpacing: 180
    }
  },
  physics: false,
  interaction:{
    hover:true
  },
  edges: {
    color: {
      color:'rgb(211, 211, 211, 0.1)',
      highlight:'blue',
      hover: 'rgb(35, 120, 249, 1)',
      inherit: 'from',
      opacity: 1
    },
  },
  shadow:{
    enabled: true,
    color: 'rgba(0,0,0,0.5)',
    size:10,
    x:5,
    y:5
  },
};

// initialize network!
var network = new vis.Network(container, data, options);

let oldClickedNodeIds = [];
let oldClickedEdgeIds = [];
//click handler
network.on( 'select', function(properties) {
  if(oldClickedNodeIds.length > 0 ) {
      let oldNodes = nodes.get(oldClickedNodeIds)
      oldNodes.forEach(node => {
        node.color = 
        { 
          border: 'rgb(211, 211, 211, 1)', 
          background: node.initialColor,
          highlight: 
          {
            border: '#2B7CE9',
            background: 'yellow'
          },
          hover: {
            border: '#2B7CE9',
            background: 'lightblue'
          }
        }
      })
      nodes.update(oldNodes);
  }
  if(oldClickedEdgeIds.length > 0 ) {
      let oldEdges = edges.get(oldClickedEdgeIds)
      oldEdges.forEach(edge => {
        edge.color = {
          color:'rgb(211, 211, 211, 0.1)',
          highlight:'blue',
          hover: 'blue',
          inherit: 'from',
          opacity: 0.5
        }
      })
      edges.update(oldEdges);
  }
  const clickedId = properties.nodes[0];
   const connectedNodes = network.getConnectedNodes(clickedId)
   const connectedEdges = network.getConnectedEdges(clickedId)

//   connectedNodes.push(clickedId);
//   nodes.update({id: clickedId, color: {background: "orange"}});
//   network.selectNodes(connectedNodes);

  // network.selectEdges(connectedEdges);
   connectedNodes.forEach(nodeId => {
   // network.clustering.updateEdge(originalEdge.id, {color : '#aa0000'})
    nodes.update({id: nodeId, color: {background: "rgb(113, 167, 247, 1)"}});
  })
  connectedEdges.forEach(edgeId => {
    edges.update({id: edgeId, color: "blue" });
  })
  oldClickedNodeIds = connectedNodes;
  oldClickedEdgeIds = connectedEdges;
 network.redraw();
});

// network.on( 'deselectNode', function(properties) {

//   const previousIds = properties.previousSelection.nodes;
//   const connectedNodes = network.getConnectedNodes(clickedId)

//   connectedNodes.forEach(nodeId => {
//     nodes.update({id: nodeId, color: {background: "orange"}});
//   })
// //  network.redraw();
// });




//load data
fetch("http://localhost:1111/src/grants.json")
  .then(response => response.json())
  .then(json => {
    render(json);
  });

var getColor = function(type) {
  var color;
  if(type === "ROLE"){
    color = "rgb(255, 232, 232, 1)";
  }
  else if(type === "USER"){
    color = "rgb(189, 243, 227, 1)";
  }
  return color;
}

var render = function(json){
  json.forEach(element => {    
    if((element.SNOWFLAKE_OBJECT_TYPE === 'ROLE') && (element.GRANTED_TO_NAME !=="SECURITYADMIN")) {   
      try {
        nodes.add({
          id: element.GRANTED_TO_NAME, 
          label: element.GRANTED_TO_NAME, 
          shape: "box", 
          color: { 
            border: 'rgb(211, 211, 211, 1)', 
            background: getColor(element.GRANTED_TO_TYPE),
            highlight: 
            {
              border: 'rgb(211, 211, 211, 1)',
              background: 'yellow'
            },
            hover: {
              border: '#2B7CE9',
              background: 'lightblue'
            }
          },
          widthConstraint: { maximum: 150 },
          initialColor: getColor(element.GRANTED_TO_TYPE)
        });
      }
      catch(error) {
        console.log(error);
        //errors if there are duplicate items
      }
      try {
        nodes.add({
          id: element.OBJECT_NAME, 
          label: element.OBJECT_NAME, 
          shape: "box", 
          color: { 
            border: 'rgb(211, 211, 211, 1)', 
            background: getColor(element.SNOWFLAKE_OBJECT_TYPE),
            highlight: {
              border: '#2B7CE9',
              background: 'yellow'
            },
            hover: {
              border: '#2B7CE9',
              background: 'lightblue'
            }
          },
          widthConstraint: { maximum: 150 },
          initialColor: getColor(element.SNOWFLAKE_OBJECT_TYPE)
        });
      }
      catch(error) {
        console.log(error);
          //errors if there are duplicate items
      }
    }
    
  });

  json.forEach(element => {
    if((element.GRANTED_TO_NAME !=="SECURITYADMIN") && (element.PRIVILEGE !== 'OWNERSHIP')) {
      edges.add({from: element.OBJECT_NAME, to: element.GRANTED_TO_NAME, arrows:'to'})
    }
  })
}
