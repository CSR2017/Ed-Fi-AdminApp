import { ToOptions } from '@tanstack/router';
import { IconType } from 'react-icons/lib';

export type ActionsType = Record<
  string,
  (props: {
    children: (
      props: ActionPropsConfirm | ActionProps | LinkActionProps
    ) => JSX.Element;
  }) => JSX.Element
>;

export type ActionProps = {
  onClick: () => void;
  icon: IconType;
  text: string;
  title: string;
  isDisabled?: boolean;
};
export type ActionPropsConfirm = ActionProps & {
  confirmBody: string;
  confirm: true;
};

export type LinkActionProps = ActionProps & {
  linkProps: ToOptions;
};
