import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import contractABI from './contractABI.json';
import QRCode from 'qrcode';

const CONTRACT_ADDRESS = "0xC5117F33935DcFEB2Ef59aa8743F12F5E3b8a8c9";
const PINATA_API_KEY = "cf5e544fb393d2c00a40";
const PINATA_SECRET_KEY = "9fb8aa518f53c9e4b999ef9ab795902a18ed17e30880d4b1c909b1cc54ff3781";
const SEPOLIA_RPC = 'https://ethereum-sepolia.publicnode.com';

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

// Parsear resultado del contrato (ahora con matricula en index 1)
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

const generateQR = async (id) => {
  try {
    return await QRCode.toDataURL(`${window.location.origin}/verify/${id}`, {
      errorCorrectionLevel: 'H', margin: 1, width: 200
    });
  } catch (e) { return ''; }
};

/**
 * Calcula el SHA-256 de un File localmente (sin subir nada).
 * Se usa para verificar si el documento ya está en blockchain antes de subirlo a Pinata.
 */
const fileToSha256 = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
            ['Matrícula',        data.matricula],
            ['Propietario',      data.ownerName],
            ['Cédula',           data.ownerId],
            ['Nacionalidad',     data.nationality      || 'N/A'],
            ['Ubicación',        data.propertyLocation || 'N/A'],
            ['Distrito Catastral', data.district       || 'N/A'],
            ['Parcela',          data.parcel],
            ['Superficie',       `${data.area} m²`],
            ['Fecha Registro',   data.registrationDate || 'N/A'],
            ['Timestamp Blockchain', data.timestamp],
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
  const [ipfsWarning, setIpfsWarning] = useState(null); // advertencia duplicado IPFS
  const [operationType, setOperationType] = useState('new');
  const [propertyData, setPropertyData] = useState(null);
  const [propertyId, setPropertyId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transferId, setTransferId] = useState('');
  const [transferData, setTransferData] = useState({ newOwnerName: '', newOwnerId: '', transferNote: '' });
  const [formData, setFormData] = useState({
    ownerName: '', ownerId: '', nationality: 'Dominicana',
    propertyLocation: '', district: '', parcel: '', area: '', registrationDate: ''
  });

  const handleInputChange  = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleTransferChange = (e) => setTransferData({ ...transferData, [e.target.name]: e.target.value });

  // Verificar duplicado IPFS al seleccionar archivo
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) { setSelectedFile(null); setIpfsWarning(null); return; }
    setSelectedFile(file);
    setIpfsWarning(null);
    try {
      // Calcular SHA-256 local del archivo
      const localHash = await fileToSha256(file);
      // Verificar en Pinata si ya fue subido (por nombre de archivo en metadata)
      // La verificación real es contra el contrato con el hash IPFS
      // Nota: no podemos saber el hash IPFS antes de subirlo sin calcularlo con la API de Pinata.
      // En cambio, verificamos si el nombre del archivo ya está en algún título.
      // La verificación definitiva la hace el contrato al registrar.
      // Aquí hacemos una advertencia visual basada en el SHA-256 local.
      console.log('SHA-256 local del archivo:', localHash);
      // Podríamos guardar un mapping local, pero lo más confiable es la validación del contrato.
    } catch (err) {
      console.error('Error calculando hash local:', err);
    }
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
      alert('Error al subir el archivo a IPFS');
      return null;
    } finally { setUploading(false); }
  };

  const registerProperty = async (e) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.ownerId || !formData.parcel || !formData.area) {
      alert('Complete los campos obligatorios: Propietario, Cédula, Parcela y Superficie');
      return;
    }

    let ipfsHash = '';

    if (selectedFile) {
      // 1. Subir a Pinata primero para obtener el hash IPFS real
      ipfsHash = await uploadToIPFS(selectedFile);
      if (!ipfsHash) return;

      // 2. Verificar en el contrato si ese hash IPFS ya está registrado
      try {
        const alreadyRegistered = await contract.isIpfsHashRegistered(ipfsHash);
        if (alreadyRegistered) {
          const existingId = await contract.getPropertyByIpfsHash(ipfsHash);
          // Obtener matrícula del título existente
          let matriculaExistente = `#${existingId}`;
          try {
            const existingProp = await contract.getProperty(existingId);
            matriculaExistente = existingProp[1]; // matricula en index 1
          } catch (e) {}

          setIpfsWarning({
            type: 'error',
            message: `Este documento ya está registrado en el título ${matriculaExistente}. No se puede usar el mismo documento para un registro nuevo.`
          });
          return; // Bloquear el registro
        }
      } catch (err) {
        console.error('Error verificando IPFS hash:', err);
      }
    }

    const metadata = JSON.stringify({
      operationType: 'new', nationality: formData.nationality,
      district: formData.district, location: formData.propertyLocation,
      registrationDate: formData.registrationDate, previousOwner: '', qrCode: ''
    });

    try {
      setLoading(true);
      const tx = await contract.registerProperty(
        formData.ownerName, formData.ownerId, formData.parcel, formData.area, ipfsHash, metadata
      );
      await tx.wait();

      const total = await contract.getTotalProperties();
      setTotalProperties(Number(total));
      setQrCodeUrl(await generateQR(total));
      setIpfsWarning(null);

      // Obtener la matrícula generada
      const newProp = await contract.getProperty(Number(total));
      const mat = newProp[1];
      alert(`¡Título registrado exitosamente!\nMatrícula asignada: ${mat}`);

      setFormData({ ownerName: '', ownerId: '', nationality: 'Dominicana', propertyLocation: '', district: '', parcel: '', area: '', registrationDate: '' });
      setSelectedFile(null);
    } catch (error) {
      if (error.message.includes('ya se encuentra registrada') || error.message.includes('already registered')) {
        alert('Esta parcela ya se encuentra registrada. No se permiten duplicados.');
      } else if (error.message.includes('ya esta asociado')) {
        alert('Este documento IPFS ya está asociado a otro título registrado.');
      } else {
        alert('Error al registrar: ' + error.message);
      }
    } finally { setLoading(false); }
  };

  const transferProperty = async (e) => {
    e.preventDefault();
    if (!transferId || transferId <= 0) { alert('Ingrese un ID de título válido'); return; }
    if (!transferData.newOwnerName || !transferData.newOwnerId) {
      alert('Complete el nombre y cédula del nuevo propietario');
      return;
    }
    try {
      setLoading(true);
      const meta = JSON.stringify({
        fechaTraspaso: new Date().toISOString(),
        nota: transferData.transferNote || 'Traspaso de propiedad'
      });
      const tx = await contract.transferProperty(
        transferId, transferData.newOwnerName, transferData.newOwnerId, meta
      );
      await tx.wait();
      alert('¡Traspaso registrado exitosamente en la Blockchain!');
      setTransferData({ newOwnerName: '', newOwnerId: '', transferNote: '' });
      setTransferId('');
    } catch (error) {
      alert('Error al registrar traspaso: ' + error.message);
    } finally { setLoading(false); }
  };

  const getProperty = async (e, forcedId) => {
    if (e) e.preventDefault();
    const id = forcedId !== undefined ? forcedId : propertyId;
    if (!id || id <= 0) { alert('Ingrese un ID válido'); return; }
    try {
      setLoading(true);
      const result = await contract.getProperty(id);
      const info = parseProperty(result);
      setPropertyData(info);
      setQrCodeUrl(await generateQR(info.id));
    } catch (error) {
      alert('Propiedad no encontrada.');
      setPropertyData(null);
    } finally { setLoading(false); }
  };

  const verifyProperty = async (id) => {
    try {
      setLoading(true);
      const tx = await contract.verifyProperty(id);
      await tx.wait();
      alert(`Título verificado oficialmente.`);
      await getProperty(null, id);
    } catch (error) {
      alert('Error al verificar: ' + error.message);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="module-banner module-banner-authority">
        <div className="module-banner-icon"><IconKey /></div>
        <div>
          <div className="module-banner-title">Panel de Autoridad — Registrador Oficial</div>
          <div className="module-banner-sub">
            Acceso restringido. Solo la wallet del Registrador puede crear, transferir y verificar títulos.
            La matrícula es generada automáticamente por el sistema.
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
                <IconBuilding /> Registrando un <strong>título nuevo</strong>. La matrícula (RD-YYMMDD-XXXX) se genera automáticamente al confirmar la transacción.
              </div>

              {/* Advertencia duplicado IPFS */}
              {ipfsWarning && (
                <div className={`ipfs-alert ipfs-alert-${ipfsWarning.type}`}>
                  <IconAlertTriangle /> {ipfsWarning.message}
                </div>
              )}

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
                  <div className="form-group">
                    <label className="form-label">Documento adjunto (PDF/Imagen)</label>
                    <label className="file-label">
                      <IconUpload />
                      {selectedFile ? selectedFile.name : 'Seleccionar archivo...'}
                      <input type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
                    </label>
                    {selectedFile && <div className="file-selected"><IconFile /> {selectedFile.name}</div>}
                    <div className="form-hint">Si el documento ya está registrado en otro título, el sistema lo detectará y bloqueará el registro.</div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading || uploading || ipfsWarning?.type === 'error'}>
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
                    <label className="form-label">Matrícula o ID del Título<span className="req">*</span></label>
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
  padding: 6px 32px; 
  display: flex; 
  align-items: center; 
  justify-content: center;  /* ← Agrega esta línea para centrar */
  gap: 8px; 
  font-size: 11.5px; 
  color: rgba(255,255,255,0.60); 
  letter-spacing: 0.05em; 
  text-transform: uppercase; 
}
        .top-bar svg { opacity: 0.6; }
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

        /* Tabs búsqueda */
        .search-type-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .search-tab { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1.5px solid var(--gris-borde); border-radius: 4px; background: var(--blanco); font-size: 13px; font-family: 'Source Sans 3', sans-serif; cursor: pointer; color: var(--gris-texto); transition: all 0.15s; }
        .search-tab:hover { border-color: var(--azul-claro); color: var(--azul); }
        .search-tab.active { background: var(--azul); color: var(--blanco); border-color: var(--azul); }

        /* Alerta IPFS duplicado */
        .ipfs-alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 20px; }
        .ipfs-alert-error { background: #FFF5F5; border: 1.5px solid #FEB2B2; color: #C53030; border-left: 4px solid var(--rojo); }
        .ipfs-alert-warning { background: #FFFBEB; border: 1.5px solid #FBD38D; color: #744210; border-left: 4px solid #D97706; }

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

        /* ── Fix calendario ── */
        .date-input { color-scheme: light; }
        .date-input::-webkit-calendar-picker-indicator {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
          cursor: pointer;
          opacity: 1;
          filter: none;
          padding: 2px;
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
          .gov-main { padding: 20px 16px 40px; }
          .form-grid { grid-template-columns: 1fr; }
          .header-inner { padding: 20px 16px; }
          .wallet-panel { flex-direction: column; align-items: flex-start; gap: 14px; }
          .top-bar, .gov-nav { padding-left: 16px; padding-right: 16px; }
          .wallet-info { flex-wrap: wrap; }
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
          <p>Jurisdicción Inmobiliaria — República Dominicana — {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
}

export default App;