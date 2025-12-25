import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { Table } from "@/components/table";
import { IPersonConfig } from "@/types/storeType";
import { addOtherInfo } from "../../home/home-util";
import { readFileBinary } from "@/utils/file";
import { getAllPersonList, getAlreadyPersonList, usePersonStore } from "@/store/person";

const limitType = ".xlsx,.xls";

export default function PersonAll() {
  const { t } = useTranslation();
  const {
    personConfig,
    resetPerson,
    addNotPersonList,
    deletePerson,
    resetAlreadyPerson,
    deleteAllPerson,
  } = usePersonStore();
  const allPersonList = getAllPersonList(personConfig);
  const alreadyPersonList = getAlreadyPersonList(personConfig);

  const resetDataDialogRef = useRef<HTMLDialogElement>(null);
  const delAllDataDialogRef = useRef<HTMLDialogElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const dataBinary = await readFileBinary(e.target.files[0]);
    const workBook = XLSX.read(dataBinary, { type: "binary", cellDates: true });
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(workSheet);
    const allData = addOtherInfo(excelData as IPersonConfig[]);
    resetPerson();
    addNotPersonList(allData);
  };

  const exportData = () => {
    let data = JSON.parse(JSON.stringify(allPersonList));

    data = data.map((item: any) => {
      const newItem = { ...item };
      delete newItem.x;
      delete newItem.y;
      delete newItem.id;
      delete newItem.createTime;
      delete newItem.updateTime;
      delete newItem.prizeId;

      newItem.isWin = newItem.isWin ? "是" : "否";
      newItem.prizeTime = newItem.prizeTime.join(",");
      newItem.prizeName = newItem.prizeName.join(",");
      return newItem;
    });

    const fieldMapping = {
      uid: t("person.uid"),
      isWin: t("person.haveWonPrize"),
      department: t("person.department"),
      name: t("person.name"),
      identity: t("person.identity"),
      prizeName: t("person.prize"),
      prizeTime: t("person.timeOfWinning"),
    };

    const renamedData = data.map((item: any) => {
      const newItem: any = {};
      Object.entries(item).forEach(([key, value]) => {
        newItem[fieldMapping[key as keyof typeof fieldMapping] || key] = value;
      });
      return newItem;
    });

    if (renamedData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(renamedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, "data.xlsx");
    }
  };

  const resetData = () => {
    resetAlreadyPerson();
    resetDataDialogRef.current?.close();
  };

  const deleteAll = () => {
    deleteAllPerson();
    delAllDataDialogRef.current?.close();
  };

  const delPersonItem = (row: IPersonConfig) => {
    deletePerson(row);
  };

  const tableColumns = [
    { label: t("person.uid"), props: "uid" },
    { label: t("person.name"), props: "name" },
    { label: t("person.department"), props: "department" },
    { label: t("person.identity"), props: "identity" },
    {
      label: t("person.haveWonPrize"),
      props: "isWin",
      formatValue: (row: IPersonConfig) => (row.isWin ? t("person.yes") : t("person.no")),
    },
    {
      label: t("person.operate"),
      actions: [
        {
          label: t("person.delete"),
          type: "btn-error",
          onClick: delPersonItem,
        },
      ],
    },
  ];

  return (
    <div className="min-w-1000px">
      <dialog ref={resetDataDialogRef} className="border-none modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t("person.areYouSure")}</h3>
          <p className="py-4">{t("person.clearWinningInfoConfirm")}</p>
          <div className="modal-action">
            <div className="flex gap-3">
              <button className="btn" onClick={() => resetDataDialogRef.current?.close()}>
                {t("common.cancel")}
              </button>
              <button className="btn btn-success" onClick={resetData}>
                {t("common.ok")}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <dialog ref={delAllDataDialogRef} className="border-none modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t("person.areYouSure")}</h3>
          <p className="py-4">{t("person.deleteAllPersonnelConfirm")}</p>
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

      <h2 className="text-3xl sm:text-4x pb-4">{t("person.personnelManagement")}</h2>
      <div className="flex gap-3">
        <button
          className="btn btn-error btn-sm"
          onClick={() => delAllDataDialogRef.current?.showModal()}
        >
          {t("person.deleteAll")}
        </button>
        <div className="tooltip tooltip-bottom" data-tip={t("person.downloadTemplateTooltip")}>
          <a
            className="no-underline btn btn-secondary btn-sm"
            download="template-person.xlsx"
            target="_blank"
            href="/assets/personListTemplate.xlsx"
          >
            {t("person.downloadTemplate")}
          </a>
        </div>
        <div>
          <label htmlFor="explore">
            <div className="tooltip tooltip-bottom" data-tip={t("person.uploadFileTooltip")}>
              <input
                type="file"
                id="explore"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept={limitType}
              />
              <span className="btn btn-primary btn-sm">{t("person.importPersonnelData")}</span>
            </div>
          </label>
        </div>
        <button
          className="btn btn-error btn-sm"
          onClick={() => resetDataDialogRef.current?.showModal()}
        >
          {t("person.resetPersonnelData")}
        </button>
        <button className="btn btn-accent btn-sm" onClick={exportData}>
          {t("person.exportResults")}
        </button>
        <div>
          <span>{t("person.numberOfWinners")}: </span>
          <span>{alreadyPersonList.length}</span>
          <span>&nbsp;/&nbsp;</span>
          <span>{allPersonList.length}</span>
        </div>
      </div>

      <Table tableColumns={tableColumns} data={allPersonList} />
    </div>
  );
}
