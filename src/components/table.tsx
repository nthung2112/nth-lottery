import { useMemo } from "react";

interface TableColumn {
  label: string;
  props?: string;
  sort?: boolean;
  actions?: Array<{
    label: string;
    type: string;
    onClick: (item: any) => void;
  }>;
  formatValue?: (item: any) => string;
}

interface TableProps {
  data: any[];
  tableColumns: TableColumn[];
}

export function Table({ data = [], tableColumns = [] }: TableProps) {
  const dataColumns = useMemo(() => {
    return tableColumns.filter((item) => !item.actions);
  }, [tableColumns]);

  const actionsColumns = useMemo(() => {
    return tableColumns.filter((item) => item.actions);
  }, [tableColumns]);

  return (
    <div className="overflow-x-auto">
      <table className="table min-w-[600px]">
        <thead>
          <tr>
            <th></th>
            {dataColumns.map((item, index) => (
              <th key={index}>{item.label}</th>
            ))}
            {actionsColumns.map((item, index) => (
              <th key={index}>Operate</th>
            ))}
            <th></th>
          </tr>
        </thead>
        {data.length > 0 ? (
          <tbody>
            {data.map((item) => (
              <tr className="hover" key={item.id}>
                <th>{item.id}</th>
                {dataColumns.map((column, index) => (
                  <td key={index}>
                    {column.formatValue ? column.formatValue(item) : item[column.props as string]}
                  </td>
                ))}
                {actionsColumns.map((column, index) => (
                  <td key={index} className="flex gap-2">
                    {column.actions?.map((action) => (
                      <button
                        key={action.type}
                        className={`btn btn-xs ${action.type}`}
                        onClick={() => action.onClick(item)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={5} className="text-center">
                No data yet
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
