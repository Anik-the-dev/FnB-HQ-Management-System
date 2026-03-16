export const buildReceiptNumber = (outletId, sequence) => {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const seqPart  = String(sequence).padStart(4, '0');
  return `OT${outletId}-${datePart}-${seqPart}`;
};
