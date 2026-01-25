import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

  if (req.method === 'GET') {
    try {
      // Hacemos el SELECT mapeando tus columnas a lo que espera el Frontend
      const orders = await sql`
        SELECT 
          id, 
          total_pago, 
          metodo_pago, 
          estado,
          fecha,
          cliente_nombre as nombre_completo, 
          cliente_cedula as cedula
        FROM compras
        ORDER BY fecha DESC
      `;
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    const { id, estado } = req.body;
    try {
      await sql`UPDATE compras SET estado = ${estado} WHERE id = ${id}`;
      return res.status(200).json({ message: 'Estado actualizado' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}