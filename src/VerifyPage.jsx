import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams, Link, useNavigate } from 'react-router-dom';
import contractABI from './contractABI.json';
import QRCode from 'qrcode';

const CONTRACT_ADDRESS = "0xC5117F33935DcFEB2Ef59aa8743F12F5E3b8a8c9";
const SEPOLIA_RPC = 'https://ethereum-sepolia.publicnode.com';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
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
const IconHistory = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
    <path d="M12 7v5l4 2"/>
  </svg>
);
const IconSearch = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconAlertCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconHash = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const IconChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
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
    ipfsUrl: result[6] ? `https://gateway.pinata.cloud/ipfs/${result[6]}` : ''
  };
};

// ─── Componente: Card resumen en lista de múltiples títulos ───────────────────
function PropertySummaryCard({ prop, onSelect }) {
  return (
    <div className="summary-card" onClick={() => onSelect(prop.id)}>
      <div className="summary-left">
        <div className="summary-matricula">{prop.matricula}</div>
        <div className="summary-parcel">Parcela: {prop.parcel} &nbsp;·&nbsp; {prop.area} m²</div>
        <div className="summary-location">{prop.propertyLocation || 'Ubicación no especificada'} {prop.district ? `— ${prop.district}` : ''}</div>
      </div>
      <div className="summary-right">
        <span className={`badge ${prop.isVerified ? 'badge-verified' : 'badge-pending'}`}>
          {prop.isVerified ? <><IconCheck size={11} /> Verificado</> : <><IconClock size={11} /> Pendiente</>}
        </span>
        <IconChevronRight size={18} />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
function VerifyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado búsqueda
  const [searchType, setSearchType] = useState('matricula');
  const [searchVal, setSearchVal]   = useState('');
  const [searching, setSearching]   = useState(false);

  // Resultados
  const [multipleResults, setMultipleResults] = useState([]); // lista de props (búsqueda nombre/cédula)
  const [property, setProperty]   = useState(null);           // prop seleccionada / única
  const [history,  setHistory]    = useState([]);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [contract, setContract]   = useState(null);

  // Inicializar contrato público
  useEffect(() => {
    const init = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        const c = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        setContract(c);
      } catch (e) { console.error('Error inicializando contrato:', e); }
    };
    init();
  }, []);

  // Si viene con ID en la URL, cargar automáticamente
  useEffect(() => {
    if (id && contract) loadPropertyById(Number(id));
  }, [id, contract]);

  const loadPropertyById = async (numId) => {
    try {
      setLoading(true);
      setError(null);
      setMultipleResults([]);

      const result = await contract.getProperty(numId);
      const info = parseProperty(result);
      setProperty(info);

      // Historial
      try {
        const hist = await contract.getOwnershipHistory(numId);
        const formatted = hist[0].map((name, i) => {
          let noteText = '';
          if (hist[3][i] && hist[3][i] !== 'Registro inicial') {
            try {
              const m = JSON.parse(hist[3][i]);
              noteText = m.nota || '';
            } catch (e) { noteText = hist[3][i]; }
          }
          return {
            ownerName: name, ownerId: hist[1][i],
            timestamp: new Date(Number(hist[2][i]) * 1000).toLocaleString(),
            note: i === 0 ? 'Registro inicial' : (noteText || 'Traspaso de propiedad'),
            isFirst: i === 0
          };
        });
        setHistory(formatted);
      } catch (e) { setHistory([]); }

      const qr = await QRCode.toDataURL(
        `${window.location.origin}/verify/${numId}`,
        { errorCorrectionLevel: 'H', margin: 1, width: 200 }
      );
      setQrCodeUrl(qr);

    } catch (err) {
      setError('Título no encontrado o ID inválido');
      setProperty(null);
    } finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!contract || !searchVal.trim()) return;
    const val = searchVal.trim();

    try {
      setSearching(true);
      setError(null);
      setProperty(null);
      setMultipleResults([]);
      setHistory([]);
      setQrCodeUrl('');

      if (searchType === 'matricula') {
        const numId = await contract.getPropertyByMatricula(val);
        if (Number(numId) === 0) { setError('No se encontró ningún título con esa matrícula.'); return; }
        await loadPropertyById(Number(numId));

      } else if (searchType === 'cedula') {
        const ids = await contract.getPropertiesByOwnerId(val);
        if (!ids || ids.length === 0) { setError('No se encontraron títulos para esa cédula.'); return; }
        if (ids.length === 1) {
          await loadPropertyById(Number(ids[0]));
        } else {
          // Múltiples títulos — cargar resumen de cada uno
          const props = await Promise.all(ids.map(async (rawId) => {
            const r = await contract.getProperty(Number(rawId));
            return parseProperty(r);
          }));
          setMultipleResults(props);
        }

      } else if (searchType === 'nombre') {
        const ids = await contract.getPropertiesByOwnerName(val);
        if (!ids || ids.length === 0) { setError('No se encontraron títulos para ese nombre.'); return; }
        if (ids.length === 1) {
          await loadPropertyById(Number(ids[0]));
        } else {
          const props = await Promise.all(ids.map(async (rawId) => {
            const r = await contract.getProperty(Number(rawId));
            return parseProperty(r);
          }));
          setMultipleResults(props);
        }

      } else if (searchType === 'ipfs') {
        const numId = await contract.getPropertyByIpfsHash(val);
        if (Number(numId) === 0) { setError('No se encontró ningún título con ese hash IPFS.'); return; }
        await loadPropertyById(Number(numId));
      }

    } catch (err) {
      console.error(err);
      setError('Error al realizar la búsqueda. Verifique el dato ingresado.');
    } finally { setSearching(false); }
  };

  const downloadCertificate = () => {
    if (!property) return;
    const historyRows = history.map((h, i) => `
      <div class="field">
        <span class="field-label">${i === 0 ? 'Registro inicial' : `Traspaso #${i}`}</span>
        <span class="field-value">${h.ownerName} — ${h.ownerId} — ${h.timestamp}</span>
      </div>`).join('');

    const html = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>Certificado — ${property.matricula}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap');
    body { font-family: 'Source Sans 3', Arial, sans-serif; padding: 48px; max-width: 820px; margin: 0 auto; color: #1A202C; }
    .header { text-align: center; border-top: 8px solid #002868; border-bottom: 3px solid #CE1126; padding: 28px 0 20px; margin-bottom: 36px; }
    .gov-title { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #002868; margin-bottom: 8px; }
    .cert-title { font-size: 26px; font-weight: 700; color: #002868; margin: 8px 0; }
    .cert-sub { font-size: 12px; color: #7f8c8d; letter-spacing: 0.06em; text-transform: uppercase; }
    .matricula-box { display: inline-block; margin-top: 14px; padding: 8px 24px; background: #002868; color: white; border-radius: 4px; font-size: 18px; font-weight: 700; letter-spacing: 0.08em; font-family: monospace; }
    .status-badge { display: inline-block; margin-top: 10px; padding: 6px 18px; border-radius: 3px; font-size: 12px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; background: ${property.isVerified ? '#C6F6D5' : '#FEEBC8'}; color: ${property.isVerified ? '#276749' : '#744210'}; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #002868; border-bottom: 2px solid #002868; padding-bottom: 6px; margin: 28px 0 14px; }
    .field { display: flex; padding: 9px 0; border-bottom: 1px solid #EDF2F7; font-size: 13.5px; }
    .field-label { width: 200px; flex-shrink: 0; font-weight: 700; color: #4A5568; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    .field-value { color: #1A202C; }
    .qr-section { text-align: center; margin: 32px 0; padding: 24px; border: 1.5px solid #E2E8F0; border-radius: 6px; }
    .qr-section img { width: 130px; height: 130px; }
    .qr-section p { font-size: 11.5px; color: #718096; margin-top: 10px; letter-spacing: 0.04em; text-transform: uppercase; }
    .footer { margin-top: 40px; text-align: center; font-size: 11.5px; color: #A0AEC0; border-top: 1px solid #E2E8F0; padding-top: 20px; }
    .footer p + p { margin-top: 4px; }
  </style>
</head><body>
  <div class="header">
    <div class="gov-title">República Dominicana — Jurisdicción Inmobiliaria</div>
    <div class="cert-title">Certificado de Título de Propiedad</div>
    <div class="cert-sub">Registro inmutable en Blockchain — Red Sepolia</div>
    <div class="matricula-box">${property.matricula}</div><br/>
    <div class="status-badge">${property.isVerified ? 'Verificado en Blockchain' : 'Pendiente de Verificación'}</div>
  </div>
  <div class="section-title">Información del Título</div>
  <div class="field"><span class="field-label">Matrícula</span><span class="field-value">${property.matricula}</span></div>
  <div class="field"><span class="field-label">Parcela</span><span class="field-value">${property.parcel}</span></div>
  <div class="field"><span class="field-label">Superficie</span><span class="field-value">${property.area} m²</span></div>
  <div class="field"><span class="field-label">Distrito Catastral</span><span class="field-value">${property.district || 'No especificado'}</span></div>
  <div class="field"><span class="field-label">Ubicación</span><span class="field-value">${property.propertyLocation || 'No especificada'}</span></div>
  <div class="field"><span class="field-label">Fecha de Registro</span><span class="field-value">${property.registrationDate || property.timestamp}</span></div>
  <div class="field"><span class="field-label">Timestamp Blockchain</span><span class="field-value">${property.timestamp}</span></div>
  <div class="section-title">Propietario Actual</div>
  <div class="field"><span class="field-label">Nombre</span><span class="field-value">${property.ownerName}</span></div>
  <div class="field"><span class="field-label">Cédula</span><span class="field-value">${property.ownerId}</span></div>
  <div class="field"><span class="field-label">Nacionalidad</span><span class="field-value">${property.nationality || 'Dominicana'}</span></div>
  ${history.length > 0 ? `<div class="section-title">Historial de Propietarios</div>${historyRows}` : ''}
  <div class="section-title">Datos Blockchain</div>
  <div class="field"><span class="field-label">Contrato</span><span class="field-value" style="font-family:monospace;font-size:12px">${CONTRACT_ADDRESS}</span></div>
  <div class="qr-section">
    <img src="${qrCodeUrl}" alt="QR" />
    <p>Escanee para verificar la autenticidad del título</p>
  </div>
  <div class="footer">
    <p>Este certificado fue registrado en la blockchain de Ethereum (Red Sepolia).</p>
    <p>Verificación: ${window.location.origin}/verify/${property.id}</p>
    <p>Emisión: ${new Date().toLocaleString()}</p>
  </div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `Certificado_${property.matricula}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const placeholders = {
    matricula: 'RD-240105-0001',
    cedula:    '001-01-00001',
    nombre:    'Juan Pérez',
    ipfs:      'QmXoypiz...',
  };

  const searchTabs = [
    { key: 'matricula', label: 'Matrícula',  icon: <IconHash size={14} /> },
    { key: 'cedula',    label: 'Cédula',     icon: <IconUser size={14} /> },
    { key: 'nombre',    label: 'Nombre',     icon: <IconUser size={14} /> },
    { key: 'ipfs',      label: 'Hash IPFS',  icon: <IconDatabase size={14} /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --azul: #002D6E; --azul-medio: #0048A4; --azul-claro: #1565C0;
          --rojo: #C8102E; --rojo-oscuro: #9B0E24;
          --gris-claro: #F4F5F7; --gris-borde: #D8DCE4; --gris-texto: #4A5568;
          --blanco: #FFFFFF;
          --sombra: 0 2px 8px rgba(0,45,110,0.10);
          --sombra-lg: 0 8px 32px rgba(0,45,110,0.14);
        }
        body { background: var(--gris-claro); font-family: 'Source Sans 3', sans-serif; color: #1A202C; }
        .vp-app { min-height: 100vh; display: flex; flex-direction: column; }

        .top-bar { background: #001a42; padding: 6px 32px; display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: rgba(255,255,255,0.60); letter-spacing: 0.05em; text-transform: uppercase; }
        .top-bar svg { opacity: 0.6; }
        .gov-header { background: #002868; padding: 0; border-bottom: 4px solid #CE1126; }
        .header-inner { width: 100%; padding: 20px 32px; display: flex; align-items: center; gap: 18px; }
        .header-logo-box { color: rgba(255,255,255,0.90); flex-shrink: 0; display: flex; align-items: center; }
        .header-text h1 { font-family: 'Source Sans 3', sans-serif; font-size: 22px; font-weight: 600; color: var(--blanco); margin: 0; }
        .header-text p { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 3px; }
        .header-accent { flex: 1; }
        .header-badge { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 8px 18px; font-size: 14px; color: rgba(255,255,255,0.90); }

        .vp-main { width: 100%; padding: 36px 32px 60px; flex: 1; }

        /* Buscador */
        .search-card { background: var(--blanco); border: 1px solid var(--gris-borde); border-radius: 6px; box-shadow: var(--sombra); overflow: hidden; margin-bottom: 28px; }
        .search-card-header { background: var(--azul); padding: 14px 24px; display: flex; align-items: center; gap: 10px; color: var(--blanco); }
        .search-card-header h2 { font-family: 'EB Garamond', serif; font-size: 17px; font-weight: 500; letter-spacing: 0.04em; }
        .search-card-body { padding: 24px; }
        .search-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .search-tab { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1.5px solid var(--gris-borde); border-radius: 4px; background: var(--blanco); font-size: 13px; font-family: 'Source Sans 3', sans-serif; cursor: pointer; color: var(--gris-texto); transition: all 0.15s; }
        .search-tab:hover { border-color: var(--azul-claro); color: var(--azul); }
        .search-tab.active { background: var(--azul); color: var(--blanco); border-color: var(--azul); }
        .search-bar { display: flex; gap: 10px; }
        .search-bar .form-control { flex: 1; }
        .form-control { width: 100%; padding: 10px 12px; border: 1.5px solid var(--gris-borde); border-radius: 4px; font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #1A202C; background: var(--blanco); transition: border-color 0.15s; outline: none; }
        .form-control:focus { border-color: var(--azul-claro); box-shadow: 0 0 0 3px rgba(21,101,192,0.10); }
        .form-control::placeholder { color: #A0AEC0; }
        .search-hint { font-size: 12px; color: #A0AEC0; margin-top: 10px; }

        /* Error */
        .error-notice { display: flex; align-items: center; gap: 10px; background: #FFF5F5; border: 1.5px solid #FEB2B2; border-radius: 6px; padding: 14px 18px; color: #C53030; font-size: 13.5px; margin-top: 16px; }

        /* Lista múltiples resultados */
        .multi-header { font-size: 13px; color: var(--gris-texto); margin: 20px 0 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
        .summary-card { display: flex; align-items: center; gap: 16px; background: var(--blanco); border: 1.5px solid var(--gris-borde); border-radius: 6px; padding: 14px 18px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; }
        .summary-card:hover { border-color: var(--azul-claro); box-shadow: 0 2px 12px rgba(0,45,110,0.10); }
        .summary-left { flex: 1; }
        .summary-matricula { font-family: monospace; font-size: 16px; font-weight: 700; color: var(--azul); letter-spacing: 0.06em; }
        .summary-parcel { font-size: 13px; color: var(--gris-texto); margin-top: 3px; }
        .summary-location { font-size: 12px; color: #A0AEC0; margin-top: 2px; }
        .summary-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

        /* Status banner */
        .status-banner { border-radius: 6px 6px 0 0; padding: 20px 28px; display: flex; align-items: center; gap: 14px; }
        .status-banner.verified { background: linear-gradient(90deg, #276749, #38a169); }
        .status-banner.pending  { background: linear-gradient(90deg, #744210, #c05621); }
        .status-banner-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; }
        .status-banner-text h2 { font-family: 'EB Garamond', serif; font-size: 20px; color: white; }
        .status-banner-text p { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 3px; }
        .matricula-display { font-family: monospace; font-size: 14px; font-weight: 700; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 3px; letter-spacing: 0.06em; margin-top: 6px; display: inline-block; }

        /* Cert cards */
        .cert-card { background: var(--blanco); border: 1px solid var(--gris-borde); border-radius: 6px; box-shadow: var(--sombra-lg); overflow: hidden; margin-bottom: 24px; }
        .cert-section-header { background: var(--azul); color: var(--blanco); padding: 12px 24px; display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
        .cert-body { padding: 0 24px; }
        .cert-row { display: flex; padding: 11px 0; border-bottom: 1px solid #F0F4F8; font-size: 13.5px; align-items: baseline; }
        .cert-row:last-child { border-bottom: none; }
        .cert-key { width: 190px; flex-shrink: 0; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gris-texto); }
        .cert-val { color: #1A202C; flex: 1; }

        /* Historial */
        .history-list { padding: 16px 24px; }
        .history-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #F0F4F8; }
        .history-item:last-child { border-bottom: none; }
        .history-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--azul); flex-shrink: 0; margin-top: 5px; }
        .history-dot.first { background: #276749; }
        .history-content { flex: 1; }
        .history-name { font-weight: 700; font-size: 14px; color: #1A202C; }
        .history-meta { font-size: 12px; color: var(--gris-texto); margin-top: 2px; }
        .history-note { font-size: 11.5px; color: #A0AEC0; margin-top: 3px; font-style: italic; }

        /* Badges */
        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 3px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .badge-verified { background: #C6F6D5; color: #276749; }
        .badge-pending  { background: #FEEBC8; color: #744210; }

        /* QR + acciones */
        .actions-panel { background: var(--blanco); border: 1px solid var(--gris-borde); border-radius: 6px; padding: 28px; display: flex; align-items: center; gap: 32px; flex-wrap: wrap; box-shadow: var(--sombra); }
        .qr-box { text-align: center; }
        .qr-box img { border: 1.5px solid var(--gris-borde); border-radius: 4px; display: block; }
        .qr-box small { font-size: 10.5px; color: #A0AEC0; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 8px; display: block; }
        .actions-text { flex: 1; min-width: 200px; }
        .actions-text h3 { font-family: 'EB Garamond', serif; font-size: 18px; color: var(--azul); margin-bottom: 6px; }
        .actions-text p { font-size: 13px; color: var(--gris-texto); line-height: 1.5; }
        .actions-btns { display: flex; flex-direction: column; gap: 10px; }

        /* Botones */
        .btn { display: inline-flex; align-items: center; gap: 8px; border: none; border-radius: 4px; cursor: pointer; font-family: 'Source Sans 3', sans-serif; font-weight: 600; font-size: 14px; padding: 11px 22px; letter-spacing: 0.03em; transition: all 0.18s; white-space: nowrap; text-decoration: none; }
        .btn-primary { background: var(--azul); color: var(--blanco); }
        .btn-primary:hover { background: var(--azul-medio); }
        .btn-success { background: #276749; color: var(--blanco); }
        .btn-success:hover { background: #22543d; }
        .btn-outline { background: var(--blanco); color: var(--azul); border: 1.5px solid var(--azul); }
        .btn-outline:hover { background: var(--azul); color: var(--blanco); }
        .btn-sm { padding: 8px 16px; font-size: 13px; }

        /* Loading */
        .state-card { background: var(--blanco); border: 1px solid var(--gris-borde); border-radius: 6px; padding: 60px 40px; text-align: center; box-shadow: var(--sombra); max-width: 520px; margin: 0 auto 28px; }
        .state-icon { margin: 0 auto 20px; display: flex; justify-content: center; }
        .state-card h2 { font-family: 'EB Garamond', serif; font-size: 22px; color: var(--azul); margin-bottom: 8px; }
        .state-card p { font-size: 14px; color: var(--gris-texto); }
        .loading-pulse { width: 56px; height: 56px; border-radius: 50%; background: rgba(0,45,110,0.1); display: flex; align-items: center; justify-content: center; animation: pulse 1.4s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.7; } }

        /* IPFS */
        .ipfs-link { display: inline-flex; align-items: center; gap: 6px; color: var(--azul-claro); font-size: 13.5px; text-decoration: none; }
        .ipfs-link:hover { color: var(--azul); text-decoration: underline; }
        .hash-text { font-family: monospace; font-size: 11.5px; color: #A0AEC0; word-break: break-all; margin-top: 6px; }

        /* Footer */
        .gov-footer { background: var(--azul); color: rgba(255,255,255,0.55); font-size: 11.5px; text-align: center; padding: 20px 32px; letter-spacing: 0.04em; }
        .gov-footer-items { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; margin-bottom: 10px; }
        .gov-footer-item { display: flex; align-items: center; gap: 6px; }

        @media (max-width: 680px) {
          .vp-main { padding: 20px 16px 40px; }
          .header-inner { padding: 20px 16px; }
          .top-bar { padding: 6px 16px; }
          .cert-row { flex-direction: column; gap: 4px; }
          .cert-key { width: auto; }
          .actions-panel { flex-direction: column; }
          .search-tabs { gap: 6px; }
        }
      `}</style>

      <div className="vp-app">
        <div className="top-bar">
          <IconShield size={13} />
          REPÚBLICA DOMINICANA &nbsp;|&nbsp; Jurisdicción Inmobiliaria &nbsp;|&nbsp; Verificación de Títulos
        </div>

        <header className="gov-header">
          <div className="header-inner">
            <div className="header-logo-box"><IconLayers size={46} /></div>
            <div className="header-text">
              <h1>Verificación de Títulos</h1>
              <p>República Dominicana</p>
            </div>
            <div className="header-accent" />
            <div className="header-badge"><IconBlockchain size={18} /><span>Blockchain Sepolia</span></div>
          </div>
        </header>

        <main className="vp-main">

          {/* Buscador siempre visible */}
          <div className="search-card">
            <div className="search-card-header"><IconSearch size={16} /><h2>Buscar Título de Propiedad</h2></div>
            <div className="search-card-body">
              <div className="search-tabs">
                {searchTabs.map(t => (
                  <button key={t.key} type="button"
                    className={`search-tab${searchType === t.key ? ' active' : ''}`}
                    onClick={() => { setSearchType(t.key); setProperty(null); setMultipleResults([]); setError(null); setSearchVal(''); }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="search-bar">
                <input type="text" placeholder={placeholders[searchType]}
                  value={searchVal} onChange={e => setSearchVal(e.target.value)} className="form-control" />
                <button type="submit" className="btn btn-primary btn-sm" disabled={searching || loading}>
                  <IconSearch size={15} /> {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </form>
              <div className="search-hint">
                {searchType === 'cedula' && 'Si el propietario tiene más de un título, aparecerán todos listados.'}
                {searchType === 'nombre' && 'La búsqueda por nombre no distingue mayúsculas. Si hay varios resultados, aparecerán listados.'}
                {searchType === 'matricula' && 'Formato de matrícula: RD-YYMMDD-XXXX (ej: RD-240105-0001)'}
                {searchType === 'ipfs' && 'Ingrese el hash IPFS completo del documento adjunto al título.'}
              </div>
              {error && (
                <div className="error-notice">
                  <IconAlertCircle size={18} /> {error}
                </div>
              )}
            </div>
          </div>

          {/* Cargando */}
          {(loading || searching) && (
            <div className="state-card">
              <div className="state-icon">
                <div className="loading-pulse"><IconDatabase size={24} /></div>
              </div>
              <h2>Consultando Blockchain...</h2>
              <p>Verificando información en la red Ethereum</p>
            </div>
          )}

          {/* Múltiples resultados */}
          {!loading && !searching && multipleResults.length > 1 && (
            <>
              <div className="multi-header">
                Se encontraron {multipleResults.length} títulos — Seleccione uno para ver el detalle completo
              </div>
              {multipleResults.map(p => (
                <PropertySummaryCard key={p.id} prop={p} onSelect={loadPropertyById} />
              ))}
            </>
          )}

          {/* Título único — detalle completo */}
          {!loading && !searching && property && (
            <>
              {/* Botón volver a lista si hay múltiples */}
              {multipleResults.length > 1 && (
                <button className="btn btn-outline" style={{ marginBottom: 16 }}
                  onClick={() => setProperty(null)}>
                  <IconArrowLeft /> Ver todos los títulos
                </button>
              )}

              {/* Banner estado */}
              <div className="cert-card" style={{ marginBottom: 24 }}>
                <div className={`status-banner ${property.isVerified ? 'verified' : 'pending'}`}>
                  <div className="status-banner-icon">
                    {property.isVerified ? <IconCheck size={24} /> : <IconClock size={24} />}
                  </div>
                  <div className="status-banner-text">
                    <h2>{property.isVerified ? 'Título Verificado en Blockchain' : 'Pendiente de Verificación Oficial'}</h2>
                    <div className="matricula-display">{property.matricula}</div>
                    <p style={{ marginTop: 6 }}>Contrato: {CONTRACT_ADDRESS.slice(0,12)}...{CONTRACT_ADDRESS.slice(-10)}</p>
                  </div>
                </div>
              </div>

              {/* Info título */}
              <div className="cert-card">
                <div className="cert-section-header"><IconFile size={16} /> Información del Título</div>
                <div className="cert-body">
                  {[
                    ['Matrícula',          property.matricula],
                    ['Estado',             <span className={`badge ${property.isVerified ? 'badge-verified' : 'badge-pending'}`}>
                                             {property.isVerified ? <><IconCheck size={12}/> Verificado</> : <><IconClock size={12}/> Pendiente</>}
                                           </span>],
                    ['Parcela',            property.parcel],
                    ['Superficie',         `${property.area} m²`],
                    ['Distrito Catastral', property.district || 'No especificado'],
                    ['Ubicación',          property.propertyLocation || 'No especificada'],
                    ['Fecha de Registro',  property.registrationDate || property.timestamp],
                    ['Timestamp Blockchain', property.timestamp],
                  ].map(([k, v]) => (
                    <div className="cert-row" key={k}>
                      <span className="cert-key">{k}</span>
                      <span className="cert-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Propietario */}
              <div className="cert-card">
                <div className="cert-section-header"><IconUser size={16} /> Propietario Actual</div>
                <div className="cert-body">
                  {[
                    ['Nombre',       <strong>{property.ownerName}</strong>],
                    ['Cédula',       property.ownerId],
                    ['Nacionalidad', property.nationality || 'Dominicana'],
                  ].map(([k, v]) => (
                    <div className="cert-row" key={k}>
                      <span className="cert-key">{k}</span>
                      <span className="cert-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial */}
              {history.length > 0 && (
                <div className="cert-card">
                  <div className="cert-section-header"><IconHistory size={16} /> Historial de Propietarios ({history.length})</div>
                  <div className="history-list">
                    {history.map((h, i) => (
                      <div className="history-item" key={i}>
                        <div className={`history-dot${h.isFirst ? ' first' : ''}`} />
                        <div className="history-content">
                          <div className="history-name">{h.ownerName}</div>
                          <div className="history-meta">Cédula: {h.ownerId} &nbsp;|&nbsp; {h.timestamp}</div>
                          {h.note && <div className="history-note">{h.note}</div>}
                        </div>
                        {h.isFirst && <span className="badge badge-verified" style={{ alignSelf: 'flex-start' }}>Registro inicial</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IPFS */}
              {property.ipfsHash && (
                <div className="cert-card">
                  <div className="cert-section-header"><IconDatabase size={16} /> Documento Digital (IPFS)</div>
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
                    <img src={qrCodeUrl} alt="QR" style={{ width: 140, height: 140 }} />
                    <small>Código QR de verificación</small>
                  </div>
                )}
                <div className="actions-text">
                  <h3>Verificación Oficial</h3>
                  <p>Este certificado ha sido registrado de forma permanente e inmutable en la Blockchain de Ethereum. La matrícula <strong>{property.matricula}</strong> es única e irrepetible.</p>
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
          <p>Jurisdicción Inmobiliaria — República Dominicana — {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
}

export default VerifyPage;