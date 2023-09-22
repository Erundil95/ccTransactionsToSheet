/*Google Sheet formulas for overview:
EARNINGS MONTH: =SUMIFS(Earnings!C2:C; Earnings!A2:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Earnings!A2:A; "<="&EOMONTH(TODAY();0))
EXPENSES MONTH: =SUMIFS(Transactions!C2:C; Transactions!E2:E; "=mine"; Transactions!A2:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transactions!A2:A; "<="&EOMONTH(TODAY();0))
EARNINGS YEAR: =SUMIFS(Earnings!C2:C; Earnings!A2:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Earnings!A2:A; "<="&EOMONTH(TODAY();0))
EXPENSES YEAR: =SUMIFS(Transactions!C2:C; Transactions!E2:E; "=mine"; Transactions!A2:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transactions!A2:A; "<="&EOMONTH(TODAY();0))
*/
const SHEET_ID = '1ZDt-wVw6yhNq3Tm_pUkRvZi7VVFUg9Qb3i6a9QHs7Ao';
const PENDING_LABEL = 'Pending Transactions';
const PROCESSED_LABEL = 'Processed Transactions';
const monthToColor = {
  1: "#FF0000", // January
  2: "#00FF00", // February
  3: "#0000FF", // March
  4: "#FFFF00", // April
  5: "#00FFFF", // May
  6: "#FF00FF", // June
  7: "#C0C0C0", // July
  8: "#808080", // August
  9: "#800000", // September
  10: "#808000", // October
  11: "#008000", // November
  12: "#008080" // December
};

function main() {
  const pendingLabel = GmailApp.getUserLabelByName(PENDING_LABEL);
  const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL);
  const threads = pendingLabel.getThreads();
  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const transactionSheet = sheet.getSheetByName("Transactions");

  if (threads) {
    for (var i = 0; i < threads.length; i++) {
      const message = threads[i].getMessages()[0]; //get first and only message
      const body = message.getPlainBody();

      const transactionData = getDataFromTransactionMail(body);
      if (!transactionData) continue;

      //Append and format new transaction
      transactionSheet.appendRow(transactionData);
      const lastRow = transactionSheet.getLastRow();
      const dateCell = transactionSheet.getRange("A" + lastRow);
      dateCell.setNumberFormat("dd/mm/yyyy");
      const amountCell = transactionSheet.getRange("C" + lastRow);
      amountCell.setNumberFormat("0.00");

      colorLabels(transactionData[0], lastRow, transactionSheet);

      // Move the thread to the 'Processed Transactions' label
      threads[i].removeLabel(pendingLabel);
      threads[i].addLabel(processedLabel);
    }
  }

  //Order transactions by date (column A) and time (column B) (newest first)
  transactionSheet.sort(1, false); 
}

function getDataFromTransactionMail(body) {
    try {
      // Text is CSV-like "amount,vendor,date,time,owner"f
      const data = body.split("|");
      if (data.length < 5) {
        throw new Error("Email body not formatted as expected.");
      }
      
      const amount = data[0].replace(" €", "");    //might want to handle the rare cases of diff currency transactions
      const vendor = data[1];
      const date = data[2];
      const time = data[3];
      const owner = data[4];
      
      return [date, time, amount, vendor, owner];

    } catch(e) {
      // Log any errors for debugging
      console.error("Error processing thread: " + e.message);
      return null;
    }
}

function colorLabels(transactionDate,  lastRow, transactionSheet) {
  const colorCell = transactionSheet.getRange("F" + lastRow);
  const [day, month, year] = transactionDate.split("/"); 
  Logger.log(transactionDate);
  Logger.log("Month: " + month);

  let color = monthToColor[parseInt(month)];
  Logger.log("Coloring cell " + colorCell.getA1Notation() + " with color " + color);

  colorCell.setBackground(color);
}  
  
main();
