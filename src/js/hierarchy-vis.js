import jstree from 'jstree';
const renderHierarchy = (tree) => {
  $('#hierarchy').data('jstree', false).empty();
  $('#hierarchy')
    .jstree({
      core: {
        data: tree,
      },
    })
    .bind('loaded.jstree', (event, data) => {
      $(this).jstree('open_all');
    });
};

export default renderHierarchy;
