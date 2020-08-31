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
    if (!element.toId) {
      element.toId = element.GRANTED_TO_NAME + '___' + element.GRANTED_TO_TYPE;
    }
    if (!element.onId) {
      element.onId = element.GRANTED_ON_NAME + '___' + element.GRANTED_ON_TYPE;
    }
    if (
      element.GRANTED_ON_TYPE === 'ROLE' &&
      element.GRANTED_TO_NAME !== 'SECURITYADMIN' &&
      element.PRIVILEGE !== 'OWNERSHIP'
    ) {
      const grantedToNodeIndex = data.nodes.findIndex((node) => node.id === element.toId);
      if (grantedToNodeIndex === -1) {
        data.nodes.push({
          id: element.toId,
          name: element.GRANTED_TO_NAME,
          type: element.GRANTED_TO_TYPE,
        });
      }
      const grantedOnNodeIndex = data.nodes.findIndex((node) => node.id === element.onId);
      if (grantedOnNodeIndex === -1) {
        data.nodes.push({
          id: element.onId,
          name: element.GRANTED_ON_NAME,
          type: element.GRANTED_ON_TYPE,
        });
      }
      const edgeIndex = data.edges.findIndex(
        (edge) => edge.from === element.GRANTED_TO_NAME && edge.to === element.GRANTED_ON_NAME
      );
      if (edgeIndex === -1)
        data.edges.push({
          from: element.toId,
          to: element.onId,
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

  return data;
};

const filterNodes = (formattedData, json, jstreeObject) => {
  let filteredJson = [];
  const jstreeData = jstreeObject.instance.get_json('#', { flat: true });
  const selectedObj = jstreeObject.instance.get_node(jstreeObject.selected[0]);
  let levels = JSON.parse(JSON.stringify(selectedObj.parents));
  levels = levels.reverse();

  let leafIndex = levels.findIndex((leaf) => leaf === selectedObj.id);
  if (leafIndex === -1) {
    levels.push(selectedObj.id);
  }

  let levelsData = [];
  for (let levelIndex of levels) {
    if (levelIndex !== '#') {
      levelsData.push(jstreeData.filter((x) => x.id === levelIndex)[0]);
    }
  }

  filteredJson = json.filter((element) => {
    if (element.GRANTED_ON_TYPE !== 'ROLE' || element.GRANTED_ON_TYPE !== 'USER') {
      if (element.GRANTED_ON_TYPE === selectedObj.type) {
        if (selectedObj.parent !== '#') {
          if (element.GRANTED_ON_DATABASE && levelsData[0] != null && levelsData[0].type === 'DATABASE') {
            if (
              levelsData[1] != null &&
              levelsData[1].type === 'DATABASE' &&
              levelsData[1].text === element.GRANTED_ON_DATABASE
            ) {
              if (levelsData[2] != null) {
                if (levelsData[2].text === element.GRANTED_ON_SCHEMA && levelsData[2].type === 'SCHEMA') {
                  if (levelsData[3] != null) {
                    if (levelsData[4] != null) {
                      if (
                        levelsData[4].type === element.GRANTED_ON_TYPE &&
                        levelsData[4].text === element.GRANTED_ON_NAME
                      ) {
                        return true;
                      }
                    } else if (
                      levelsData[3].text === levelsData[3].type &&
                      levelsData[3].type === element.GRANTED_ON_TYPE
                    ) {
                      return true;
                    }
                  } else if (
                    levelsData[2].text === element.GRANTED_ON_NAME &&
                    levelsData[2].type === element.GRANTED_ON_TYPE
                  ) {
                    return true;
                  }
                }
              } else {
                return true;
              }
            }
          } else if (levelsData[0] != null) {
            if (
              levelsData[1] != null &&
              levelsData[1].text === element.GRANTED_ON_NAME &&
              levelsData[1].type === element.GRANTED_ON_TYPE
            ) {
              return true;
            }
          }
        } else if (
          selectedObj.parent === '#' &&
          selectedObj.text === selectedObj.type &&
          selectedObj.type === element.GRANTED_ON_TYPE
        ) {
          return true;
        }
      }
    }
  });

  return buildObjectNodeRelationship(formattedData.nodes, filteredJson);
};

const buildObjectNodeRelationship = (renderedNodes, filteredJson) => {
  let relatedData = [];
  filteredJson.forEach((element) => {
    if (element.GRANTED_TO_TYPE === 'ROLE' || element.GRANTED_TO_TYPE === 'USER') {
      const grantedToNodeIndex = relatedData.findIndex((node) => node.id === element.toId);
      if (grantedToNodeIndex === -1) {
        relatedData.push({
          id: element.toId,
          name: element.GRANTED_TO_NAME,
          type: element.GRANTED_TO_TYPE,
        });
      }
    }
  });

  //Return nodes that are related to provided filtered json
  return renderedNodes.filter((node) => relatedData.some((item) => item.id === node.id));
};

const filterObjectsOnNodeClick = (json, nodes = []) => {
  let filteredJson = json.filter((element) => {
    return nodes.filter((node) => node === element.toId).length > 0 ? true : false;
  });
  const x = buildData(filteredJson);
  return x.hierarchy;
};

export { buildData, filterNodes, filterObjectsOnNodeClick };
