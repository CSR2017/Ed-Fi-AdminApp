import { Select } from 'chakra-react-select';
import { MenuList } from './MenuList';
import { Option } from './Option';
import { SingleValue } from './SingleValue';
export const VirtualizedSelect = (props: Parameters<typeof Select>[0]) => {
  return (
    <Select
      {...{
        ...props,
        components: {
          ...props.components,
          MenuList: MenuList,
          Option: Option,
          SingleValue: SingleValue,
        },
      }}
    />
  );
};
