// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyRegistry {

    struct Property {
        uint   id;
        string matricula;
        string ownerName;
        string ownerId;
        string parcel;
        string area;
        string ipfsHash;
        uint   timestamp;
        bool   isVerified;
        string metadata;
    }

    struct OwnershipRecord {
        string ownerName;
        string ownerId;
        uint   timestamp;
        string transferMetadata;
    }

    address public registrar;

    mapping(uint    => Property)          public  properties;
    mapping(string  => bool)              private parcelExists;
    mapping(string  => uint)              private parcelToId;
    mapping(string  => uint)              private ipfsHashToId;
    mapping(string  => uint)              private matriculaToId;
    mapping(string  => uint[])            private ownerNameIndex;
    mapping(string  => uint[])            private ownerIdIndex;
    mapping(uint    => OwnershipRecord[]) private ownerHistory;

    uint public propertyCount;

    event PropertyRegistered(uint indexed id, string matricula, string ownerName, string parcel, address registeredBy);
    event PropertyVerified(uint indexed id, string matricula, address verifiedBy);
    event PropertyTransferred(uint indexed id, string matricula, string fromOwner, string toOwner, uint timestamp);
    event IpfsHashUpdated(uint indexed id, string oldHash, string newHash);
    event RegistrarChanged(address indexed oldRegistrar, address indexed newRegistrar);

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "Acceso denegado: solo el Registrador puede realizar esta operacion");
        _;
    }

    constructor() {
        registrar = msg.sender;
    }

    function _getYearFromTimestamp(uint _ts) internal pure returns (uint) {
        uint z = _ts / 86400 + 719468;
        uint era = z / 146097;
        uint doe = z - era * 146097;
        uint yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        uint y = yoe + era * 400;
        uint doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint mp = (5 * doy + 2) / 153;
        uint mm = mp < 10 ? mp + 3 : mp - 9;
        uint yyyy = mm <= 2 ? y + 1 : y;
        return yyyy;
    }

    function _getMonthFromTimestamp(uint _ts) internal pure returns (uint) {
        uint z = _ts / 86400 + 719468;
        uint era = z / 146097;
        uint doe = z - era * 146097;
        uint yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        uint doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint mp = (5 * doy + 2) / 153;
        uint mm = mp < 10 ? mp + 3 : mp - 9;
        return mm;
    }

    function _getDayFromTimestamp(uint _ts) internal pure returns (uint) {
        uint z = _ts / 86400 + 719468;
        uint era = z / 146097;
        uint doe = z - era * 146097;
        uint yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        uint doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint mp = (5 * doy + 2) / 153;
        uint dd = doy - (153 * mp + 2) / 5 + 1;
        return dd;
    }

    function _generateMatricula(uint _seq, uint _ts) internal pure returns (string memory) {
        uint yy = _getYearFromTimestamp(_ts) % 100;
        uint mm = _getMonthFromTimestamp(_ts);
        uint dd = _getDayFromTimestamp(_ts);
        bytes memory b = new bytes(14);
        b[0] = 'R'; b[1] = 'D'; b[2] = '-';
        b[3] = _uintToByte(yy / 10); b[4] = _uintToByte(yy % 10);
        b[5] = _uintToByte(mm / 10); b[6] = _uintToByte(mm % 10);
        b[7] = _uintToByte(dd / 10); b[8] = _uintToByte(dd % 10);
        b[9] = '-';
        b[10] = _uintToByte((_seq / 1000) % 10);
        b[11] = _uintToByte((_seq / 100)  % 10);
        b[12] = _uintToByte((_seq / 10)   % 10);
        b[13] = _uintToByte(_seq          % 10);
        return string(b);
    }

    function _uintToByte(uint _digit) internal pure returns (bytes1) {
        return bytes1(uint8(48 + _digit));
    }

    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory b  = bytes(str);
        bytes memory bl = new bytes(b.length);
        for (uint i = 0; i < b.length; i++) {
            bl[i] = (b[i] >= 0x41 && b[i] <= 0x5A) ? bytes1(uint8(b[i]) + 32) : b[i];
        }
        return string(bl);
    }

    // ─── Registro ─────────────────────────────────────────────────────────────

    function registerProperty(
        string memory _ownerName,
        string memory _ownerId,
        string memory _parcel,
        string memory _area,
        string memory _ipfsHash,
        string memory _metadata
    ) public onlyRegistrar {
        require(bytes(_ownerName).length > 0, "Nombre del propietario requerido");
        require(bytes(_ownerId).length > 0,   "Cedula requerida");
        require(bytes(_parcel).length > 0,    "Numero de parcela requerido");
        require(!parcelExists[_parcel],       "Esta parcela ya se encuentra registrada en el sistema");
        if (bytes(_ipfsHash).length > 0) {
            require(ipfsHashToId[_ipfsHash] == 0, "Este documento ya esta asociado a un titulo existente");
        }

        propertyCount++;
        string memory mat = _generateMatricula(propertyCount, block.timestamp);

        properties[propertyCount] = Property({
            id:         propertyCount,
            matricula:  mat,
            ownerName:  _ownerName,
            ownerId:    _ownerId,
            parcel:     _parcel,
            area:       _area,
            ipfsHash:   _ipfsHash,
            timestamp:  block.timestamp,
            isVerified: false,
            metadata:   _metadata
        });

        parcelExists[_parcel]   = true;
        parcelToId[_parcel]     = propertyCount;
        matriculaToId[mat]      = propertyCount;
        if (bytes(_ipfsHash).length > 0) ipfsHashToId[_ipfsHash] = propertyCount;
        ownerNameIndex[_toLower(_ownerName)].push(propertyCount);
        ownerIdIndex[_ownerId].push(propertyCount);

        ownerHistory[propertyCount].push(OwnershipRecord({
            ownerName:        _ownerName,
            ownerId:          _ownerId,
            timestamp:        block.timestamp,
            transferMetadata: "Registro inicial"
        }));

        emit PropertyRegistered(propertyCount, mat, _ownerName, _parcel, msg.sender);
    }

    // ─── Verificar ────────────────────────────────────────────────────────────

    function verifyProperty(uint _id) public onlyRegistrar {
        require(_id > 0 && _id <= propertyCount, "El titulo no existe");
        properties[_id].isVerified = true;
        emit PropertyVerified(_id, properties[_id].matricula, msg.sender);
    }

    // ─── Traspaso (solo cambio de propietario, SIN actualizar IPFS) ───────────

    function transferProperty(
        uint _id,
        string memory _newOwnerName,
        string memory _newOwnerId,
        string memory _transferMetadata
    ) public onlyRegistrar {
        require(_id > 0 && _id <= propertyCount, "El titulo no existe");
        require(bytes(_newOwnerName).length > 0, "Nombre del nuevo propietario requerido");
        require(bytes(_newOwnerId).length > 0,   "Cedula del nuevo propietario requerida");

        string memory prev = properties[_id].ownerName;

        ownerHistory[_id].push(OwnershipRecord({
            ownerName:        _newOwnerName,
            ownerId:          _newOwnerId,
            timestamp:        block.timestamp,
            transferMetadata: _transferMetadata
        }));

        ownerNameIndex[_toLower(_newOwnerName)].push(_id);
        ownerIdIndex[_newOwnerId].push(_id);

        properties[_id].ownerName  = _newOwnerName;
        properties[_id].ownerId    = _newOwnerId;
        properties[_id].isVerified = false;

        emit PropertyTransferred(_id, properties[_id].matricula, prev, _newOwnerName, block.timestamp);
    }

    // ─── Actualizar IPFS Hash (solo hash, SIN cambio de propietario) ─────────

    function updateIpfsHash(uint _id, string memory _newIpfsHash) public onlyRegistrar {
        require(_id > 0 && _id <= propertyCount, "El titulo no existe");
        require(bytes(_newIpfsHash).length > 0, "Hash IPFS requerido");
        require(
            ipfsHashToId[_newIpfsHash] == 0,
            "Este hash ya esta asociado a otro titulo"
        );

        string memory oldHash = properties[_id].ipfsHash;

        if (bytes(oldHash).length > 0) {
            ipfsHashToId[oldHash] = 0;
        }

        properties[_id].ipfsHash    = _newIpfsHash;
        ipfsHashToId[_newIpfsHash]  = _id;

        emit IpfsHashUpdated(_id, oldHash, _newIpfsHash);
    }

    // ⭐⭐⭐ NUEVA FUNCIÓN COMBINADA: Traspaso + actualización de IPFS en UNA sola transacción ⭐⭐⭐

    function transferPropertyWithCertificate(
        uint _id,
        string memory _newOwnerName,
        string memory _newOwnerId,
        string memory _transferMetadata,
        string memory _newIpfsHash
    ) public onlyRegistrar {
        // 1. Validaciones básicas
        require(_id > 0 && _id <= propertyCount, "El titulo no existe");
        require(bytes(_newOwnerName).length > 0, "Nombre del nuevo propietario requerido");
        require(bytes(_newOwnerId).length > 0,   "Cedula del nuevo propietario requerida");
        require(bytes(_newIpfsHash).length > 0,  "Hash IPFS requerido");
        require(
            ipfsHashToId[_newIpfsHash] == 0,
            "Este hash ya esta asociado a otro titulo"
        );

        // 2. Guardar nombre anterior para el evento
        string memory prevOwner = properties[_id].ownerName;
        string memory oldHash   = properties[_id].ipfsHash;

        // 3. Registrar el nuevo propietario en el historial
        ownerHistory[_id].push(OwnershipRecord({
            ownerName:        _newOwnerName,
            ownerId:          _newOwnerId,
            timestamp:        block.timestamp,
            transferMetadata: _transferMetadata
        }));

        // 4. Actualizar índices de búsqueda por nombre y cédula
        ownerNameIndex[_toLower(_newOwnerName)].push(_id);
        ownerIdIndex[_newOwnerId].push(_id);

        // 5. Actualizar los datos principales de la propiedad
        properties[_id].ownerName  = _newOwnerName;
        properties[_id].ownerId    = _newOwnerId;
        properties[_id].isVerified = false;

        // 6. Actualizar el hash IPFS
        if (bytes(oldHash).length > 0) {
            ipfsHashToId[oldHash] = 0;
        }
        properties[_id].ipfsHash    = _newIpfsHash;
        ipfsHashToId[_newIpfsHash]  = _id;

        // 7. Emitir eventos (uno para el traspaso, otro para el hash)
        emit PropertyTransferred(_id, properties[_id].matricula, prevOwner, _newOwnerName, block.timestamp);
        emit IpfsHashUpdated(_id, oldHash, _newIpfsHash);
    }

    // ─── Cambiar registrador ──────────────────────────────────────────────────

    function changeRegistrar(address _newRegistrar) public onlyRegistrar {
        require(_newRegistrar != address(0), "Direccion invalida");
        address old = registrar;
        registrar = _newRegistrar;
        emit RegistrarChanged(old, _newRegistrar);
    }

    // ─── Consultas ────────────────────────────────────────────────────────────

    function getProperty(uint _id) public view returns (
        uint id,
        string memory matricula,
        string memory ownerName,
        string memory ownerId,
        string memory parcel,
        string memory area,
        string memory ipfsHash,
        uint timestamp,
        bool isVerified,
        string memory metadata
    ) {
        require(_id > 0 && _id <= propertyCount, "El titulo no existe");
        Property memory p = properties[_id];
        return (p.id, p.matricula, p.ownerName, p.ownerId, p.parcel, p.area,
                p.ipfsHash, p.timestamp, p.isVerified, p.metadata);
    }

    function getOwnershipHistory(uint _id) public view returns (
        string[] memory ownerNames,
        string[] memory ownerIds,
        uint[]   memory timestamps,
        string[] memory transferMetas
    ) {
        require(_id > 0 && _id <= propertyCount, "El titulo no existe");
        uint len = ownerHistory[_id].length;
        ownerNames    = new string[](len);
        ownerIds      = new string[](len);
        timestamps    = new uint[](len);
        transferMetas = new string[](len);
        for (uint i = 0; i < len; i++) {
            ownerNames[i]    = ownerHistory[_id][i].ownerName;
            ownerIds[i]      = ownerHistory[_id][i].ownerId;
            timestamps[i]    = ownerHistory[_id][i].timestamp;
            transferMetas[i] = ownerHistory[_id][i].transferMetadata;
        }
    }

    function getPropertiesByOwnerId(string memory _ownerId) public view returns (uint[] memory) { return ownerIdIndex[_ownerId]; }
    function getPropertiesByOwnerName(string memory _name) public view returns (uint[] memory) { return ownerNameIndex[_toLower(_name)]; }
    function getPropertyByIpfsHash(string memory _hash) public view returns (uint) { return ipfsHashToId[_hash]; }
    function getPropertyByMatricula(string memory _mat) public view returns (uint) { return matriculaToId[_mat]; }
    function getPropertyByParcel(string memory _parcel) public view returns (uint) { return parcelToId[_parcel]; }
    function isParcelRegistered(string memory _parcel) public view returns (bool) { return parcelExists[_parcel]; }
    function isIpfsHashRegistered(string memory _hash) public view returns (bool) { return ipfsHashToId[_hash] != 0; }
    function getTotalProperties() public view returns (uint) { return propertyCount; }
    function isRegistrar(address _addr) public view returns (bool) { return _addr == registrar; }
}
