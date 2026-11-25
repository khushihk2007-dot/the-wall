import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  RotateCw,
  FileCode,
} from 'lucide-react';

export function QRCodeModal({
  isOpen,
  onClose,
  record,
  onRegenerateQr,
  onOpenPrintLabel,
}) {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!record || !record.qrRecord) return null;

  const publicUrl = record.publicUrl;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadPng = () => {
    const link = document.createElement('a');
    link.href = record.qrRecord.qrDataUrl;
    link.download = `QR-${record.batchId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSvg = () => {
    if (!record.qrRecord.qrSvg) return;
    const blob = new Blob([record.qrRecord.qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-${record.batchId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateQr(record.batchId);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Product QR Passport: ${record.batchId}`}
      subtitle={`Traceability ID: ${record.traceabilityId} • Generated on ${record.qrRecord.qrGeneratedAt}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <Badge variant="forest" size="md">
            {record.verificationStatus}
          </Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <a
              href={`/trace/${record.traceabilityId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-700 text-white text-xs font-semibold hover:bg-forest-600 transition-colors"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Main QR Display & Quick Metadata */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-sand-50/80 border border-sand-200">
          {/* QR Code Container */}
          <div className="p-3 bg-white border border-sand-300 rounded-2xl shadow-subtle text-center shrink-0">
            <img
              src={record.qrRecord.qrDataUrl}
              alt={`QR for ${record.batchId}`}
              className="w-48 h-48 mx-auto"
            />
            <span className="text-[10px] text-sand-500 font-mono mt-1 block">
              Scannable Camera Target
            </span>
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-3 w-full">
            <div>
              <span className="text-[10px] uppercase font-bold text-sand-400 font-mono">
                Stable Traceability ID
              </span>
              <h3 className="font-mono font-bold text-lg text-forest-900">
                {record.traceabilityId}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-sand-700 pt-2 border-t border-sand-200">
              <div>
                <span className="text-sand-400 block">Manufacturing Lot:</span>
                <span className="font-mono font-semibold text-sand-900">{record.batchId}</span>
              </div>
              <div>
                <span className="text-sand-400 block">Production Date:</span>
                <span className="font-mono">{record.productionDate}</span>
              </div>
              <div>
                <span className="text-sand-400 block">Quantity:</span>
                <span className="font-mono font-semibold">{record.quantity} Beds</span>
              </div>
            </div>

            {/* Public URL Box */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-sand-400 font-mono block mb-1">
                Public Verification Link
              </span>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-sand-300 font-mono text-[11px] text-sand-800 break-all">
                <span className="flex-1 truncate">{publicUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 rounded hover:bg-sand-100 text-sand-500 hover:text-forest-700 shrink-0"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && (
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  Link copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sand-500 block mb-3">
            Digital Passport Actions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownloadPng}
            >
              Download PNG
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={FileCode}
              onClick={handleDownloadSvg}
            >
              Download SVG
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={onOpenPrintLabel}
            >
              Print Label
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={RotateCw}
              loading={isRegenerating}
              onClick={handleRegenerate}
              title="Regenerate QR image while preserving the permanent Traceability ID"
            >
              Regenerate QR
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
