import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, nombre, cedula, telefono, direccion } = req.body;

  try {
    // REGISTRO
    if (action === 'register') {
      const existingUser = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
      if (existingUser.length > 0) return res.status(400).json({ error: 'Correo ya registrado' });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Insertamos en 'usuarios' usando 'email' (según tu esquema)
      // Asignamos rol 'cliente' por defecto
      const newUser = await sql`
        INSERT INTO usuarios (nombre_completo, email, password_hash, cedula, telefono, direccion, rol)
        VALUES (${nombre}, ${email}, ${hash}, ${cedula}, ${telefono}, ${direccion}, 'cliente')
        RETURNING id, nombre_completo, email, rol
      `;

      return res.status(201).json({ user: newUser[0], message: 'Usuario creado' });
    }

    // LOGIN
    if (action === 'login') {
      const users = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
      if (users.length === 0) return res.status(400).json({ error: 'Credenciales inválidas' });

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Credenciales inválidas' });

      // IMPORTANTE: Devolvemos el ROL para que App.tsx sepa si es cajero
      const { password_hash, ...userData } = user;
      return res.status(200).json({ user: userData, message: 'Bienvenido' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}