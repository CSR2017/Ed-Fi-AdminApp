import { defineStyle, extendTheme } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

export const theme = extendTheme({
  components: {
    Heading: {
      sizes: {
        'page-heading': {
          fontSize: '2xl',
          mb: 1,
        },
      },
    },
    Table: {
      baseStyle: {
        thead: {
          tr: {
            bg: 'gray.100',
            th: {
              borderColor: 'gray.300',
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
            },
          },
        },
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
      sizes: {
        sm: {
          thead: {
            tr: {
              th: {
                px: 4,
                py: 2,
              },
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
        'table-row': {
          h: '2rem',
          fontSize: 'md',
          px: '0.5em',
          borderRadius: 0,
        },
        'action-bar': {
          fontSize: 'sm',
          px: '0.5em',
          h: 6,
          // boxShadow: 'base',
        },
      },
      variants: {
        'outline-highlight': defineStyle((props) => {
          const { colorScheme: c } = props;
          const darkHoverBg = transparentize(`${c}.200`, 0.12)(theme);
          const darkActiveBg = transparentize(`${c}.200`, 0.24)(theme);
          return {
            border: '1px solid',
            borderColor: c === 'gray' ? 'gray.200' : 'currentColor',
            '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
              { marginEnd: '-1px' },
            '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
              { marginBottom: '-1px' },
            ...(c === 'gray'
              ? {
                  color: `gray.900`,
                  bg: `gray.50`,
                  _hover: {
                    bg: `gray.100`,
                  },
                  _active: { bg: `gray.200` },
                }
              : {
                  color: `${c}.800`,
                  bg: `${c}.50`,
                  _hover: {
                    bg: `${c}.100`,
                  },
                  _active: {
                    bg: `${c}.200`,
                  },
                }),
          };
        }),
        'ghost-dark': defineStyle((props) => {
          const { colorScheme: c, theme } = props;

          if (c === 'gray') {
            return {
              color: 'gray.600',
              _hover: {
                bg: `gray.200`,
              },
              _active: { bg: `gray.300` },
            };
          }

          return {
            color: `${c}.600`,
            bg: 'transparent',
            _hover: {
              bg: `${c}.100`,
            },
            _active: {
              bg: `${c}.200`,
            },
          };
        }),
      },
    },
    FormLabel: {
      baseStyle: {
        marginBottom: 0,
        marginTop: 5,
      },
    },
    FormError: {
      baseStyle: {
        text: {
          marginTop: 1,
        },
      },
    },
    Tag: {
      baseStyle: {
        container: { fontFamily: 'mono', fontWeight: 'semibold' },
      },
    },
    Card: {
      variants: {
        elevated: {
          container: {
            borderWidth: '1px',
            borderColor: 'border',
            boxShadow: 'md',
            _dark: {
              bg: 'gray.700',
            },
          },
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
