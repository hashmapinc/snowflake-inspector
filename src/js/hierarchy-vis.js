const renderHierarchy = (tree) => {
  $('#hierarchy').data('jstree', false).empty();
  $('#hierarchy').jstree({
    core: {
      data: tree,
    },
  });
};

export default renderHierarchy;
