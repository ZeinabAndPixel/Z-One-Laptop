import { neon } from '@neondatabase/serverless';
import { getBcvRateCurrent, setBcvRate } from '../lib/db';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

  // Verificación básica de seguridad (en producción usaríamos tokens reales)
  const { action, product, rate, set_by, note } = req.body || {};

  try {
    // --- BCV: obtener tasa actual mediante GET ?type=bcv
    if (req.method === 'GET' && req.query && req.query.type === 'bcv') {
      const current = await getBcvRateCurrent();
      return res.status(200).json({ data: current });
    }

    // --- BCV: actualizar tasa desde admin (POST action)
    if (req.method === 'POST' && action === 'set_bcv') {
      const parsedRate = Number(rate);
      if (isNaN(parsedRate)) return res.status(400).json({ error: 'Rate inválida' });
      await setBcvRate(parsedRate, set_by || 'admin', note || null);
      return res.status(200).json({ message: 'Tasa BCV actualizada' });
    }

    // 1. AGREGAR PRODUCTO
    if (req.method === 'POST' && action === 'create') {
      const { nombre, marca, categoria, precio, stock, imagen_url, descripcion, detalles } = product;
      
      await sql`
        INSERT INTO productos (nombre, marca, categoria, precio, stock, imagen_url, descripcion, detalles)
        VALUES (${nombre}, ${marca}, ${categoria}, ${precio}, ${stock}, ${imagen_url}, ${descripcion}, ${detalles})
      `;
      return res.status(201).json({ message: 'Producto creado' });
    }

    // 2. ACTUALIZAR PRODUCTO (Editar stock, precio, etc.)
    if (req.method === 'PUT') {
      const { id, nombre, marca, categoria, precio, stock, imagen_url, descripcion, detalles } = product;
      
      await sql`
        UPDATE productos 
        SET nombre=${nombre}, marca=${marca}, categoria=${categoria}, 
            precio=${precio}, stock=${stock}, imagen_url=${imagen_url}, 
            descripcion=${descripcion}, detalles=${detalles}
        WHERE id=${id}
      `;
      return res.status(200).json({ message: 'Producto actualizado' });
    }

    // 3. ELIMINAR PRODUCTO
    if (req.method === 'DELETE') {
      const { id } = req.body;
      await sql`DELETE FROM productos WHERE id=${id}`;
      return res.status(200).json({ message: 'Producto eliminado' });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error: any) {
    console.error("Error Admin:", error);
    return res.status(500).json({ error: error.message });
  }
}