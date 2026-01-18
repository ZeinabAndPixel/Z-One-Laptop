import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // DEBUG: Verificar si la variable existe
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ 
      error: 'CRÍTICO: La variable DATABASE_URL no existe o está vacía.',
      check: 'Revisa en Vercel > Settings > Environment Variables'
    });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { categoria } = req.query;
    
    // DEBUG: Ver qué categoría está llegando
    console.log("Buscando categoría:", categoria);

    let result;
    if (categoria === 'Fuentes de Poder') {
        result = await sql`SELECT * FROM productos WHERE categoria = 'Fuentes de Poder' OR categoria = 'Gabinetes'`;
    } else {
        result = await sql`SELECT * FROM productos WHERE categoria = ${categoria}`;
    }

    return res.status(200).json(result);
  } catch (error) {
    // DEBUG: Devolver el error real al navegador para que lo leas
    return res.status(500).json({ 
      error: 'Error de Base de Datos', 
      details: error.message 
    });
  }
}
