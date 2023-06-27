export const createEdorgCompositeNaturalKey = (args: {
  odsDbName: number | string;
  educationOrganizationId: number | string;
}) =>
  `${
    // args.odsDbName TODO clarify Admin API behavior around inclusion of ods name in Application DTO
    ''
  }-${args.educationOrganizationId}`;
