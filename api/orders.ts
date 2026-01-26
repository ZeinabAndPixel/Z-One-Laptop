import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Conexión segura para Vercel Functions
  const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

  if (req.method === 'GET') {
    try {
      // SOLUCIÓN: Traemos TODAS las columnas necesarias para el dashboard avanzado
      const orders = await sql`
        SELECT 
          id, 
          cliente_nombre, 
          cliente_cedula,
          cliente_telefono, -- Agregado
          total_pago, 
          metodo_pago, 
          referencia_pago,  -- Agregado
          comprobante_url,  -- Agregado
          estado, 
          items,            -- Agregado (El JSON de productos)
          fecha
        FROM compras
        ORDER BY fecha DESC
      `;
      return res.status(200).json(orders);
    } catch (error) {
      console.error("Error API:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    const { id, estado } = req.body;
    try {
      // El ID viene como UUID (string) desde la BD
      await sql`UPDATE compras SET estado = ${estado} WHERE id = ${id}`;
      return res.status(200).json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}