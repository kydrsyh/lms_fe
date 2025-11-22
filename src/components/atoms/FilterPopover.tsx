import React, { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface FilterPopoverProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  hasActiveFilter?: boolean;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  value,
  onChange,
  options,
  placeholder = "Filter",
  hasActiveFilter = false,
}) => {
  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={clsx(
              "inline-flex items-center justify-center p-1.5 rounded-md transition-colors",
              hasActiveFilter
                ? "text-primary-600 bg-primary-50 hover:bg-primary-100"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
          >
            <FunnelIcon className="h-4 w-4" />
            {hasActiveFilter && (
              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary-600"></span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 mt-2 w-56 origin-top-left">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {placeholder}
                  </span>
                  {hasActiveFilter && (
                    <button
                      onClick={() => {
                        onChange("");
                        close();
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    close();
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default FilterPopover;
