import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportDispatchExcel = (
  data:any[],
  fileName:string
)=>{

const rows=data.map((item)=>({

Order:item.order?.orderNumber,

Customer:item.customer?.name,

Status:item.status,

Date:new Date(item.createdAt).toLocaleDateString(),

}));

const ws=XLSX.utils.json_to_sheet(rows);

const wb=XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb,ws,"Dispatch");

const buffer=XLSX.write(wb,{
bookType:"xlsx",
type:"array",
});

saveAs(new Blob([buffer]),`${fileName}.xlsx`);

};