import { type MouseEvent } from "react";
import "./pattern-setting.css";

interface PatternSettingProps {
  rowCount?: number;
  cardColor?: string;
  patternColor?: string;
  patternList?: number[];
  onPatternChange?: (newPattern: number[]) => void;
}

export function PatternSetting({
  rowCount = 17,
  cardColor = "#fff",
  patternColor = "#000",
  patternList = [],
  onPatternChange,
}: PatternSettingProps) {
  const updatePatternList = (event: MouseEvent, item: number) => {
    event.stopPropagation();
    const newPatternList = [...patternList];

    if (newPatternList.includes(item)) {
      const index = newPatternList.indexOf(item);
      newPatternList.splice(index, 1);
    } else {
      newPatternList.push(item);
    }

    onPatternChange?.(newPatternList);
  };

  return (
    <div className="w-full h-auto">
      <ul
        className="pattern-list"
        style={{
          gridTemplateColumns: `repeat(${rowCount}, 1fr)`,
        }}
      >
        {[...Array(rowCount * 7)].map((_, index) => (
          <li
            key={index + 1}
            className="w-5 h-5"
            onClick={(e) => updatePatternList(e, index + 1)}
            style={{
              backgroundColor: patternList.includes(index + 1) ? patternColor : cardColor,
            }}
          />
        ))}
      </ul>
    </div>
  );
}
