/**
 * lib/db.ts
 * Capa de acceso a la base de datos (Neon/Postgres) usada por los endpoints y
 * componentes del frontend. Exporta funciones reutilizables:
 *  - getProducts(): productos con stock > 0 (catálogo público)
 *  - getAllProducts(): todos los productos (admin)
 *  - saveOrder(orderData, cartItems): guarda pedidos, gestiona cliente y stock
 *  - getOrders(), updateOrderStatus(): utilidades para cajero/administración
 *
 * Las funciones usan `Pool` de @neondatabase/serverless y manejan errores
 * devolviendo arrays vacíos o lanzando cuando es crítico.
 */

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


// En lib/db.ts

export const saveOrder = async (orderData: any, cartItems: any[]) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cedulaString = String(orderData.cedula).trim(); 
    
    // GESTIÓN INTELIGENTE DEL CLIENTE (Incluyendo dirección que arreglamos antes)
    const checkQuery = 'SELECT id FROM clientes WHERE id = $1';
    const checkRes = await client.query(checkQuery, [cedulaString]);
    const clientAddress = orderData.address || ""; 

    if (checkRes.rows.length > 0) {
      await client.query(
        'UPDATE clientes SET telefono = $1, correo = $2, nombre_completo = $3, direccion = $4 WHERE id = $5',
        [orderData.phone, orderData.email, orderData.fullName, clientAddress, cedulaString]
      );
    } else {
      await client.query(
        'INSERT INTO clientes (id, nombre_completo, correo, telefono, direccion) VALUES ($1, $2, $3, $4, $5)',
        [cedulaString, orderData.fullName, orderData.email, orderData.phone, clientAddress]
      );
    }

    // 3. GUARDAR COMPRA (AHORA CON REFERENCIA Y COMPROBANTE)
    // Nota: Si es pago en tienda, referencia y comprobante serán null o vacíos
    const insertOrderQuery = `
      INSERT INTO compras (
        cliente_nombre, 
        cliente_cedula, 
        cliente_telefono, 
        total_pago, 
        metodo_pago, 
        referencia_pago,   -- Nuevo campo
        comprobante_url,   -- Nuevo campo
        estado, 
        items, 
        fecha
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8, NOW())
      RETURNING id;
    `;
    
    const itemsJson = JSON.stringify(cartItems);

    const resOrder = await client.query(insertOrderQuery, [
      orderData.fullName,
      orderData.cedula,
      orderData.phone,
      orderData.total,
      orderData.paymentMethod,
      orderData.reference || null,      // Si no hay referencia, enviamos null
      orderData.receiptImage || null,   // Si no hay imagen, enviamos null
      itemsJson
    ]);
    
    const orderId = resOrder.rows[0].id;

    // 4. RESTAR STOCK
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