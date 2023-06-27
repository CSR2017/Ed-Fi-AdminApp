import { Button, Icon, IconButton, MenuItem } from '@chakra-ui/react';
import { ConfirmAction } from '@edanalytics/common-ui';
import { MutateOptions } from '@tanstack/react-query';
import { AnyRoute, Link } from '@tanstack/router';
import { AxiosResponse } from 'axios';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import {
  ActionProps,
  ActionPropsConfirm,
  LinkActionProps,
} from './ActionsType';

export const StandardRowActions = <
  RowType extends {
    getValue: () => unknown;
    row: { original: { id: number } };
  },
  RouteType extends AnyRoute = AnyRoute,
  ParamsType extends object = object
>(props: {
  route: RouteType;
  info: RowType;
  params: ParamsType;
  mutation: (
    variables: number,
    options?:
      | MutateOptions<
          AxiosResponse<unknown, any>,
          unknown,
          number | string,
          unknown
        >
      | undefined
  ) => void;
}) => {
  const path = props.route.fullPath;
  return (
    <>
      <Link title="View" to={path} params={props.params}>
        <Icon fontSize="md" as={HiOutlineEye} />
      </Link>
      <Link
        title="Edit"
        to={path}
        params={props.params}
        search={{ edit: true }}
      >
        <Icon fontSize="md" as={BiEdit} />
      </Link>
      <ConfirmAction
        headerText={`Delete ${props.info.getValue()}?`}
        bodyText="You won't be able to get it back"
        action={() => {
          props.mutation(props.info.row.original.id);
        }}
      >
        {(props) => (
          <Icon
            role="button"
            fontSize="md"
            _hover={{ cursor: 'pointer' }}
            as={BiTrash}
            {...props}
          />
        )}
      </ConfirmAction>
    </>
  );
};

export const ActionBarButton = (
  props: ActionProps | ActionPropsConfirm | LinkActionProps
) =>
  'linkProps' in props ? (
    <ActionBarButtons.link {...props} />
  ) : 'confirm' in props ? (
    <ActionBarButtons.confirm {...props} />
  ) : (
    <ActionBarButtons.standard {...props} />
  );

export const ActionBarButtons = {
  standard: (props: ActionProps) => (
    <Button
      isDisabled={props.isDisabled}
      leftIcon={props.icon({})}
      onClick={props.onClick}
      title={props.title}
    >
      {props.text}
    </Button>
  ),
  confirm: (props: ActionPropsConfirm) => (
    <ConfirmAction
      headerText={props.text}
      bodyText={props.confirmBody}
      action={props.onClick}
    >
      {(confirmProps) => (
        <Button
          isDisabled={props.isDisabled}
          leftIcon={props.icon({})}
          onClick={(e) => {
            e.stopPropagation();
            confirmProps.onClick && confirmProps.onClick(e);
          }}
          title={props.title}
        >
          {props.text}
        </Button>
      )}
    </ConfirmAction>
  ),
  link: (props: LinkActionProps) => (
    <Button
      as={Link}
      {...props.linkProps}
      isDisabled={props.isDisabled}
      leftIcon={props.icon({})}
      title={props.title}
    >
      {props.text}
    </Button>
  ),
};
export const ActionMenuButton = (
  props: ActionProps | ActionPropsConfirm | LinkActionProps
) =>
  'linkProps' in props ? (
    <ActionMenuButtons.link {...props} />
  ) : 'confirm' in props ? (
    <ActionMenuButtons.confirm {...props} />
  ) : (
    <ActionMenuButtons.standard {...props} />
  );

export const ActionMenuButtons = {
  standard: (props: ActionProps) => (
    <MenuItem
      gap={2}
      isDisabled={props.isDisabled}
      onClick={props.onClick}
      title={props.title}
    >
      <Icon as={props.icon} />
      {props.text}
    </MenuItem>
  ),
  confirm: (props: ActionPropsConfirm) => (
    <ConfirmAction
      headerText={props.text}
      bodyText={props.confirmBody}
      action={props.onClick}
    >
      {(confirmProps) => (
        <MenuItem
          gap={2}
          isDisabled={props.isDisabled}
          onClick={(e) => {
            e.stopPropagation();
            confirmProps.onClick && confirmProps.onClick(e);
          }}
          title={props.title}
        >
          <Icon as={props.icon} />
          {props.text}
        </MenuItem>
      )}
    </ConfirmAction>
  ),
  link: (props: LinkActionProps) => (
    <MenuItem
      gap={2}
      as={Link}
      {...props.linkProps}
      isDisabled={props.isDisabled}
      title={props.title}
    >
      <Icon as={props.icon} />
      {props.text}
    </MenuItem>
  ),
};

export const TdIconButton = (
  props: ActionProps | ActionPropsConfirm | LinkActionProps
) =>
  'linkProps' in props ? (
    <TdIconButtons.link {...props} />
  ) : 'confirm' in props ? (
    <TdIconButtons.confirm {...props} />
  ) : (
    <TdIconButtons.standard {...props} />
  );

export const TdIconButtons = {
  link: (props: LinkActionProps) => (
    <IconButton
      as={Link}
      isDisabled={props.isDisabled}
      {...(props.linkProps as any)}
      aria-label={props.text}
      title={props.title}
      px="0.3rem"
      icon={<Icon as={props.icon} />}
    />
  ),
  standard: (props: ActionProps) => (
    <IconButton
      aria-label={props.text}
      title={props.title}
      px="0.3rem"
      icon={<Icon as={props.icon} />}
      onClick={props.onClick}
      isDisabled={props.isDisabled}
    />
  ),
  confirm: (props: ActionPropsConfirm) => (
    <ConfirmAction
      headerText={props.text}
      bodyText={props.confirmBody}
      action={props.onClick}
    >
      {(confirmProps) => (
        <IconButton
          px="0.3rem"
          aria-label={props.text}
          title={props.title}
          icon={<Icon as={props.icon} />}
          onClick={(e) => {
            e.stopPropagation();
            confirmProps.onClick && confirmProps.onClick(e);
          }}
          isDisabled={props.isDisabled}
        />
      )}
    </ConfirmAction>
  ),
};
