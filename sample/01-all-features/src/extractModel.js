const fs = require('fs');

const schemaFilePath = '../prisma/schema.prisma';
const outputFilePath = './generic/generic.model.ts';

const extractModel = (schemaContent) => {
  const startPattern = 'model';
  const endPattern = '}';
  const models = [];
  const modelNames = [];

  let startIndex = schemaContent.indexOf(startPattern);

  while (startIndex !== -1) {
    const modelNameStartIndex = startIndex + startPattern.length;
    const modelNameEndIndex = schemaContent.indexOf('{', modelNameStartIndex);

    if (modelNameEndIndex !== -1) {
      const modelName = schemaContent.substring(modelNameStartIndex, modelNameEndIndex).trim();
      modelNames.push(modelName);
    }

    const endIndex = schemaContent.indexOf(endPattern, startIndex + startPattern.length);

    if (endIndex !== -1) {
      const bookModel = schemaContent.substring(startIndex + startPattern.length, endIndex);
      models.push(bookModel);

      // Find the next occurrence of 'model'
      startIndex = schemaContent.indexOf(startPattern, endIndex);
    } else {
      break;
    }
  }
  return {
    models: models.length > 0 ? models : null,
    modelNames: modelNames.length > 0 ? modelNames : null,
  };
};

const convertToTypeScript = (prismaModel, prismaModelNames) => {
  const length = prismaModel.length;
  let tsCode = '';
  tsCode += 'import { Prisma } from "@prisma/client";\n\n';

  for (let i = 0; i < length; i++) {
    const model = prismaModel[i];
    const lines = model.split('\n');
    const properties = lines
      .filter(line => line.trim().length > 0 && !line.includes('{') && !line.includes('model'))
      .map(line => {
        const parts = line.trim().split(' ');
        const name = parts[0];
        let type = parts[1].replace('?', '').toLowerCase() || 'any';
        if (type === 'int' || type === 'float' || type === 'double') {
          type = 'number';
        }
        const optional = line.includes('?') ? '?' : '';
        return `${name}${optional}: ${type};`;
      });

    // tsCode += `model ${prismaModelNames[i]} {\n  ${properties.join('\n  ')}\n}\n\n`;
    tsCode += `export class ${prismaModelNames[i]} implements Prisma.${prismaModelNames[i]}CreateInput {\n  ${properties.join(
      '\n  '
    )}\n}\n\n`;
  }

  return tsCode;
};


const main = () => {
  const schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
  const Models = extractModel(schemaContent).models;
  const ModelNames = extractModel(schemaContent).modelNames;

  if (Models) {
    const tsCode = convertToTypeScript(Models, ModelNames);
    fs.writeFileSync(outputFilePath, tsCode);
    console.log('Model extracted and converted to TypeScript successfully.');
  } else {
    console.error('Failed to extract Book model from the schema.');
  }

};

main();