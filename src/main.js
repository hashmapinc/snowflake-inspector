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

var x = [];
var y = new vis.DataSet([]);
var values = function(json){
  json.forEach(element => {
    var xbgcolor = '', ybgcolor  = '';
    
      if((element.GRANTED_TO_TYPE === 'USER' || element.GRANTED_TO_TYPE === 'ROLE' ) && (element.SNOWFLAKE_OBJECT_TYPE === 'ROLE'  || element.SNOWFLAKE_OBJECT_TYPE === 'USER')){   


        if(element.GRANTED_TO_TYPE === 'ROLE'){
          xbgcolor = 'lightgreen'
        } else if(element.GRANTED_TO_TYPE === 'USER'){
          xbgcolor = '#D2E5FF'
        }
        if(element.SNOWFLAKE_OBJECT_TYPE === 'ROLE'){
          ybgcolor = 'lightgreen'
        } else if(element.SNOWFLAKE_OBJECT_TYPE === 'USER'){
          ybgcolor = '#D2E5FF'
        }
        try {
        y.add({id: element.GRANTED_TO_NAME, label: element.GRANTED_TO_NAME, shape: "box", color: { border: '#2B7CE9', background: xbgcolor,
          highlight: {
            border: '#2B7CE9',
            background: '#D2E5FF'
          }},
          widthConstraint: { maximum: 150 }
        });
      }
      catch(error) {
        console.log(error);
        //errors if there are duplicate items
      }
      try {
        y.add({id: element.OBJECT_NAME, label: element.OBJECT_NAME, shape: "box", color: { border: '#2B7CE9', background: ybgcolor,
        highlight: {
          border: '#2B7CE9',
          background: '#D2E5FF'
        }},
        widthConstraint: { maximum: 150 }
      });
    }
    catch(error) {
      console.log(error);
        //errors if there are duplicate items
    }
    }
    
  });
  x = y.distinct('id');
  var items = y.get(x);
  nodes.add(items);

  json.forEach(element => {
    edges.add({from: element.OBJECT_NAME, to: element.GRANTED_TO_NAME, arrows:'to'})
  })
}
