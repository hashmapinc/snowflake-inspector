import { ICONS } from './constants';

let rendered = false;
const renderHierarchy = (tree) => {
  if (!rendered) {
    $('#hierarchy').jstree({
      core: {
        data: tree,
      },
      types: ICONS,
      plugins: ['types', 'sort', 'search'],
    });
    rendered = true;
  } else {
    $('#hierarchy').jstree(true).settings.core.data = tree;
    $('#hierarchy').jstree(true).refresh();
  }
};

$('#hierarchy-selector').keyup(function () {
  var searchString = $(this).val();
  $('#hierarchy').jstree('search', searchString);
});

export default renderHierarchy;
