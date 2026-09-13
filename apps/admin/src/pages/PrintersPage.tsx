import React, { useState } from 'react';
import { Printer, CheckCircle2, RefreshCw } from 'lucide-react';

export const PrintersPage: React.FC = () => {
  const [printerType, setPrinterType] = useState('BROWSER_PRINT');
  const [paperWidth, setPaperWidth] = useState('80mm');
  const [autoPrintOnCashConfirm, setAutoPrintOnCashConfirm] = useState(true);
  const [headerText, setHeaderText] = useState('Sri Lakshmi Tea & Snacks');
  const [footerText, setFooterText] = useState('Thank you for ordering with QueueLess!');
  const [testPrinting, setTestPrinting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleTestPrint = () => {
    setTestPrinting(true);
    setTestSuccess(false);

    setTimeout(() => {
      setTestPrinting(false);
      setTestSuccess(true);
      window.print();
    }, 600);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Receipt & Printer Configuration</h1>
          <p className="page-desc">Configure thermal receipt printers, paper sizing, and automatic KOT/bill generation</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={20} color="#d97706" /> Printer Hardware & Interface
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Printing Method
              </label>
              <select
                className="input-field"
                style={{ width: '100%' }}
                value={printerType}
                onChange={(e) => setPrinterType(e.target.value)}
              >
                <option value="BROWSER_PRINT">Browser Standard & PDF Export</option>
                <option value="ESC_POS_NETWORK">Network Thermal Printer (ESC/POS over TCP/IP)</option>
                <option value="ESC_POS_USB">Direct USB Thermal Printer</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Receipt Paper Width
              </label>
              <select
                className="input-field"
                style={{ width: '100%' }}
                value={paperWidth}
                onChange={(e) => setPaperWidth(e.target.value)}
              >
                <option value="80mm">80mm (Standard POS Thermal Roll — 48/42 columns)</option>
                <option value="58mm">58mm (Compact Mobile Printer — 32 columns)</option>
                <option value="A4">A4 / Letter (Full Page Receipt)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="autoPrint"
                checked={autoPrintOnCashConfirm}
                onChange={(e) => setAutoPrintOnCashConfirm(e.target.checked)}
              />
              <label htmlFor="autoPrint" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Auto-generate bill upon order confirmation
              </label>
            </div>

            <div style={{ paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button
                className="btn btn-primary"
                onClick={handleTestPrint}
                disabled={testPrinting}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {testPrinting ? (
                  <>
                    <RefreshCw size={16} className="spin" /> Sending Test Print...
                  </>
                ) : (
                  <>
                    <Printer size={16} /> Send Test Print Page
                  </>
                )}
              </button>

              {testSuccess && (
                <div style={{ marginTop: 12, color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Test receipt rendered successfully.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Bill Receipt Customization</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Header Outlet Title
              </label>
              <input
                type="text"
                className="input-field"
                style={{ width: '100%' }}
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Footer Message
              </label>
              <input
                type="text"
                className="input-field"
                style={{ width: '100%' }}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>PREVIEW FORMAT:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#ffffff', padding: 12, border: '1px dashed #cbd5e1', borderRadius: 4 }}>
                <center><strong>{headerText}</strong><br />Token: #A101<br />--------------------------------</center>
                <div>2x Regular Tea &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₹30.00</div>
                <div>2x Crispy Samosa &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₹30.00</div>
                <div>--------------------------------</div>
                <div style={{ fontWeight: 'bold' }}>TOTAL: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₹60.00</div>
                <div>Status: PAID (ONLINE)</div>
                <center>--------------------------------<br />{footerText}<br />Powered by QueueLess</center>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
