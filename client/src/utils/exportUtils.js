import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import the function directly

// --- CSV EXPORT ---
export const exportToCSV = (data, fileName) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => `"${value}"`)
      .join(","),
  );

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- PDF REPORT GENERATION ---
export const generateDashboardPDF = (stats, recentOrders) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("StockFlow Business Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // 1. STATS TABLE
  // Instead of doc.autoTable, use autoTable(doc, ...)
  autoTable(doc, {
    startY: 40,
    head: [["Metric", "Value"]],
    body: [
      ["Total Revenue", `INR ${stats.totalRevenue.toLocaleString()}`],
      ["Total Orders", stats.totalOrders],
      ["Pending Dues", `INR ${stats.totalDues.toLocaleString()}`],
      ["Inventory Count", stats.totalProducts],
    ],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] }, // Fixed property name to fillColor
  });

  // 2. RECENT TRANSACTIONS TABLE
  const finalY = doc.lastAutoTable.finalY; // Get position of previous table

  doc.setTextColor(0);
  doc.text("Recent Transactions", 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Order ID", "Customer", "Amount", "Status"]],
    body: recentOrders.map((o) => [
      o.orderId,
      o.customerName,
      `INR ${o.totalAmount.toLocaleString()}`,
      o.paymentStatus,
    ]),
    headStyles: { fillColor: [71, 85, 105] },
  });

  doc.save(`StockFlow_Report_${Date.now()}.pdf`);
};
