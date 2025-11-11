const fs = require('fs');
const path = require('path');

// Leer el archivo db.json actual
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const DEMO_BUSINESS_ID = "demo-business";

// Agregar las nuevas colecciones si no existen
if (!db.users) {
  db.users = [
    {
      "id": "demo-admin",
      "businessId": DEMO_BUSINESS_ID,
      "username": "admin",
      "email": "admin@easypark.com",
      "password": "admin123",
      "role": "admin",
      "name": "Administrator",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "isActive": true
    },
    {
      "id": "demo-operator",
      "businessId": DEMO_BUSINESS_ID,
      "username": "operator",
      "email": "operator@easypark.com",
      "password": "operator123",
      "role": "operator",
      "name": "Operator Demo",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "isActive": true
    }
  ];
}

if (!db.businesses) {
  db.businesses = [
    {
      "id": DEMO_BUSINESS_ID,
      "businessName": "EasyPark Demo",
      "address": "Av. Principal 123, Lima, Peru",
      "phone": "+51987654321",
      "email": "contact@easypark.com",
      "taxId": "20123456789",
      "maxCapacity": 100,
      "motorcycleRate": 2,
      "carTruckRate": 4,
      "nightRate": 20,
      "openingTime": "08:00",
      "closingTime": "22:00",
      "currency": "PEN",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ];
}

// Función para agregar businessId a arrays de objetos
function addBusinessIdToArray(array) {
  if (Array.isArray(array)) {
    return array.map(item => {
      if (typeof item === 'object' && item !== null && !item.businessId) {
        return { ...item, businessId: DEMO_BUSINESS_ID };
      }
      return item;
    });
  }
  return array;
}

// Función para agregar businessId a un objeto
function addBusinessIdToObject(obj) {
  if (typeof obj === 'object' && obj !== null && !obj.businessId) {
    return { ...obj, businessId: DEMO_BUSINESS_ID };
  }
  return obj;
}

// Actualizar parkingSettings para incluir businessId
if (db.parkingSettings) {
  db.parkingSettings = addBusinessIdToObject(db.parkingSettings);
}

// Actualizar todas las colecciones existentes con businessId
if (db.operations) {
  db.operations = addBusinessIdToArray(db.operations);
}

if (db['vehicle-debts']) {
  db['vehicle-debts'] = addBusinessIdToArray(db['vehicle-debts']);
}

if (db.incidents) {
  db.incidents = addBusinessIdToArray(db.incidents);
}

if (db.vehicles) {
  db.vehicles = addBusinessIdToArray(db.vehicles);
}

if (db['accounting-records']) {
  db['accounting-records'] = addBusinessIdToArray(db['accounting-records']);
}

if (db.subscribers) {
  db.subscribers = addBusinessIdToArray(db.subscribers);
}

// Guardar el archivo actualizado
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('✅ Database updated successfully!');
console.log('');
console.log('📝 Default credentials for existing data:');
console.log('   👤 Admin: username: admin, password: admin123');
console.log('   👤 Operator: username: operator, password: operator123');
console.log('');
console.log('📊 All existing data has been associated with:');
console.log(`   🏢 Business: EasyPark Demo (ID: ${DEMO_BUSINESS_ID})`);
console.log('');
console.log('✨ What was updated:');
console.log('   ✓ parkingSettings → businessId added');
console.log('   ✓ operations → businessId added');
console.log('   ✓ vehicle-debts → businessId added');
console.log('   ✓ incidents → businessId added');
console.log('   ✓ vehicles → businessId added');
console.log('   ✓ accounting-records → businessId added');
console.log('   ✓ subscribers → businessId added');
