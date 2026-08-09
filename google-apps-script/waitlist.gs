/**
 * HustleQ — Waitlist → Google Sheets
 * Recebe os envios do formulário da landing e grava uma linha na planilha.
 *
 * Como usar (passo a passo no README abaixo):
 *  1. Crie/abra a planilha do Google.
 *  2. Extensões → Apps Script, cole este arquivo.
 *  3. Implantar → Nova implantação → "App da Web".
 *     - Executar como: Eu
 *     - Quem tem acesso: Qualquer pessoa
 *  4. Copie a URL do app da Web e cole em src/content/site.ts (waitlist.endpoint).
 */

var SHEET_NAME = 'Waitlist'
var HEADERS = ['Timestamp', 'Email', 'Business', 'Marketing', 'Hardest part']

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)

    // Garante o cabeçalho na primeira vez
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS)
    }

    var data = JSON.parse(e.postData.contents)

    sheet.appendRow([
      new Date(),
      data.email || '',
      data.business || '',
      data.marketing || '',
      data.hardest || '',
    ])

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}
