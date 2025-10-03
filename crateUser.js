const bcrypt = require("bcryptjs");
const db = require("./models/db");

(async () => {
  const hash = await bcrypt.hash("admin", 10);
  db.query(
    "INSERT INTO usuarios (nombre, email, password, rol, sede_id) VALUES (?, ?, ?, ?, ?)",
    ["Admin General", "admin@admin.com", hash, "admin", 1],
    (err, result) => {
      if (err) console.error(err);
      else console.log("Usuario insertado con hash:", hash);
      process.exit();
    }
  );
})();