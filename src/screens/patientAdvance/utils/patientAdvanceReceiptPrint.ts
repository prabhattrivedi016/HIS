export const openPatientAdvanceReceiptInNewTab = (existingWindow: Window | null = null) => {
  const newWindow = existingWindow || window.open("", "_blank");
  if (!newWindow) {
    alert("Popup blocked! Please allow popups for this site to view the receipt.");
    return null;
  }

  newWindow.document.write(`
    <html>
      <head>
        <title>Patient Advance Receipt</title>
        <base href="${window.location.origin}" />
        <style>
          @page {
            size: A4;
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

          #root #patient-advance-receipt-print-wrapper {
            width: 100% !important;
            page-break-inside: avoid;
            break-inside: avoid-page;
          }

          #root #patient-advance-receipt-print-wrapper > div {
            padding: 0 !important;
            background: #fff !important;
          }

          #root #patient-advance-receipt-print-wrapper > div > div {
            width: 100% !important;
            max-width: 100% !important;
            padding: 10px !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          #root #patient-advance-receipt-print-wrapper table {
            margin-bottom: 6px !important;
          }

          #root #patient-advance-receipt-print-wrapper tr,
          #root #patient-advance-receipt-print-wrapper td,
          #root #patient-advance-receipt-print-wrapper th {
            page-break-inside: avoid !important;
          }

          @media print {
            #root #patient-advance-receipt-print-wrapper {
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
    const content = document.getElementById("patient-advance-receipt-print-wrapper");

    if (!content) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Patient Advance receipt not found</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    if (!content.innerHTML || content.innerHTML.trim() === "") {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Patient Advance receipt empty</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    const branchAddressNode = content.querySelector("#receipt-branch-address");
    const branchNameNode = content.querySelector("#receipt-branch-name");
    const branchAddressText = branchAddressNode?.textContent?.trim() || "";
    const branchNameText = branchNameNode?.textContent?.trim() || "";

    const hasResolvedBranchFooter =
      branchAddressText.length > 0 &&
      branchNameText.length > 0 &&
      !branchAddressText.toLowerCase().includes("undefined") &&
      !branchNameText.toLowerCase().includes("undefined") &&
      branchAddressText !== "Subject to  Jurisdiction" &&
      branchNameText !== "For";

    if (!hasResolvedBranchFooter) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Branch details not ready for receipt</h3>";
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
  return newWindow;
};
