import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportDispatchPdf=(
data:any[],
title:string
)=>{

const doc=new jsPDF();

doc.text(title,14,18);

autoTable(doc,{

startY:28,

head:[[
"Order",
"Customer",
"Status",
"Date",
]],

body:data.map(item=>[
item.order?.orderNumber,
item.customer?.name,
item.status,
new Date(item.createdAt).toLocaleDateString(),
]),

});

doc.save("dispatch.pdf");

};