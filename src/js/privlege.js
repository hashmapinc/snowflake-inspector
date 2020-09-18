import { filterByPrivilege } from './app';
import { PRIVILEGE_HEADER } from './constants';
const initFilterByPrivleges = (privileges) => {
  $('#checks').empty();

  privileges.forEach(function (privilege) {
    $('#checks').append('<input name="chckbox" type="checkbox" value="' + privilege + '"/> ' + privilege + '<br/>');
  });

  $('#checks :checkbox')
    .unbind()
    .click(function (e) {
      let allVals = [];
      $('#checks :checked').each(function () {
        allVals.push($(this).val());
      });

      filterByPrivilege(allVals);
    });
};

const setPrivilegeHeader = (header) => {
  if (header === PRIVILEGE_HEADER.NODES.id) {
    $('#privilege-header').text(PRIVILEGE_HEADER.NODES.value);
    $('#privilege-header').addClass('filter-card-header-nodes').removeClass('filter-card-header-objects');
    $('#filter-card').addClass('filter-card-nodes').removeClass('filter-card-objects');
  } else if (header === PRIVILEGE_HEADER.OBJECTS.id) {
    $('#privilege-header').text(PRIVILEGE_HEADER.OBJECTS.value);
    $('#privilege-header').addClass('filter-card-header-objects').removeClass('filter-card-header-nodes');
    $('#filter-card').addClass('filter-card-objects').removeClass('filter-card-nodes');
  }
};
export { initFilterByPrivleges, setPrivilegeHeader };
