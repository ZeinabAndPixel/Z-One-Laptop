import { Pool } from '@neondatabase/serverless';

// 1. Configuración de conexión (Igual que antes)
const getConnectionString = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DATABASE_URL) {
    return import.meta.env.VITE_DATABASE_URL;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
  }
  return undefined;
};

const pool = new Pool({ connectionString: getConnectionString() });

// --- GUARDAR ORDEN (Adaptado a TU esquema exacto) ---
export const saveOrder = async (orderData: any, cartItems: any[]) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // DATOS SEGUROS
    // Tu tabla 'clientes' obliga a tener 'correo'. Si está vacío, generamos uno falso.
    const emailSeguro = orderData.email || `${orderData.cedula}@cliente-tienda.com`;
    // Tu tabla 'clientes' no tiene 'cedula', pero tiene 'id' de texto. Usaremos la Cédula como ID.
    const clienteId = orderData.cedula; 

    // PASO 1: GESTIONAR CLIENTE (Tabla: clientes)
    // Buscamos por ID (que es la cédula)
    const checkQuery = 'SELECT id FROM clientes WHERE id = $1';
    const checkRes = await client.query(checkQuery, [clienteId]);

    if (checkRes.rows.length > 0) {
      // SI EXISTE: Actualizamos teléfono y correo (usando nombre de columna 'correo')
      await client.query(
        'UPDATE clientes SET telefono = $1, correo = $2 WHERE id = $3',
        [orderData.phone, emailSeguro, clienteId]
      );
    } else {
      // SI NO EXISTE: Insertamos (usando 'correo' y 'nombre_completo')
      await client.query(
        'INSERT INTO clientes (id, nombre_completo, correo, telefono) VALUES ($1, $2, $3, $4)',
        [clienteId, orderData.fullName, emailSeguro, orderData.phone]
      );
    }

    // PASO 2: GUARDAR COMPRA (Tabla: compras)
    // Usamos las columnas que SÍ existen en tu esquema: 
    // cliente_nombre, cliente_cedula, cliente_telefono, total_pago, items
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
      RETURNING id;
    `;
    
    const itemsJson = JSON.stringify(cartItems);

    const resOrder = await client.query(insertOrderQuery, [
      orderData.fullName,
      orderData.cedula,
      orderData.phone,
      orderData.total,
      orderData.paymentMethod,
      itemsJson
    ]);
    
    const orderId = resOrder.rows[0].id; // Esto devolverá un UUID

    // PASO 3: RESTAR STOCK (Tabla: productos)
    for (const item of cartItems) {
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2', 
        [item.quantity, item.id]
      );
    }

    await client.query('COMMIT');
    console.log("✅ Pedido completado. ID:", orderId);
    return orderId;

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("❌ ERROR BD:", error);
    // Este mensaje te dirá exactamente qué pasa si falla de nuevo
    throw new Error(error.message || "Error al guardar en base de datos");
  } finally {
    client.release();
  }
};

// --- OBTENER PRODUCTOS ---
export const getProducts = async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos WHERE stock > 0');
    return rows;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --- OBTENER ORDENES (Cajero) ---
export const getOrders = async () => {
  try {
    // Tu tabla compras tiene 'fecha', ordenamos por eso
    const { rows } = await pool.query('SELECT * FROM compras ORDER BY fecha DESC');
    return rows;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --- ACTUALIZAR ORDEN (Cajero) ---
export const updateOrderStatus = async (id: string, status: string) => {
  try {
    // El ID es UUID (string), así que TypeScript no se quejará
    await pool.query('UPDATE compras SET estado = $1 WHERE id = $2', [status, id]);
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};