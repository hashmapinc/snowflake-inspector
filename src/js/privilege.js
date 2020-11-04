import { filterByPrivilege } from './app';
import { PRIVILEGE_HEADER } from './constants';
import SelectPure from 'select-pure';

const initFilterByPrivileges = (privileges) => {
  let options = [];

  privileges.forEach(function (privilege) {
    options.push({ label: privilege, value: privilege });
  });

  let autocomplete = new SelectPure('#checks', {
    options: options,
    value: [],
    multiple: true,
    autocomplete: true,
    icon: 'fa fa-times',
    placeholder: 'Click here to select',
    onChange: (value) => {
      filterByPrivilege(value);
    },
    classNames: {
      select: 'select-pure__select',
      dropdownShown: 'select-pure__select--opened',
      multiselect: 'select-pure__select--multiple',
      label: 'select-pure__label',
      placeholder: 'select-pure__placeholder',
      dropdown: 'select-pure__options',
      option: 'select-pure__option',
      autocompleteInput: 'select-pure__autocomplete',
      selectedLabel: 'select-pure__selected-label',
      selectedOption: 'select-pure__option--selected',
      placeholderHidden: 'select-pure__placeholder--hidden',
      optionHidden: 'select-pure__option--hidden',
    },
  });

  return autocomplete;
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
export { initFilterByPrivileges, setPrivilegeHeader };
