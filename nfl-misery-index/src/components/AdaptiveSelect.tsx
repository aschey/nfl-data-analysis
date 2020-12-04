/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, useThemeUI, Select as MobileSelect, SxStyleProp, Box } from 'theme-ui';
import Select, { Styles, ValueType } from 'react-select';
import { isMobile, setOpacity } from '../util/util';
import { useEffect, useState } from 'react';
import { Value } from '../models/value';

interface AdaptiveSelectProps<T> {
  value: Value<T> | undefined;
  onChange: (value: ValueType<Value<T>>) => void;
  options: Value<T>[];
  sxStyles?: SxStyleProp;
  width: number;
}

export const AdaptiveSelect: <T>(props: AdaptiveSelectProps<T>) => React.ReactElement<AdaptiveSelectProps<T>> = <T,>({
  value,
  onChange,
  options,
  sxStyles,
  width,
}: AdaptiveSelectProps<T>) => {
  const { theme } = useThemeUI();
  const [isMobileBrowser, setIsMobileBrowser] = useState<boolean | null>(null);
  useEffect(() => {
    setIsMobileBrowser(isMobile());
  }, []);

  const selectStyles: Partial<Styles> = {
    control: (base, state) => ({
      ...base,
      background: theme.colors?.background,
      borderColor: theme.colors ? (theme.colors['border'] as string) : '',
      boxShadow: state.isFocused ? `0 0 0 1px ${theme.colors?.primary}` : undefined,
      ':hover': {
        borderColor: theme.colors?.primary,
      },
    }),
    indicatorSeparator: base => ({ ...base, background: setOpacity(theme.colors?.text ?? '', 0.5) }),
    dropdownIndicator: base => ({ ...base, color: setOpacity(theme.colors?.text ?? '', 0.8) }),
    menu: base => ({
      ...base,
      background: theme.colors?.background,
    }),
    singleValue: base => ({ ...base, color: theme.colors?.text }),
    input: base => ({
      ...base,
      caretColor: theme.colors?.text,
      color: theme.colors?.text,
    }),
    option: (base, state) => {
      if (!theme.colors) {
        return base;
      }
      return {
        ...base,
        backgroundColor: state.isSelected ? (theme.colors['selected'] as string) : theme.colors?.background,
        ':hover': {
          background: theme.colors['hover'],
        },
      };
    },
  };

  const selectElement = () => {
    switch (isMobileBrowser) {
      case true:
        return (
          <MobileSelect
            onChange={e => onChange(options.find(o => o.label.toString() === e.target.value) ?? options[0])}
          >
            {options.map((o, i) => (
              <option key={i}>{o.label}</option>
            ))}
          </MobileSelect>
        );
      case false:
        return <Select styles={selectStyles} value={value} onChange={onChange} options={options} />;
      case null:
        return null;
    }
  };

  return <Box sx={{ ...sxStyles, height: 38, width }}>{selectElement()}</Box>;
};
