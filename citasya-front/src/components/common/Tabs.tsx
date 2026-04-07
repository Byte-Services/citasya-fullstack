import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TabsProps {
  options: string[];
  onChange?: (tab: string) => void;
}

export default function Tabs({ options, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(options[0] ?? '');

  useEffect(() => {
    if (!options.includes(activeTab)) {
      setActiveTab(options[0] ?? '');
    }
  }, [options, activeTab]);

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex overflow-x-auto hide-scrollbar mb-8 border-b border-gray-200">
      <div className="flex space-x-8">
        {options.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              onChange?.(tab);
            }}
            className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? 'text-primary'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="commonTabsIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
