/** @jsx jsx */
import { jsx, useThemeUI } from 'theme-ui';
import RingLoader from 'react-spinners/RingLoader';
import LoadingOverlay from 'react-loading-overlay';
import { setOpacity } from '../util/util';

export const Overlay: React.FC<{ children: React.ReactNode; isLoading: boolean }> = ({ isLoading, children }) => {
  const { theme } = useThemeUI();

  return (
    <LoadingOverlay
      active={isLoading}
      spinner={<RingLoader color={theme.colors?.text} />}
      styles={{
        wrapper: (base: Record<string, unknown>) => ({
          ...base,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%',
          width: '100%',
        }),
        overlay: (base: Record<string, unknown>) => ({
          ...base,
          background: setOpacity(theme.colors?.background ?? '', 0.6),
        }),
      }}
    >
      {children}
    </LoadingOverlay>
  );
};
