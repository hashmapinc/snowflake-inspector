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
};

export default renderHierarchy;
