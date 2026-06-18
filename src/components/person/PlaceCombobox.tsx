"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface PlaceComboboxProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

export default function PlaceCombobox({
  defaultValue = "",
  onChange,
  suggestions,
  placeholder = "Nhập địa danh...",
}: PlaceComboboxProps) {
  return (
    <Combobox
      defaultInputValue={defaultValue}
      onInputValueChange={(v) => onChange(v)}
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear
        showTrigger={suggestions.length > 0}
        className="w-full bg-background"
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>Không tìm thấy</ComboboxEmpty>
          {suggestions.map((place) => (
            <ComboboxItem key={place} value={place}>
              {place}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
