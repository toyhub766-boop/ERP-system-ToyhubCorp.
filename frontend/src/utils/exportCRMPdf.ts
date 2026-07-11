import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportCRMPdf=(
data:any[],
title:string
)=>{

const doc=new jsPDF();

doc.text(title,14,18);

autoTable(doc,{
startY:28,
head:[Object.keys(data[0]||{})],
body:data.map(Object.values),
});

doc.save("crm.pdf");

};