// Script de inicialización de MongoDB
// Se ejecuta automáticamente al arrancar el contenedor (docker-entrypoint-initdb.d)

// Classroom DB
db = db.getSiblingDB('classroom_db');
db.classrooms.insertMany([
  { _id: 'aula-101', description: 'Aula de Matemáticas', capacity: 30, available: true },
  { _id: 'aula-102', description: 'Aula de Historia', capacity: 25, available: true },
  { _id: 'aula-103', description: 'Laboratorio', capacity: 20, available: false }
]);

// Student DB
db = db.getSiblingDB('student_db');
db.students.insertMany([
  { _id: 'est-001', name: 'Juan Pérez', email: 'juan@example.com' },
  { _id: 'est-002', name: 'María García', email: 'maria@example.com' }
]);

// Loans DB
db = db.getSiblingDB('loans_db');
db.loans.insertMany([
  { _id: 'loan-001', classroomId: 'aula-101', borrowerId: 'est-001', status: 'active' }
]);

print('Datos iniciales cargados en classroom_db, student_db y loans_db');