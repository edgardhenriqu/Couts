/** Planilha .xlsx dos leads filtrados. ExcelJS só é baixado ao exportar. */
export async function exportLeadsWorkbook(rows) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'COUTS CRM';
  const sheet = workbook.addWorksheet('Leads', { views: [{ state: 'frozen', ySplit: 1 }], properties: { defaultRowHeight: 20 } });
  sheet.columns = [
    { header: 'Nome', key: 'name', width: 30 },
    { header: 'E-mail', key: 'email', width: 38 },
    { header: 'Telefone', key: 'phone', width: 22 },
    { header: 'Empresa', key: 'company', width: 30 },
    { header: 'Interesse', key: 'interest', width: 30 },
    { header: 'Origem', key: 'source', width: 20 },
    { header: 'Responsável', key: 'owner', width: 28 },
    { header: 'Data de captação', key: 'date', width: 20 },
    { header: 'Hora de captação', key: 'time', width: 18 },
    { header: 'Atendimento', key: 'contacted', width: 16 },
    { header: 'Observações', key: 'notes', width: 50 },
  ];
  const header = sheet.getRow(1);
  header.height = 28;
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF05070A' } };
  header.alignment = { vertical: 'middle' };
  sheet.autoFilter = 'A1:K1';

  for (const item of rows) {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    // O Excel guarda datas sem fuso: preserva o horário mostrado no CRM.
    const local =
      createdAt && !Number.isNaN(createdAt.getTime())
        ? new Date(Date.UTC(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate(), createdAt.getHours(), createdAt.getMinutes(), createdAt.getSeconds()))
        : null;
    const row = sheet.addRow({ ...item, date: local, time: local, contacted: item.contacted ? 'Contatado' : 'A contatar' });
    row.alignment = { vertical: 'top', wrapText: true };
    row.getCell('date').numFmt = 'dd/mm/yyyy';
    row.getCell('time').numFmt = 'hh:mm:ss';
    row.getCell('phone').numFmt = '@';
    if (row.number % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F6FB' } };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-couts-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
