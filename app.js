/**
 * JAI MATA DI ENTERPRISES - COURIER RECEIPT GENERATOR
 * Reactive Controller & Print / PDF Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Form Inputs
  const trackingNoInput = document.getElementById('trackingNo');
  const billDateInput = document.getElementById('billDate');
  const originInput = document.getElementById('origin');
  const destinationInput = document.getElementById('destination');

  const senderNameInput = document.getElementById('senderName');
  const senderPhoneInput = document.getElementById('senderPhone');
  const senderAddressInput = document.getElementById('senderAddress');
  const senderPincodeInput = document.getElementById('senderPincode');

  const receiverNameInput = document.getElementById('receiverName');
  const receiverPhoneInput = document.getElementById('receiverPhone');
  const receiverAddressInput = document.getElementById('receiverAddress');
  const receiverPincodeInput = document.getElementById('receiverPincode');

  const parcelQuantityInput = document.getElementById('parcelQuantity');
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const itemsContainer = document.getElementById('itemsContainer');

  const courierChargeInput = document.getElementById('courierCharge');
  const packingChargeInput = document.getElementById('packingCharge');
  const discountInput = document.getElementById('discount');

  const formulaText = document.getElementById('formulaText');
  const displayCalculatedTotal = document.getElementById('displayCalculatedTotal');
  const validationAlert = document.getElementById('validationAlert');
  const validationMessage = document.getElementById('validationMessage');

  // Preview Elements
  const previewTrackingNo = document.getElementById('previewTrackingNo');
  const previewDate = document.getElementById('previewDate');
  const previewOrigin = document.getElementById('previewOrigin');
  const previewDestination = document.getElementById('previewDestination');

  const previewSenderName = document.getElementById('previewSenderName');
  const previewSenderPhone = document.getElementById('previewSenderPhone');
  const previewSenderAddress = document.getElementById('previewSenderAddress');
  const previewSenderPincode = document.getElementById('previewSenderPincode');

  const previewReceiverName = document.getElementById('previewReceiverName');
  const previewReceiverPhone = document.getElementById('previewReceiverPhone');
  const previewReceiverAddress = document.getElementById('previewReceiverAddress');
  const previewReceiverPincode = document.getElementById('previewReceiverPincode');

  const previewItemsTableBody = document.getElementById('previewItemsTableBody');
  const previewCourierCharge = document.getElementById('previewCourierCharge');
  const previewPackingCharge = document.getElementById('previewPackingCharge');
  const previewDiscount = document.getElementById('previewDiscount');
  const previewDiscountRow = document.getElementById('previewDiscountRow');
  const previewTotalAmount = document.getElementById('previewTotalAmount');
  const receiptLogoImg = document.getElementById('receiptLogoImg');
  const receiptSignatureImg = document.getElementById('receiptSignatureImg');

  // Set embedded high-res base64 logo if available
  if (receiptLogoImg && typeof JETLINE_LOGO_BASE64 !== 'undefined' && JETLINE_LOGO_BASE64) {
    receiptLogoImg.src = JETLINE_LOGO_BASE64;
  }

  // Set embedded high-res base64 signature if available
  if (receiptSignatureImg && typeof SIGNATURE_BASE64 !== 'undefined' && SIGNATURE_BASE64) {
    receiptSignatureImg.src = SIGNATURE_BASE64;
  }

  // Buttons
  const btnGenerateTop = document.getElementById('btnGenerateTop');
  const btnGenerateBottom = document.getElementById('btnGenerateBottom');
  const btnPrintTop = document.getElementById('btnPrintTop');
  const btnPrintBottom = document.getElementById('btnPrintBottom');
  const btnResetTop = document.getElementById('btnResetTop');
  const btnResetBottom = document.getElementById('btnResetBottom');
  const btnFillSample = document.getElementById('btnFillSample');

  // State: items array
  let items = [
    {
      description: '',
      actualWeight: '',
      length: '',
      width: '',
      height: '',
      volumetricWeight: ''
    }
  ];

  /**
   * Format Date to "DD-MMM-YYYY" (e.g. 29-Sep-2026) matching the reference receipt
   */
  function formatDateForPreview(dateString) {
    if (!dateString) return '';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDay = day < 10 ? `0${day}` : `${day}`;
        return `${formattedDay}-${monthNames[monthIndex]}-${year}`;
      }
    } catch (e) {
      console.warn('Date formatting fallback:', e);
    }
    return dateString;
  }

  /**
   * Calculate Volumetric Weight according to exact specification:
   * Volumetric Weight (kg) = (Length × Width × Height) / 5000
   * Length, Width, Height in cm.
   * STRICT RULE: Do NOT round. Display calculated volumetric value.
   */
  function calculateVolumetricWeight(l, w, h) {
    const length = parseFloat(l);
    const width = parseFloat(w);
    const height = parseFloat(h);

    if (isNaN(length) || isNaN(width) || isNaN(height) || length <= 0 || width <= 0 || height <= 0) {
      return '';
    }

    const vol = (length * width * height) / 5000;
    // Format without artificial rounding; up to 3 decimal places without trailing unnecessary zeroes if clean
    const formatted = parseFloat(vol.toFixed(4)).toString();
    return formatted;
  }

  /**
   * Render dynamic item form blocks based on current items state
   */
  function renderItemFormBlocks() {
    itemsContainer.innerHTML = '';

    items.forEach((item, index) => {
      const itemNum = index + 1;
      const card = document.createElement('div');
      card.className = 'item-card';
      card.dataset.index = index;

      const volWeightDisplay = item.volumetricWeight ? `${item.volumetricWeight} Kg` : 'Auto-calculated';

      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-badge">ITEM ${itemNum}</span>
          <span class="vol-wt-indicator" id="volIndicator_${index}">Vol. Wt: ${volWeightDisplay}</span>
        </div>
        <div class="form-grid grid-2">
          <div class="form-group full-width">
            <label for="itemDesc_${index}">Item Description <span class="required">*</span></label>
            <input type="text" id="itemDesc_${index}" class="input-item-desc" placeholder="e.g. Food Items, Documents, Clothes" value="${escapeHtml(item.description)}" required>
          </div>
          <div class="form-group">
            <label for="actualWt_${index}">Actual Weight (kg) <span class="required">*</span></label>
            <input type="number" id="actualWt_${index}" class="input-actual-wt" min="0.01" step="any" placeholder="e.g. 8.28" value="${escapeHtml(item.actualWeight)}" required>
          </div>
          <div class="form-group">
            <label>Dimensions (cm) (L &times; W &times; H) <span class="required">*</span></label>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
              <input type="number" id="dimL_${index}" class="input-dim-l" min="0.1" step="any" placeholder="L (cm)" value="${escapeHtml(item.length)}" required title="Length in cm">
              <input type="number" id="dimW_${index}" class="input-dim-w" min="0.1" step="any" placeholder="W (cm)" value="${escapeHtml(item.width)}" required title="Width in cm">
              <input type="number" id="dimH_${index}" class="input-dim-h" min="0.1" step="any" placeholder="H (cm)" value="${escapeHtml(item.height)}" required title="Height in cm">
            </div>
          </div>
        </div>
      `;

      itemsContainer.appendChild(card);

      // Attach event listeners for this item's inputs
      const descInput = card.querySelector('.input-item-desc');
      const actualInput = card.querySelector('.input-actual-wt');
      const lInput = card.querySelector('.input-dim-l');
      const wInput = card.querySelector('.input-dim-w');
      const hInput = card.querySelector('.input-dim-h');

      const updateThisItem = () => {
        item.description = descInput.value;
        item.actualWeight = actualInput.value;
        item.length = lInput.value;
        item.width = wInput.value;
        item.height = hInput.value;

        // Calculate volumetric weight
        const vol = calculateVolumetricWeight(item.length, item.width, item.height);
        item.volumetricWeight = vol;

        const volIndicator = document.getElementById(`volIndicator_${index}`);
        if (volIndicator) {
          volIndicator.textContent = vol ? `Vol. Wt: ${vol} Kg` : 'Vol. Wt: Auto-calculated';
        }

        updatePreview();
      };

      descInput.addEventListener('input', updateThisItem);
      actualInput.addEventListener('input', updateThisItem);
      lInput.addEventListener('input', updateThisItem);
      wInput.addEventListener('input', updateThisItem);
      hInput.addEventListener('input', updateThisItem);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Synchronize Quantity Input with items array
   */
  function setQuantity(newQty) {
    const qty = Math.max(1, Math.min(10, parseInt(newQty, 10) || 1));
    parcelQuantityInput.value = qty;

    const currentLen = items.length;
    if (qty > currentLen) {
      // Add items
      for (let i = currentLen; i < qty; i++) {
        items.push({
          description: '',
          actualWeight: '',
          length: '',
          width: '',
          height: '',
          volumetricWeight: ''
        });
      }
    } else if (qty < currentLen) {
      // Remove excess items
      items = items.slice(0, qty);
    }

    renderItemFormBlocks();
    updatePreview();
  }

  // Quantity controls
  parcelQuantityInput.addEventListener('change', () => {
    setQuantity(parcelQuantityInput.value);
  });

  btnQtyMinus.addEventListener('click', () => {
    setQuantity(parseInt(parcelQuantityInput.value, 10) - 1);
  });

  btnQtyPlus.addEventListener('click', () => {
    setQuantity(parseInt(parcelQuantityInput.value, 10) + 1);
  });

  /**
   * Calculate Total Amount = (Courier Charge + Packing Charge) - Discount Amount (from %)
   */
  function calculateTotal() {
    const courierVal = courierChargeInput.value.trim();
    const packingVal = packingChargeInput.value.trim();
    const discountVal = discountInput.value.trim(); // percentage entered by user

    // If courier charge is not entered yet, total is empty/0
    const courier = parseFloat(courierVal) || 0;
    const packing = parseFloat(packingVal) || 0;
    const discountPercent = parseFloat(discountVal) || 0;

    const subtotal = courier + packing;
    // Calculate monetary discount price from percentage
    const discountPrice = (subtotal * discountPercent) / 100;

    let total = subtotal - discountPrice;
    if (total < 0) total = 0;

    displayCalculatedTotal.textContent = `₹${total.toFixed(2)}`;

    // Update form hint showing the price equivalent of the percentage discount
    const discountPriceEquivalent = document.getElementById('discountPriceEquivalent');
    if (discountPriceEquivalent) {
      if (discountPercent > 0 && subtotal > 0) {
        discountPriceEquivalent.textContent = `₹${discountPrice.toFixed(2)} off`;
      } else {
        discountPriceEquivalent.textContent = '₹0.00 off';
      }
    }

    return {
      courierVal,
      packingVal,
      discountVal,
      courier,
      packing,
      discountPercent,
      discountPrice,
      total
    };
  }

  /**
   * Update Live Preview DOM
   */
  function updatePreview() {
    // 1. Bill Information
    previewTrackingNo.textContent = trackingNoInput.value.trim();
    previewDate.textContent = formatDateForPreview(billDateInput.value.trim());
    previewOrigin.textContent = originInput.value.trim();
    previewDestination.textContent = destinationInput.value.trim();

    // 2. Sender Details
    previewSenderName.textContent = senderNameInput.value.trim();
    previewSenderPhone.textContent = senderPhoneInput.value.trim();
    previewSenderAddress.textContent = senderAddressInput.value.trim();
    previewSenderPincode.textContent = senderPincodeInput.value.trim();

    // 3. Receiver Details
    previewReceiverName.textContent = receiverNameInput.value.trim();
    previewReceiverPhone.textContent = receiverPhoneInput.value.trim();
    previewReceiverAddress.textContent = receiverAddressInput.value.trim();
    previewReceiverPincode.textContent = receiverPincodeInput.value.trim();

    // 4. Items Table
    previewItemsTableBody.innerHTML = '';
    items.forEach((item, index) => {
      const tr = document.createElement('tr');

      // Actual Weight format
      let actualWtText = '';
      if (item.actualWeight) {
        actualWtText = item.actualWeight.toString().toLowerCase().includes('kg')
          ? item.actualWeight
          : `${item.actualWeight} kg`;
      }

      // Dimensions format: "45cm, 32cm, 23cm"
      let dimText = '';
      if (item.length && item.width && item.height) {
        dimText = `${item.length}cm, ${item.width}cm, ${item.height}cm`;
      }

      // Volumetric Wt format: "6.624 Kg"
      let volText = '';
      if (item.volumetricWeight) {
        volText = `${item.volumetricWeight} Kg`;
      }

      // Quantity: show 1 per row or appropriate index
      const qtyText = '1';

      tr.innerHTML = `
        <td class="col-desc">${escapeHtml(item.description)}</td>
        <td class="col-actual">${escapeHtml(actualWtText)}</td>
        <td class="col-dim">${escapeHtml(dimText)}</td>
        <td class="col-vol">${escapeHtml(volText)}</td>
        <td class="col-qty">${escapeHtml(qtyText)}</td>
      `;
      previewItemsTableBody.appendChild(tr);
    });

    // 5. Charges
    const charges = calculateTotal();

    // Courier charge display
    previewCourierCharge.textContent = charges.courierVal !== '' ? `${charges.courier}` : '';

    // Packing charge display
    previewPackingCharge.textContent = charges.packingVal !== '' ? `${charges.packing}` : '0';

    // Discount display in PDF / preview table:
    // User requested: "here discount provide in percentage and in pdf discount is showing in price as now showing"
    if (charges.discountVal !== '' && charges.discountPercent > 0) {
      previewDiscountRow.style.display = 'table-row';
      const formattedDiscountPrice = Number.isInteger(charges.discountPrice)
        ? charges.discountPrice.toString()
        : charges.discountPrice.toFixed(2);
      previewDiscount.textContent = formattedDiscountPrice;
    } else {
      previewDiscountRow.style.display = 'none';
      previewDiscount.textContent = '0';
    }

    // Total Amount display
    if (charges.courierVal !== '') {
      previewTotalAmount.textContent = `${charges.total.toFixed(2)}`;
      previewTotalAmount.style.display = 'inline-block';
    } else {
      previewTotalAmount.textContent = '';
      previewTotalAmount.style.display = 'none';
    }
  }

  // Add event listeners to all main inputs
  [
    trackingNoInput,
    billDateInput,
    originInput,
    destinationInput,
    senderNameInput,
    senderPhoneInput,
    senderAddressInput,
    senderPincodeInput,
    receiverNameInput,
    receiverPhoneInput,
    receiverAddressInput,
    receiverPincodeInput,
    courierChargeInput,
    packingChargeInput,
    discountInput
  ].forEach(input => {
    input.addEventListener('input', () => {
      hideValidationError();
      updatePreview();
    });
  });

  /**
   * Validate Form Inputs before PDF Generation / Printing
   */
  function validateForm() {
    const errors = [];

    if (!trackingNoInput.value.trim()) errors.push('Tracking No. is required.');
    if (!billDateInput.value.trim()) errors.push('Bill Date is required.');
    if (!originInput.value.trim()) errors.push('Origin is required.');
    if (!destinationInput.value.trim()) errors.push('Destination is required.');

    if (!senderNameInput.value.trim()) errors.push('Sender Name is required.');
    if (!senderPhoneInput.value.trim()) errors.push('Sender Phone is required.');
    if (!senderAddressInput.value.trim()) errors.push('Sender Address is required.');
    if (!senderPincodeInput.value.trim()) errors.push('Sender Pincode is required.');

    if (!receiverNameInput.value.trim()) errors.push('Receiver Name is required.');
    if (!receiverPhoneInput.value.trim()) errors.push('Receiver Phone is required.');
    if (!receiverAddressInput.value.trim()) errors.push('Receiver Address is required.');
    if (!receiverPincodeInput.value.trim()) errors.push('Receiver Pincode is required.');

    items.forEach((item, idx) => {
      const num = idx + 1;
      if (!item.description.trim()) errors.push(`Item ${num}: Description is required.`);
      if (!item.actualWeight || parseFloat(item.actualWeight) <= 0) {
        errors.push(`Item ${num}: Actual Weight must be greater than zero.`);
      }
      if (!item.length || parseFloat(item.length) <= 0) {
        errors.push(`Item ${num}: Length must be greater than zero.`);
      }
      if (!item.width || parseFloat(item.width) <= 0) {
        errors.push(`Item ${num}: Width must be greater than zero.`);
      }
      if (!item.height || parseFloat(item.height) <= 0) {
        errors.push(`Item ${num}: Height must be greater than zero.`);
      }
    });

    if (courierChargeInput.value.trim() === '' || isNaN(parseFloat(courierChargeInput.value)) || parseFloat(courierChargeInput.value) < 0) {
      errors.push('Courier Charge / Rate must be a valid positive amount.');
    }

    if (packingChargeInput.value.trim() !== '' && (isNaN(parseFloat(packingChargeInput.value)) || parseFloat(packingChargeInput.value) < 0)) {
      errors.push('Packing Charge must be a valid number.');
    }

    if (discountInput.value.trim() !== '' && (isNaN(parseFloat(discountInput.value)) || parseFloat(discountInput.value) < 0 || parseFloat(discountInput.value) > 100)) {
      errors.push('Discount must be a valid percentage between 0% and 100%.');
    }

    return errors;
  }

  function showValidationError(messages) {
    validationMessage.innerHTML = messages.map(m => `<div>&bull; ${m}</div>`).join('');
    validationAlert.classList.remove('hidden');
    validationAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideValidationError() {
    validationAlert.classList.add('hidden');
  }

  /**
   * PDF Generation via html2pdf.js
   * Configured for exact A4 proportions and print fidelity
   */
  async function generateA4PDF() {
    const errors = validateForm();
    if (errors.length > 0) {
      showValidationError(errors);
      return;
    }
    hideValidationError();

    const element = document.getElementById('receiptDocument');
    const trackingNo = trackingNoInput.value.trim() || 'Receipt';
    const filename = `Courier_Receipt_${trackingNo}.pdf`;

    // Ensure preview is fully up to date
    updatePreview();

    // Feedback on button
    const originalTextTop = btnGenerateTop.innerHTML;
    const originalTextBottom = btnGenerateBottom.innerHTML;
    btnGenerateTop.innerHTML = '<span>Generating PDF...</span>';
    btnGenerateBottom.innerHTML = '<span>Generating PDF...</span>';
    btnGenerateTop.disabled = true;
    btnGenerateBottom.disabled = true;

    try {
      const opt = {
        margin: [0, 0, 0, 0],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2.2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all'] }
      };

      if (window.html2pdf) {
        // Save current scroll and scroll to top to prevent html2canvas scroll offset bugs
        const savedScrollX = window.scrollX || window.pageXOffset || 0;
        const savedScrollY = window.scrollY || window.pageYOffset || 0;
        window.scrollTo(0, 0);

        // Temporarily clear box shadow during capture
        const prevBoxShadow = element.style.boxShadow;
        element.style.boxShadow = 'none';

        try {
          await window.html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
              const totalPages = pdf.internal.getNumberOfPages();
              if (totalPages > 1) {
                for (let i = totalPages; i > 1; i--) {
                  pdf.deletePage(i);
                }
              }
            })
            .save();
        } finally {
          element.style.boxShadow = prevBoxShadow;
          window.scrollTo(savedScrollX, savedScrollY);
        }
      } else {
        // Fallback: trigger browser print
        window.print();
      }
    } catch (err) {
      console.error('PDF Generation error:', err);
      alert('PDF generation encountered an issue. Falling back to native browser print.');
      window.print();
    } finally {
      btnGenerateTop.innerHTML = originalTextTop;
      btnGenerateBottom.innerHTML = originalTextBottom;
      btnGenerateTop.disabled = false;
      btnGenerateBottom.disabled = false;
    }
  }

  /**
   * Print Receipt
   */
  function handlePrintReceipt() {
    const errors = validateForm();
    if (errors.length > 0) {
      showValidationError(errors);
      return;
    }
    hideValidationError();
    updatePreview();
    window.print();
  }

  /**
   * Reset Form & Receipt Preview back to clean initial state
   */
  function handleReset() {
    if (confirm('Are you sure you want to reset all fields? All entered data will be cleared.')) {
      document.getElementById('receiptForm').reset();
      items = [
        {
          description: '',
          actualWeight: '',
          length: '',
          width: '',
          height: '',
          volumetricWeight: ''
        }
      ];
      parcelQuantityInput.value = '1';
      renderItemFormBlocks();
      hideValidationError();
      updatePreview();
    }
  }

  /**
   * Fill Sample Test Data (from prompt specification for verification)
   */
  function fillSampleTestData() {
    trackingNoInput.value = '14847603';
    billDateInput.value = '2026-09-29';
    originInput.value = 'Tajpur';
    destinationInput.value = 'Test Destination';

    senderNameInput.value = 'Ram Prit Singh';
    senderPhoneInput.value = 'NA';
    senderAddressInput.value = 'C/o Baso Kubauli, Ward - 02, PO- Kubauli Ram, Tajpur, Samastipur';
    senderPincodeInput.value = '848131';

    receiverNameInput.value = 'Ramnath Singh';
    receiverPhoneInput.value = '9472149995';
    receiverAddressInput.value = 'C/o: LifeStyle international Pvt Ltd, Felix Plaza, Sec- 82A, Shikohpur';
    receiverPincodeInput.value = '122012 (Gurgaon)';

    parcelQuantityInput.value = '1';
    items = [
      {
        description: 'Food Items',
        actualWeight: '8.28',
        length: '45',
        width: '32',
        height: '23',
        volumetricWeight: calculateVolumetricWeight('45', '32', '23')
      }
    ];

    courierChargeInput.value = '1000';
    packingChargeInput.value = '0';
    discountInput.value = '0';

    renderItemFormBlocks();
    hideValidationError();
    updatePreview();
  }

  // Button Listeners
  btnGenerateTop.addEventListener('click', generateA4PDF);
  btnGenerateBottom.addEventListener('click', generateA4PDF);

  btnPrintTop.addEventListener('click', handlePrintReceipt);
  btnPrintBottom.addEventListener('click', handlePrintReceipt);

  btnResetTop.addEventListener('click', handleReset);
  btnResetBottom.addEventListener('click', handleReset);

  // Expose clean helper interface on window for programmatic testing and control
  window.courierApp = {
    setQuantity,
    fillSampleTestData,
    calculateTotal,
    calculateVolumetricWeight,
    validateForm,
    generateA4PDF,
    handlePrintReceipt,
    handleReset,
    getItems: () => items,
    setItem: (index, field, value) => {
      if (items[index]) {
        items[index][field] = value;
        if (field === 'length' || field === 'width' || field === 'height') {
          items[index].volumetricWeight = calculateVolumetricWeight(items[index].length, items[index].width, items[index].height);
        }
        renderItemFormBlocks();
        updatePreview();
      }
    }
  };

  // Initialize empty state as specified:
  // "When the website opens: All user-entered fields must be empty.
  // Only fixed company information and fixed Terms & Conditions should already exist."
  renderItemFormBlocks();
  updatePreview();

  // Check if URL has ?sample=1 (convenient for automated testing & verification)
  if (window.location.search.includes('sample=1') || window.location.hash.includes('sample')) {
    fillSampleTestData();
  }
});
