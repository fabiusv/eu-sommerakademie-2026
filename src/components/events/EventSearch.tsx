"use client";

import SearchField from "@/components/home/SearchField";

export default function EventSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <SearchField
      value={value}
      onChange={onChange}
      placeholder="Search events, cities, topics, or communities"
      clearable
      containerClassName="gap-3.5 rounded-2xl px-5 py-4 shadow-card lg:px-[clamp(24px,calc(0.36vw_+_18.9px),28px)] lg:py-[clamp(18px,calc(0.36vw_+_12.9px),22px)]"
      iconClassName="size-5"
      inputClassName="text-[15px] lg:text-[clamp(16px,calc(0.27vw_+_12.1px),19px)]"
    />
  );
}
