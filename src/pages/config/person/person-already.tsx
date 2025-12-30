import { useTranslation } from "react-i18next";
import { getAlreadyPersonList, usePersonStore } from "@/store/person";
import { IPersonConfig } from "@/types/storeType";
import { Table } from "@/components/table";
import { useRef } from "react";

export default function PersonAlready() {
  const { t } = useTranslation();
  const delAllDataDialogRef = useRef<HTMLDialogElement>(null);
  const { personConfig, moveAlreadyToNot, resetAlreadyPerson } = usePersonStore();
  const alreadyPersonList = getAlreadyPersonList(personConfig);

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
      label: t("person.timeOfWinning"),
      props: "prizeTime",
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

  const deleteAll = () => {
    resetAlreadyPerson();
    delAllDataDialogRef.current?.close();
  };

  return (
    <div className="overflow-y-auto">
      <h2 className="text-3xl sm:text-4x pb-4">{t("person.managementOfWinners")}</h2>
      <div className="flex items-center justify-start gap-4">
        <button
          className="btn btn-error btn-sm"
          onClick={() => delAllDataDialogRef.current?.showModal()}
        >
          {t("person.resetAll")}
        </button>
        <div>
          <span>{t("person.numberOfWinners")}: </span>
          <span>{alreadyPersonList.length}</span>
        </div>
      </div>

      <Table tableColumns={tableColumnsList} data={alreadyPersonList} />

      <dialog ref={delAllDataDialogRef} className="border-none modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t("person.areYouSure")}</h3>
          <p className="py-4">{t("person.deleteAllWinnersConfirm")}</p>
          <div className="modal-action">
            <div className="flex gap-3">
              <button className="btn" onClick={() => delAllDataDialogRef.current?.close()}>
                {t("common.cancel")}
              </button>
              <button className="btn btn-success" onClick={deleteAll}>
                {t("common.ok")}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
