# MongoDB to Excel Exporter - Pecfest 2025

This script downloads all data from the MongoDB database and exports it to Excel files.

## Features

- ✅ Exports all collections to individual Excel files
- ✅ Creates separate Excel files for each event's registrations
- ✅ Handles nested data structures and special MongoDB types
- ✅ Automatically styles Excel files with headers and proper formatting
- ✅ Auto-adjusts column widths for better readability
- ✅ Creates a summary report of all collections
- ✅ Handles binary data (like poster images) gracefully

## Collections Exported

The script exports the following collections:

1. **users** - All registered users
2. **events** - All events (technical, cultural, convenor)
3. **registrations** - All event registrations
4. **adminusers** - Admin users with access levels
5. **discounts** - Discount codes and usage
6. **minimarathons** - PEC student mini marathon registrations
7. **nonpecminimarathons** - Non-PEC student mini marathon registrations
8. **registrationforms** - Registration forms with poster submissions
9. **otps** - OTP verification records

## Installation

### Step 1: Install Python
Make sure you have Python 3.7 or higher installed. Check with:
```bash
python --version
```

### Step 2: Install Dependencies
Install required Python packages:
```bash
pip install -r requirements_db_export.txt
```

Or install manually:
```bash
pip install pymongo openpyxl dnspython
```

## Usage

### Basic Usage
Simply run the script:
```bash
python download_db_to_excel.py
```

### Output Structure
The script creates the following directory structure:

```
output/
├── 00_SUMMARY_REPORT.xlsx          # Summary of all collections
├── users.xlsx                       # All users
├── events.xlsx                      # All events
├── registrations.xlsx              # All registrations
├── adminusers.xlsx                 # Admin users
├── discounts.xlsx                  # Discount codes
├── minimarathons.xlsx              # Mini marathon (PEC)
├── nonpecminimarathons.xlsx        # Mini marathon (Non-PEC)
├── registrationforms.xlsx          # Registration forms
├── otps.xlsx                       # OTP records
└── events/                         # Folder with per-event registrations
    ├── EVT001_Event_Name_registrations.xlsx
    ├── EVT002_Another_Event_registrations.xlsx
    └── ...
```

### Customization

To change the MongoDB connection string, edit the `MONGODB_URI` variable in the script:

```python
MONGODB_URI = "your-mongodb-connection-string-here"
```

Or set it as an environment variable:
```bash
set MONGODB_URI=your-mongodb-connection-string-here
python download_db_to_excel.py
```

## Features Explained

### 1. Flattened Data Structure
Nested JSON objects are flattened with underscore separation:
- `mapCoordinates.latitude` → `mapCoordinates_latitude`
- `mapCoordinates.longitude` → `mapCoordinates_longitude`

### 2. Data Type Handling
- **ObjectId**: Converted to string
- **DateTime**: Formatted as `YYYY-MM-DD HH:MM:SS`
- **Arrays**: Joined with commas (or JSON for complex arrays)
- **Binary Data**: Shown as `<Binary data: X bytes>`
- **Null/None**: Shown as empty string

### 3. Excel Styling
- Blue header row with white bold text
- Auto-adjusted column widths (max 50 characters)
- Centered header alignment
- Professional appearance

### 4. Event Registrations
Each event gets its own Excel file with all registrations, including:
- User information
- Team details
- Payment verification status
- Accommodation requirements
- Discount applied
- Total fees

## Troubleshooting

### Connection Issues
If you see "Failed to connect to MongoDB":
1. Check your internet connection
2. Verify the MongoDB URI is correct
3. Ensure your IP is whitelisted in MongoDB Atlas

### Missing Dependencies
If you see import errors:
```bash
pip install --upgrade pymongo openpyxl dnspython
```

### Permission Errors
Run the script from a directory where you have write permissions.

### Empty Collections
If a collection is empty, the script will skip it and show a warning:
```
⚠ Collection 'collection_name' is empty, skipping...
```

## Notes

- The script handles large datasets efficiently
- Binary data (images) is not exported to Excel but noted
- All timestamps are converted to readable format
- The script is safe to run multiple times (overwrites previous exports)
- MongoDB connection is properly closed after export

## Security Note

⚠️ **Important**: The exported Excel files contain sensitive data including:
- User emails and personal information
- Payment verification details
- Admin credentials
- Contact information

Keep these files secure and do not share them publicly!

## Support

For issues or questions:
1. Check the console output for specific error messages
2. Verify MongoDB connection string
3. Ensure all dependencies are installed
4. Check Python version compatibility

---

**Export Date Format**: All exports include a timestamp in the summary report.

**Last Updated**: November 2025
