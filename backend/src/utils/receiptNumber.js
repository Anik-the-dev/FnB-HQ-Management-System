
// Format: OT{outletId}-{YYYYMMDD}-{SEQ padded to 4}
// e.g.    OT1-20260316-0042
//
// Sequence comes from outlet_receipt_counters (locked in DB transaction)
// so this function is purely a formatter — no DB logic here.

export const buildReceiptNumber = (outletId, sequence) => {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const seqPart  = String(sequence).padStart(4, '0');
  return `OT${outletId}-${datePart}-${seqPart}`;
};
