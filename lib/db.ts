import { Pool } from '@neondatabase/serverless';

// --- CORRECCIÓN IMPORTANTE ---
// Esta función busca la URL de la base de datos de forma segura
// tanto si estás en el navegador (Vite) como si estás en el servidor (API)
const getConnectionString = () => {
  // Intenta obtenerla para Vite (Navegador)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DATABASE_URL) {
    return import.meta.env.VITE_DATABASE_URL;
  }
  // Intenta obtenerla para Node.js (Servidor/API)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
  }
  return undefined;
};

// Creamos la conexión con la URL detectada
const pool = new Pool({
  connectionString: getConnectionString(),
});

// --- 1. OBTENER PRODUCTOS (Catálogo) ---
// Solo trae productos que tengan stock disponible
export const getProducts = async () => {
  try {
    const connectionString = getConnectionString();
    if (!connectionString) {
      console.error("⛔ ERROR CRÍTICO: No se encontró la URL de la base de datos (VITE_DATABASE_URL). Revisa tu archivo .env");
      return []; // Retorna array vacío para que no explote la app
    }

    const { rows } = await pool.query('SELECT * FROM productos WHERE stock > 0');
    return rows;
  } catch (error) {
    console.error('Error fetching products from Neon:', error);
    throw error;
  }
};

// --- 2. GUARDAR ORDEN Y RESTAR INVENTARIO (Checkout) ---
export const saveOrder = async (orderData: any, cartItems: any[]) => {
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); 

    // A. Guardar la compra
    const insertOrderQuery = `
      INSERT INTO compras (
        cliente_nombre, 
        cliente_cedula, 
        cliente_telefono, 
        total_pago, 
        metodo_pago, 
        estado, 
        items,
        fecha
      ) 
      VALUES ($1, $2, $3, $4, $5, 'pendiente', $6, NOW())
      RETURNING id
    `;
    
    const values = [
      orderData.fullName,
      orderData.cedula,
      orderData.phone,
      orderData.total,
      orderData.paymentMethod,
      JSON.stringify(cartItems)
    ];

    const res = await client.query(insertOrderQuery, values);
    const orderId = res.rows[0].id;

    // B. Restar stock
    for (const item of cartItems) {
      const updateStockQuery = `
        UPDATE productos 
        SET stock = stock - $1 
        WHERE id = $2
      `;
      await client.query(updateStockQuery, [item.quantity, item.id]);
    }

    await client.query('COMMIT'); 
    return orderId;

  } catch (error) {
    await client.query('ROLLBACK'); 
    console.error('Error al procesar orden:', error);
    throw error;
  } finally {
    client.release(); 
  }
};

// --- 3. OBTENER ORDENES (Para el Cajero) ---
export const getOrders = async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM compras ORDER BY fecha DESC');
    return rows;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// --- 4. ACTUALIZAR ESTADO DE ORDEN (Para el Cajero) ---
export const updateOrderStatus = async (id: number, status: string) => {
  try {
    await pool.query('UPDATE compras SET estado = $1 WHERE id = $2', [status, id]);
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};