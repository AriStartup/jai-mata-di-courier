# JAI MATA DI ENTERPRISES - Courier Bill / Receipt PDF Generator

A complete, working web application for generating official courier receipts and bills for **JAI MATA DI ENTERPRISES** (Jetline Couriers Pvt. Ltd.).

Built strictly to match the visual layout, typography, proportions, borders, colors, and structure of the company's existing courier receipt.

---

## 🚀 How to Run the Website

### Option 1: Double-Click Launcher (Windows)
Double-click `start.bat` in this folder. It will launch the local server and automatically open your default browser.

### Option 2: Direct Browser Open (Offline-ready)
You can directly double-click or open `index.html` in any browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari). All assets and PDF libraries are bundled locally—no internet connection is required.

### Option 3: Terminal Command
```bash
python server.py
# OR
npm start
```
Then visit: `http://localhost:8080/index.html`

---

## 📋 Features & Implemented Business Rules

1. **Exact Receipt Design Match**:
   - Jetline Couriers logo with crisp border on top-left.
   - Fixed company info:
     - `JAI MATA DI ENTERPRISES`
     - `HOSPITAL CHOWK (NEAR-HINDUSTAN MEDICAL HALL)`
     - `RAJDHANI ROAD, TAJPUR, SAMASTIPUR - 848130`
     - `WhatsApp Only: 8651337137`
     - `Contact No: 9153369890`
   - Solid blue header dividing line.
   - Light blue horizontal pill bar for Tracking No, Date (DD-MMM-YYYY), Origin, Destination.
   - Distinct **SENDER (भेजने वाला)** blue badge box and **RECEIVER (पाने वाला)** green badge box.
   - Professional Item Table with blue header.
   - Fixed Terms & Conditions verbatim from reference.
   - Charges box with Courier Charge, Packing Charge, Discount, and highlighted Total Amount bar with white numeric pill.
   - Right-aligned signature section with ample blank space for handwritten physical signatures and `Authorized Signatory`.

2. **Volumetric Weight Calculation (Rule 1)**:
   - Formula: `(Length × Width × Height) / 5000` (dimensions in cm, output in kg).
   - **Strictly Unrounded**: For 45 × 32 × 23 cm, it outputs exactly `6.624 Kg`. Not rounded to 7, not rounded to 9.
   - Actual Weight and Volumetric Weight are completely separate and independent.

3. **Dynamic Quantity (Rule 5)**:
   - Defaults to 1 item.
   - Changing quantity to 2, 3, or more dynamically creates separate item input sections and corresponding rows in the receipt table.
   - Each item calculates its Volumetric Weight independently.
   - Reducing quantity dynamically removes extra items while preserving earlier inputs.

4. **Total Amount Calculation (Rule 4)**:
   - Formula: `Courier Charge + Packing Charge - Discount`.
   - Real-time updates as user types.

5. **No Database / Zero Permanent Storage (Rule 6)**:
   - No login, no accounts, no background tracking, no database.
   - Operates in-memory for the current receipt only.

6. **Validation & Error Handling**:
   - Validates all required fields before PDF generation or printing.
   - Highlights any missing inputs.

7. **A4 PDF Download & Print**:
   - Generates pixel-perfect A4 PDF via `html2pdf.js`.
   - Dedicated `@media print` rules for browser printing / PDF export.

8. **One-Click Test Data**:
   - Includes a discreet "Fill Test Data" button for testing sample data provided in the specification.
