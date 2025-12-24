import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getAlreadyPersonDetail, getAlreadyPersonList, usePersonStore } from "@/store/person";
import { IPersonConfig } from "@/types/storeType";
import { Table } from "@/components/table";

export default function PersonAlready() {
  const { t } = useTranslation();
  const [isDetail, setIsDetail] = useState(false);
  const { personConfig, moveAlreadyToNot } = usePersonStore();
  const alreadyPersonList = getAlreadyPersonList(personConfig);
  const alreadyPersonDetail = getAlreadyPersonDetail(personConfig);

  const handleMoveNotPerson = (row: IPersonConfig) => {
    moveAlreadyToNot(row);
  };

  const tableColumnsList = [
    {
      label: t("person.uid"),
      props: "uid",
      sort: true,
    },
    {
      label: t("person.name"),
      props: "name",
    },
    {
      label: t("person.department"),
      props: "department",
    },
    {
      label: t("person.identity"),
      props: "identity",
    },
    {
      label: t("person.prize"),
      props: "prizeName",
      sort: true,
    },
    {
      label: t("person.operate"),
      actions: [
        {
          label: t("person.movedToNonWinners"),
          type: "btn-info",
          onClick: handleMoveNotPerson,
        },
      ],
    },
  ];

  const tableColumnsDetail = [
    ...tableColumnsList.slice(0, -1),
    {
      label: t("person.timeOfWinning"),
      props: "prizeTime",
    },
    tableColumnsList[tableColumnsList.length - 1],
  ];

  return (
    <div className="overflow-y-auto">
      <h2 className="text-3xl sm:text-4x pb-4">{t("person.managementOfWinners")}</h2>
      <div className="flex items-center justify-start gap-10">
        <div>
          <span>{t("person.numberOfWinners")}: </span>
          <span>{alreadyPersonList.length}</span>
        </div>
        <div className="flex flex-col">
          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">{t("person.details")}</span>
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
