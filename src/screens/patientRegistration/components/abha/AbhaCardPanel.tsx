import { ABDM_ENDPOINTS } from "@/config/abdmEndpoints";
import useAbdmCoreApi from "@/hooks/useAbdmCoreApi";
import { useEffect, useState } from "react";
import { AbdmCallResult } from "./abhaTypes";

type Props = {
  /** X-Token from a successful OTP verify. Panel renders nothing until this is set. */
  token: string | null;
  /** Use the ABHA-address/number profile-card endpoint instead of the regular one. */
  byAbhaId?: boolean;
};

// Same sniffing legacy used: PNG/JPEG magic-byte prefixes in the base64 stream, else PDF.
const isImageBase64 = (b64: string) => b64.startsWith("iVBORw0KGgo") || b64.startsWith("/9j/");
const mimeFor = (b64: string) =>
  b64.startsWith("/9j/") ? "image/jpeg" : b64.startsWith("iVBORw0KGgo") ? "image/png" : "application/pdf";
const extFor = (mime: string) => (mime === "image/png" ? "png" : mime === "image/jpeg" ? "jpg" : "pdf");

const base64ToBlob = (b64: string, mime: string): Blob => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

/**
 * ABHA card preview/download/print -- the right-side panel from the legacy
 * _ABHACreationVerificationView.cshtml (abha-card-col / verifyCardPanel / createCardPanel),
 * backed by ABDMCore's GET /abha/profile/card (or /by-abha-id/card). That endpoint returns
 * base64-encoded PDF/image bytes (ABDM's real abha-card API is raw binary, not JSON -- see the
 * AbhaProfileService.GetCardAsync backend fix), so this fetches once a token is available and
 * renders an <img> or <embed> depending on what came back.
 */
const AbhaCardPanel = ({ token, byAbhaId }: Props) => {
  const { fetchAbdm } = useAbdmCoreApi();
  const [base64, setBase64] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) {
      setBase64(null);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setFetching(true);
    setFailed(false);
    setBase64(null);

    const endpoint = byAbhaId ? ABDM_ENDPOINTS.PROFILE_CARD_BY_ABHA_ID : ABDM_ENDPOINTS.PROFILE_CARD;

    fetchAbdm<AbdmCallResult<string>>("GET", endpoint, {}, { headers: { "X-Token": token } }).then(resp => {
      if (cancelled) return;
      setFetching(false);
      if (resp.result && resp.data) {
        setBase64(resp.data.replace(/\s/g, ""));
      } else {
        setFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, byAbhaId]);

  const handleDownload = () => {
    if (!base64) return;
    const mime = mimeFor(base64);
    const url = URL.createObjectURL(base64ToBlob(base64, mime));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ABHA_Card.${extFor(mime)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!base64) return;
    const mime = mimeFor(base64);
    const url = URL.createObjectURL(base64ToBlob(base64, mime));
    const printWindow = window.open("", "_blank", "width=720,height=600");
    if (!printWindow) return;

    const bodyHtml = mime.startsWith("image/")
      ? `<img src="${url}" style="max-width:100%;height:auto;" />`
      : `<embed src="${url}" type="application/pdf" style="width:100%;height:90vh;" />`;

    printWindow.document.write(
      `<html><head><title>ABHA Card</title></head><body style="margin:20px;text-align:center;font-family:Arial,sans-serif;">` +
        `<h3 style="color:#003366;margin-bottom:16px;">ABHA Card</h3>${bodyHtml}</body></html>`
    );
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 600);
  };

  if (!token) return null;

  return (
    <div className="w-full shrink-0 overflow-hidden rounded-xl border-2 border-[#00c0ef] bg-[#f5faff] shadow-lg lg:w-[300px]">
      <div className="bg-gradient-to-r from-[#003366] to-[#0055a5] px-4 py-3 text-sm font-bold text-white">
        ABHA Card Preview
      </div>
      <div className="flex min-h-[280px] items-center justify-center bg-white p-3">
        {fetching && <p className="text-center text-xs text-gray-400">Fetching your ABHA card...</p>}
        {!fetching && failed && <p className="p-4 text-center text-xs text-red-600">Could not load card.</p>}
        {!fetching && base64 && isImageBase64(base64) && (
          <img src={`data:${mimeFor(base64)};base64,${base64}`} alt="ABHA Card" className="w-full rounded-lg shadow" />
        )}
        {!fetching && base64 && !isImageBase64(base64) && (
          <embed src={`data:application/pdf;base64,${base64}`} type="application/pdf" className="h-[400px] w-full rounded-lg" />
        )}
      </div>
      {base64 && (
        <div className="flex gap-2 border-t border-[#bde3f5] bg-[#e8f5fd] p-3">
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#003366] py-2 text-xs font-bold text-white"
            onClick={handleDownload}
          >
            Download
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#e67e22] py-2 text-xs font-bold text-white"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      )}
    </div>
  );
};

export default AbhaCardPanel;
