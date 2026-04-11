import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import contractABI from './contractABI.json';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CONTRACT_ADDRESS = "0x1621c22640351d707B4a41815B214C6BFFbFC851";
const PINATA_API_KEY = "cf5e544fb393d2c00a40";
const PINATA_SECRET_KEY = "9fb8aa518f53c9e4b999ef9ab795902a18ed17e30880d4b1c909b1cc54ff3781";
const SEPOLIA_RPC = 'https://ethereum-sepolia.publicnode.com';

// Registrador fijo
const REGISTRADOR_NOMBRE = "Arianny Cristina Batista";
const REGISTRADOR_TITULO = "Registrador de Títulos Adscrito";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/><path d="M2 10h20"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10"/>
    <path d="M8 7h1"/><path d="M12 7h1"/><path d="M16 7h1"/>
    <path d="M8 11h1"/><path d="M12 11h1"/><path d="M16 11h1"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconTransfer = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconPlusCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
  </svg>
);
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconLayers = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconBlockchain = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="19" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="7" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="15" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="17" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="7" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const IconLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconDatabase = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconAlertTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconHash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseProperty = (result) => {
  let metadata = {};
  try { metadata = JSON.parse(result[9]); } catch (e) { metadata = {}; }
  return {
    id:               result[0].toString(),
    matricula:        result[1],
    ownerName:        result[2],
    ownerId:          result[3],
    parcel:           result[4],
    area:             result[5],
    ipfsHash:         result[6],
    timestamp:        new Date(Number(result[7]) * 1000).toLocaleString(),
    isVerified:       result[8],
    nationality:      metadata.nationality      || '',
    district:         metadata.district         || '',
    propertyLocation: metadata.location         || '',
    registrationDate: metadata.registrationDate || '',
    provincia:        metadata.provincia        || '',
    municipio:        metadata.municipio        || '',
    ipfsUrl: result[6] ? `https://gateway.pinata.cloud/ipfs/${result[6]}` : ''
  };
};

const generateQR = async (id) => {
  try {
    return await QRCode.toDataURL(`http://localhost:5173/verify/${id}`, {
      errorCorrectionLevel: 'H', margin: 1, width: 200
    });
  } catch (e) { return ''; }
};

// ─── Generador HTML del Certificado (idéntico al diseño oficial) ──────────────

