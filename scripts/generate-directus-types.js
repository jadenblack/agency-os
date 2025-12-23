// scripts/generate-directus-types.js
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const fs = require('fs');
const path = require('path');

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('Error: Debes configurar DIRECTUS_ADMIN_TOKEN en tu .env.local');
  process.exit(1);
}

console.log('Generando tipos de Directus desde:', DIRECTUS_URL);

const url = `${DIRECTUS_URL}/schema/snapshot?access_token=${DIRECTUS_TOKEN}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const schema = response.data || response;
      
      if (!schema.collections) {
        console.error('Error: No se encontraron colecciones en el schema');
        process.exit(1);
      }

      // Mapear relaciones
      const relations = {};
      if (schema.relations) {
        schema.relations.forEach(rel => {
          if (!relations[rel.collection]) {
            relations[rel.collection] = {};
          }
          relations[rel.collection][rel.field] = {
            relatedCollection: rel.related_collection,
            meta: rel.meta
          };
        });
      }
      
      // Generar tipos TypeScript
      let types = `// Auto-generated Directus Schema Types
// Generated on: ${new Date().toISOString()}

export interface DirectusSchema {
`;

      // Generar referencias a colecciones
      schema.collections.forEach((collection) => {
        const collectionName = collection.collection;
        types += `  ${collectionName}: ${collectionName}Item[];\n`;
      });

      types += `}\n\n`;

      // Generar interfaces individuales
      schema.collections.forEach((collection) => {
        const collectionName = collection.collection;
        
        types += `export interface ${collectionName}Item {\n`;
        
        const fields = schema.fields.filter(f => f.collection === collectionName);
        
        fields.forEach((field) => {
          const fieldName = field.field;
          let fieldType = 'any';
          
          // Verificar si es una relación
          const relation = relations[collectionName]?.[fieldName];
          
          if (relation && relation.relatedCollection) {
            // Es una relación - usar el tipo de la colección relacionada
            const relatedType = `${relation.relatedCollection}Item`;
            
            // Determinar si es un array o un objeto único
            if (field.type === 'alias' || field.meta?.special?.includes('m2m') || field.meta?.special?.includes('o2m')) {
              fieldType = `${relatedType}[] | string[]`;
            } else {
              fieldType = `${relatedType} | string`;
            }
          } else {
            // Campo normal - mapear tipo
            switch (field.type) {
              case 'string':
              case 'text':
                fieldType = 'string';
                break;
              case 'integer':
              case 'bigInteger':
              case 'float':
              case 'decimal':
                fieldType = 'number';
                break;
              case 'boolean':
                fieldType = 'boolean';
                break;
              case 'timestamp':
              case 'datetime':
              case 'date':
              case 'time':
                fieldType = 'string';
                break;
              case 'uuid':
                fieldType = 'string';
                break;
              case 'json':
                fieldType = 'any';
                break;
              default:
                fieldType = 'any';
            }
          }
          
          const nullable = field.schema?.is_nullable ? ' | null' : '';
          types += `  ${fieldName}${field.schema?.is_nullable ? '?' : ''}: ${fieldType}${nullable};\n`;
        });
        
        types += `}\n\n`;
      });

      // Agregar tipos de Directus system
      types += `// Directus System Types
export interface directus_usersItem {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  password?: string | null;
  location?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: any | null;
  avatar?: string | null;
  language?: string | null;
  theme?: string | null;
  tfa_secret?: string | null;
  status?: string | null;
  role?: string | null;
  token?: string | null;
  last_access?: string | null;
  last_page?: string | null;
}

export interface directus_filesItem {
  id: string;
  storage: string;
  filename_disk?: string | null;
  filename_download: string;
  title?: string | null;
  type?: string | null;
  folder?: string | null;
  uploaded_by?: string | null;
  uploaded_on: string;
  modified_by?: string | null;
  modified_on: string;
  charset?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  embed?: string | null;
  description?: string | null;
  location?: string | null;
  tags?: any | null;
  metadata?: any | null;
}
`;

      const typesDir = path.join(process.cwd(), 'src', 'types');
      if (!fs.existsSync(typesDir)) {
        fs.mkdirSync(typesDir, { recursive: true });
      }

      fs.writeFileSync(path.join(typesDir, 'directus.ts'), types);
      
      console.log('✅ Tipos generados correctamente en src/types/directus.ts');
      console.log(`   ${schema.collections.length} colecciones procesadas`);
      console.log(`   ${Object.keys(relations).length} relaciones detectadas`);
      
    } catch (error) {
      console.error('Error al procesar el schema:', error);
      console.error(error.stack);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('Error al conectar con Directus:', error.message);
  process.exit(1);
});