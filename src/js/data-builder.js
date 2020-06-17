//import { data } from 'vis-network';
const buildData = (json) => {
  let data = {};
  data.nodes = [];
  data.edges = [];
  data.hierarchy = [{ text: 'DATABASE', children: [], type: 'DATABASE' }];

  let database = [],
    schema = {},
    category = {},
    item = {},
    other = {},
    rootType = {},
    dbRoot = {};
  json.forEach((element) => {
    if (
      element.GRANTED_ON_TYPE === 'ROLE' &&
      element.GRANTED_TO_NAME !== 'SECURITYADMIN' &&
      element.PRIVILEGE !== 'OWNERSHIP'
    ) {
      const grantedToNodeIndex = data.nodes.findIndex((node) => node.name === element.GRANTED_TO_NAME);
      if (grantedToNodeIndex === -1) {
        data.nodes.push({
          name: element.GRANTED_TO_NAME,
          type: element.GRANTED_TO_TYPE,
        });
      }
      const grantedOnNodeIndex = data.nodes.findIndex((node) => node.name === element.GRANTED_ON_NAME);
      if (grantedOnNodeIndex === -1) {
        data.nodes.push({
          name: element.GRANTED_ON_NAME,
          type: element.GRANTED_ON_TYPE,
        });
      }
      const edgeIndex = data.edges.findIndex(
        (edge) => edge.from === element.GRANTED_TO_NAME && edge.to === element.GRANTED_ON_NAME
      );
      if (edgeIndex === -1)
        data.edges.push({
          from: element.GRANTED_TO_NAME,
          to: element.GRANTED_ON_NAME,
          arrows: 'to',
        });
    } else if (element.GRANTED_ON_DATABASE) {
      const dbRootIndex = data.hierarchy.findIndex((database) => database.text === 'DATABASE');
      dbRoot = data.hierarchy[dbRootIndex];

      const dbIndex = dbRoot.children.findIndex((db) => db.text === element.GRANTED_ON_DATABASE);
      database =
        dbIndex !== -1
          ? dbRoot.children[dbIndex]
          : {
              text: element.GRANTED_ON_DATABASE,
              children: [],
              type: 'DATABASE',
            };

      if (element.GRANTED_ON_SCHEMA) {
        let schemaIndex = database.children.findIndex((schema) => schema.text === element.GRANTED_ON_SCHEMA);
        schema =
          schemaIndex !== -1
            ? database.children[schemaIndex]
            : { text: element.GRANTED_ON_SCHEMA, children: [], type: 'SCHEMA' };

        if (element.GRANTED_ON_TYPE && element.GRANTED_ON_TYPE !== 'SCHEMA') {
          let categoryIndex = schema.children.findIndex((category) => category.text === element.GRANTED_ON_TYPE);
          category =
            categoryIndex !== -1
              ? schema.children[categoryIndex]
              : { text: element.GRANTED_ON_TYPE, children: [], type: element.GRANTED_ON_TYPE };
          categoryIndex === -1 ? schema.children.push(category) : (schema.children[categoryIndex] = category);

          let itemIndex = category.children.findIndex((item) => item.text === element.GRANTED_ON_NAME);
          item =
            itemIndex !== -1
              ? category.children[itemIndex]
              : { text: element.GRANTED_ON_NAME, children: [], type: element.GRANTED_ON_TYPE };
          itemIndex === -1 ? category.children.push(item) : (category.children[itemIndex] = item);
        }

        schemaIndex === -1 ? database.children.push(schema) : (database.children[schemaIndex] = schema);
      }
      dbIndex === -1 ? dbRoot.children.push(database) : (dbRoot.children[dbIndex] = database);
    } else if (element.GRANTED_ON_TYPE !== 'ROLE' && element.GRANTED_ON_TYPE !== 'USER') {
      let rootTypeIndex = data.hierarchy.findIndex((rootType) => rootType.text === element.GRANTED_ON_TYPE);
      rootType =
        rootTypeIndex !== -1
          ? data.hierarchy[rootTypeIndex]
          : { text: element.GRANTED_ON_TYPE, children: [], type: element.GRANTED_ON_TYPE };
      rootTypeIndex === -1 ? data.hierarchy.push(rootType) : (data.hierarchy[rootTypeIndex] = rootType);

      let otherIndex = rootType.children.findIndex((other) => other.text === element.GRANTED_ON_NAME);
      other =
        otherIndex !== -1
          ? rootType.children[otherIndex]
          : {
              text: element.GRANTED_ON_NAME,
              type: element.GRANTED_ON_TYPE,
              children: [],
            };

      otherIndex === -1 ? rootType.children.push(other) : (rootType.children[otherIndex] = other);
    }
  });
  data.hierarchy.sort((a, b) => (a.text > b.text ? 1 : -1));

  return data;
};
const filterObjects = (json, nodes = []) => {
  let filteredArray = json.filter((element) => {
    return nodes.filter((node) => node === element.GRANTED_TO_NAME && element.GRANTED_TO_TYPE === 'ROLE').length > 0
      ? true
      : false;
  });
  const x = buildData(filteredArray);
  return x.hierarchy;
};

const filterNodes = (formattedData, json, jstreeObject) => {
  let filteredArray = [];
  const jstreeData = jstreeObject.instance.get_json();
  const selectedObj = jstreeObject.instance.get_node(jstreeObject.selected[0]);

  if (selectedObj.parent === '#') {
    if (selectedObj.text === 'DATABASE') {
      filteredArray = json.filter((element) => element.GRANTED_ON_DATABASE !== undefined);
    }
  }

  return buildRelationship(formattedData.nodes, filteredArray);
  // let filteredArray = json.filter((element) => {
  //   return;
  // });

  console.log('data', jstreeObject.instance.get_node(jstreeObject.selected[0]));
  console.log('json', jstreeObject.instance.get_json());
};

const buildRelationship = (nodes, filteredArray) => {
  let relatedData = [];
  filteredArray.forEach((element) => {
    if (element.GRANTED_TO_TYPE === 'ROLE' || element.GRANTED_TO_TYPE === 'USER') {
      const grantedToNodeIndex = relatedData.findIndex((node) => node.name === element.GRANTED_TO_NAME);
      if (grantedToNodeIndex === -1) {
        relatedData.push({
          name: element.GRANTED_TO_NAME,
          type: element.GRANTED_TO_TYPE,
        });
      }
    }
  });

  const y = nodes.filter((node) => relatedData.some((value) => value.name === node.name));
  return y;
};
export { buildData, filterNodes, filterObjects };
