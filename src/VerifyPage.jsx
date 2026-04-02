import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams, Link } from 'react-router-dom';
import contractABI from './contractABI.json';
import QRCode from 'qrcode';

const CONTRACT_ADDRESS = "0x393738f1201C6A9Aef64d663F5F882e65b9B8939";

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconShield = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
const IconCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconClock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconUser = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconFile = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconLink = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconDownload = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconArrowLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);
const IconDatabase = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
  </svg>
);
const IconMap = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const IconTransfer = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconPlusCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8"/><path d="M8 12h8"/>
  </svg>
);
const IconAlertCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

function VerifyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        if (!window.ethereum) { setError("MetaMask no está instalado"); setLoading(false); return; }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        const result = await contract.getProperty(id);
        let metadata = {};
        try { metadata = JSON.parse(result[8]); } catch(e) { metadata = {}; }
        const propertyInfo = {
          id: result[0].toString(),
          ownerName: result[1],
          ownerId: result[2],
          parcel: result[3],
          area: result[4],
          ipfsHash: result[5],
          timestamp: new Date(Number(result[6]) * 1000).toLocaleString(),
          isVerified: result[7],
          operationType: metadata.operationType || "new",
          nationality: metadata.nationality || "",
          district: metadata.district || "",
          propertyLocation: metadata.location || "",
          registrationDate: metadata.registrationDate || "",
          previousOwner: metadata.previousOwner || "",
          ipfsUrl: result[5] ? `https://gateway.pinata.cloud/ipfs/${result[5]}` : ''
        };
        setProperty(propertyInfo);
        const verificationUrl = window.location.href;
        const generatedQrUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', margin: 1, width: 200 });
        setQrCodeUrl(generatedQrUrl);
      } catch (err) {
        console.error("Error:", err);
        setError("Título no encontrado o ID inválido");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const downloadCertificate = async () => {
    if (!property) return;
    const certificateHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificado de Propiedad - Título #${property.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&family=Source+Sans+3:wght@400;600;700&display=swap');
    body { font-family: 'Source Sans 3', Arial, sans-serif; padding: 48px; max-width: 820px; margin: 0 auto; color: #1A202C; background: #fff; }
    .header { text-align: center; border-top: 8px solid #002D6E; border-bottom: 3px solid #C8102E; padding: 28px 0 20px; margin-bottom: 36px; }
    .gov-title { font-family: 'EB Garamond', serif; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: #002D6E; margin-bottom: 8px; }
    .cert-title { font-family: 'EB Garamond', serif; font-size: 26px; font-weight: 600; color: #002D6E; margin: 8px 0; }
    .cert-sub { font-size: 12px; color: #7f8c8d; letter-spacing: 0.06em; text-transform: uppercase; }
    .status-badge { display: inline-block; margin-top: 14px; padding: 6px 18px; border-radius: 3px; font-size: 12px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; background: ${property.isVerified ? '#C6F6D5' : '#FEEBC8'}; color: ${property.isVerified ? '#276749' : '#744210'}; border: 1.5px solid ${property.isVerified ? '#9AE6B4' : '#F6E05E'}; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #002D6E; border-bottom: 2px solid #002D6E; padding-bottom: 6px; margin: 28px 0 14px; }
    .field { display: flex; padding: 9px 0; border-bottom: 1px solid #EDF2F7; font-size: 13.5px; }
    .field-label { width: 200px; flex-shrink: 0; font-weight: 700; color: #4A5568; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; padding-top: 1px; }
    .field-value { color: #1A202C; }
    .qr-section { text-align: center; margin: 32px 0; padding: 24px; border: 1.5px solid #E2E8F0; border-radius: 6px; background: #F7FAFC; }
    .qr-section img { width: 130px; height: 130px; }
    .qr-section p { font-size: 11.5px; color: #718096; margin-top: 10px; letter-spacing: 0.04em; text-transform: uppercase; }
    .footer { margin-top: 40px; text-align: center; font-size: 11.5px; color: #A0AEC0; border-top: 1px solid #E2E8F0; padding-top: 20px; letter-spacing: 0.03em; }
    .footer p + p { margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="gov-title">República Dominicana &mdash; Jurisdicción Inmobiliaria</div>
    <div class="cert-title">Certificado de Título de Propiedad</div>
    <div class="cert-sub">Registro inmutable en Blockchain &mdash; Red Sepolia</div>
    <div class="status-badge">${property.isVerified ? 'Verificado en Blockchain' : 'Pendiente de Verificación'}</div>
  </div>
  <div class="section-title">Información del Título</div>
  <div class="field"><span class="field-label">ID del Título</span><span class="field-value">#${property.id}</span></div>
  <div class="field"><span class="field-label">Tipo de Operación</span><span class="field-value">${property.operationType === 'new' ? 'Registro Nuevo' : 'Traspaso'}</span></div>
  <div class="field"><span class="field-label">Parcela</span><span class="field-value">${property.parcel}</span></div>
  <div class="field"><span class="field-label">Superficie</span><span class="field-value">${property.area} m²</span></div>
  <div class="field"><span class="field-label">Distrito Catastral</span><span class="field-value">${property.district || 'No especificado'}</span></div>
  <div class="field"><span class="field-label">Ubicación</span><span class="field-value">${property.propertyLocation || 'No especificada'}</span></div>
  <div class="field"><span class="field-label">Fecha de Registro</span><span class="field-value">${property.registrationDate || property.timestamp}</span></div>
  <div class="field"><span class="field-label">Timestamp Blockchain</span><span class="field-value">${property.timestamp}</span></div>
  <div class="section-title">Propietario</div>
  <div class="field"><span class="field-label">Nombre</span><span class="field-value">${property.ownerName}</span></div>
  <div class="field"><span class="field-label">Cédula</span><span class="field-value">${property.ownerId}</span></div>
  <div class="field"><span class="field-label">Nacionalidad</span><span class="field-value">${property.nationality || 'Dominicana'}</span></div>
  ${property.previousOwner ? `<div class="field"><span class="field-label">Propietario Anterior</span><span class="field-value">${property.previousOwner}</span></div>` : ''}
  <div class="section-title">Datos Blockchain</div>
  <div class="field"><span class="field-label">Contrato</span><span class="field-value" style="font-family:monospace;font-size:12px">${CONTRACT_ADDRESS}</span></div>
  <div class="qr-section">
    <img src="${qrCodeUrl}" alt="QR de verificación" />
    <p>Escanee para verificar la autenticidad del título</p>
  </div>
  <div class="footer">
    <p>Este certificado fue registrado en la blockchain de Ethereum (Red Sepolia) y tiene validez permanente.</p>
    <p>Verificación en línea: ${window.location.origin}/verify/${property.id}</p>
    <p>Emisión: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificado_Titulo_${property.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --azul: #002D6E;
          --azul-medio: #0048A4;
          --azul-claro: #1565C0;
          --rojo: #C8102E;
          --rojo-oscuro: #9B0E24;
          --gris-claro: #F4F5F7;
          --gris-borde: #D8DCE4;
          --gris-texto: #4A5568;
          --blanco: #FFFFFF;
          --sombra: 0 2px 8px rgba(0,45,110,0.10);
          --sombra-lg: 0 8px 32px rgba(0,45,110,0.14);
        }
        body { background: var(--gris-claro); font-family: 'Source Sans 3', sans-serif; color: #1A202C; }

        .vp-app { min-height: 100vh; display: flex; flex-direction: column; }

        .top-bar {
          background: #001a42; padding: 6px 40px;
          display: flex; align-items: center; gap: 8px;
          font-size: 11.5px; color: rgba(255,255,255,0.60);
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .top-bar svg { opacity: 0.6; }

        .gov-header {
          background: #002868;
          padding: 0;
          border-bottom: 4px solid #CE1126;
        }
        .header-inner {
          max-width: 960px; margin: 0 auto; padding: 20px 40px;
          display: flex; align-items: center; gap: 18px;
        }
        .header-logo-box {
          color: rgba(255,255,255,0.90); flex-shrink: 0;
          display: flex; align-items: center;
        }
        .header-text h1 {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 22px; font-weight: 600;
          color: var(--blanco); letter-spacing: 0.01em;
          line-height: 1.15; margin: 0;
        }
        .header-text p { font-size: 13px; color: rgba(255,255,255,0.65); letter-spacing: 0.02em; margin-top: 3px; }
        .header-accent { flex: 1; }
        .header-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px; padding: 8px 18px;
          font-size: 14px; color: rgba(255,255,255,0.90); letter-spacing: 0.02em;
        }

        .vp-main { max-width: 960px; margin: 0 auto; padding: 36px 40px 60px; flex: 1; }

        /* Estado banner */
        .status-banner {
          border-radius: 6px 6px 0 0;
          padding: 20px 28px;
          display: flex; align-items: center; gap: 14px;
        }
        .status-banner.verified { background: linear-gradient(90deg, #276749 0%, #38a169 100%); }
        .status-banner.pending { background: linear-gradient(90deg, #744210 0%, #c05621 100%); }
        .status-banner-icon {
          width: 48px; height: 48px; background: rgba(255,255,255,0.15);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          color: white;
        }
        .status-banner-text h2 { font-family: 'EB Garamond', serif; font-size: 20px; color: white; }
        .status-banner-text p { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 3px; letter-spacing: 0.04em; }

        /* Main card */
        .cert-card {
          background: var(--blanco); border: 1px solid var(--gris-borde);
          border-radius: 6px; box-shadow: var(--sombra-lg); overflow: hidden;
          margin-bottom: 24px;
        }

        .cert-section-header {
          background: var(--azul); color: var(--blanco);
          padding: 12px 24px; display: flex; align-items: center; gap: 10px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .cert-body { padding: 0 24px; }
        .cert-row {
          display: flex; padding: 11px 0; border-bottom: 1px solid #F0F4F8;
          font-size: 13.5px; align-items: baseline;
        }
        .cert-row:last-child { border-bottom: none; }
        .cert-key { width: 190px; flex-shrink: 0; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gris-texto); }
        .cert-val { color: #1A202C; flex: 1; }

        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 3px; font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .badge-verified { background: #C6F6D5; color: #276749; }
        .badge-pending { background: #FEEBC8; color: #744210; }
        .badge-new { background: #EBF4FF; color: var(--azul); }
        .badge-transfer { background: #FFF5F5; color: var(--rojo-oscuro); }

        /* QR + acciones */
        .actions-panel {
          background: var(--blanco); border: 1px solid var(--gris-borde);
          border-radius: 6px; padding: 28px;
          display: flex; align-items: center; gap: 32px;
          flex-wrap: wrap; box-shadow: var(--sombra);
        }
        .qr-box { text-align: center; }
        .qr-box img { border: 1.5px solid var(--gris-borde); border-radius: 4px; display: block; }
        .qr-box small { font-size: 10.5px; color: #A0AEC0; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 8px; display: block; }
        .actions-text { flex: 1; min-width: 200px; }
        .actions-text h3 { font-family: 'EB Garamond', serif; font-size: 18px; color: var(--azul); margin-bottom: 6px; }
        .actions-text p { font-size: 13px; color: var(--gris-texto); line-height: 1.5; }
        .actions-btns { display: flex; flex-direction: column; gap: 10px; }

        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          border: none; border-radius: 4px; cursor: pointer;
          font-family: 'Source Sans 3', sans-serif; font-weight: 600; font-size: 14px;
          padding: 11px 22px; letter-spacing: 0.03em; transition: all 0.18s;
          white-space: nowrap; text-decoration: none;
        }
        .btn-primary { background: var(--azul); color: var(--blanco); }
        .btn-primary:hover { background: var(--azul-medio); }
        .btn-success { background: #276749; color: var(--blanco); }
        .btn-success:hover { background: #22543d; }
        .btn-outline { background: var(--blanco); color: var(--azul); border: 1.5px solid var(--azul); }
        .btn-outline:hover { background: var(--azul); color: var(--blanco); }

        /* Loading / Error */
        .state-card {
          background: var(--blanco); border: 1px solid var(--gris-borde);
          border-radius: 6px; padding: 60px 40px; text-align: center;
          box-shadow: var(--sombra); max-width: 520px; margin: 60px auto;
        }
        .state-icon { margin: 0 auto 20px; display: flex; justify-content: center; }
        .state-card h2 { font-family: 'EB Garamond', serif; font-size: 22px; color: var(--azul); margin-bottom: 8px; }
        .state-card p { font-size: 14px; color: var(--gris-texto); }

        .loading-pulse {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(0,45,110,0.1);
          display: flex; align-items: center; justify-content: center;
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.7; } }

        .error-icon { width: 56px; height: 56px; border-radius: 50%; background: #FFF5F5; display: flex; align-items: center; justify-content: center; color: var(--rojo); }

        /* IPFS */
        .ipfs-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--azul-claro); font-size: 13.5px; text-decoration: none;
          transition: color 0.15s;
        }
        .ipfs-link:hover { color: var(--azul); text-decoration: underline; }
        .hash-text { font-family: monospace; font-size: 11.5px; color: #A0AEC0; word-break: break-all; margin-top: 6px; }

        /* Footer */
        .gov-footer {
          background: var(--azul); color: rgba(255,255,255,0.55);
          font-size: 11.5px; text-align: center; padding: 20px 40px; letter-spacing: 0.04em;
        }
        .gov-footer-items { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; margin-bottom: 10px; }
        .gov-footer-item { display: flex; align-items: center; gap: 6px; }

        @media (max-width: 680px) {
          .vp-main { padding: 20px 16px 40px; }
          .header-inner { padding: 20px 16px; }
          .top-bar { padding: 6px 16px; }
          .cert-row { flex-direction: column; gap: 4px; }
          .cert-key { width: auto; }
          .actions-panel { flex-direction: column; }
        }
      `}</style>

      <div className="vp-app">
        <div className="top-bar">
          <IconShield size={13} />
          REPÚBLICA DOMINICANA &nbsp;|&nbsp; Jurisdicción Inmobiliaria &nbsp;|&nbsp; Verificación de Títulos
        </div>

        <header className="gov-header">
          <div className="header-inner">
            <div className="header-logo-box">
              <IconLayers size={46} />
            </div>
            <div className="header-text">
              <h1>Verificación de Títulos</h1>
              <p>República Dominicana</p>
            </div>
            <div className="header-accent" />
            <div className="header-badge">
              <IconBlockchain size={18} />
              <span>Blockchain Sepolia</span>
            </div>
          </div>
        </header>

        <main className="vp-main">
          {loading && (
            <div className="state-card">
              <div className="state-icon">
                <div className="loading-pulse">
                  <IconDatabase size={24} />
                </div>
              </div>
              <h2>Verificando título...</h2>
              <p>Consultando información desde la blockchain</p>
            </div>
          )}

          {!loading && error && (
            <div className="state-card">
              <div className="state-icon">
                <div className="error-icon"><IconAlertCircle size={28} /></div>
              </div>
              <h2 style={{ color: 'var(--rojo)' }}>Título no encontrado</h2>
              <p style={{ marginBottom: 24 }}>El título con ID #{id} no existe o no está registrado.</p>
              <Link to="/" className="btn btn-primary"><IconArrowLeft /> Volver al inicio</Link>
            </div>
          )}

          {!loading && !error && property && (
            <>
              {/* Banner de estado */}
              <div className={`cert-card`} style={{ marginBottom: 24 }}>
                <div className={`status-banner ${property.isVerified ? 'verified' : 'pending'}`}>
                  <div className="status-banner-icon">
                    {property.isVerified ? <IconCheck size={24} /> : <IconClock size={24} />}
                  </div>
                  <div className="status-banner-text">
                    <h2>{property.isVerified ? 'Título Verificado en Blockchain' : 'Pendiente de Verificación'}</h2>
                    <p>Contrato: {CONTRACT_ADDRESS.slice(0, 12)}...{CONTRACT_ADDRESS.slice(-10)} &nbsp;|&nbsp; Título #{property.id}</p>
                  </div>
                </div>
              </div>

              {/* Sección Título */}
              <div className="cert-card">
                <div className="cert-section-header">
                  <IconFile /> Información del Título
                </div>
                <div className="cert-body">
                  <div className="cert-row">
                    <span className="cert-key">ID del Título</span>
                    <span className="cert-val"><strong>#{property.id}</strong></span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Tipo de Operación</span>
                    <span className="cert-val">
                      <span className={`badge ${property.operationType === 'new' ? 'badge-new' : 'badge-transfer'}`}>
                        {property.operationType === 'new'
                          ? <><IconPlusCircle size={12} /> Registro Nuevo</>
                          : <><IconTransfer size={12} /> Traspaso</>
                        }
                      </span>
                    </span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Estado</span>
                    <span className="cert-val">
                      <span className={`badge ${property.isVerified ? 'badge-verified' : 'badge-pending'}`}>
                        {property.isVerified ? <><IconCheck size={12} /> Verificado</> : <><IconClock size={12} /> Pendiente</>}
                      </span>
                    </span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Parcela</span>
                    <span className="cert-val">{property.parcel}</span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Superficie</span>
                    <span className="cert-val">{property.area} m²</span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Distrito Catastral</span>
                    <span className="cert-val">{property.district || 'No especificado'}</span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Ubicación</span>
                    <span className="cert-val">{property.propertyLocation || 'No especificada'}</span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Fecha de Registro</span>
                    <span className="cert-val">{property.registrationDate || property.timestamp}</span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Timestamp Blockchain</span>
                    <span className="cert-val">{property.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Sección Propietario */}
              <div className="cert-card">
                <div className="cert-section-header">
                  <IconUser /> Propietario
                </div>
                <div className="cert-body">
                  <div className="cert-row">
                    <span className="cert-key">Nombre</span>
                    <span className="cert-val"><strong>{property.ownerName}</strong></span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Cédula</span>
                    <span className="cert-val">{property.ownerId}</span>
                  </div>
                  <div className="cert-row">
                    <span className="cert-key">Nacionalidad</span>
                    <span className="cert-val">{property.nationality || 'Dominicana'}</span>
                  </div>
                  {property.previousOwner && (
                    <div className="cert-row">
                      <span className="cert-key">Prop. Anterior</span>
                      <span className="cert-val">{property.previousOwner}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documento IPFS */}
              {property.ipfsHash && (
                <div className="cert-card">
                  <div className="cert-section-header">
                    <IconDatabase size={16} /> Documento Digital (IPFS)
                  </div>
                  <div className="cert-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
                    <p style={{ fontSize: 13.5, color: 'var(--gris-texto)', marginBottom: 12 }}>
                      El documento original está almacenado en IPFS (almacenamiento descentralizado e inmutable).
                    </p>
                    <a href={property.ipfsUrl} target="_blank" rel="noopener noreferrer" className="ipfs-link">
                      <IconLink size={14} /> Ver documento original en IPFS
                    </a>
                    <p className="hash-text">Hash IPFS: {property.ipfsHash}</p>
                  </div>
                </div>
              )}

              {/* QR + Acciones */}
              <div className="actions-panel">
                {qrCodeUrl && (
                  <div className="qr-box">
                    <img src={qrCodeUrl} alt="QR de verificación" style={{ width: 140, height: 140 }} />
                    <small>Código QR de verificación</small>
                  </div>
                )}
                <div className="actions-text">
                  <h3>Verificación Oficial</h3>
                  <p>Este certificado ha sido registrado de forma permanente e inmutable en la blockchain de Ethereum. El código QR confirma la autenticidad del título.</p>
                </div>
                <div className="actions-btns">
                  <button onClick={downloadCertificate} className="btn btn-success">
                    <IconDownload /> Descargar Certificado
                  </button>
                  <Link to="/" className="btn btn-outline">
                    <IconArrowLeft /> Volver al inicio
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="gov-footer">
          <div className="gov-footer-items">
            <div className="gov-footer-item"><IconShield size={13} /> Blockchain Sepolia</div>
            <div className="gov-footer-item"><IconDatabase size={13} /> IPFS Descentralizado</div>
            <div className="gov-footer-item"><IconLink size={13} /> Verificación por QR</div>
          </div>
          <p>Jurisdicción Inmobiliaria &mdash; República Dominicana &mdash; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
}

export default VerifyPage;