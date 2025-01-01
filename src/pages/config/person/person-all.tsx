import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { Table } from "@/components/table";
import { IPersonConfig } from "@/types/storeType";
import { addOtherInfo } from "../../home/home-util";
import { readFileBinary } from "@/utils/file";
import { getAllPersonList, getAlreadyPersonList, usePersonStore } from "@/store/person";

const limitType = ".xlsx,.xls";

export default function PersonAll() {
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
      uid: "编号",
      isWin: "是否中奖",
      department: "部门",
      name: "姓名",
      identity: "身份",
      prizeName: "获奖",
      prizeTime: "获奖时间",
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
    { label: "UID", props: "uid" },
    { label: "Name", props: "name" },
    { label: "Department", props: "department" },
    { label: "Identity", props: "identity" },
    {
      label: "Have you won the prize?",
      props: "isWin",
      formatValue: (row: IPersonConfig) => (row.isWin ? "Yes" : "No"),
    },
    {
      label: "Operate",
      actions: [
        {
          label: "Delete",
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
          <h3 className="text-lg font-bold">Are you sure?</h3>
          <p className="py-4">
            This operation will clear the winning information of the person. Do you want to
            continue?
          </p>
          <div className="modal-action">
            <div className="flex gap-3">
              <button className="btn" onClick={() => resetDataDialogRef.current?.close()}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={resetData}>
                OK
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <dialog ref={delAllDataDialogRef} className="border-none modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Are you sure?</h3>
          <p className="py-4">This operation will delete all personnel data. Do you want to continue?</p>
          <div className="modal-action">
            <div className="flex gap-3">
              <button className="btn" onClick={() => delAllDataDialogRef.current?.close()}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={deleteAll}>
                OK
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <h2>Personnel management</h2>
      <div className="flex gap-3">
        <button
          className="btn btn-error btn-sm"
          onClick={() => delAllDataDialogRef.current?.showModal()}
        >
          Delete all
        </button>
        <div
          className="tooltip tooltip-bottom"
          data-tip="下载文件后，请在excel中填写数据，并保存为xlsx格式"
        >
          <a
            className="no-underline btn btn-secondary btn-sm"
            download="人口登记表.xlsx"
            target="_blank"
            href="/log-lottery/人口登记表.xlsx"
          >
            Download template
          </a>
        </div>
        <div>
          <label htmlFor="explore">
            <div className="tooltip tooltip-bottom" data-tip="上传修改好的excel文件">
              <input
                type="file"
                id="explore"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept={limitType}
              />
              <span className="btn btn-primary btn-sm">Import personnel data</span>
            </div>
          </label>
        </div>
        <button
          className="btn btn-error btn-sm"
          onClick={() => resetDataDialogRef.current?.showModal()}
        >
          Reset personnel data
        </button>
        <button className="btn btn-accent btn-sm" onClick={exportData}>
          Export results
        </button>
        <div>
          <span>Number of winners: </span>
          <span>{alreadyPersonList.length}</span>
          <span>&nbsp;/&nbsp;</span>
          <span>{allPersonList.length}</span>
        </div>
      </div>

      <Table tableColumns={tableColumns} data={allPersonList} />
    </div>
  );
}