const generarHTMLCertificado = (datos, qrDataUrl, tipo) => {
  const {
    id, matricula, ownerName, ownerId, nationality, parcel, area,
    district, propertyLocation, registrationDate, provincia, municipio, ipfsHash
  } = datos;

  const verUrl = `http://localhost:5173/verify/${id}`;
  const shortHash = ipfsHash ? `${ipfsHash.slice(0, 20)}...` : 'N/A';
  const shortContract = `${CONTRACT_ADDRESS.slice(0, 20)}...`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado de Título #${id}</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #525659;
      display: flex;
      justify-content: center;
      padding: 20px;
      font-family: "Times New Roman", Times, serif;
    }
    .certificate-container {
      width: 794px;
      height: 1123px;
      background-color: white;
      background-image: url('/fondo_de_tituloa4.png');
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-position: center;
      border: none;
      outline: none;
      padding: 60px;
      box-sizing: border-box;
      position: relative;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }
    .inner-content {
      width: 95%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
    }
    .title-main {
      width: 100%;
      text-align: center;
      color: #0076c2;
      font-weight: bold;
      font-size: 26px;
      letter-spacing: 2px;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      margin-top: 20px;
    }
    .header-logos {
      display: flex;
      gap: 80px;
      align-items: center;
    }
    .logo-img { width: 70px; height: auto; }
    .svg-icon { width: 60px; height: 60px; color: #d32f2f; }
    .registry-text {
      font-weight: bold;
      font-size: 18px;
      margin-top: 10px;
      font-family: "Times New Roman", Times, serif;
    }
    .registration-box { width: 250px; }
    .input-row { display: flex; align-items: center; margin-bottom: 5px; }
    .input-row label {
      font-size: 11px; font-weight: bold; width: 65px;
      font-family: Arial, sans-serif;
    }
    .field-value {
      flex-grow: 1;
      height: 22px;
      border: 1px solid #333;
      background: rgba(255,255,255,0.85);
      padding: 0 5px;
      font-size: 11px;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #000;
    }
    .main-body {
      border: 1px solid #333;
      height: 480px;
      margin-top: 30px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 30px;
      box-sizing: border-box;
      background: rgba(255,255,255,0.4);
    }
    .legal-content {
      text-align: justify;
      font-size: 14px;
      line-height: 1.7;
      color: #000;
    }
    .signature-area { text-align: center; }
    .signature-img-container {
      width: 180px; height: 60px;
      margin: 0 auto;
      display: flex; align-items: center; justify-content: center;
    }
    .signature-png { max-width: 100%; max-height: 100%; object-fit: contain; }
    .registrar-title {
      border-top: 1px solid #000;
      padding-top: 5px;
      width: 250px;
      font-size: 12px;
      text-align: center;
    }
    .seal-left { position: absolute; bottom: 20px; left: 20px; width: 90px; opacity: 0.8; }
    .seal-right { position: absolute; bottom: 100px; right: 30px; width: 100px; opacity: 0.6; }
    .footer-info-box {
      border: 1px solid #333;
      margin-top: 15px;
      padding: 8px 15px;
      background: rgba(255,255,255,0.7);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .blockchain-info { font-size: 10px; line-height: 1.5; font-family: Arial, sans-serif; }
    .qr-box { text-align: center; width: 90px; }
    .qr-box img { width: 65px; height: 65px; }
    .footer-validation {
      margin-top: 16px;
      text-align: center;
      font-size: 9px;
      color: #444;
      font-family: Arial, sans-serif;
    }

    .hash-text {
  font-family: monospace;
  font-size: 9px;
  background: none !important; /* Asegura que no haya fondo */
  color: #333;
  padding: 0;
}
     .demo-text {
            text-align: center;
            font-weight: bold;
            color: #0076c2;
            font-size: 22px;
            margin-top: 20px;
            letter-spacing: 5px;
        }

  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="inner-content">

      <div class="title-main">CERTIFICADO DE TÍTULO</div>

      <div class="header">
        <div style="display:flex;flex-direction:column;">
          <div class="header-logos">
            <img src="/escudo.png" alt="Escudo Nacional" class="logo-img">
            <div class="svg-icon">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="registry-text">REGISTRO DE TÍTULOS</div>
        </div>

        <div class="registration-box">
          <div class="input-row">
            <label>Matrícula</label>
            <div class="field-value">${matricula || `${new Date().getFullYear()}-${String(id).padStart(6, '0')}`}</div>
          </div>
          <div class="input-row">
            <label>Provincia</label>
            <div class="field-value">${provincia || 'SANTO DOMINGO DE GUZMÁN'}</div>
          </div>
          <div class="input-row">
            <label>Municipio</label>
            <div class="field-value">${municipio || 'SANTO DOMINGO, D.N.'}</div>
          </div>
        </div>
      </div>

      <div class="main-body">
        <div class="legal-content">
          En virtud de la Ley y en nombre de la República se declara
          <strong>TITULAR DEL DERECHO DE PROPIEDAD</strong> a
          <strong>${ownerName || 'N/A'}</strong>,
          de nacionalidad <strong>${nationality || 'Dominicana'}</strong>,
          mayor de edad, Cédula de Identidad No. <strong>${ownerId || 'N/A'}</strong>, sobre el inmueble identificado como
          <strong>${parcel || 'N/A'}</strong>,
          que tiene una superficie de
          <strong>${area || '0'} metros cuadrados (${area || '0'} m²)</strong>,
          matrícula <strong>${matricula || `${new Date().getFullYear()}-${String(id).padStart(6, '0')}`}</strong>,
          ubicado en <strong>${propertyLocation || 'Santo Domingo de Guzmán, Distrito Nacional'}</strong>.
          <br/><br/>
          <strong>Distrito Catastral:</strong> ${district || 'N/A'} &nbsp;|&nbsp;
          <strong>Fecha de Registro:</strong> ${registrationDate || new Date().toLocaleDateString('es-DO')}
        </div>

        <div class="signature-area">
          <div class="signature-img-container">
            <img src="/signature.png" alt="Firma" class="signature-png">
          </div>
          <div class="registrar-title">${REGISTRADOR_TITULO}</div>
          <p style="margin:5px 0 0 0;font-size:13px;"><strong>${REGISTRADOR_NOMBRE}</strong></p>
        </div>

        <div class="seal-left"><img src="/sello1.png" style="width:100%;"></div>
        <div class="seal-right"><img src="/sello2.png" style="width:100%;"></div>
      </div>

      <div class="footer-info-box">
        <div class="blockchain-info">
  <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0076c2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
    <strong style="color:#0076c2;">INFORMACIÓN DE BLOCKCHAIN</strong>
  </div>
  <div><strong>ID Blockchain:</strong> #${id}</div>
  <div><strong>Matrícula:</strong> ${matricula || `${new Date().getFullYear()}-${String(id).padStart(6, '0')}`}</div>
  <div><strong>Red:</strong> Sepolia Testnet (Ethereum)</div>
  <div><strong>Contrato:</strong> <span style="font-family:monospace;font-size:9px;">${shortContract}</span></div>
  <div><strong>Tipo:</strong> ${tipo}</div>
  <div><strong>Fecha de Registro:</strong> ${registrationDate || new Date().toLocaleDateString('es-DO')}</div>
</div>

        <div class="qr-box">
          ${qrDataUrl
            ? `<img src="${qrDataUrl}" alt="QR Code">`
            : `<div style="width:65px;height:65px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:8px;">QR</div>`
          }
          <p style="font-size:7px;margin-top:3px;font-weight:bold;">Validar Blockchain</p>
        </div>
      </div>

       <div class="demo-text">DOCUMENTO DEMOSTRATIVO</div>

      <div class="footer-validation">
        <p>Documento validado en Blockchain de Ethereum (Red Sepolia) | Inmutable y verificable públicamente</p>
        <p><strong>${verUrl}</strong></p>
      </div>

    </div>
  </div>
</body>
</html>`;
};

// ─── Convierte HTML → canvas → PDF → File y lo sube a Pinata ─────────────────
const generarCertificadoPDF = async (datos, qrDataUrl, tipo, uploadToIPFS) => {
  console.log("Generando certificado PDF para ID:", datos.id);

  const htmlContent = generarHTMLCertificado(datos, qrDataUrl, tipo);

  const containerId = `cert-${Date.now()}`;
  const container = document.createElement('div');
  container.id = containerId;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  await new Promise(resolve => setTimeout(resolve, 150));

  try {
    const certEl = container.querySelector('.certificate-container');
    if (!certEl) throw new Error("No se encontró .certificate-container");

    const canvas = await html2canvas(certEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], `certificado_titulo_${datos.id}.pdf`, { type: 'application/pdf' });
    console.log("📄 PDF creado, tamaño:", file.size, "bytes");

    const hash = await uploadToIPFS(file);
    console.log("✅ Certificado subido a IPFS:", hash);
    return hash;
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    return null;
  } finally {
    const el = document.getElementById(containerId);
    if (el) document.body.removeChild(el);
  }
};

// ─── ResultCard ───────────────────────────────────────────────────────────────
function ResultCard({ data, qrUrl, onVerify, showVerifyBtn }) {
  if (!data) return null;
  return (
    <div className="result-card">
      <div className="result-header">
        <IconFile />
        <div>
          <h3>Matrícula {data.matricula}</h3>
          <span style={{ fontSize: 11, color: 'var(--gris-texto)', fontFamily: 'monospace' }}>ID interno: #{data.id}</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className={`badge ${data.isVerified ? 'badge-verified' : 'badge-pending'}`}>
            {data.isVerified ? <><IconCheck /> Verificado</> : 'Pendiente'}
          </span>
        </div>
      </div>
      <div className="result-body">
        <div className="result-fields">
          {[
            ['Matrícula',           data.matricula],
            ['Propietario',         data.ownerName],
            ['Cédula',              data.ownerId],
            ['Nacionalidad',        data.nationality      || 'N/A'],
            ['Provincia',           data.provincia        || 'N/A'],
            ['Municipio',           data.municipio        || 'N/A'],
            ['Ubicación',           data.propertyLocation || 'N/A'],
            ['Distrito Catastral',  data.district         || 'N/A'],
            ['Parcela',             data.parcel],
            ['Superficie',          `${data.area} m²`],
            ['Fecha Registro',      data.registrationDate || 'N/A'],
            ['Timestamp Blockchain',data.timestamp],
          ].map(([k, v]) => (
            <div className="result-row" key={k}>
              <span className="result-key">{k}</span>
              <span className="result-val">{v}</span>
            </div>
          ))}
          {data.ipfsHash && (
            <div className="result-row">
              <span className="result-key">Documento</span>
              <a href={data.ipfsUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--azul-claro)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                <IconLink /> Ver en IPFS
              </a>
            </div>
          )}
        </div>
        {qrUrl && (
          <div className="qr-panel">
            <img src={qrUrl} alt="QR" style={{ width: 130, height: 130 }} />
            <small>Escanear para verificar</small>
          </div>
        )}
      </div>
      {showVerifyBtn && !data.isVerified && onVerify && (
        <div style={{ padding: '0 20px 20px' }}>
          <button className="btn btn-primary" onClick={() => onVerify(data.id)}>
            <IconCheck /> Verificar Título Oficialmente
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Módulo: Consulta Pública ─────────────────────────────────────────────────
function PublicView({ contract }) {
  const [searchType, setSearchType] = useState('matricula');
  const [searchVal, setSearchVal] = useState('');
  const [propertyData, setPropertyData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchById = async (id) => {
    if (!contract || !id || id <= 0) return;
    try {
      const result = await contract.getProperty(id);
      const info = parseProperty(result);
      setPropertyData(info);
      setQrCodeUrl(await generateQR(info.id));
    } catch (e) {
      alert('Título no encontrado.');
      setPropertyData(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!contract || !searchVal.trim()) return;
    try {
      setLoading(true);
      setPropertyData(null);
      const val = searchVal.trim();

      if (searchType === 'matricula') {
        const id = await contract.getPropertyByMatricula(val);
        if (Number(id) === 0) { alert('Matrícula no encontrada.'); return; }
        await fetchById(Number(id));
      } else if (searchType === 'parcel') {
        const id = await contract.getPropertyByParcel(val);
        if (Number(id) === 0) { alert('Parcela no encontrada.'); return; }
        await fetchById(Number(id));
      } else if (searchType === 'ipfs') {
        const id = await contract.getPropertyByIpfsHash(val);
        if (Number(id) === 0) { alert('Hash IPFS no encontrado.'); return; }
        await fetchById(Number(id));
      }
    } catch (e) {
      alert('Error al buscar.');
    } finally { setLoading(false); }
  };

  const placeholders = {
    matricula: 'RD-240105-0001',
    parcel:    'Parcela 10-A',
    ipfs:      'QmXoypiz...',
  };

  return (
    <>
      <div className="module-banner module-banner-public">
        <div className="module-banner-icon"><IconGlobe /></div>
        <div>
          <div className="module-banner-title">Módulo de Consulta Pública</div>
          <div className="module-banner-sub">
            Cualquier ciudadano puede verificar un título sin autenticación. Busque por matrícula, parcela o hash IPFS.
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header"><IconSearch /><h2>Verificar Título de Propiedad</h2></div>
        <div className="section-body">
          <div className="search-type-tabs">
            {[
              { key: 'matricula', label: 'Matrícula', icon: <IconHash /> },
              { key: 'parcel',    label: 'Parcela',   icon: <IconFile /> },
              { key: 'ipfs',      label: 'Hash IPFS', icon: <IconDatabase /> },
            ].map(t => (
              <button key={t.key} type="button"
                className={`search-tab${searchType === t.key ? ' active' : ''}`}
                onClick={() => { setSearchType(t.key); setPropertyData(null); setSearchVal(''); }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="search-bar" style={{ marginTop: 16 }}>
            <input type="text" placeholder={placeholders[searchType]}
              value={searchVal} onChange={e => setSearchVal(e.target.value)} className="form-control" />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <IconSearch /> {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>

          <ResultCard data={propertyData} qrUrl={qrCodeUrl} showVerifyBtn={false} />
        </div>
      </div>
    </>
  );
}

// ─── Módulo: Panel de Autoridad ───────────────────────────────────────────────
function AuthorityPanel({ contract, setTotalProperties }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [operationType, setOperationType] = useState('new');
  const [propertyData, setPropertyData] = useState(null);
  const [propertyId, setPropertyId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transferId, setTransferId] = useState('');
  const [transferData, setTransferData] = useState({ newOwnerName: '', newOwnerId: '', transferNote: '' });

  // Estados para modales y notificaciones
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Mostrar notificación tipo toast
const showToast = (message, type = 'success') => {
  setToast({ show: true, message, type });
  setTimeout(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, 4000);
};

// Mostrar modal de carga con mensaje dinámico
const showLoading = (message) => {
  setLoading(true);              // ← NUEVO: activa loading del botón
  setLoadingMessage(message);
  setShowLoadingModal(true);
};

const hideLoading = () => {
  setShowLoadingModal(false);
  setLoadingMessage('');
  // NO poner setLoading(false) aquí, se maneja aparte
};

  // Registrador eliminado del formulario — es una constante del sistema
  const [formData, setFormData] = useState({
    ownerName: '', ownerId: '', nationality: 'Dominicana',
    propertyLocation: '', district: '', parcel: '', area: '', registrationDate: '',
    provincia: 'SANTO DOMINGO DE GUZMÁN',
    municipio: 'SANTO DOMINGO, D.N.',
  });

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleTransferChange = (e) => setTransferData({ ...transferData, [e.target.name]: e.target.value });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
  };

  // ─── Subida a IPFS ────────────────────────────────────────────────────────
  const uploadToIPFS = async (file) => {
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      });
      return response.data.IpfsHash;
    } catch (error) {
      alert('Error al subir el archivo a IPFS');
      return null;
    } finally { setUploading(false); }
  };

  // ─── Registro de nueva propiedad ──────────────────────────────────────────
const registerProperty = async (e) => {
  e.preventDefault();
  if (!contract) { 
    showToast("Conecte su wallet primero", "error");
    return; 
  }
  if (!formData.ownerName || !formData.ownerId || !formData.parcel || !formData.area) {
    showToast('Complete los campos obligatorios: Propietario, Cédula, Parcela y Superficie', "error");
    return;
  }

  try {
    setLoading(true);
    showLoading("Verificando datos del título...");

    const totalActual = await contract.getTotalProperties();
    const nuevoId = Number(totalActual) + 1;
    
    // Verificar si la parcela ya existe (simular transacción)
    showLoading("Validando parcela en Blockchain...");
    try {
      // Llamada estática para verificar sin gastar gas
      await contract.registerProperty.staticCall(
        formData.ownerName,
        formData.ownerId,
        formData.parcel,
        formData.area,
        "0x", 
        "{}"
      );
    } catch (validationError) {
      // Extraer el mensaje de error del contrato
      let errorMessage = "Error de validación";
      if (validationError.reason) {
        errorMessage = validationError.reason;
      } else if (validationError.message) {
        const match = validationError.message.match(/reason="([^"]+)"/);
        if (match) errorMessage = match[1];
        else if (validationError.message.includes("parcela")) errorMessage = "Esta parcela ya se encuentra registrada en el sistema";
      }
      hideLoading();
      setLoading(false);
      showToast(errorMessage, "error");
      return;
    }

    // Si llegamos aquí, la parcela NO está duplicada
    const qrUrlTemp = await generateQR(nuevoId);
    // Generar matrícula con formato RD-YYMMDD-XXXXX
    const hoy = new Date();
    const yy = hoy.getFullYear().toString().slice(-2);
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const secuencial = String(nuevoId).padStart(5, '0');
    const matriculaGenerada = `RD-${yy}${mm}${dd}-${secuencial}`;

    const datosCert = {
      id: nuevoId,
      matricula: matriculaGenerada,
      ownerName: formData.ownerName,
      ownerId: formData.ownerId,
      nationality: formData.nationality,
      parcel: formData.parcel,
      area: formData.area,
      district: formData.district,
      propertyLocation: formData.propertyLocation,
      registrationDate: formData.registrationDate,
      provincia: formData.provincia,
      municipio: formData.municipio,
      ipfsHash: ''
    };

    // Generar certificado y subir a IPFS (solo si la validación pasó)
    showLoading("Generando certificado digital y subiendo a IPFS...");
    const ipfsHashFinal = await generarCertificadoPDF(datosCert, qrUrlTemp, 'REGISTRO INICIAL', uploadToIPFS);

    if (!ipfsHashFinal) {
      hideLoading();
      setLoading(false);
      showToast('Error al generar o subir el certificado. Intente de nuevo.', "error");
      return;
    }

    datosCert.ipfsHash = ipfsHashFinal;

    const metadata = JSON.stringify({
      operationType: 'new',
      nationality: formData.nationality,
      district: formData.district,
      location: formData.propertyLocation,
      registrationDate: formData.registrationDate,
      provincia: formData.provincia,
      municipio: formData.municipio,
      registrador: REGISTRADOR_NOMBRE,
      previousOwner: '',
      qrCode: qrUrlTemp,
      certificadoHash: ipfsHashFinal
    });

    showLoading("Registrando en Blockchain (esto puede tomar unos segundos)...");
    const tx = await contract.registerProperty(
      formData.ownerName,
      formData.ownerId,
      formData.parcel,
      formData.area,
      ipfsHashFinal,
      metadata
    );
    await tx.wait();

    hideLoading();
    setLoading(false);
    showToast('¡Título registrado exitosamente en la Blockchain!', "success");

    const total = await contract.getTotalProperties();
    setTotalProperties(Number(total));
    setQrCodeUrl(qrUrlTemp);

    setFormData({
      ownerName: '', ownerId: '', nationality: 'Dominicana',
      propertyLocation: '', district: '', parcel: '', area: '', registrationDate: '',
      provincia: 'SANTO DOMINGO DE GUZMÁN',
      municipio: 'SANTO DOMINGO, D.N.',
    });
    setSelectedFile(null);
    setPropertyId('');
    setPropertyData(null);

  } catch (error) {
    hideLoading();
    setLoading(false);
    console.error("Error detallado:", error);
    
    let errorMessage = "Error al registrar el título";
    
    if (error.code === 'ACTION_REJECTED' || 
        error.code === 4001 || 
        error.message?.includes('user rejected') ||
        error.message?.includes('User denied') ||
        error.message?.includes('rejected') ||
        error.error?.message?.includes('reject')) {
      errorMessage = "Transacción rechazada en MetaMask";
    }
    else if (error.reason) {
      errorMessage = error.reason;
    }
    else if (error.message) {
      const match = error.message.match(/reason="([^"]+)"/);
      if (match) {
        errorMessage = match[1];
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Saldo insuficiente en la wallet";
      } else if (error.message.includes("gas")) {
        errorMessage = "Error con el gas de la transacción";
      } else if (error.message.includes("already registered")) {
        errorMessage = "Esta parcela ya se encuentra registrada en el sistema";
      }
    }
    else if (error.code === 'NETWORK_ERROR') {
      errorMessage = "Error de conexión con la red. Verifique su conexión a Internet.";
    }
    
    showToast(errorMessage, "error");
  }
};

  // ─── Traspaso ─────────────────────────────────────────────────────────────
const transferProperty = async (e) => {
  e.preventDefault();
  if (!transferId || transferId <= 0) { 
    showToast('Ingrese un ID de título válido', "error"); 
    return; 
  }
  if (!transferData.newOwnerName || !transferData.newOwnerId) {
    showToast('Complete el nombre y cédula del nuevo propietario', "error");
    return;
  }

  try {
    setLoading(true);
    showLoading("Preparando traspaso...");

    const propiedadActual = await contract.getProperty(transferId);
    let metadataActual = {};
    try { metadataActual = JSON.parse(propiedadActual[9]); } catch(e) {}

    const nuevoQrUrl = await generateQR(transferId);
    const matriculaActual = propiedadActual[1];

    // Datos para el nuevo certificado (con el nuevo propietario)
    const datosNuevoCert = {
      id: transferId,
      matricula: matriculaActual,
      ownerName: transferData.newOwnerName,
      ownerId: transferData.newOwnerId,
      nationality: metadataActual.nationality || 'Dominicana',
      parcel: propiedadActual[4],
      area: propiedadActual[5],
      district: metadataActual.district || '',
      propertyLocation: metadataActual.location || '',
      registrationDate: metadataActual.registrationDate || new Date().toISOString().split('T')[0],
      provincia: metadataActual.provincia || 'SANTO DOMINGO DE GUZMÁN',
      municipio: metadataActual.municipio || 'SANTO DOMINGO, D.N.',
      ipfsHash: ''
    };

    // Generar nuevo certificado con los datos del nuevo propietario
    showLoading("Generando nuevo certificado digital...");
    const nuevoIpfsHash = await generarCertificadoPDF(datosNuevoCert, nuevoQrUrl, 'TRASPASO', uploadToIPFS);
    
    if (!nuevoIpfsHash) {
      hideLoading();
      setLoading(false);
      showToast('Error al generar el certificado de traspaso', "error");
      return;
    }  

    const metaTraspaso = JSON.stringify({
      fechaTraspaso: new Date().toISOString(),
      nota: transferData.transferNote || 'Traspaso de propiedad',
      nuevoCertificadoHash: nuevoIpfsHash,
      nuevoQr: nuevoQrUrl
    });  

    // ─── TRANSACCIÓN ÚNICA: TRASPASO + ACTUALIZACIÓN DE IPFS ──────────────
    showLoading("Registrando traspaso y actualizando certificado en Blockchain...");

    const tx = await contract.transferPropertyWithCertificate(
      transferId,
      transferData.newOwnerName,
      transferData.newOwnerId,
      metaTraspaso,
      nuevoIpfsHash
    );

    await tx.wait();

    hideLoading();
    setLoading(false);
    showToast('¡Traspaso registrado exitosamente! Se ha generado un nuevo certificado para el nuevo propietario.', "success");
    
    setTransferData({ newOwnerName: '', newOwnerId: '', transferNote: '' });
    setTransferId('');
    setPropertyData(null);

  } catch (error) {
    hideLoading();
    setLoading(false);
    console.error("Error en traspaso:", error);
    
    let errorMessage = "Error al registrar el traspaso";
    
    if (error.code === 'ACTION_REJECTED' || 
        error.code === 4001 || 
        error.message?.includes('user rejected') ||
        error.message?.includes('User denied') ||
        error.message?.includes('rejected')) {
      errorMessage = "Transacción rechazada en MetaMask";
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      const match = error.message.match(/reason="([^"]+)"/);
      if (match) errorMessage = match[1];
      else if (error.message.includes("insufficient funds")) errorMessage = "Saldo insuficiente en la wallet";
    }
    
    showToast(errorMessage, "error");
  }
};
  // ─── Consulta por ID ──────────────────────────────────────────────────────
  const getProperty = async (e, forcedId) => {
    if (e) e.preventDefault();
    const id = forcedId !== undefined ? forcedId : propertyId;
    if (!id || id <= 0) { showToast('Ingrese un ID válido', 'error'); return; }
    try {
      setLoading(true);
      const result = await contract.getProperty(id);
      const info = parseProperty(result);
      setPropertyData(info);
      setQrCodeUrl(await generateQR(info.id));
    } catch (error) {
      showToast('Propiedad no encontrada.', "error");
      setPropertyData(null);
    } finally { setLoading(false); }
  };

  const verifyProperty = async (id) => {
    try {
      setLoading(true);
      showLoading("Verificando título en Blockchain...");
      const tx = await contract.verifyProperty(id);
      await tx.wait();
      hideLoading();
      showToast(`Título #${id} verificado oficialmente en la Blockchain`, "success");
      await getProperty(null, id);
    } catch (error) {
      hideLoading();
      console.error("Error al verificar:", error);
      
      let errorMessage = "Error al verificar el título";
      
      if (error.code === 'ACTION_REJECTED' || 
          error.code === 4001 || 
          error.message?.includes('user rejected') ||
          error.message?.includes('User denied')) {
        errorMessage = "Transacción rechazada en MetaMask";
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        const match = error.message.match(/reason="([^"]+)"/);
        if (match) errorMessage = match[1];
        else if (error.message.includes("insufficient funds")) errorMessage = "Saldo insuficiente en la wallet";
      }
      
      showToast(errorMessage, "error");
    } finally { 
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal de carga */}
    {showLoadingModal && (
      <div className="modal-overlay">
        <div className="modal-loading">
          <div className="modal-spinner"></div>
          <div className="modal-message">{loadingMessage}</div>
          <div className="modal-submessage">Por favor espere, esto puede tomar unos segundos...</div>
        </div>
      </div>
    )}

    {/* Toast de notificación */}
    {toast.show && (
      <div className={`toast-notification ${toast.type}`}>
        <div className="toast-icon">
          {toast.type === 'success' ? <IconCheck /> : <IconAlertTriangle />}
        </div>
        <div className="toast-message">{toast.message}</div>
        <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: 'success' })}>
          ✕
        </button>
      </div>
    )}

      <div className="module-banner module-banner-authority">
        <div className="module-banner-icon"><IconKey /></div>
        <div>
          <div className="module-banner-title">Panel de Autoridad — Registrador Oficial</div>
          <div className="module-banner-sub">
            Acceso restringido. Solo la wallet del Registrador puede crear, transferir y verificar títulos.
            La matrícula es generada automáticamente. Registrador: <strong>{REGISTRADOR_NOMBRE}</strong>.
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header"><IconClipboard /><h2>Gestión de Títulos de Propiedad</h2></div>
        <div className="section-body">
          <div className="op-selector">
            <button type="button" className={`op-btn op-btn-new${operationType === 'new' ? ' active' : ''}`} onClick={() => setOperationType('new')}>
              <IconPlusCircle /> Registro Nuevo
            </button>
            <button type="button" className={`op-btn op-btn-transfer${operationType === 'transfer' ? ' active' : ''}`} onClick={() => setOperationType('transfer')}>
              <IconTransfer /> Traspaso
            </button>
          </div>

          {/* ── Registro Nuevo ── */}
          {operationType === 'new' && (
            <>
              <div className="op-notice op-notice-new">
                <IconBuilding /> Registrando un <strong>título nuevo.</strong>La matrícula y el nombre del Registrador se asignan automáticamente.
              </div>

              <form onSubmit={registerProperty}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre del Propietario<span className="req">*</span></label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} required className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cédula<span className="req">*</span></label>
                    <input type="text" name="ownerId" value={formData.ownerId} onChange={handleInputChange} placeholder="001-0000000-1" required className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nacionalidad</label>
                    <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Provincia</label>
                    <input type="text" name="provincia" value={formData.provincia} onChange={handleInputChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Municipio</label>
                    <input type="text" name="municipio" value={formData.municipio} onChange={handleInputChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ubicación</label>
                    <input type="text" name="propertyLocation" value={formData.propertyLocation} onChange={handleInputChange} placeholder="Santo Domingo de Guzmán" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Distrito Catastral</label>
                    <input type="text" name="district" value={formData.district} onChange={handleInputChange} placeholder="Distrito No.18" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parcela<span className="req">*</span></label>
                    <input type="text" name="parcel" value={formData.parcel} onChange={handleInputChange} placeholder="Parcela 10-A" required className="form-control" />
                    
                  </div>
                  <div className="form-group">
                    <label className="form-label">Superficie (m²)<span className="req">*</span></label>
                    <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="260.17" required className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha de Registro</label>
                    <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleInputChange} className="form-control date-input" />
                  </div>
                  
                </div>

                <div className="registrador-info-box">
                  <IconKey />
                  <span>Registrador: <strong>{REGISTRADOR_NOMBRE}</strong> — {REGISTRADOR_TITULO}</span>
                </div>

                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 16 }} disabled={loading || uploading}>
                  {uploading ? <><IconUpload /> Subiendo documento...</> : loading ? 'Procesando transacción...' : <><IconPlusCircle /> Registrar Nuevo Título</>}
                </button>
              </form>
            </>
          )}

          {/* ── Traspaso ── */}
          {operationType === 'transfer' && (
            <>
              <div className="op-notice op-notice-transfer">
                <IconTransfer /> Traspaso de titularidad. El propietario anterior quedará en el historial inmutable de la Blockchain.
              </div>
              <form onSubmit={transferProperty}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">ID del Título a Traspasar<span className="req">*</span></label>
                    <input type="number" value={transferId} onChange={e => setTransferId(e.target.value)}
                      placeholder="ID interno del título" required className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre del Nuevo Propietario<span className="req">*</span></label>
                    <input type="text" name="newOwnerName" value={transferData.newOwnerName} onChange={handleTransferChange} required className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cédula del Nuevo Propietario<span className="req">*</span></label>
                    <input type="text" name="newOwnerId" value={transferData.newOwnerId} onChange={handleTransferChange} placeholder="001-01-00001" required className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Motivo del Traspaso</label>
                    <input type="text" name="transferNote" value={transferData.transferNote} onChange={handleTransferChange}
                      placeholder="Compraventa, herencia, donación..." className="form-control" />
                  </div>
                </div>
                <button type="submit" className="btn btn-danger btn-full" disabled={loading}>
                  {loading ? 'Procesando transacción...' : <><IconTransfer /> Registrar Traspaso</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Consulta y verificación */}
      <div className="section-card">
        <div className="section-header"><IconSearch /><h2>Consultar y Verificar Título</h2></div>
        <div className="section-body">
          <form onSubmit={getProperty} className="search-bar">
            <input type="number" placeholder="ID interno del título" value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)} className="form-control" />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <IconSearch /> {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>
          <ResultCard data={propertyData} qrUrl={qrCodeUrl} showVerifyBtn={true} onVerify={verifyProperty} />
        </div>
      </div>

      {qrCodeUrl && !propertyData && (
        <div className="section-card">
          <div className="section-header"><IconBlockchain size={16} /><h2>Código QR del Título Registrado</h2></div>
          <div className="section-body" style={{ textAlign: 'center' }}>
            <img src={qrCodeUrl} alt="QR" style={{ width: 160, height: 160, border: '1.5px solid var(--gris-borde)', borderRadius: 6 }} />
            <p style={{ marginTop: 10, fontSize: 13, color: 'var(--gris-texto)' }}>Escanee para verificar la autenticidad del título</p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── App Principal ────────────────────────────────────────────────────────────
function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [publicContract, setPublicContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const [isRegistrar, setIsRegistrar] = useState(false);

  useEffect(() => {
    const loadPublic = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        const instance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        setPublicContract(instance);
        const total = await instance.getTotalProperties();
        setTotalProperties(Number(total));
      } catch (e) { console.error('RPC público no disponible:', e); }
    };
    loadPublic();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) { alert('Instale MetaMask para acceder al Panel de Autoridad'); return; }
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      setContract(contractInstance);
      const registrarStatus = await contractInstance.isRegistrar(accounts[0]);
      setIsRegistrar(registrarStatus);
      const total = await contractInstance.getTotalProperties();
      setTotalProperties(Number(total));
    } catch (error) { alert('Error al conectar con MetaMask'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --azul: #002D6E; --azul-medio: #0048A4; --azul-claro: #1565C0;
          --rojo: #C8102E; --rojo-oscuro: #9B0E24;
          --gris-claro: #F4F5F7; --gris-borde: #D8DCE4; --gris-texto: #4A5568;
          --blanco: #FFFFFF; --sombra: 0 2px 8px rgba(0,45,110,0.10);
        }
        body { background: var(--gris-claro); font-family: 'Source Sans 3', sans-serif; color: #1A202C; }
        .gov-app { min-height: 100vh; display: flex; flex-direction: column; }

        .top-bar { 
  background: #001a42; 
  padding: 8px 32px; 
  display: flex; 
  justify-content: center; 
  align-items: center;  /* ← Asegura alineación vertical */
  gap: 10px; 
  font-size: 11.5px; 
  color: rgba(255,255,255,0.60); 
  letter-spacing: 0.05em; 
  text-transform: uppercase; 
}
.top-bar svg { 
  opacity: 0.8;
  vertical-align: middle;  /* ← Alinea el icono con el texto */
  margin-top: -2px;        /* ← Ajuste fino (puedes cambiar el valor) */
}
        .gov-header { background: #002868; padding: 0; border-bottom: 4px solid #CE1126; }
        .header-inner { width: 100%; padding: 20px 32px; display: flex; align-items: center; gap: 18px; }
        .header-logo-box { color: rgba(255,255,255,0.90); flex-shrink: 0; display: flex; align-items: center; }
        .header-text h1 { font-family: 'Source Sans 3', sans-serif; font-size: 22px; font-weight: 600; color: var(--blanco); margin: 0; }
        .header-text p { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 3px; }
        .header-accent { flex: 1; }
        .header-badge { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 8px 18px; font-size: 14px; color: rgba(255,255,255,0.90); }
        .gov-nav { background: var(--blanco); border-bottom: 1px solid var(--gris-borde); padding: 10px 32px; }
        .gov-nav-inner { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--gris-texto); }
        .gov-nav-inner a { color: var(--azul-claro); text-decoration: none; }
        .gov-nav-inner span { color: #A0AEC0; }
        .gov-main { width: 100%; padding: 32px 180px 60px; flex: 1; }

        .wallet-panel { background: var(--blanco); border: 1px solid var(--gris-borde); border-radius: 6px; padding: 18px 24px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--sombra); }
        .wallet-label { font-size: 13px; color: var(--gris-texto); letter-spacing: 0.04em; text-transform: uppercase; }
        .wallet-info { display: flex; align-items: center; gap: 16px; }
        .wallet-stat { text-align: center; }
        .wallet-stat span { display: block; font-size: 11px; color: #A0AEC0; letter-spacing: 0.05em; text-transform: uppercase; }
        .wallet-stat strong { font-size: 18px; color: var(--azul); font-weight: 700; }
        .wallet-address { display: flex; align-items: center; gap: 8px; background: #EBF4FF; border: 1px solid #BEE3F8; border-radius: 4px; padding: 6px 12px; font-size: 13px; color: var(--azul-claro); font-family: monospace; }
        .registrar-badge { display: flex; align-items: center; gap: 6px; background: #C6F6D5; border: 1px solid #9AE6B4; border-radius: 4px; padding: 6px 12px; font-size: 12px; color: #276749; font-weight: 700; }
        .divider-v { width: 1px; height: 30px; background: var(--gris-borde); }

        .module-banner { display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px; border-left: 5px solid; }
        .module-banner-public { background: #EBF4FF; border-color: var(--azul-claro); }
        .module-banner-authority { background: #FFFBEB; border-color: #D97706; }
        .module-banner-icon { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .module-banner-public .module-banner-icon { background: #BEE3F8; color: var(--azul); }
        .module-banner-authority .module-banner-icon { background: #FDE68A; color: #92400E; }
        .module-banner-title { font-weight: 700; font-size: 14px; color: #1A202C; margin-bottom: 3px; }
        .module-banner-sub { font-size: 12.5px; color: var(--gris-texto); }

        .search-type-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .search-tab { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1.5px solid var(--gris-borde); border-radius: 4px; background: var(--blanco); font-size: 13px; font-family: 'Source Sans 3', sans-serif; cursor: pointer; color: var(--gris-texto); transition: all 0.15s; }
        .search-tab:hover { border-color: var(--azul-claro); color: var(--azul); }
        .search-tab.active { background: var(--azul); color: var(--blanco); border-color: var(--azul); }

        /* Caja informativa del registrador fijo */
        .registrador-info-box {
          display: flex; align-items: center; gap: 10px;
          background: #F0FFF4; border: 1px solid #9AE6B4; border-radius: 4px;
          padding: 10px 16px; font-size: 13px; color: #276749;
          margin-top: 4px;
        }

        .btn { display: inline-flex; align-items: center; gap: 8px; border: none; border-radius: 4px; cursor: pointer; font-family: 'Source Sans 3', sans-serif; font-weight: 600; letter-spacing: 0.03em; transition: all 0.18s ease; white-space: nowrap; }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-primary { background: var(--azul); color: var(--blanco); padding: 11px 22px; font-size: 14px; }
        .btn-primary:hover:not(:disabled) { background: var(--azul-medio); }
        .btn-danger { background: var(--rojo); color: var(--blanco); padding: 11px 22px; font-size: 14px; }
        .btn-danger:hover:not(:disabled) { background: var(--rojo-oscuro); }
        .btn-outline { background: var(--blanco); color: var(--azul); border: 1.5px solid var(--azul); padding: 10px 20px; font-size: 14px; }
        .btn-outline:hover:not(:disabled) { background: var(--azul); color: var(--blanco); }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
        .btn-full { width: 100%; justify-content: center; }

        .section-card { background: var(--blanco); border: 1px solid var(--gris-borde); border-radius: 6px; margin-bottom: 28px; box-shadow: var(--sombra); overflow: hidden; }
        .section-header { background: var(--azul); padding: 14px 24px; display: flex; align-items: center; gap: 10px; color: var(--blanco); }
        .section-header h2 { font-family: 'EB Garamond', serif; font-size: 17px; font-weight: 500; letter-spacing: 0.04em; }
        .section-body { padding: 28px 24px; }

        .op-selector { display: flex; gap: 0; margin-bottom: 24px; border: 1.5px solid var(--gris-borde); border-radius: 5px; overflow: hidden; }
        .op-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border: none; cursor: pointer; font-size: 13.5px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; transition: all 0.18s; letter-spacing: 0.02em; }
        .op-btn-new { background: #EBF4FF; color: var(--azul); }
        .op-btn-new.active { background: var(--azul); color: var(--blanco); }
        .op-btn-transfer { background: #FFF5F5; color: var(--rojo); border-left: 1.5px solid var(--gris-borde); }
        .op-btn-transfer.active { background: var(--rojo); color: var(--blanco); }
        .op-notice { padding: 10px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
        .op-notice-new { background: #EBF4FF; border-left: 4px solid var(--azul); color: var(--azul); }
        .op-notice-transfer { background: #FFF5F5; border-left: 4px solid var(--rojo); color: var(--rojo-oscuro); }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; }
        .form-label { font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gris-texto); margin-bottom: 6px; }
        .form-label .req, .req { color: var(--rojo); margin-left: 3px; }
        .form-control { width: 100%; padding: 10px 12px; border: 1.5px solid var(--gris-borde); border-radius: 4px; font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #1A202C; background: var(--blanco); transition: border-color 0.15s; outline: none; }
        .form-control:focus { border-color: var(--azul-claro); box-shadow: 0 0 0 3px rgba(21,101,192,0.10); }
        .form-control::placeholder { color: #A0AEC0; }
        .form-hint { font-size: 11.5px; color: #A0AEC0; margin-top: 5px; }

        .date-input { color-scheme: light; }
        .date-input::-webkit-calendar-picker-indicator {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
          cursor: pointer; opacity: 1; filter: none; padding: 2px;
        }

        .file-label { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1.5px dashed var(--gris-borde); border-radius: 4px; cursor: pointer; font-size: 13.5px; color: var(--gris-texto); background: var(--gris-claro); transition: border-color 0.15s; }
        .file-label:hover { border-color: var(--azul-claro); color: var(--azul); }
        .file-selected { color: #276749; font-size: 12.5px; margin-top: 5px; display: flex; align-items: center; gap: 5px; }

        .result-card { margin-top: 24px; border: 1.5px solid #BEE3F8; border-radius: 6px; overflow: hidden; }
        .result-header { background: #EBF4FF; padding: 12px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #BEE3F8; }
        .result-header h3 { font-family: 'EB Garamond', serif; font-size: 17px; font-weight: 700; color: var(--azul); }
        .result-body { padding: 20px; display: flex; gap: 28px; flex-wrap: wrap; }
        .result-fields { flex: 1; min-width: 260px; }
        .result-row { display: flex; padding: 8px 0; border-bottom: 1px solid #F0F4F8; font-size: 13.5px; }
        .result-row:last-child { border-bottom: none; }
        .result-key { width: 170px; flex-shrink: 0; color: var(--gris-texto); font-weight: 600; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.04em; padding-top: 1px; }
        .result-val { color: #1A202C; }
        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 3px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .badge-verified { background: #C6F6D5; color: #276749; }
        .badge-pending { background: #FEEBC8; color: #744210; }
        .qr-panel { text-align: center; padding: 12px; }
        .qr-panel img { border: 1.5px solid var(--gris-borde); border-radius: 4px; display: block; margin: 0 auto 8px; }
        .qr-panel small { font-size: 11px; color: #A0AEC0; letter-spacing: 0.04em; text-transform: uppercase; }
        .search-bar { display: flex; gap: 10px; }
        .search-bar .form-control { flex: 1; }

        .gov-footer { background: var(--azul); color: rgba(255,255,255,0.55); font-size: 11.5px; text-align: center; padding: 20px 32px; letter-spacing: 0.04em; }
        .gov-footer p + p { margin-top: 4px; }
        .gov-footer-items { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; margin-bottom: 8px; }
        .gov-footer-item { display: flex; align-items: center; gap: 6px; }

        @media (max-width: 700px) {
  /* Layout principal */
  .gov-main { 
    padding: 20px 16px 40px; 
  }
  
  /* Header */
  .header-inner { 
    padding: 16px; 
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
    gap: 12px;
  }
  .header-logo-box {
    display: none; /* Opcional: oculta el logo en móvil */
  }
  .header-text h1 {
    font-size: 18px;
  }
  .header-text p {
    font-size: 11px;
  }
  .header-badge {
    padding: 4px 12px;
    font-size: 11px;
  }
  
  /* TOP BAR - MÓVIL */
  .top-bar { 
    padding: 8px 12px;
    font-size: 9px;
    text-align: center;
    line-height: 1.4;
    flex-wrap: wrap;
    gap: 6px;
  }
  .top-bar svg {
    width: 12px;
    height: 12px;
  }
  
  /* Navegación */
  .gov-nav { 
    padding: 8px 16px;
  }
  .gov-nav-inner {
    font-size: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  /* Panel de wallet */
  .wallet-panel { 
    flex-direction: column; 
    align-items: center;  /* Centrado en móvil */
    gap: 14px; 
    text-align: center;
  }
  .wallet-label {
    font-size: 11px;
  }
  .wallet-info { 
    flex-wrap: wrap; 
    justify-content: center;
  }
  .wallet-stat strong {
    font-size: 16px;
  }
  .wallet-address {
    font-size: 11px;
  }
  
  /* Formulario */
  .form-grid { 
    grid-template-columns: 1fr; 
    gap: 14px;
  }
  .section-header {
    padding: 12px 16px;
  }
  .section-header h2 {
    font-size: 15px;
  }
  .section-body {
    padding: 20px 16px;
  }
  
  /* Selector de operación (Registro Nuevo / Traspaso) */
  .op-selector {
    flex-direction: column;
    gap: 6px;
    border: none;
  }
  .op-btn {
    border-radius: 5px;
    border: 1.5px solid var(--gris-borde);
  }
  .op-btn-transfer {
    border-left: 1.5px solid var(--gris-borde);
  }
  
  /* Avisos */
  .op-notice {
    font-size: 11px;
    padding: 8px 12px;
  }
  
  /* Botones */
  .btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  .btn-sm {
    padding: 8px 14px;
  }
  
  /* Barra de búsqueda */
  .search-bar {
    flex-direction: column;
  }
  .search-bar .btn {
    width: 100%;
    justify-content: center;
  }
  
  /* Tarjetas de resultado */
  .result-body {
    flex-direction: column;
    align-items: center;
  }
  .result-row {
    flex-direction: column;
    gap: 4px;
  }
  .result-key {
    width: auto;
  }
  
  /* QR panel */
  .qr-panel {
    margin-top: 15px;
  }
  
  /* Footer */
  .gov-footer {
    padding: 16px;
    font-size: 9px;
  }
  .gov-footer-items {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  
  /* Módulo de autoridad */
  .module-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .module-banner-title {
    font-size: 13px;
  }
  .module-banner-sub {
    font-size: 11px;
  }
}

/* Pantallas muy pequeñas (menos de 480px) */
@media (max-width: 480px) {
  .header-text h1 {
    font-size: 16px;
  }
  .wallet-stat span {
    font-size: 9px;
  }
  .wallet-stat strong {
    font-size: 14px;
  }
  .form-label {
    font-size: 10px;
  }
  .form-control {
    font-size: 13px;
    padding: 8px 10px;
  }
  .btn {
    padding: 8px 14px;
    font-size: 12px;
  }
  .top-bar {
    font-size: 8px;
  }
}

/* Modal de carga */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-loading {
  background: white;
  border-radius: 12px;
  padding: 30px 40px;
  text-align: center;
  min-width: 320px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  border-top: 4px solid #002868;
}
.modal-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #002868;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.modal-message {
  font-size: 16px;
  font-weight: 600;
  color: #002868;
  margin-bottom: 10px;
}
.modal-submessage {
  font-size: 12px;
  color: #666;
}

/* Toast notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  min-width: 320px;
  background: white;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  z-index: 1001;
  animation: slideIn 0.3s ease;
  border-left: 4px solid;
}
.toast-notification.success {
  border-left-color: #28a745;
}
.toast-notification.error {
  border-left-color: #dc3545;
}
.toast-icon svg {
  width: 20px;
  height: 20px;
}
.toast-notification.success .toast-icon svg {
  stroke: #28a745;
}
.toast-notification.error .toast-icon svg {
  stroke: #dc3545;
}
.toast-message {
  flex: 1;
  font-size: 13px;
  color: #333;
}
.toast-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
  padding: 0 5px;
}
.toast-close:hover {
  color: #333;
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive para móvil */
@media (max-width: 480px) {
  .modal-loading {
    min-width: 280px;
    padding: 25px 30px;
  }
  .modal-message {
    font-size: 14px;
  }
  .toast-notification {
    bottom: 20px;
    right: 20px;
    left: 20px;
    min-width: auto;
  }
}
      `}</style>

      <div className="gov-app">
        <div className="top-bar">
          <IconShield />
          REPÚBLICA DOMINICANA &nbsp;|&nbsp; Jurisdicción Inmobiliaria &nbsp;|&nbsp; Registro de Títulos
        </div>
        <header className="gov-header">
          <div className="header-inner">
            <div className="header-logo-box"><IconLayers size={46} /></div>
            <div className="header-text">
              <h1>Registro de Títulos</h1>
              <p>República Dominicana</p>
            </div>
            <div className="header-accent" />
            <div className="header-badge"><IconBlockchain size={18} /><span>Blockchain Sepolia</span></div>
          </div>
        </header>
        <nav className="gov-nav">
          <div className="gov-nav-inner">
            <a href="#">Inicio</a><span>/</span>
            <a href="#">Jurisdicción Inmobiliaria</a><span>/</span>
            <span>{isRegistrar ? 'Panel de Autoridad' : 'Consulta Pública'}</span>
          </div>
        </nav>

        <main className="gov-main">
          <div className="wallet-panel">
            <div>
              <div className="wallet-label">{isRegistrar ? 'Panel de Autoridad — Acceso Activo' : 'Módulo de Consulta Pública'}</div>
              <div style={{ fontSize: 13, marginTop: 4, color: account ? '#276749' : '#A0AEC0', display: 'flex', alignItems: 'center', gap: 6 }}>
                {account ? <><IconCheck /> Sesión activa en red Sepolia</> : 'Consulta disponible sin autenticación — Conecte wallet para acceso de Registrador'}
              </div>
            </div>
            <div className="wallet-info">
              <div className="wallet-stat">
                <span>Títulos Registrados</span>
                <strong>{totalProperties}</strong>
              </div>
              <div className="divider-v" />
              {account ? (
                <>
                  <div className="wallet-address"><IconUser /> {account.slice(0, 8)}...{account.slice(-6)}</div>
                  {isRegistrar && <div className="registrar-badge"><IconKey /> Registrador Oficial</div>}
                </>
              ) : (
                <button className="btn btn-outline" onClick={connectWallet} disabled={loading}>
                  <IconKey /> {loading ? 'Conectando...' : 'Acceso Registrador'}
                </button>
              )}
            </div>
          </div>

          {isRegistrar
            ? <AuthorityPanel contract={contract} setTotalProperties={setTotalProperties} />
            : <PublicView contract={publicContract} />
          }
        </main>

        <footer className="gov-footer">
          <div className="gov-footer-items">
            <div className="gov-footer-item"><IconShield /> Registros inmutables en Blockchain Sepolia</div>
            <div className="gov-footer-item"><IconDatabase /> Documentos en IPFS descentralizado</div>
            <div className="gov-footer-item"><IconLink /> Verificación mediante código QR</div>
          </div>
          <p>© 2026 Jurisdicción Inmobiliaria - República Dominicana</p>
        </footer>
      </div>
    </>
  );
}

export default App;