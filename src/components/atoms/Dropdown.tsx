import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ items, align = 'right' }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white rounded-full hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
          <EllipsisVerticalIcon className="w-5 h-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index} disabled={item.disabled}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={clsx(
                      'w-full text-left px-4 py-2 text-sm flex items-center gap-3',
                      item.disabled && 'opacity-50 cursor-not-allowed',
                      !item.disabled && active && 'bg-gray-100',
                      item.variant === 'danger'
                        ? 'text-red-700 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;

