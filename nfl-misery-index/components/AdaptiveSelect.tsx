/** @jsxRuntime classic */
/** @jsx jsx */

import {
  jsx,
  useThemeUI,
  Select as MobileSelect,
  ThemeUIStyleObject,
  Box,
} from "theme-ui";
import { useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { isMobile, setOpacity } from "../util/util";
import { Value } from "../models/value";

interface AdaptiveSelectProps<T> {
  value: Value<T> | undefined;
  onChange: (value: Value<T>) => void;
  options: Value<T>[];
  sxStyles?: ThemeUIStyleObject;
  width: number;
}

export const AdaptiveSelect: <T>(
  props: AdaptiveSelectProps<T>,
) => React.ReactElement<AdaptiveSelectProps<T>> = <T,>({
  value,
  onChange,
  options,
  sxStyles,
  width,
}: AdaptiveSelectProps<T>) => {
  const { theme } = useThemeUI();
  const [isMobileBrowser, setIsMobileBrowser] = useState<boolean>(undefined);
  useEffect(() => {
    setIsMobileBrowser(isMobile());
  }, []);

  const selectStyles: Partial<StylesConfig<Value<T>, false>> = {
    control: (base, state) => ({
      ...base,
      background: theme.colors.background as string,
      borderColor: theme.colors.border as string,
      boxShadow: state.isFocused
        ? `0 0 0 1px ${theme.colors.highlight}`
        : undefined,
      ":hover": {
        borderColor: theme.colors.highlight as string,
      },
    }),
    indicatorSeparator: (base) => ({
      ...base,
      background: setOpacity(theme.colors.text as string, 0.5),
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: setOpacity(theme.colors.text as string, 0.8),
    }),
    menu: (base) => ({
      ...base,
      background: theme.colors.background as string,
    }),
    singleValue: (base) => ({ ...base, color: theme.colors.text as string }),
    input: (base) => ({
      ...base,
      caretColor: theme.colors.text as string,
      color: theme.colors.text as string,
    }),
    option: (base, state) => {
      if (!theme.colors) {
        return base;
      }

      return {
        ...base,
        backgroundColor: state.isSelected
          ? (theme.colors.selected as string)
          : (theme.colors.background as string),
        ":hover": {
          background: theme.colors.hover as string,
        },
      };
    },
  };

  const selectElement = () => {
    switch (isMobileBrowser) {
      case true:
        return (
          <MobileSelect
            value={value?.label}
            onChange={(e) =>
              onChange(
                options.find((o) => (o.label as string) === e.target.value) ??
                  options[0],
              )
            }
          >
            {options.map((o) => (
              <option key={o.label}>{o.label}</option>
            ))}
          </MobileSelect>
        );
      case false:
        return (
          <Select
            styles={selectStyles}
            value={value}
            onChange={(newValue, _) => onChange(newValue)}
            options={options}
          />
        );
      default:
        return undefined;
    }
  };

  return <Box sx={{ ...sxStyles, height: 38, width }}>{selectElement()}</Box>;
};
