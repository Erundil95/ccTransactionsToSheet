function ccTransactionsToSheet() {
  var label = GmailApp.getUserLabelByName("CC Transactions");

  var threads = label.getThreads().filter(function(thread) {
    return thread.isUnread();
  });

  var sheet = SpreadsheetApp.openById('1hHLlyu5B5hI9cIfWHgbHfDQjak57iO1DRD2YBBgLSNc').getSheetByName('Transactions')
  
  for (var i = 0; i < threads.length; i++){
    var message = threads[i].getMessages()[0];   //get first and only message
    var body = message.getPlainBody();

    try {
      // Text is CSV-like "amount,vendor,date,time,label"
      var data = body.split("|");
      if (data.length < 5) {
        throw new Error("Email body not formatted as expected.");
      }
      var amount = data[0];
      var vendor = data[1];
      var date = data[2];
      var time = data[3];
      var label = data[4];
      
      sheet.appendRow([date, time, amount, vendor, label]);
      
      // Mark the message as read
      message.markRead();
    } catch(e) {
      // Log any errors for debugging
      console.error("Error processing thread " + threads[i].getId() + ": " + e.message);
    }
  }
}
