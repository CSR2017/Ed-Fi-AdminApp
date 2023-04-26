import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  components: {
    Table: {
      baseStyle: {
        tbody: {
          tr: {
            '&:hover': {
              bg: 'gray.50',
            },
            _selected: {
              bg: 'gray.100',
            },
            '& .row-hover': {
              visibility: 'hidden',
            },
            '&:hover .row-hover, &[aria-selected="true"] .row-hover': {
              visibility: 'visible',
            },
          },
        },
      },
      defaultProps: {
        size: 'sm',
      },
    },
    Button: {
      sizes: {
        table: {
          h: 6,
          minW: 6,
          fontSize: 'md',
          margin: 'calc(-2px - 0.25rem)',
        },
      },
    },
    FormLabel: {
      baseStyle: {
        marginBottom: 1,
        marginTop: 3,
      },
    },
    FormError: {
      baseStyle: {
        text: {
          marginTop: 1,
        },
      },
    },
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.4)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
    none: 'none',
    'dark-lg':
      'rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px',
  },
});
