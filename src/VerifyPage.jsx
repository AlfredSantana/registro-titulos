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
// ─── Componente: Card resumen en lista de múltiples títulos ───────────────────
function PropertySummaryCard({ prop, onSelect }) {
  return (
    <div className="summary-card" onClick={() => onSelect(prop.id)}>
      <div className="summary-left">
        <div className="summary-owner">{prop.ownerName}</div>
        <div className="summary-matricula">Matrícula: {prop.matricula}</div>
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

    // --- LÓGICA DE DETECCIÓN AUTOMÁTICA ---
    
    // 1. ¿Es un Hash IPFS? (Empieza con Qm y es largo)
    if (val.startsWith('Qm') && val.length > 30) {
      const numId = await contract.getPropertyByIpfsHash(val);
      if (Number(numId) === 0) throw new Error('No se encontró IPFS');
      await loadPropertyById(Number(numId));
    } 
    
    // 2. ¿Es una Cédula? (Contiene guiones o solo números de 11 dígitos)
    else if (/^\d{3}-?\d{7}-?\d{1}$/.test(val)) {
      const ids = await contract.getPropertiesByOwnerId(val);
      if (!ids || ids.length === 0) throw new Error('Cédula no registrada');
      if (ids.length === 1) await loadPropertyById(Number(ids[0]));
      else {
        const props = await Promise.all(ids.map(async (id) => parseProperty(await contract.getProperty(Number(id)))));
        setMultipleResults(props);
      }
    }

    // 3. ¿Es una Matrícula? (Ejemplo: RD-XXXX)
    else if (val.toUpperCase().startsWith('RD-') || /^\d{10,}$/.test(val)) {
      const numId = await contract.getPropertyByMatricula(val);
      if (Number(numId) === 0) throw new Error('Matrícula no encontrada');
      await loadPropertyById(Number(numId));
    }

    // 4. Búsqueda por NOMBRE (con coincidencia parcial)
    else {
      // Obtener el total de títulos registrados
      const total = await contract.getTotalProperties();
      const totalNum = Number(total);
      
      if (totalNum === 0) {
        throw new Error('No hay títulos registrados en el sistema.');
      }
      
      // Cargar todos los títulos
      const allIds = [];
      for (let i = 1; i <= totalNum; i++) {
        allIds.push(i);
      }
      
      const allProperties = await Promise.all(
        allIds.map(async (id) => {
          const result = await contract.getProperty(id);
          return parseProperty(result);
        })
      );
      
      // Filtrar por coincidencia parcial (insensible a mayúsculas/minúsculas)
      const searchLower = val.toLowerCase();
      const matched = allProperties.filter(prop => 
        prop.ownerName.toLowerCase().includes(searchLower)
      );
      
      if (matched.length === 0) {
        throw new Error(`No se encontraron títulos para "${val}".`);
      }
      
        // Si hay múltiples, mostramos la lista
        setMultipleResults(matched);
    }

  } catch (err) {
    console.error("Error en búsqueda:", err);
    setError(err.message || 'No se encontraron resultados para su búsqueda.');
  } finally {
    setSearching(false);
  }
};

  const downloadCertificate = async () => {
    if (!property || !property.ipfsUrl) return;

    try {
      // 1. Descargamos el archivo desde el enlace de IPFS
      const response = await fetch(property.ipfsUrl);
      if (!response.ok) throw new Error('Error al conectar con IPFS');
      
      const blob = await response.blob();
      
      // 2. Creamos un link temporal para forzar la descarga en el navegador
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre con el que se guardará el archivo en la PC
      link.setAttribute('download', `Titulo_Oficial_${property.matricula}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      // 3. Limpieza de memoria
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando:", err);
      // Si falla por seguridad (CORS), simplemente abrimos el link en otra pestaña
      window.open(property.ipfsUrl, '_blank');
    }
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

        .vp-main { width: 100%; padding: 32px 180px 60px; flex: 1; }

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

        .multi-header { 
        font-size: 13px; 
        color: var(--gris-texto); 
        margin: 20px 0 12px; 
        font-weight: 600; 
        letter-spacing: 0.04em; 
        text-transform: uppercase; 
        }

        .summary-card { 
        display: flex; 
        align-items: center; 
        gap: 16px; 
        background: var(--blanco); 
        border: 1.5px solid var(--gris-borde); 
        border-radius: 6px; 
        padding: 14px 18px; 
        margin-bottom: 10px; 
        cursor: pointer; 
        transition: border-color 0.15s, box-shadow 0.15s; 
        }

        .summary-card:hover { 
        border-color: var(--azul-claro); 
        box-shadow: 0 2px 12px rgba(0,45,110,0.10); 
        }

        .summary-left { 
        flex: 1; 
        }
        
        .summary-matricula {
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--azul);
  letter-spacing: 0.05em;
  margin-top: 4px;
}

        .summary-parcel {
  font-size: 12px;
  color: var(--gris-texto);
  margin-top: 3px;
}
        .summary-location {
  font-size: 11px;
  color: #A0AEC0;
  margin-top: 2px;
}

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

        .actions-text { flex: 1; 
        min-width: 200px; }
        .actions-text h3 { font-family: 'EB Garamond', serif; font-size: 18px; color: var(--azul); margin-bottom: 2px; }
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
  /* Layout general */
  .vp-main { 
    padding: 20px 16px 40px; 
  }
  
  /* Header */
  .header-inner { 
    padding: 16px; 
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
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
    margin-top: 0;
  }
  
  /* Cards y filas */
  .cert-row { 
    flex-direction: column; 
    gap: 4px; 
  }
  .cert-key { 
    width: auto; 
  }
  
  /* Panel de acciones */
  .actions-panel { 
    flex-direction: column; 
    align-items: center;
    text-align: center;
  }
  .actions-panel .actions-text {
    text-align: center;
  }
  .actions-panel .actions-btns {
    align-items: center;
  }
  
  /* Pestañas de búsqueda */
  .search-tabs { 
    gap: 6px;
    justify-content: center;
  }
  .search-tab {
    padding: 5px 10px;
    font-size: 11px;
  }
  
  /* Barra de búsqueda */
  .search-bar {
    flex-direction: column;
  }
  .search-bar .btn {
    width: 100%;
    justify-content: center;
  }
  
  /* Tarjetas de resultados */
  .summary-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  .summary-left {
    text-align: center;
  }
  .summary-right {
    justify-content: center;
  }
  
  /* Footer */
  .gov-footer-items {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  .gov-footer {
    padding: 16px;
    font-size: 9px;
  }
  
  /* Botones */
  .btn {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  /* QR */
  .qr-box img {
    width: 100px;
    height: 100px;
  }
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
          
          {/* Buscador Único Inteligente */}
 <div className="search-card">
  <div className="search-card-header">
    <IconSearch size={16} />
    <h2>Consulta Unificada de Títulos</h2>
  </div>
  <div className="search-card-body">
    <form onSubmit={handleSearch} className="search-bar">
      <input 
        type="text" 
        placeholder="Ingrese Nombre, Cédula, Matrícula o Hash IPFS"
        value={searchVal} 
        onChange={e => setSearchVal(e.target.value)}
        className="form-control"
        style={{ fontSize: '16px', padding: '15px' }} 
      />
      <button type="submit" className="btn btn-primary" disabled={searching}>
        {searching ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
    <p className="search-hint" style={{ marginTop: '12px' }}>
      <strong>Tip:</strong> El sistema detecta automáticamente el tipo de dato ingresado mediante algoritmos de validación.
    </p>
  </div>
 </div>

          {/* 2. MANEJO DE ESTADOS (ERROR Y CARGA) */}
          {error && (
            <div className="error-notice">
              <IconAlertCircle size={16} /> {error}
            </div>
          )}

          {searching && (
            <div className="state-card">
              <div className="state-icon">
                <div className="loading-pulse"><IconBlockchain size={32} /></div>
              </div>
              <h2>Consultando Red</h2>
              <p>Accediendo al registro inmutable en Sepolia...</p>
            </div>
          )}

          {/* 3. RESULTADOS MÚLTIPLES (Si una cédula tiene varios títulos) */}
          {multipleResults.length > 0 && !property && (
            <div className="multi-container">
              <h3 className="multi-header">Propiedades encontradas ({multipleResults.length})</h3>
              {multipleResults.map(p => (
                <PropertySummaryCard key={p.id} prop={p} onSelect={loadPropertyById} />
              ))}
            </div>
          )}

          {/* 4. FICHA TÉCNICA DEL TÍTULO (Cuando ya hay uno seleccionado) */}
          {property && !searching && (
            <div className="animate-fade-in">
              <div className={`status-banner ${property.isVerified ? 'verified' : 'pending'}`}>
                <div className="status-banner-icon">
                  {property.isVerified ? <IconCheck size={28} /> : <IconClock size={28} />}
                </div>
                <div className="status-banner-text">
                  <h2>{property.isVerified ? 'Título Verificado' : 'Título en Proceso'}</h2>
                  <div className="matricula-display">{property.matricula}</div>
                </div>
              </div>

              <div className="cert-card">
                <div className="cert-section-header"><IconFile size={14} /> Datos Técnicos</div>
                <div className="cert-body">
                  <div className="cert-row"><span className="cert-key">Matrícula</span><span className="cert-val">{property.matricula}</span></div>
                  <div className="cert-row"><span className="cert-key">Parcela / Solar</span><span className="cert-val">{property.parcel}</span></div>
                  <div className="cert-row"><span className="cert-key">Superficie</span><span className="cert-val">{property.area} m²</span></div>
                  <div className="cert-row"><span className="cert-key">Ubicación</span><span className="cert-val">{property.propertyLocation}</span></div>
                </div>

                <div className="cert-section-header"><IconUser size={14} /> Titularidad Actual</div>
                <div className="cert-body">
                  <div className="cert-row"><span className="cert-key">Nombre Completo</span><span className="cert-val">{property.ownerName}</span></div>
                  <div className="cert-row"><span className="cert-key">Identificación</span><span className="cert-val">{property.ownerId}</span></div>
                </div>
              </div>

<div className="actions-panel" style={{ textAlign: 'center' }}>
  <div style={{ maxWidth: '500px', margin: '0 auto' }}>
    <h3 style={{ color: 'var(--azul)', marginBottom: '10px', fontSize: '18px' }}>Documentación Original</h3>
    <p style={{ fontSize: '13px', color: 'var(--gris-texto)', lineHeight: '1.5' }}>
      Este registro cuenta con un respaldo digital almacenado de forma descentralizada en IPFS (InterPlanetary File System).
    </p>
  </div>

  <div style={{ 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  gap: '20px', 
  marginTop: '25px',
  flexWrap: 'wrap'
}}>
  <a 
    href={property.ipfsUrl} 
    target="_blank" 
    rel="noreferrer" 
    style={{ 
      backgroundColor: '#28a745',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '4px',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: '600',
      lineHeight: '1.2',           // ← misma altura de línea
      minHeight: '40px',           // ← altura mínima igual para ambos
      boxSizing: 'border-box'
    }}
  >
    <IconLink size={14} /> Ver Original en IPFS
  </a>

  <button 
    onClick={downloadCertificate} 
    style={{ 
      backgroundColor: '#002D6E',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: '600',
      lineHeight: '1.2',           // ← misma altura de línea
      minHeight: '40px',           // ← altura mínima igual para ambos
      boxSizing: 'border-box'
    }}
  >
    <IconDownload size={16} /> Descargar Certificado PDF
  </button>
</div>
</div>
</div>
            
          )}
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

export default VerifyPage;