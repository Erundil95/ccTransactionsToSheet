# ccTransactionsToSheet
Detect and sort CC transactions using Automagic Premium and Google script

- Automagic Premium detects NEXI App notification about a credit card transaction
- Reads notification, script uses regex to extrapolate amount, vendor, date and time
- Creates new notification with option to specify if the transaction is mine or made on behalf of someone else (other)
- Sends an email containing pipe sperated data about the transaction to my own email account
- Google Script runs every hour to detect unread mails labled "CC Transaction"
- Extracts data and appends it to Google Sheet containing transaction history
