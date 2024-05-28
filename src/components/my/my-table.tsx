import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';

type TableColumn<T> = {
  name: string;
  param: keyof T;
  width: string;
};

type MyTableProps<T> = {
  columns: TableColumn<T>[];
  description: string;
  data: T[];
};

export function MyTable<T>({ columns, description, data }: MyTableProps<T>) {
  return (
    <Table>
      <TableCaption>{description}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.param as string} className={`w-[${column.width}]`}>
              {column.name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column) => (
              <TableCell key={column.param as string}>
                {row[column.param] as string}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
