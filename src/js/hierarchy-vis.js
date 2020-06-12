const renderHierarchy = (tree) => {
  $('#hierarchy').data('jstree', false).empty();
  $('#hierarchy')
    .jstree({
      core: {
        data: tree,
      },
    })
    .on('loaded.jstree', function () {
      $('#hierarchy').jstree('open_all');
    });
};

export default renderHierarchy;
