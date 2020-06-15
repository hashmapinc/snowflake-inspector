import jstree from 'jstree';
import { ICONS } from './constants';

let rendered = false;
const renderHierarchy = (tree) => {
  if (!rendered) {
    $('#hierarchy').jstree({
      core: {
        data: tree,
      },
      types: ICONS,
      plugins: ['types'],
    });
    rendered = tree;
  } else {
    $('#hierarchy').jstree(true).settings.core.data = tree;
    $('#hierarchy').jstree(true).refresh();
  }
  $('#hierarchy').on('select_node.jstree', function (e, data) {
    console.log('data', data.instance.get_node(data.selected[0]));
    console.log('json', data.instance.get_json());
  });
};

export default renderHierarchy;
