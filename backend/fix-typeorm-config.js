const fs = require('fs');
const path = require('path');

// Path to app.module.ts
const appModulePath = path.join(__dirname, 'src', 'app.module.ts');

try {
  console.log(`Reading file: ${appModulePath}`);
  
  // Read the current content
  const content = fs.readFileSync(appModulePath, 'utf8');
  
  // Check if the file already has the naming strategy
  if (content.includes('namingStrategy')) {
    console.log('File already has naming strategy configuration.');
    return;
  }
  
  // Add import for SnakeNamingStrategy if it doesn't exist
  let updatedContent = content;
  
  if (!content.includes('typeorm-naming-strategies')) {
    const importLine = "import { SnakeNamingStrategy } from 'typeorm-naming-strategies';\n";
    // Add after the last import
    const lastImportIndex = content.lastIndexOf('import');
    const lastImportEndIndex = content.indexOf('\n', lastImportIndex);
    updatedContent = 
      content.substring(0, lastImportEndIndex + 1) + 
      importLine + 
      content.substring(lastImportEndIndex + 1);
  }
  
  // Add naming strategy configuration to TypeOrmModule.forRoot
  const typeOrmConfig = 'TypeOrmModule.forRoot({';
  const configEndIndex = updatedContent.indexOf('})');
  
  // Check if the synchronize line exists and insert before it
  const synchronizeIndex = updatedContent.indexOf('synchronize:', 0, configEndIndex);
  
  if (synchronizeIndex !== -1) {
    const insertIndex = updatedContent.lastIndexOf('\n', synchronizeIndex);
    updatedContent = 
      updatedContent.substring(0, insertIndex) + 
      '\n      namingStrategy: new SnakeNamingStrategy(),' + 
      updatedContent.substring(insertIndex);
  } else {
    // If no synchronize line, add it before the closing bracket
    updatedContent = 
      updatedContent.substring(0, configEndIndex) + 
      '\n      namingStrategy: new SnakeNamingStrategy(),' + 
      updatedContent.substring(configEndIndex);
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(appModulePath, updatedContent, 'utf8');
  console.log('Successfully updated app.module.ts with SnakeNamingStrategy configuration.');
  
} catch (error) {
  console.error('Error updating app.module.ts:', error);
}

// Additionally, let's create a quick fix to update all existing Order entities
// Path to order.entity.ts
const orderEntityPath = path.join(__dirname, 'src', 'modules', 'order', 'entities', 'order.entity.ts');

try {
  console.log(`\nReading file: ${orderEntityPath}`);
  
  // Read the current content
  const content = fs.readFileSync(orderEntityPath, 'utf8');
  
  // Ensure all column declarations have explicit name mappings
  // For the orderNumber specifically, ensure it has name: 'order_number'
  const orderNumberLineRegex = /@Column\(.*?\)\s*orderNumber:/;
  const orderNumberLine = content.match(orderNumberLineRegex);
  
  if (orderNumberLine) {
    console.log('Found orderNumber property, checking if it has correct name mapping...');
    
    if (!content.includes("name: 'order_number'") && !content.includes('name: "order_number"')) {
      // Add the name attribute if it doesn't exist
      console.log('Updating orderNumber property with explicit column name mapping...');
      
      const updatedContent = content.replace(
        /@Column\((.*?)\)\s*orderNumber:/g, 
        (match, p1) => {
          // If it already has parameters, add name to them
          if (p1.trim() !== '') {
            if (p1.endsWith('}')) {
              return `@Column({ name: 'order_number', ${p1.substring(1)})\norderNumber:`;
            } else {
              return `@Column({ name: 'order_number', ${p1} })\norderNumber:`;
            }
          } else {
            return `@Column({ name: 'order_number' })\norderNumber:`;
          }
        }
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(orderEntityPath, updatedContent, 'utf8');
      console.log('Successfully updated order.entity.ts with explicit column name mappings.');
    } else {
      console.log('orderNumber property already has the correct column name mapping.');
    }
  } else {
    console.log('Could not find orderNumber property in order.entity.ts');
  }
  
} catch (error) {
  console.error('Error updating order.entity.ts:', error);
} 