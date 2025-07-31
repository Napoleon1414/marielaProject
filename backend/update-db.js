const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/job_platform.db');
const db = new sqlite3.Database(dbPath);

console.log('Actualizando base de datos...');

db.serialize(() => {
  // Agregar columnas si no existen
  const columns = [
    "ALTER TABLE job_postings ADD COLUMN requirements TEXT",
    "ALTER TABLE job_postings ADD COLUMN company_name TEXT",
    "ALTER TABLE job_postings ADD COLUMN status TEXT DEFAULT 'active'",
    "ALTER TABLE job_postings ADD COLUMN applications_count INTEGER DEFAULT 0",
    "ALTER TABLE job_postings ADD COLUMN skills TEXT" // Nueva columna para skills
  ];

  columns.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`Error en columna ${index + 1}:`, err.message);
      } else {
        console.log(`Columna ${index + 1} agregada o ya existe`);
      }
    });
  });

  // Actualizar registros existentes
  setTimeout(() => {
    db.run("UPDATE job_postings SET status = 'active' WHERE status IS NULL", (err) => {
      if (err) {
        console.error('Error actualizando status:', err.message);
      } else {
        console.log('Status actualizado');
      }
    });

    db.run("UPDATE job_postings SET applications_count = 0 WHERE applications_count IS NULL", (err) => {
      if (err) {
        console.error('Error actualizando applications_count:', err.message);
      } else {
        console.log('Applications count actualizado');
      }
    });

    db.run("UPDATE job_postings SET requirements = required_skills WHERE requirements IS NULL AND required_skills IS NOT NULL", (err) => {
      if (err) {
        console.error('Error copiando required_skills:', err.message);
      } else {
        console.log('Requirements copiado desde required_skills');
      }
    });

    // Cerrar base de datos
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error cerrando base de datos:', err.message);
        } else {
          console.log('Base de datos actualizada exitosamente!');
        }
      });
    }, 1000);
  }, 2000);
}); 