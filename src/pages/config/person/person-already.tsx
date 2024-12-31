import { useState } from "react";
import { getAlreadyPersonDetail, getAlreadyPersonList, usePersonStore } from "@/store/person";
import { IPersonConfig } from "@/types/storeType";
import { Table } from "@/components/table";

export default function PersonAlready() {
  const [isDetail, setIsDetail] = useState(false);
  const { personConfig, moveAlreadyToNot } = usePersonStore();
  const alreadyPersonList = getAlreadyPersonList(personConfig);
  const alreadyPersonDetail = getAlreadyPersonDetail(personConfig);

  const handleMoveNotPerson = (row: IPersonConfig) => {
    moveAlreadyToNot(row);
  };

  const tableColumnsList = [
    {
      label: "UID",
      props: "uid",
      sort: true,
    },
    {
      label: "Name",
      props: "name",
    },
    {
      label: "Department",
      props: "department",
    },
    {
      label: "Identity",
      props: "identity",
    },
    {
      label: "Prize",
      props: "prizeName",
      sort: true,
    },
    {
      label: "Operate",
      actions: [
        {
          label: "Moved to the list of non-winners",
          type: "btn-info",
          onClick: handleMoveNotPerson,
        },
      ],
    },
  ];

  const tableColumnsDetail = [
    ...tableColumnsList.slice(0, -1),
    {
      label: "Time of winning",
      props: "prizeTime",
    },
    tableColumnsList[tableColumnsList.length - 1],
  ];

  return (
    <div className="overflow-y-auto">
      <h2>Management of winners</h2>
      <div className="flex items-center justify-start gap-10">
        <div>
          <span>Number of winners: </span>
          <span>{alreadyPersonList.length}</span>
        </div>
        <div className="flex flex-col">
          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">Details:</span>
              <input
                type="checkbox"
                className="border-solid toggle toggle-primary border-1"
                checked={isDetail}
                onChange={(e) => setIsDetail(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>

      {isDetail ? (
        <Table tableColumns={tableColumnsDetail} data={alreadyPersonDetail} />
      ) : (
        <Table tableColumns={tableColumnsList} data={alreadyPersonList} />
      )}
    </div>
  );
}
