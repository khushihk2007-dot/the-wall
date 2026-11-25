import React from 'react';
import { Leaf, Printer, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function QRPrintLabel({ record, onClose }) {
  if (!record || !record.qrRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sand-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-elevated border border-sand-300 max-w-md w-full overflow-hidden">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 border-b border-sand-200 bg-sand-50 print:hidden">
          <span className="text-xs font-bold text-sand-800">Printable Product Label Preview</span>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
              Print Label
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-sand-400 hover:text-sand-700 hover:bg-sand-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Label Body (Optimized for standard 4x6" or thermal label printing) */}
        <div id="printable-label-area" className="p-6 bg-white text-sand-900 border-4 border-forest-900 m-4 rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-forest-900 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-forest-900 text-white flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-forest-950 uppercase">
                  The Wall
                </h2>
                <p className="text-[9px] font-mono tracking-wider text-forest-800 uppercase">
                  Biodegradable Growing Bed
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-sand-500 uppercase block">Lot Size</span>
              <span className="font-mono font-bold text-xs">{record.quantity} Beds</span>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="flex flex-col items-center justify-center py-2 text-center">
            <div className="p-2 border-2 border-sand-300 rounded-xl bg-white shadow-sm inline-block">
              <img
                src={record.qrRecord.qrDataUrl}
                alt={`QR code for ${record.batchId}`}
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-[11px] font-bold text-forest-900 mt-3 uppercase tracking-wide">
              Scan to Trace This Product
            </p>
            <p className="text-[9px] text-sand-500 max-w-[240px] mt-0.5 leading-tight">
              Instant mobile verification of fiber composition, lab QA scores & agricultural bed journey.
            </p>
          </div>

          {/* Batch Meta Specs */}
          <div className="mt-4 pt-3 border-t-2 border-forest-900 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <span className="text-sand-500 block">BATCH ID:</span>
              <span className="font-bold text-forest-950">{record.batchId}</span>
            </div>
            <div>
              <span className="text-sand-500 block">TRACE ID:</span>
              <span className="font-bold text-forest-950">{record.traceabilityId}</span>
            </div>
            <div>
              <span className="text-sand-500 block">MFG DATE:</span>
              <span className="text-sand-800">{record.productionDate}</span>
            </div>
            <div>
              <span className="text-sand-500 block">STATUS:</span>
              <span className="font-bold text-forest-900">{record.verificationStatus}</span>
            </div>
          </div>

          {/* Public URL footer */}
          <div className="mt-3 pt-2 border-t border-sand-200 text-center">
            <span className="text-[8px] font-mono text-sand-400 break-all">
              {record.publicUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
