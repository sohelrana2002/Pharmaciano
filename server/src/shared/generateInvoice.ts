/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import { Response } from "express";

export const generateInvoicePDF = (sale: any, res: Response) => {
  const doc = new PDFDocument({ size: "A6", margin: 20 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice-${sale.invoiceNo}.pdf`,
  );

  doc.pipe(res);

  doc
    .fontSize(10)
    .text(sale.organizationId.name.toUpperCase(), { align: "center" })
    .fontSize(8)
    .text(sale.organizationId.address.toUpperCase(), { align: "center" })
    .text(`Phone: ${sale.organizationId.contact.phone}`, {
      align: "center",
    });

  doc.moveDown(0.5);

  doc
    .fontSize(8)
    .text(`Branch: ${sale.branchId.name.toUpperCase()}`, { align: "center" });

  doc.moveDown();

  doc.fontSize(8).text("INVOICE", { align: "center", underline: true });

  doc.moveDown(1.5);

  const leftX = 20;
  const rightX = 130;

  // use the same top y
  const topY = doc.y;

  doc
    .fontSize(7)
    .text(`Invoice No: ${sale.invoiceNo}`, leftX, topY)
    .text(`Date: ${new Date(sale.createdAt).toLocaleString()}`, leftX)
    .text(`Payment: ${sale.paymentMethod.toUpperCase()}`, leftX);

  doc
    .text(`Customer: ${sale.customerName.toUpperCase()}`, rightX, topY)
    .text(`Phone: ${sale.customerPhone}`, rightX)
    .text(`Cashier: ${sale.cashierId.name.toUpperCase()}`, rightX);

  doc.moveDown(2);

  const tableTop = doc.y;

  doc
    .fontSize(8)
    .text("SL", 20, tableTop)
    .text("Medicine", 40, tableTop)
    .text("Batch", 110, tableTop)
    .text("Qty", 180, tableTop)
    .text("Price", 210, tableTop)
    .text("Total", 240, tableTop);

  doc.moveDown(0.5);
  doc.moveTo(20, doc.y).lineTo(270, doc.y).stroke();

  let y = doc.y + 5;

  sale.items.forEach((item: any, index: number) => {
    const total = item.quantity * item.sellingPrice;

    doc
      .fontSize(6)
      .text(String(index + 1), 20, y)
      .text(item.medicineName.toUpperCase(), 40, y, { width: 50 }) // wrap support
      .text(item.batchNo, 110, y)
      .text(String(item.quantity), 180, y)
      .text(item.sellingPrice.toFixed(2), 210, y)
      .text(total.toFixed(2), 240, y);

    y += 10;
  });

  doc.moveDown(2);

  const summaryX = 180;

  doc
    .fontSize(8)
    .text(`Subtotal: ${sale.subtotal.toFixed(2)}`, summaryX)
    .text(`Discount: ${sale.discount}%`, summaryX)
    .text(`Tax: ${sale.tax}%`, summaryX)
    .moveDown(0.5)
    .fontSize(8)
    .text(`Grand Total: ${sale.totalAmount.toFixed(2)}`, summaryX);

  doc.moveDown(3);

  doc.fontSize(7).text("Thank you for your purchase!", 0, doc.y, {
    align: "center",
    width: doc.page.width,
  });

  doc.end();
};
