import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import contractABI from './contractABI.json';
import QRCode from 'qrcode';

const CONTRACT_ADDRESS = "0x393738f1201C6A9Aef64d663F5F882e65b9B8939";
const PINATA_API_KEY = "fae0d0391c853f60f755";
const PINATA_SECRET_KEY = "cd9cf2f7261da66619986a891d4e90eaae04267eb95693d6f930b178b39666b2";

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M16 12h2"/>
    <path d="M2 10h20"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="1"/>
    <path d="M9 22V12h6v10"/>
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
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const IconTransfer = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 1 4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="m7 23-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconPlusCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8"/><path d="M8 12h8"/>
  </svg>
);
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [propertyData, setPropertyData] = useState(null);
  const [propertyId, setPropertyId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [operationType, setOperationType] = useState('new');

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerId: '',
    nationality: 'Dominicana',
    propertyLocation: '',
    district: '',
    parcel: '',
    area: '',
    registrationDate: '',
    previousOwner: ''
  });

  const handleOperationChange = (type) => {
    setOperationType(type);
    if (type === 'new') setFormData(prev => ({ ...prev, previousOwner: '' }));
  };

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
      console.error('Error:', error);
      alert('Error al subir el archivo a IPFS');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const generateQRCode = async (propertyId) => {
    try {
      const verifyUrl = `${window.location.origin}/verify/${propertyId}`;
      const qrUrl = await QRCode.toDataURL(verifyUrl, { errorCorrectionLevel: 'H', margin: 1, width: 200 });
      setQrCodeUrl(qrUrl);
      return qrUrl;
    } catch (error) {
      console.error('Error generando QR:', error);
      return '';
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        setContract(contractInstance);
        const total = await contractInstance.getTotalProperties();
        setTotalProperties(Number(total));
      } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con MetaMask");
      } finally {
        setLoading(false);
      }
    } else {
      alert("¡Instala MetaMask!");
    }
  };

  const registerProperty = async (e) => {
    e.preventDefault();
    if (!contract) { alert("Conecta tu wallet primero"); return; }
    if (!formData.ownerName || !formData.ownerId || !formData.parcel || !formData.area) {
      alert("Por favor completa los campos obligatorios: Propietario, Cédula, Parcela y Superficie");
      return;
    }
    if (operationType === 'transfer' && !formData.previousOwner) {
      alert("Para un traspaso, debes especificar el propietario anterior");
      return;
    }
    let ipfsHash = '';
    if (selectedFile) {
      ipfsHash = await uploadToIPFS(selectedFile);
      if (!ipfsHash) return;
    }
    const metadata = JSON.stringify({
      operationType,
      nationality: formData.nationality,
      district: formData.district,
      location: formData.propertyLocation,
      registrationDate: formData.registrationDate,
      previousOwner: operationType === 'transfer' ? formData.previousOwner : "",
      qrCode: ""
    });
    try {
      setLoading(true);
      const tx = await contract.registerProperty(formData.ownerName, formData.ownerId, formData.parcel, formData.area, ipfsHash, metadata);
      await tx.wait();
      alert(operationType === 'new' ? "¡Título registrado exitosamente!" : "¡Traspaso registrado exitosamente!");
      const total = await contract.getTotalProperties();
      setTotalProperties(Number(total));
      await generateQRCode(total);
      setFormData({ ownerName: '', ownerId: '', nationality: 'Dominicana', propertyLocation: '', district: '', parcel: '', area: '', registrationDate: '', previousOwner: '' });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProperty = async (e) => {
    e.preventDefault();
    if (!contract) return;
    if (!propertyId || propertyId <= 0) { alert("Ingresa un ID válido"); return; }
    try {
      setLoading(true);
      const result = await contract.getProperty(propertyId);
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
      setPropertyData(propertyInfo);
      await generateQRCode(propertyInfo.id);
    } catch (error) {
      console.error("Error:", error);
      alert("Propiedad no encontrada. Verifica el ID.");
      setPropertyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
          --oro: #B8952A;
          --gris-claro: #F4F5F7;
          --gris-borde: #D8DCE4;
          --gris-texto: #4A5568;
          --blanco: #FFFFFF;
          --sombra: 0 2px 8px rgba(0,45,110,0.10);
          --sombra-lg: 0 4px 20px rgba(0,45,110,0.14);
        }
        body { background: var(--gris-claro); font-family: 'Source Sans 3', sans-serif; color: #1A202C; }

        .gov-app { min-height: 100vh; display: flex; flex-direction: column; }

        /* ── Barra superior ── */
        .top-bar {
          background: #001a42;
          padding: 6px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 11.5px;
          color: rgba(255,255,255,0.60);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .top-bar svg { opacity: 0.6; }

        /* ── Header institucional ── */
        .gov-header {
          background: #002868;
          padding: 0;
          border-bottom: 4px solid #CE1126;
        }
        .header-inner {
          width: 100%;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .header-logo-box {
          color: rgba(255,255,255,0.90);
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .header-text h1 {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 22px; font-weight: 600;
          color: var(--blanco);
          letter-spacing: 0.01em;
          line-height: 1.15;
          margin: 0;
        }
        .header-text p {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.02em;
          margin-top: 3px;
        }
        .header-accent { flex: 1; }
        .header-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px;
          padding: 8px 18px;
          font-size: 14px;
          color: rgba(255,255,255,0.90);
          letter-spacing: 0.02em;
        }
        .header-badge strong { font-weight: 700; color: var(--blanco); }

        /* ── Nav breadcrumb ── */
        .gov-nav {
          background: var(--blanco);
          border-bottom: 1px solid var(--gris-borde);
          padding: 10px 32px;
        }
        .gov-nav-inner {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--gris-texto);
        }
        .gov-nav-inner a { color: var(--azul-claro); text-decoration: none; }
        .gov-nav-inner span { color: #A0AEC0; }

        /* ── Main layout ── */
        .gov-main { width: 100%; padding: 32px 180px 60px; flex: 1; }

        /* ── Wallet panel ── */
        .wallet-panel {
          background: var(--blanco);
          border: 1px solid var(--gris-borde);
          border-radius: 6px;
          padding: 18px 24px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--sombra);
        }
        .wallet-label { font-size: 13px; color: var(--gris-texto); letter-spacing: 0.04em; text-transform: uppercase; }
        .wallet-info { display: flex; align-items: center; gap: 20px; }
        .wallet-stat { text-align: center; }
        .wallet-stat span { display: block; font-size: 11px; color: #A0AEC0; letter-spacing: 0.05em; text-transform: uppercase; }
        .wallet-stat strong { font-size: 18px; color: var(--azul); font-weight: 700; }
        .wallet-address {
          display: flex; align-items: center; gap: 8px;
          background: #EBF4FF; border: 1px solid #BEE3F8;
          border-radius: 4px; padding: 6px 12px;
          font-size: 13px; color: var(--azul-claro); font-family: monospace;
        }
        .divider-v { width: 1px; height: 30px; background: var(--gris-borde); }

        /* ── Botones ── */
        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          border: none; border-radius: 4px; cursor: pointer;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 600; letter-spacing: 0.03em;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-primary {
          background: var(--azul); color: var(--blanco);
          padding: 11px 22px; font-size: 14px;
        }
        .btn-primary:hover:not(:disabled) { background: var(--azul-medio); }
        .btn-danger {
          background: var(--rojo); color: var(--blanco);
          padding: 11px 22px; font-size: 14px;
        }
        .btn-danger:hover:not(:disabled) { background: var(--rojo-oscuro); }
        .btn-outline {
          background: var(--blanco); color: var(--azul);
          border: 1.5px solid var(--azul);
          padding: 10px 20px; font-size: 14px;
        }
        .btn-outline:hover:not(:disabled) { background: var(--azul); color: var(--blanco); }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
        .btn-full { width: 100%; justify-content: center; }

        /* ── Cards de sección ── */
        .section-card {
          background: var(--blanco);
          border: 1px solid var(--gris-borde);
          border-radius: 6px;
          margin-bottom: 28px;
          box-shadow: var(--sombra);
          overflow: hidden;
        }
        .section-header {
          background: var(--azul);
          padding: 14px 24px;
          display: flex; align-items: center; gap: 10px;
          color: var(--blanco);
        }
        .section-header h2 {
          font-family: 'EB Garamond', serif;
          font-size: 17px; font-weight: 500;
          letter-spacing: 0.04em;
        }
        .section-body { padding: 28px 24px; }

        /* ── Selector tipo operación ── */
        .op-selector { display: flex; gap: 0; margin-bottom: 24px; border: 1.5px solid var(--gris-borde); border-radius: 5px; overflow: hidden; }
        .op-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 16px; border: none; cursor: pointer; font-size: 13.5px; font-weight: 600;
          font-family: 'Source Sans 3', sans-serif; transition: all 0.18s;
          letter-spacing: 0.02em;
        }
        .op-btn-new { background: #EBF4FF; color: var(--azul); }
        .op-btn-new.active { background: var(--azul); color: var(--blanco); }
        .op-btn-transfer { background: #FFF5F5; color: var(--rojo); border-left: 1.5px solid var(--gris-borde); }
        .op-btn-transfer.active { background: var(--rojo); color: var(--blanco); }

        .op-notice {
          padding: 10px 16px; border-radius: 4px; font-size: 13px;
          margin-bottom: 24px; display: flex; align-items: center; gap: 8px;
        }
        .op-notice-new { background: #EBF4FF; border-left: 4px solid var(--azul); color: var(--azul); }
        .op-notice-transfer { background: #FFF5F5; border-left: 4px solid var(--rojo); color: var(--rojo-oscuro); }

        /* ── Formulario ── */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 24px;
        }
        .form-group { display: flex; flex-direction: column; }
        .form-label {
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--gris-texto); margin-bottom: 6px;
        }
        .form-label .req { color: var(--rojo); margin-left: 3px; }
        .form-control {
          width: 100%; padding: 10px 12px;
          border: 1.5px solid var(--gris-borde); border-radius: 4px;
          font-family: 'Source Sans 3', sans-serif; font-size: 14px;
          color: #1A202C; background: var(--blanco);
          transition: border-color 0.15s;
          outline: none;
        }
        .form-control:focus { border-color: var(--azul-claro); box-shadow: 0 0 0 3px rgba(21,101,192,0.10); }
        .form-control::placeholder { color: #A0AEC0; }
        .form-hint { font-size: 11.5px; color: #A0AEC0; margin-top: 5px; }

        /* ── File input ── */
        .file-label {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border: 1.5px dashed var(--gris-borde);
          border-radius: 4px; cursor: pointer; font-size: 13.5px;
          color: var(--gris-texto); background: var(--gris-claro);
          transition: border-color 0.15s;
        }
        .file-label:hover { border-color: var(--azul-claro); color: var(--azul); }
        .file-selected { color: #276749; font-size: 12.5px; margin-top: 5px; display: flex; align-items: center; gap: 5px; }

        /* ── Resultado consulta ── */
        .result-card {
          margin-top: 24px;
          border: 1.5px solid #BEE3F8;
          border-radius: 6px;
          overflow: hidden;
        }
        .result-header {
          background: #EBF4FF;
          padding: 12px 20px;
          display: flex; align-items: center; gap: 10px;
          border-bottom: 1px solid #BEE3F8;
        }
        .result-header h3 { font-size: 15px; font-weight: 700; color: var(--azul); font-family: 'EB Garamond', serif; font-size: 17px; }
        .result-body { padding: 20px; display: flex; gap: 28px; flex-wrap: wrap; }
        .result-fields { flex: 1; min-width: 260px; }
        .result-row {
          display: flex; padding: 8px 0;
          border-bottom: 1px solid #F0F4F8; font-size: 13.5px;
        }
        .result-row:last-child { border-bottom: none; }
        .result-key { width: 170px; flex-shrink: 0; color: var(--gris-texto); font-weight: 600; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.04em; padding-top: 1px; }
        .result-val { color: #1A202C; }
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 3px; font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .badge-verified { background: #C6F6D5; color: #276749; }
        .badge-pending { background: #FEEBC8; color: #744210; }
        .badge-new { background: #EBF4FF; color: var(--azul); }
        .badge-transfer { background: #FFF5F5; color: var(--rojo-oscuro); }

        .qr-panel { text-align: center; padding: 12px; }
        .qr-panel img { border: 1.5px solid var(--gris-borde); border-radius: 4px; display: block; margin: 0 auto 8px; }
        .qr-panel small { font-size: 11px; color: #A0AEC0; letter-spacing: 0.04em; text-transform: uppercase; }

        /* ── Barra búsqueda ── */
        .search-bar { display: flex; gap: 10px; }
        .search-bar .form-control { flex: 1; }

        /* ── Footer ── */
        .gov-footer {
          background: var(--azul);
          color: rgba(255,255,255,0.55);
          font-size: 11.5px;
          text-align: center;
          padding: 20px 32px;
          letter-spacing: 0.04em;
        }
        .gov-footer p + p { margin-top: 4px; }
        .gov-footer-items { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; }
        .gov-footer-item { display: flex; align-items: center; gap: 6px; }

        @media (max-width: 700px) {
          .gov-main { padding: 20px 16px 40px; }
          .form-grid { grid-template-columns: 1fr; }
          .header-inner { padding: 20px 16px; }
          .wallet-panel { flex-direction: column; align-items: flex-start; gap: 14px; }
          .top-bar, .gov-nav { padding-left: 16px; padding-right: 16px; }
        }
      `}</style>

      <div className="gov-app">
        {/* Barra superior */}
        <div className="top-bar">
          <IconShield />
          REPÚBLICA DOMINICANA &nbsp;|&nbsp; Jurisdicción Inmobiliaria &nbsp;|&nbsp; Registro de Títulos
        </div>

        {/* Header */}
        <header className="gov-header">
          <div className="header-inner">
            <div className="header-logo-box">
              <IconLayers size={46} />
            </div>
            <div className="header-text">
              <h1>Registro de Títulos</h1>
              <p>República Dominicana</p>
            </div>
            <div className="header-accent" />
            <div className="header-badge">
              <IconBlockchain size={18} />
              <span>Blockchain Sepolia</span>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="gov-nav">
          <div className="gov-nav-inner">
            <a href="#">Inicio</a>
            <span>/</span>
            <a href="#">Jurisdicción Inmobiliaria</a>
            <span>/</span>
            <span>Registro de Títulos</span>
          </div>
        </nav>

        {/* Main */}
        <main className="gov-main">

          {/* Panel Wallet */}
          <div className="wallet-panel">
            <div>
              <div className="wallet-label">Autenticación Blockchain</div>
              {account
                ? <div style={{ fontSize: 13, color: '#276749', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><IconCheck /> Sesión activa en red Sepolia</div>
                : <div style={{ fontSize: 13, color: '#A0AEC0', marginTop: 4 }}>Conecte su billetera digital para operar</div>
              }
            </div>
            {account ? (
              <div className="wallet-info">
                <div className="wallet-stat">
                  <span>Propiedades</span>
                  <strong>{totalProperties}</strong>
                </div>
                <div className="divider-v" />
                <div className="wallet-address">
                  <IconUser />
                  {account.slice(0, 8)}...{account.slice(-6)}
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={connectWallet} disabled={loading}>
                <IconWallet />
                {loading ? "Conectando..." : "Conectar MetaMask"}
              </button>
            )}
          </div>

          {account && (
            <>
              {/* ── Registro ── */}
              <div className="section-card">
                <div className="section-header">
                  <IconClipboard />
                  <h2>Registro de Título de Propiedad</h2>
                </div>
                <div className="section-body">

                  {/* Tipo de operación */}
                  <div className="op-selector">
                    <button
                      type="button"
                      className={`op-btn op-btn-new${operationType === 'new' ? ' active' : ''}`}
                      onClick={() => handleOperationChange('new')}
                    >
                      <IconPlusCircle /> Registro Nuevo
                    </button>
                    <button
                      type="button"
                      className={`op-btn op-btn-transfer${operationType === 'transfer' ? ' active' : ''}`}
                      onClick={() => handleOperationChange('transfer')}
                    >
                      <IconTransfer /> Traspaso de Título
                    </button>
                  </div>

                  <div className={`op-notice ${operationType === 'new' ? 'op-notice-new' : 'op-notice-transfer'}`}>
                    {operationType === 'new'
                      ? <><IconBuilding /> Registrando un <strong>título nuevo</strong> sin propietario anterior.</>
                      : <><IconTransfer /> Realizando un <strong>traspaso</strong>. Se requiere el propietario anterior.</>
                    }
                  </div>

                  <form onSubmit={registerProperty}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Nombre del Propietario<span className="req">*</span></label>
                        <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} required className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cédula<span className="req">*</span></label>
                        <input type="text" name="ownerId" value={formData.ownerId} onChange={handleInputChange} placeholder="001-01-00001" required className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nacionalidad</label>
                        <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="form-control" />
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
                        <input type="text" name="parcel" value={formData.parcel} onChange={handleInputChange} placeholder="Parcela ______" required className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Superficie (m²)<span className="req">*</span></label>
                        <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="260.17" required className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Fecha de Registro</label>
                        <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleInputChange} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Propietario Anterior
                          {operationType === 'transfer' && <span className="req">*</span>}
                        </label>
                        <input
                          type="text"
                          name="previousOwner"
                          value={formData.previousOwner}
                          onChange={handleInputChange}
                          placeholder={operationType === 'transfer' ? "Nombre del propietario anterior" : "Solo para traspasos"}
                          required={operationType === 'transfer'}
                          className="form-control"
                        />
                        {operationType === 'new' && <div className="form-hint">Campo opcional para registros nuevos.</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Documento adjunto (PDF/Imagen)</label>
                        <label className="file-label">
                          <IconUpload />
                          {selectedFile ? selectedFile.name : "Seleccionar archivo..."}
                          <input type="file" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                        </label>
                        {selectedFile && (
                          <div className="file-selected">
                            <IconFile /> {selectedFile.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="submit" className={`btn btn-full ${operationType === 'new' ? 'btn-primary' : 'btn-danger'}`} disabled={loading || uploading}>
                      {uploading
                        ? <><IconUpload /> Subiendo documento...</>
                        : loading
                          ? "Procesando transacción..."
                          : operationType === 'new'
                            ? <><IconPlusCircle /> Registrar Nuevo Título</>
                            : <><IconTransfer /> Registrar Traspaso</>
                      }
                    </button>
                  </form>
                </div>
              </div>

              {/* ── Consulta ── */}
              <div className="section-card">
                <div className="section-header">
                  <IconSearch />
                  <h2>Consulta de Título por ID</h2>
                </div>
                <div className="section-body">
                  <form onSubmit={getProperty} className="search-bar">
                    <input
                      type="number"
                      placeholder="Ingrese el ID del título"
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className="form-control"
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                      <IconSearch />
                      {loading ? "Buscando..." : "Consultar"}
                    </button>
                  </form>

                  {propertyData && (
                    <div className="result-card">
                      <div className="result-header">
                        <IconFile />
                        <h3>Título #{propertyData.id}</h3>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                          <span className={`badge ${propertyData.isVerified ? 'badge-verified' : 'badge-pending'}`}>
                            {propertyData.isVerified ? <><IconCheck /> Verificado</> : 'Pendiente'}
                          </span>
                          <span className={`badge ${propertyData.operationType === 'new' ? 'badge-new' : 'badge-transfer'}`}>
                            {propertyData.operationType === 'new' ? <><IconPlusCircle /> Nuevo</> : <><IconTransfer /> Traspaso</>}
                          </span>
                        </div>
                      </div>
                      <div className="result-body">
                        <div className="result-fields">
                          {[
                            ['Propietario', propertyData.ownerName],
                            ['Cédula', propertyData.ownerId],
                            ['Nacionalidad', propertyData.nationality || 'N/A'],
                            ['Ubicación', propertyData.propertyLocation || 'N/A'],
                            ['Distrito Catastral', propertyData.district || 'N/A'],
                            ['Parcela', propertyData.parcel],
                            ['Superficie', `${propertyData.area} m²`],
                            ['Fecha Registro', propertyData.registrationDate || 'N/A'],
                            ['Prop. Anterior', propertyData.previousOwner || 'N/A'],
                            ['Timestamp Blockchain', propertyData.timestamp],
                          ].map(([k, v]) => (
                            <div className="result-row" key={k}>
                              <span className="result-key">{k}</span>
                              <span className="result-val">{v}</span>
                            </div>
                          ))}
                          {propertyData.ipfsHash && (
                            <div className="result-row">
                              <span className="result-key">Documento</span>
                              <a href={propertyData.ipfsUrl} target="_blank" rel="noopener noreferrer"
                                style={{ color: 'var(--azul-claro)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                                <IconLink /> Ver en IPFS
                              </a>
                            </div>
                          )}
                        </div>
                        {qrCodeUrl && (
                          <div className="qr-panel">
                            <img src={qrCodeUrl} alt="QR Code" style={{ width: 130, height: 130 }} />
                            <small>Escanear para verificar</small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="gov-footer">
          <div className="gov-footer-items" style={{ marginBottom: 10 }}>
            <div className="gov-footer-item"><IconShield /> Registros inmutables en Blockchain Sepolia</div>
            <div className="gov-footer-item"><IconDatabase /> Documentos en IPFS descentralizado</div>
            <div className="gov-footer-item"><IconLink /> Verificación mediante código QR</div>
          </div>
          <p>Jurisdicción Inmobiliaria &mdash; República Dominicana &mdash; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
}

export default App;