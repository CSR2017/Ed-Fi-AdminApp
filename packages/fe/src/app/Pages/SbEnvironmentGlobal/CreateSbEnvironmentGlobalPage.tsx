import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  Switch,
  Tooltip,
  chakra,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
} from '@chakra-ui/react';
import { Icons, PageTemplate } from '@edanalytics/common-ui';
import { PostSbEnvironmentDto, PostSbEnvironmentTenantDTO } from '@edanalytics/models';
import { get, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePopBanner } from '../../Layout/FeedbackBanner';
import { sbEnvironmentQueries } from '../../api';
import { popSyncBanner, useNavToParent } from '../../helpers';
import { mutationErrCallback } from '../../helpers/mutationErrCallback';

export const CreateSbEnvironmentGlobalPage = () => {
  const popBanner = usePopBanner();
  const navToParentOptions = useNavToParent();
  const navigate = useNavigate();
  const checkEdFiVersion = sbEnvironmentQueries.checkEdFiVersion({});
  const postSbEnvironment = sbEnvironmentQueries.post({});
  const {
    register,
    setError,
    handleSubmit,
    clearErrors,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PostSbEnvironmentDto>({
    defaultValues: Object.assign(new PostSbEnvironmentDto(), {
      metaArn: undefined,
      version: undefined,
      startingBlocks: false,
      isMultitenant: true,
      tenants: []
    }),
  });

  // Watch form values
  const isStartingBlocks = watch('startingBlocks');
  const currentVersion = watch('version');
  const tenants = watch('tenants') || [];

  const handleSwitchChange = (checked: boolean) => {
    setValue('startingBlocks', checked);

    // Clear validation errors when switching modes to prevent stale errors
    clearErrors(['metaArn', 'odsApiDiscoveryUrl', 'adminApiUrl', 'environmentLabel', 'edOrgIds', 'tenants']);

    // Clear field values when switching modes to prevent stale data
    if (checked) {
      setValue('odsApiDiscoveryUrl', undefined);
      setValue('adminApiUrl', undefined);
      setValue('environmentLabel', undefined);
      setValue('edOrgIds', '');
      setValue('isMultitenant', true);
      setValue('tenants', []);
    } else {
      setValue('metaArn', undefined);
      setValue('version', undefined);
      setValue('isMultitenant', true);
      setValue('tenants', []);
    }
  };

  const validateVersion = (odsApiDiscoveryUrl: string) => {
    const errorMessage = 'Could not fetch version from API Discovery URL. Please check the URL and try again.';
    if (!isStartingBlocks && odsApiDiscoveryUrl && odsApiDiscoveryUrl.trim() !== '') {
      // To perform the version check
      checkEdFiVersion.mutateAsync(
        { entity: { odsApiDiscoveryUrl: odsApiDiscoveryUrl }, pathParams: null },
        {
          onSuccess: (result) => {
            if (result) {
              if (result === 'v1' || result === 'v2') {
                setValue('version', result as 'v1' | 'v2');
                clearErrors(['odsApiDiscoveryUrl']);
              } else {
                setValue('version', undefined);
                setError('odsApiDiscoveryUrl', { message: errorMessage });
              }
            }
          },
          onError: (error) => {
            setError('odsApiDiscoveryUrl', { message: errorMessage });
            setValue('version', undefined);
            console.error('Error fetching version:', error);
          },
        }
      )
        .catch((error) => {
          setError('odsApiDiscoveryUrl', { message: errorMessage });
          setValue('version', undefined);
          console.error('Error fetching version:', error);
        });
    };
  }

  // Manual validation function
  const validateForm = (data: PostSbEnvironmentDto): boolean => {
    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Always validate name
    if (!data.name || data.name.trim() === '') {
      setError('name', { message: 'Name is required' });
      isValid = false;
    }

    if (isStartingBlocks) {
      // Validate Starting Blocks fields
      if (!data.metaArn || data.metaArn.trim() === '') {
        setError('metaArn', { message: 'Metadata ARN is required' });
        isValid = false;
      }
    } else {
      if (!data.odsApiDiscoveryUrl || data.odsApiDiscoveryUrl.trim() === '') {
        setError('odsApiDiscoveryUrl', { message: 'Ed-Fi API Discovery URL is required' });
        isValid = false;
      }
      else {
        if (!currentVersion) {
          validateVersion(data.odsApiDiscoveryUrl);
        }
      }
      if (!data.adminApiUrl || data.adminApiUrl.trim() === '') {
        setError('adminApiUrl', { message: 'Management API Discovery URL is required' });
        isValid = false;
      }
      if (!data.environmentLabel || data.environmentLabel.trim() === '') {
        setError('environmentLabel', { message: 'Environment Label is required' });
        isValid = false;
      }

      if (currentVersion === 'v1') {
        // Validate v1 specific fields
        if (!data.edOrgIds || data.edOrgIds.trim() === '') {
          setError('edOrgIds', { message: 'Education Organization Identifier(s) is required' });
          isValid = false;
        }
      } else if (currentVersion === 'v2') {
        // Validate v2 specific fields
        if (data.isMultitenant && (!tenants || tenants.length === 0)) {
          setError('environmentLabel', { message: 'At least one tenant is required for multi-tenant deployment' });
          isValid = false;
        }

        // Validate tenant data
        tenants.forEach((tenant, tenantIndex) => {
          if (!tenant.name || tenant.name.trim() === '') {
            setError(`tenants.${tenantIndex}.name`, { message: 'Tenant name is required' });
            isValid = false;
          }

          if (!tenant.odss || tenant.odss.length === 0) {
            setError(`tenants.${tenantIndex}.name`, { message: 'At least one ODS instance is required' });
            isValid = false;
          }

          tenant.odss?.forEach((ods, odsIndex) => {
            if (!ods.name || ods.name.trim() === '') {
              setError(`tenants.${tenantIndex}.odss.${odsIndex}.name`, { message: 'ODS name is required' });
              isValid = false;
            }
            if (!ods.dbName || ods.dbName.trim() === '') {
              setError(`tenants.${tenantIndex}.odss.${odsIndex}.dbName`, { message: 'DB name is required' });
              isValid = false;
            }
            if (!ods.allowedEdOrgs || ods.allowedEdOrgs.trim() === '') {
              setError(`tenants.${tenantIndex}.odss.${odsIndex}.allowedEdOrgs`, { message: 'Education Organization Identifier(s) is required' });
              isValid = false;
            }
          });
        });
      }
    }
    return isValid;
  };

  const onSubmit = (data: PostSbEnvironmentDto) => {
    // Manual validation
    if (!validateForm(data)) {
      return;
    }

    // Set the startingBlocks field based on the current mode
    data.startingBlocks = isStartingBlocks;

    return postSbEnvironment
      .mutateAsync(
        { entity: data },
        {
          onSuccess: (result) => {
            navigate(`/sb-environments/${result.id}`);
            result.syncQueue &&
              popSyncBanner({
                popBanner,
                syncQueue: result.syncQueue,
              });
          },
          ...mutationErrCallback({ setFormError: setError, popGlobalBanner: popBanner }),
        }
      )
      .catch((error) => {
        console.error('Error creating environment:', error);
      });
  };

  return (
    <PageTemplate title={'Connect new environment'} actions={undefined}>
      <Box w="70%">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl>
            <FormLabel>
              Using Starting Blocks from Education Analytics?{' '}
              <Tooltip
                label="Toggle this switch when you you are using Starting Blocks for your Ed-Fi deployment."
                hasArrow
              >
                <chakra.span>
                  <Icons.InfoCircle />
                </chakra.span>
              </Tooltip>
            </FormLabel>
            <Switch
              size="md"
              colorScheme="primary"
              mb="0"
              {...register('startingBlocks')}
              onChange={(e) => handleSwitchChange(e.target.checked)}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.name}>
            <FormLabel>
              Name{' '}
              <Tooltip label="Provide a unique name for the environment" hasArrow>
                <chakra.span>
                  <Icons.InfoCircle />
                </chakra.span>
              </Tooltip>
            </FormLabel>
            <Input {...register('name')} placeholder="name" />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>

          {isStartingBlocks ? (
            <FormControl isInvalid={!!errors.metaArn}>
              <FormLabel>Metadata ARN</FormLabel>
              <Input {...register('metaArn')} placeholder="arn:aws:lambda:us..." />
              <FormErrorMessage>{errors.metaArn?.message}</FormErrorMessage>
            </FormControl>
          ) : null}

          {!isStartingBlocks ? (
            <Box>
              <FormControl isInvalid={!!errors.odsApiDiscoveryUrl}>
                <FormLabel>
                  Ed-Fi API Discovery URL{' '}
                  <Tooltip label="The base URL for the ODS/API or DMS" hasArrow>
                    <chakra.span>
                      <Icons.InfoCircle />
                    </chakra.span>
                  </Tooltip>
                </FormLabel>
                <Input {...register('odsApiDiscoveryUrl')} placeholder="https://..."
                  onBlur={async (e) => {
                    const value = e.target.value;
                    setValue('odsApiDiscoveryUrl', value);
                    // Auto-detect version if not Starting Blocks and value is present
                    if (!isStartingBlocks && value.trim() !== '') {
                      validateVersion(value);
                    }
                  }}
                />
                <FormErrorMessage>{errors.odsApiDiscoveryUrl?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.adminApiUrl}>
                <FormLabel>
                  Management API Discovery URL{' '}
                  <Tooltip label="The base URL for Admin API or DMS Configuration Service" hasArrow>
                    <chakra.span>
                      <Icons.InfoCircle />
                    </chakra.span>
                  </Tooltip>
                </FormLabel>
                <Input {...register('adminApiUrl')} placeholder="https://..." />
                <FormErrorMessage>{errors.adminApiUrl?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.environmentLabel}>
                <FormLabel>
                  Environment Label{' '}
                  <Tooltip label="Examples: Development, Staging, Production" hasArrow>
                    <chakra.span>
                      <Icons.InfoCircle />
                    </chakra.span>
                  </Tooltip>
                </FormLabel>
                <Input {...register('environmentLabel')} placeholder="production" />
                <FormErrorMessage>{errors.environmentLabel?.message}</FormErrorMessage>
              </FormControl>
              {
                currentVersion === 'v2' ? (
                  <Box>
                    <FormControl>
                      <FormLabel>
                        Tenants{' '}
                        <Tooltip label="Add tenants for this multi-tenant deployment" hasArrow>
                          <chakra.span>
                            <Icons.InfoCircle />
                          </chakra.span>
                        </Tooltip>
                      </FormLabel>
                      <Stack spacing={2}>
                        <ButtonGroup size="sm">
                          <Button
                            onClick={() => {
                              const currentTenants = getValues('tenants') || [];
                              const newTenant: PostSbEnvironmentTenantDTO = {
                                name: `tenant${currentTenants.length + 1}`,
                                odss: [],
                              };
                              setValue('tenants', [...currentTenants, newTenant]);
                            }}
                          >
                            Add Tenant
                          </Button>
                        </ButtonGroup>
                        {tenants.length > 0 && (
                          <Accordion defaultIndex={[0]} allowMultiple>
                            {tenants.map((tenant, index) => (
                              <AccordionItem key={index}>
                                <AccordionButton>
                                  <Box flex="1" textAlign="left">
                                    <Text fontWeight="bold">{tenant.name}</Text>
                                  </Box>
                                  <Box
                                    as="span"
                                    fontSize="sm"
                                    color="red.500"
                                    cursor="pointer"
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    _hover={{ bg: "red.50" }}
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      const currentTenants = getValues('tenants') || [];
                                      const updatedTenants = [...currentTenants];
                                      if (updatedTenants[index]) {
                                        updatedTenants.splice(index, 1);
                                      }
                                      setValue('tenants', updatedTenants);
                                    }}
                                  >
                                    Remove
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                  <Box flex="1" textAlign="left">
                                    <Stack spacing={2} w="full">
                                      <FormControl isInvalid={!!errors.tenants?.[index]?.name}>
                                        <FormLabel>
                                          Tenant Name{' '}
                                          <Tooltip label="The tenant key you set in appsettings file" hasArrow>
                                            <chakra.span>
                                              <Icons.InfoCircle />
                                            </chakra.span>
                                          </Tooltip>
                                        </FormLabel>
                                        <Input
                                          value={tenant.name}
                                          {...register(`tenants.${index}.name`)}
                                          onChange={(e) => {
                                            const currentTenants = getValues('tenants') || [];
                                            const updatedTenants = [...currentTenants];
                                            updatedTenants[index].name = e.target.value;
                                            setValue('tenants', updatedTenants);
                                          }}
                                          placeholder="Tenant name"
                                        />
                                        <FormErrorMessage>{errors.tenants?.[index]?.name?.message}</FormErrorMessage>
                                      </FormControl>
                                      <FormControl isInvalid={!!errors.tenants?.[index]?.odss}>
                                        <FormLabel>
                                          ODS Instances{' '}
                                          <Tooltip label="Add the ODS Instances for the tenant" hasArrow>
                                            <chakra.span>
                                              <Icons.InfoCircle />
                                            </chakra.span>
                                          </Tooltip>
                                        </FormLabel>
                                        <ButtonGroup size="sm" mb={2}>
                                          <Button
                                            onClick={() => {
                                              const currentTenants = getValues('tenants') || [];
                                              const updatedTenants = [...currentTenants];
                                              if (!updatedTenants[index].odss) {
                                                updatedTenants[index].odss = [];
                                              }
                                              // Find the max id currently in use and increment by 1 for the new ODS instance
                                              const currentOdss = updatedTenants[index].odss;
                                              const idArray = currentOdss.map(o => typeof o.id === 'number' ? o.id : 0);
                                              const maxId = idArray.length > 0 ? Math.max(...idArray) : 0;
                                              updatedTenants[index].odss.push({
                                                id: maxId + 1,
                                                name: `ODS ${maxId + 1}`,
                                                dbName: `ODS_${maxId + 1}`, // Placeholder, you can set a default or leave it empty
                                                allowedEdOrgs: '', // Placeholder, you can set a default or leave it empty
                                              });
                                              setValue('tenants', updatedTenants);
                                            }}
                                          >
                                            Add ODS
                                          </Button>
                                        </ButtonGroup>
                                        <Box>
                                          <Table variant="simple" size="sm">
                                            <Thead>
                                              <Tr>
                                                <Th>ODS Name{' '}
                                                  <Tooltip label="ODS name in Admin API" hasArrow>
                                                    <chakra.span>
                                                      <Icons.InfoCircle />
                                                    </chakra.span>
                                                  </Tooltip></Th>
                                                <Th>DB Name{' '}
                                                  <Tooltip label="Database name for the ODS instance" hasArrow>
                                                    <chakra.span>
                                                      <Icons.InfoCircle />
                                                    </chakra.span>
                                                  </Tooltip></Th>
                                                <Th>Education Organization Identifier(s){' '}
                                                  <Tooltip label="Comma separated list of Education Organization IDs managed in this instance" hasArrow>
                                                    <chakra.span>
                                                      <Icons.InfoCircle />
                                                    </chakra.span>
                                                  </Tooltip></Th>
                                                <Th>Actions</Th>
                                              </Tr>
                                            </Thead>
                                            {tenant.odss && tenant.odss.length > 0 && (
                                              <Tbody>
                                                {tenant.odss.map((ods, odsIndex) => (
                                                  <Tr key={odsIndex}>
                                                    <Td>
                                                      <FormControl isInvalid={!!errors.tenants?.[index]?.odss?.[odsIndex]?.name}>
                                                        <Input
                                                          value={ods.name}
                                                          {...register(`tenants.${index}.odss.${odsIndex}.name`)}
                                                          onChange={(e) => {
                                                            const currentTenants = getValues('tenants') || [];
                                                            const updatedTenants = [...currentTenants];
                                                            if (updatedTenants[index]?.odss?.[odsIndex]) {
                                                              updatedTenants[index].odss[odsIndex].name = e.target.value;
                                                            }
                                                            setValue('tenants', updatedTenants);
                                                          }}
                                                          placeholder="ODS name"
                                                          size="sm"
                                                        />
                                                        <FormErrorMessage>{errors.tenants?.[index]?.odss?.[odsIndex]?.name?.message}</FormErrorMessage>
                                                      </FormControl>
                                                    </Td>
                                                    <Td>
                                                      <FormControl isInvalid={!!errors.tenants?.[index]?.odss?.[odsIndex]?.dbName}>
                                                        <Input
                                                          value={ods.dbName}
                                                          {...register(`tenants.${index}.odss.${odsIndex}.dbName`)}
                                                          onChange={(e) => {
                                                            const currentTenants = getValues('tenants') || [];
                                                            const updatedTenants = [...currentTenants];
                                                            if (updatedTenants[index]?.odss?.[odsIndex]) {
                                                              updatedTenants[index].odss[odsIndex].dbName = e.target.value;
                                                            }
                                                            setValue('tenants', updatedTenants);
                                                          }}
                                                          placeholder="DB name"
                                                          size="sm"
                                                        />
                                                        <FormErrorMessage>{errors.tenants?.[index]?.odss?.[odsIndex]?.dbName?.message}</FormErrorMessage>
                                                      </FormControl>
                                                    </Td>
                                                    <Td>
                                                      <FormControl isInvalid={!!errors.tenants?.[index]?.odss?.[odsIndex]?.allowedEdOrgs}>
                                                        <Input
                                                          value={ods.allowedEdOrgs}
                                                          {...register(`tenants.${index}.odss.${odsIndex}.allowedEdOrgs`)}
                                                          onChange={(e) => {
                                                            const currentTenants = getValues('tenants') || [];
                                                            const updatedTenants = [...currentTenants];
                                                            if (updatedTenants[index]?.odss?.[odsIndex]) {
                                                              updatedTenants[index].odss[odsIndex].allowedEdOrgs = e.target.value;
                                                            }
                                                            setValue('tenants', updatedTenants);
                                                          }}
                                                          placeholder="1, 255901, 25590100"
                                                          size="sm"
                                                        />
                                                        <FormErrorMessage>{errors.tenants?.[index]?.odss?.[odsIndex]?.allowedEdOrgs?.message}</FormErrorMessage>
                                                      </FormControl>
                                                    </Td>
                                                    <Td>
                                                      <Button
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => {
                                                          const currentTenants = getValues('tenants') || [];
                                                          const updatedTenants = [...currentTenants];
                                                          if (updatedTenants[index]?.odss) {
                                                            updatedTenants[index].odss.splice(odsIndex, 1);
                                                          }
                                                          setValue('tenants', updatedTenants);
                                                        }}
                                                      >
                                                        Remove
                                                      </Button>
                                                    </Td>
                                                  </Tr>
                                                ))}
                                              </Tbody>
                                            )}
                                          </Table>
                                        </Box>
                                      </FormControl>
                                    </Stack>
                                  </Box>
                                </AccordionPanel>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </Stack>
                    </FormControl>
                  </Box>
                )
                  :
                  (
                    <Box>
                      <FormControl isInvalid={!!errors.edOrgIds}>
                        <FormLabel>
                          Education Organization Identifier(s){' '}
                          <Tooltip
                            label="Comma separated list of Education Organization IDs managed in this instance"
                            hasArrow
                          >
                            <chakra.span>
                              <Icons.InfoCircle />
                            </chakra.span>
                          </Tooltip>
                        </FormLabel>
                        <Input {...register('edOrgIds')} placeholder="1, 255901, 25590100" />
                        <FormErrorMessage>{errors.edOrgIds?.message}</FormErrorMessage>
                      </FormControl>
                    </Box>)
              }
            </Box>
          ) : null}
          <ButtonGroup mt={4} colorScheme="primary">
            <Button isLoading={isSubmitting} type="submit">
              Save
            </Button>
            <Button
              variant="ghost"
              isLoading={isSubmitting}
              type="reset"
              onClick={() => {
                navigate(navToParentOptions);
              }}
            >
              Cancel
            </Button>
          </ButtonGroup>
          {errors.root?.message ? (
            <Text mt={4} color="red.500">
              {errors.root?.message}
            </Text>
          ) : null}
        </form>
      </Box >
    </PageTemplate >
  );
};
