export const openReceiptInNewTab = (data: any, existingWindow: Window | null = null) => {
  const newWindow = existingWindow || window.open("", "_blank");
  if (!newWindow) {
    alert("Popup blocked! Please allow popups for this site to view the receipt.");
    return;
  }

  // Keep receipt on a single printable page.
  const serviceCount = Array.isArray(data) ? data.length : 0;
  const isA4 = serviceCount >= 0;

  newWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <base href="${window.location.origin}" />

        <style>
          @page {
            size: ${isA4 ? "A4" : "A5"};
            margin: 6mm;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          #root {
            display: block;
            width: 100%;
            padding: 0;
          }

          /* Print-only fitting overrides for OPD details bill */
          #root #receipt-print-wrapper {
            width: 100% !important;
            page-break-inside: avoid;
            break-inside: avoid-page;
          }

          #root #receipt-print-wrapper > div {
            padding: 0 !important;
            background: #fff !important;
          }

          #root #receipt-print-wrapper > div > div {
            width: 100% !important;
            max-width: 100% !important;
            padding: 10px !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          #root #receipt-print-wrapper table {
            margin-bottom: 6px !important;
          }

          #root #receipt-print-wrapper tr,
          #root #receipt-print-wrapper td,
          #root #receipt-print-wrapper th {
            page-break-inside: avoid !important;
          }

          @media print {
            #root #receipt-print-wrapper {
              zoom: 0.92;
            }
          }
        </style>
      </head>

      <body>
        <div id="root"></div>
      </body>
    </html>
  `);

  newWindow.document.close();

  let attempts = 0;

  const tryRender = () => {
    const content = document.getElementById("receipt-print-wrapper");

    if (!content) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Receipt not found</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    if (!content.innerHTML || content.innerHTML.trim() === "") {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Receipt empty</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    newWindow.document.getElementById("root")!.innerHTML = content.innerHTML;

    const images = newWindow.document.images;
    if (images.length === 0) {
      newWindow.focus();
      return;
    }

    let loaded = 0;
    for (let i = 0; i < images.length; i++) {
      images[i].onload = images[i].onerror = () => {
        loaded++;
        if (loaded === images.length) {
          newWindow.focus();
        }
      };
    }
  };

  tryRender();
};
export const openOpdPrintInNewTab = (existingWindow: Window | null = null) => {
  const newWindow = existingWindow || window.open("", "_blank");
  if (!newWindow) {
    alert("Popup blocked! Please allow popups for this site to view the print preview.");
    return;
  }

  newWindow.document.write(`
    <html>
      <head>
        <title>OPD Print</title>
        <base href="${window.location.origin}" />
        <style>
          @page {
            size: A4;
            margin: 8mm;
          }

          body {
            margin: 0;
            background: #fff;
          }

          #root {
            width: 100%;
          }

          #print-opd-bill {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `);

  newWindow.document.close();

  let attempts = 0;
  const tryRender = () => {
    const opdCard = document.getElementById("opd-card-print-wrapper");
    const receipt = document.getElementById("receipt-print-wrapper");

    if (!opdCard || !receipt) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Print content not found</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    if (!opdCard.innerHTML?.trim() || !receipt.innerHTML?.trim()) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Print content is empty</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    newWindow.document.getElementById("root")!.innerHTML = `
      <div id="print-opd-bill">${receipt.innerHTML}</div>
      <div id="print-opd-card">${opdCard.innerHTML}</div>
    `;

    const images = newWindow.document.images;
    if (images.length === 0) {
      newWindow.focus();
      return;
    }

    let loaded = 0;
    for (let i = 0; i < images.length; i++) {
      images[i].onload = images[i].onerror = () => {
        loaded++;
        if (loaded === images.length) {
          newWindow.focus();
        }
      };
    }
  };

  tryRender();
};

export const openOpdCardInNewTab = (existingWindow: Window | null = null) => {
  const newWindow = existingWindow || window.open("", "_blank");
  if (!newWindow) {
    alert("Popup blocked! Please allow popups for this site to view the OPD card.");
    return;
  }

  newWindow.document.write(`
    <html>
      <head>
        <title>OPD Card</title>
        <base href="${window.location.origin}" />

        <style>
          @page {
            size: A4;
            margin: 8mm;
          }

          body {
            margin: 0;
            background: #fff;
          }

          #root {
            width: 100%;
          }
        </style>
      </head>

      <body>
        <div id="root"></div>
      </body>
    </html>
  `);

  newWindow.document.close();

  let attempts = 0;
  const tryRender = () => {
    const content = document.getElementById("opd-card-print-wrapper");

    if (!content) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: OPD Card not found</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    if (!content.innerHTML || content.innerHTML.trim() === "") {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: OPD Card empty</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    newWindow.document.getElementById("root")!.innerHTML = content.innerHTML;

    const images = newWindow.document.images;
    if (images.length === 0) {
      newWindow.focus();
      return;
    }

    let loaded = 0;
    for (let i = 0; i < images.length; i++) {
      images[i].onload = images[i].onerror = () => {
        loaded++;
        if (loaded === images.length) {
          newWindow.focus();
        }
      };
    }
  };

  tryRender();
};


