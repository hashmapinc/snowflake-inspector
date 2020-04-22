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
    improvedLayout: true,
    hierarchical: true,
  }
};

// initialize network!
var network = new vis.Network(container, data, options);

//load data
fetch("http://localhost:1111/src/grants.json")
  .then(response => response.json())
  .then(json => {
    values(json);
  });

var getColor = function(type) {
  const types = [{objType: "ROLE", color: 'lightgreen'}, 
                 {objType: "USER", color: '#D2E5FF'}];
  const x = types.find(element => element.objType === type).color;
  if(type === 'USER'){
    console.log(type);
  }
  return x;
}

var x = [];
var y = new vis.DataSet([]);
var values = function(json){
  json.forEach(element => {    
    if((element.GRANTED_TO_TYPE === 'USER' || element.GRANTED_TO_TYPE === 'ROLE' ) && (element.SNOWFLAKE_OBJECT_TYPE === 'ROLE'  || element.SNOWFLAKE_OBJECT_TYPE === 'USER')){   
      try {
        nodes.add({
          id: element.GRANTED_TO_NAME, 
          label: element.GRANTED_TO_NAME, 
          shape: "box", 
          color: { 
            border: '#2B7CE9', 
            background: getColor(element.GRANTED_TO_TYPE),
            highlight: 
            {
              border: '#2B7CE9',
              background: '#D2E5FF'
            }
          },
          widthConstraint: { maximum: 150 }
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
            border: '#2B7CE9', 
            background: getColor(element.SNOWFLAKE_OBJECT_TYPE),
            highlight: {
              border: '#2B7CE9',
              background: '#D2E5FF'
            }
          },
          widthConstraint: { maximum: 150 }
        });
      }
      catch(error) {
        console.log(error);
          //errors if there are duplicate items
      }
    }
    
  });

  json.forEach(element => {
    edges.add({from: element.OBJECT_NAME, to: element.GRANTED_TO_NAME, arrows:'to'})
  })
}
