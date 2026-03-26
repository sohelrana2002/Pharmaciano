/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import { Response } from "express";

export const generateInvoicePDF = (sale: any, res: Response) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice-${sale.invoiceNo}.pdf`,
  );

  doc.pipe(res);

  doc
    .fontSize(18)
    .text(sale.organizationId.name.toUpperCase(), { align: "center" })
    .fontSize(10)
    .text(sale.organizationId.address.toUpperCase(), { align: "center" })
    .text(`Phone: ${sale.organizationId.contact.phone}`, {
      align: "center",
    });

  doc.moveDown(0.5);

  doc
    .fontSize(12)
    .text(`Branch: ${sale.branchId.name.toUpperCase()}`, { align: "center" });

  doc.moveDown();

  doc.fontSize(14).text("INVOICE", { align: "center", underline: true });

  doc.moveDown(1.5);

  const leftX = 40;
  const rightX = 320;

  // use the same top y
  const topY = doc.y;

  doc
    .fontSize(10)
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
    .fontSize(10)
    .text("SL", 40, tableTop)
    .text("Medicine", 70, tableTop)
    .text("Batch", 250, tableTop)
    .text("Qty", 320, tableTop)
    .text("Price", 370, tableTop)
    .text("Total", 430, tableTop);

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  let y = doc.y + 5;

  sale.items.forEach((item: any, index: number) => {
    const total = item.quantity * item.sellingPrice;

    doc
      .fontSize(10)
      .text(String(index + 1), 40, y)
      .text(item.medicineName.toUpperCase(), 70, y, { width: 170 }) // wrap support
      .text(item.batchNo, 250, y)
      .text(String(item.quantity), 320, y)
      .text(item.sellingPrice.toFixed(2), 370, y)
      .text(total.toFixed(2), 430, y);

    y += 20;
  });

  doc.moveDown(2);

  const summaryX = 350;

  doc
    .fontSize(10)
    .text(`Subtotal: ${sale.subtotal.toFixed(2)}`, summaryX)
    .text(`Discount: ${sale.discount}%`, summaryX)
    .text(`Tax: ${sale.tax}%`, summaryX)
    .moveDown(0.5)
    .fontSize(12)
    .text(`Grand Total: ${sale.totalAmount.toFixed(2)}`, summaryX);

  doc.moveDown(3);

  doc
    .fontSize(10)
    .text("Authorized Signature", 40)
    .text("_________________________", 40);

  doc.fontSize(9).text("Thank you for your purchase!", { align: "center" });

  doc.end();
};
