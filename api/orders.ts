import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

  // --- GET: OBTENER PEDIDOS ---
  if (req.method === 'GET') {
    try {
      // Capturamos la cédula de la URL (si existe)
      const { cedula } = req.query;

      let orders;
      
      if (cedula) {
        // MODO CLIENTE: Solo sus pedidos
        orders = await sql`
          SELECT 
            id, 
            cliente_nombre, 
            cliente_cedula,
            cliente_telefono,
            total_pago, 
            metodo_pago, 
            referencia_pago,
            comprobante_url,
            estado, 
            items,
            fecha
          FROM compras
          WHERE cliente_cedula = ${cedula}
          ORDER BY fecha DESC
        `;
      } else {
        // MODO CAJERO/ADMIN: Todos los pedidos
        orders = await sql`
          SELECT 
            id, 
            cliente_nombre, 
            cliente_cedula,
            cliente_telefono,
            total_pago, 
            metodo_pago, 
            referencia_pago,
            comprobante_url,
            estado, 
            items,
            fecha
          FROM compras
          ORDER BY fecha DESC
        `;
      }

      return res.status(200).json(orders);
    } catch (error) {
      console.error("Error API:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // --- PATCH: ACTUALIZAR ESTADO Y STOCK (Igual que antes) ---
  if (req.method === 'PATCH') {
    const { id, estado } = req.body;
    
    try {
      if (estado === 'cancelado') {
        const orderResult = await sql`SELECT items, estado FROM compras WHERE id = ${id}`;
        if (orderResult.length > 0) {
          const currentOrder = orderResult[0];
          if (currentOrder.estado !== 'cancelado') {
            const items = typeof currentOrder.items === 'string' 
              ? JSON.parse(currentOrder.items) 
              : currentOrder.items;

            for (const item of items) {
              await sql`UPDATE productos SET stock = stock + ${item.quantity} WHERE id = ${item.id}`;
            }
          }
        }
      }
      await sql`UPDATE compras SET estado = ${estado} WHERE id = ${id}`;
      return res.status(200).json({ message: 'Estado actualizado' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}