import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

  // Verificación básica de seguridad (en producción usaríamos tokens reales)
  const { action, product } = req.body;

  try {
    // BCV: obtener tasa actual mediante GET ?type=bcv
    if (req.method === 'GET' && req.query && req.query.type === 'bcv') {
      try {
        const r = await sql`SELECT rate, set_by, updated_at FROM bcv_rate_current WHERE id = 1 LIMIT 1`;
        return res.status(200).json({ data: r[0] || null });
      } catch (err: any) {
        console.error('Error obteniendo BCV:', err);
        return res.status(500).json({ error: 'Error obteniendo tasa BCV' });
      }
    }

    // BCV: actualizar tasa (action = 'set_bcv')
    if (req.method === 'POST' && action === 'set_bcv') {
      const { rate, set_by, note } = req.body;
      const parsed = Number(rate);
      if (isNaN(parsed)) return res.status(400).json({ error: 'Rate inválida' });
      try {
        await sql`INSERT INTO bcv_rates_history (rate, set_by, note) VALUES (${parsed}, ${set_by || 'admin'}, ${note || null})`;
        await sql`
          INSERT INTO bcv_rate_current (id, rate, set_by, updated_at) VALUES (1, ${parsed}, ${set_by || 'admin'}, now())
          ON CONFLICT (id) DO UPDATE SET rate = EXCLUDED.rate, set_by = EXCLUDED.set_by, updated_at = EXCLUDED.updated_at
        `;
        return res.status(200).json({ message: 'Tasa BCV actualizada' });
      } catch (err: any) {
        console.error('Error actualizando BCV:', err);
        return res.status(500).json({ error: 'Error actualizando tasa BCV' });
      }
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