import { filterByPrivilege } from './app';
import { PRIVILEGE_HEADER } from './constants';
const initFilterByPrivleges = (privileges) => {
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
  } else if (header === PRIVILEGE_HEADER.OBJECTS.id) {
    $('#privilege-header').text(PRIVILEGE_HEADER.OBJECTS.value);
  }
};
export { initFilterByPrivleges, setPrivilegeHeader };
