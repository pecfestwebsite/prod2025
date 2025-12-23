# 🚀 Quick Start Guide - Database Export

## Fastest Way to Export (Windows)

### Option 1: Double-Click Method (Easiest)
1. Double-click `run_db_export.bat`
2. Wait for the script to complete
3. Your Excel files will be in the `mongodb_exports` folder

### Option 2: Command Line Method
```bash
# Install dependencies (first time only)
pip install -r requirements_db_export.txt

# Run the export
python download_db_to_excel.py
```

## What You'll Get

After running the script, you'll have:

### Main Exports Folder: `output/`
- 📊 `00_SUMMARY_REPORT.xlsx` - Overview of all collections
- 👥 `users.xlsx` - All registered users (name, email, college, etc.)
- 🎉 `events.xlsx` - All events with details
- 📝 `registrations.xlsx` - All registrations across all events
- 👔 `adminusers.xlsx` - Admin users and their access levels
- 💰 `discounts.xlsx` - Discount codes and usage
- 🏃 `minimarathons.xlsx` - PEC student marathon registrations
- 🏃 `nonpecminimarathons.xlsx` - Non-PEC marathon registrations
- 📋 `registrationforms.xlsx` - Form submissions with metadata
- 🔐 `otps.xlsx` - OTP verification records

### Event Registrations Folder: `output/events/`
Individual Excel files for each event's registrations:
- `EVT001_EventName_registrations.xlsx`
- `EVT002_AnotherEvent_registrations.xlsx`
- ... (one file per event)

## Common Use Cases

### 1. Get All Registered Users
Open: `output/users.xlsx`
- Contains: Email, Name, College, Phone, Branch, Student ID

### 2. See All Events
Open: `output/events.xlsx`
- Contains: Event details, dates, location, fees, team info

### 3. View Registrations for Specific Event
Go to: `output/events/`
- Find the event by name or ID
- Opens with all participant details

### 4. Check Payment Verifications
Open: `output/registrations.xlsx`
- Filter by `verified` column
- Check `feesPaid` for payment receipt URLs
- See `totalFees` and `discount` applied

### 5. View Admin Access
Open: `output/adminusers.xlsx`
- See all admins and their access levels
- Filter by `clubsoc` to see club/society admins

## Tips

✅ **First Time Setup**: The batch file will automatically install dependencies

✅ **Re-running**: Safe to run multiple times - will overwrite old exports

✅ **Large Data**: The script handles thousands of records efficiently

✅ **Filtering in Excel**: Use Excel's filter feature on header rows

✅ **Sorting**: All data is ready for sorting by any column

## Troubleshooting One-Liners

**Problem**: Script won't start
**Solution**: Right-click `run_db_export.bat` → Run as Administrator

**Problem**: "Python not found"
**Solution**: Install Python from https://www.python.org/downloads/

**Problem**: Connection timeout
**Solution**: Check your internet connection and MongoDB URI

**Problem**: Empty exports
**Solution**: Verify you're using the correct database connection string

## Output Example

```
====================================================================
MongoDB to Excel Exporter - Pecfest 2025
====================================================================
Connecting to MongoDB...
✓ Connected to MongoDB: test

Exporting all collections...
  ✓ Exported 150 documents to users.xlsx
  ✓ Exported 45 documents to events.xlsx
  ✓ Exported 500 documents to registrations.xlsx
  ...

✓ Successfully exported 9 collections with 1,234 total documents

Exporting event registrations...
  Found 45 events
  ✓ Exported 25 registrations for: Code Wars
  ✓ Exported 30 registrations for: Dance Competition
  ...

✓ Exported registrations for 45 events

✓ Export completed successfully!
✓ All files saved in: C:\...\output
====================================================================
```

## Need Help?

1. Check `DB_EXPORT_README.md` for detailed documentation
2. Review console output for specific error messages
3. Verify MongoDB connection string in `.env` file

---

**Ready to export?** Just run `run_db_export.bat` and you're done! 🎉
