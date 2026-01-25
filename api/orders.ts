import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // GET: Obtener todas las órdenes (Solo para el Dashboard)
  if (req.method === 'GET') {
    try {
      // Unimos tablas para ver quién compró qué
      const orders = await sql`
        SELECT 
          compras.id, 
          compras.total_pago, 
          compras.metodo_pago, 
          compras.estado,
          compras.fecha,
          usuarios.nombre_completo,
          usuarios.cedula
        FROM compras
        JOIN usuarios ON compras.cliente_id = usuarios.id
        ORDER BY compras.fecha DESC
      `;
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH: Actualizar estado (Ej: de 'pendiente' a 'entregado')
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