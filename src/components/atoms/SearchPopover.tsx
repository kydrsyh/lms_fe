import React, { Fragment, useState, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface SearchPopoverProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchPopover: React.FC<SearchPopoverProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button
            className={clsx(
              "inline-flex items-center justify-center p-1.5 rounded-md transition-colors",
              value
                ? "text-primary-600 bg-primary-50 hover:bg-primary-100"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            {value && (
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
            <Popover.Panel className="absolute z-10 mt-2 w-72 origin-top-left">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Search
                  </span>
                  {value && (
                    <button
                      onClick={handleClear}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onChange(localValue);
                        close();
                      }
                      if (e.key === "Escape") {
                        close();
                      }
                    }}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                  {localValue && (
                    <button
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onChange(localValue);
                      close();
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Search
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default SearchPopover;
