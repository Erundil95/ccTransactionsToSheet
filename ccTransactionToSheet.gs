function ccTransactionsToSheet() {
  var pendingLabel = GmailApp.getUserLabelByName("Pending Transactions");
  var processedLabel = GmailApp.getUserLabelByName("Processed Transactions");

  var threads = pendingLabel.getThreads()
  
  // .filter(function(thread) {
  //   return thread.isUnread();
  // });

  var sheet = SpreadsheetApp.openById('1hHLlyu5B5hI9cIfWHgbHfDQjak57iO1DRD2YBBgLSNc').getSheetByName('Transactions')
  
  for (var i = 0; i < threads.length; i++){
    var message = threads[i].getMessages()[0];   //get first and only message
    var body = message.getPlainBody();

    try {
      // Text is CSV-like "amount,vendor,date,time,owner"
      var data = body.split("|");
      if (data.length < 5) {
        throw new Error("Email body not formatted as expected.");
      }
  
      var amount = data[0].replace(" €", "");    //might want to handle the rare cases of diff currency transactions
      var vendor = data[1];
      var date = data[2];
      var time = data[3];
      var owner = data[4];
      
      sheet.appendRow([date, time, amount, vendor, owner]);

      var lastRow = sheet.getLastRow();

      var dateCell = sheet.getRange("A" + lastRow);
      dateCell.setNumberFormat("dd/mm/yyyy");
      var amountCell = sheet.getRange("C" + lastRow);
      amountCell.setNumberFormat("0.00");

      
      // Move the thread to the 'Processed Transactions' label
      threads[i].removeLabel(pendingLabel);
      threads[i].addLabel(processedLabel);
      
    } catch(e) {
      // Log any errors for debugging
      console.error("Error processing thread " + threads[i].getId() + ": " + e.message);
    }
  }
}
