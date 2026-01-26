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

    // 1. FORZAR CÉDULA A STRING (Soluciona el error de tipos)
    const cedulaString = String(orderData.cedula).trim(); 
    
    // 2. GESTIÓN INTELIGENTE DEL CLIENTE
    // Verificamos si existe en la tabla clientes
    const checkQuery = 'SELECT id FROM clientes WHERE id = $1';
    const checkRes = await client.query(checkQuery, [cedulaString]);

    if (checkRes.rows.length > 0) {
      // Si existe, actualizamos datos de contacto para no tener celdas viejas/vacias
      await client.query(
        'UPDATE clientes SET telefono = $1, correo = $2, nombre_completo = $3 WHERE id = $4',
            [orderData.phone, orderData.email, orderData.fullName, cedulaString]
      );
    } else {
      // Si no existe, lo creamos limpio
      await client.query(
        'INSERT INTO clientes (id, nombre_completo, correo, telefono) VALUES ($1, $2, $3, $4)',
        [cedulaString, orderData.fullName, orderData.email, orderData.phone]
      );
    }

    // 3. GUARDAR COMPRA (Usando la cédula string estandarizada)
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

// --- OBTENER TODOS LOS PRODUCTOS (ADMIN - Ver todo) ---
// Esta es la nueva función que usará tu Dashboard
export const getAllProducts = async () => {
  try {
    // SIN el filtro "WHERE stock > 0"
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    return rows;
  } catch (error) {
    console.error("Error cargando inventario admin:", error);
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