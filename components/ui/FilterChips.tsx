"use client";

import React from "react";

export type FilterOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

type FilterChipsProps<T extends string> = {
  options: readonly FilterOption<T>[] | FilterOption<T>[];
  activeValue: T;
  onChange: (val: T) => void;
  className?: string;
  allowToggle?: boolean; // if true, clicking active deselects it
};

export function FilterChips<T extends string>({ options, activeValue, onChange, className = "", allowToggle = false }: FilterChipsProps<T>) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 ${className}`}>
      {options.map((opt) => {
        const isActive = activeValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => {
              if (allowToggle && isActive) {
                onChange("all" as any);
              } else {
                onChange(opt.value);
              }
            }}
            className={`
              shrink-0 h-[36px] px-[14px] rounded-[999px] text-[13px] font-semibold transition-all flex items-center justify-center
              ${isActive 
                ? 'bg-[#FFF3E8] text-[#FC8019]' 
                : 'bg-white text-[#686B78] hover:bg-slate-50'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
