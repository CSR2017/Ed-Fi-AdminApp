import {
  Box,
  Button,
  ButtonGroup,
  chakra,
  HStack,
  Icon,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * Wrapper around @tanstack/react-table.
 *
 * Uses Chakra-UI table with no style overrrides (e.g. just plained old themed Chakra table).
 *
 * Notes:
 * - Sorting is done automatically. The `accessorKey` or `accessorFn` column attributes therefore need to yield the value to be sorted. For example, you wouldn't want to display the `displayName` of a relation but sort on their `id`.
 *   - Use the `getRelationDisplayName()` helper function to conveniently build a `accessorFn` which returns the display value.
 * - The `data` and `columns` props are passed through to react-table unchanged, so feel free to use the full react-table API.
 * 
 * @example <caption>column config for basic text value</caption>
 * ({
 *   accessorKey: 'name',
 *   header: () => 'Name',
 * })
 * 
 * @example <caption>Column config for transformed value</caption>
 * ({
 *   accessorFn: (info) => shortDate(info.createdDate),
 *   header: () => 'Created Date',
 * })
 * 
 * @example <caption>Column config for custom cell</caption>
 * // Make sure to put the transformation in the accessor so that it gets used for sorting, even if you also have a custom renderer.
 * ({
 *   accessorFn: (info) => shortDate(info.createdDate),
 *   cell: (info) => (
       <Text color="gray.500">{info.getValue()}</Text>
     ),
 *   header: () => 'Created Date',
 * })
 * 
 * @example <caption>Column config for basic text value</caption>
 * ({
 *     accessorKey: 'name',
 *     header: () => 'Name',
 * })
 */
export function DataTable<T extends object>(props: {
  data: T[] | IterableIterator<T>;
  columns: ColumnDef<T>[];
  enableRowSelection?: boolean;
}) {
  const data = useMemo(() => [...props.data], [props.data]);
  const columns = props.columns;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowSelection: false,
    debugTable: false,
  });

  return (
    <Box>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                    onClick={header.column.getToggleSortingHandler()}
                    userSelect="none"
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <>&nbsp;&#9650;</>,
                          desc: <>&nbsp;&#9660;</>,
                        }[header.column.getIsSorted() as string] ?? (
                          <chakra.span visibility="hidden">&nbsp;&#9660;</chakra.span>
                        )}
                      </>
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <Tr
                key={row.id}
                aria-selected={row.getIsSelected()}
                onClick={row.getToggleSelectedHandler()}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {table.getPrePaginationRowModel().rows.length > 10 ? (
        <HStack justify="center" p={4}>
          <ButtonGroup size="sm" variant="outline">
            <Button
              w={8}
              borderRadius={'8em'}
              onClick={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
            >
              <Icon as={FiChevronsLeft} />
            </Button>
            <Button
              w={8}
              borderRadius={'8em'}
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              <Icon as={FiChevronLeft} />
            </Button>
          </ButtonGroup>
          <Text>
            {table.getState().pagination.pageIndex + 1}&nbsp;of&nbsp;
            {table.getPageCount()}
          </Text>
          <ButtonGroup size="sm" variant="outline">
            <Button
              w={8}
              borderRadius={'8em'}
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              <Icon as={FiChevronRight} />
            </Button>
            <Button
              w={8}
              borderRadius={'8em'}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              isDisabled={!table.getCanNextPage()}
            >
              <Icon as={FiChevronsRight} />
            </Button>
          </ButtonGroup>
          <Select
            borderRadius={'8em'}
            w={'auto'}
            size="sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Select>
        </HStack>
      ) : null}
    </Box>
  );
}
