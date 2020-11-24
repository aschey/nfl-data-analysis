/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, useThemeUI, Select as MobileSelect, SxStyleProp, Box } from 'theme-ui';
import Select, { Styles } from 'react-select';
import { isMobile, setOpacity } from '../util/util';
import { IntValue, Value } from '../pages';

interface AdaptiveSelectProps {
  value: Value | IntValue;
  onChange: (value: Value | IntValue) => void;
  options: (Value | IntValue)[];
  sxStyles?: SxStyleProp;
  width: number;
}

export const AdaptiveSelect: React.FC<AdaptiveSelectProps> = ({ value, onChange, options, sxStyles, width }) => {
  const { theme } = useThemeUI();
  const selectStyles: Partial<Styles> = {
    control: (base, state) => ({
      ...base,
      background: theme.colors?.background,
      borderColor: setOpacity(theme.colors?.text ?? '', 0.2),
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

  return (
    <Box sx={{ ...sxStyles, height: 38 }}>
      {isMobile() ? (
        <MobileSelect
          onChange={e => {
            onChange(options.find(o => o.label === e.target.value) ?? options[0]);
          }}
          sx={{ width }}
        >
          {options.map(o => (
            <option key={o.value}>{o.label}</option>
          ))}
        </MobileSelect>
      ) : (
        <Select styles={selectStyles} sx={{ width }} value={value} onChange={onChange as any} options={options} />
      )}
    </Box>
  );
};
