import * as fs from 'fs';
import pkg from '@prisma/internals';
const { getDMMF } = pkg;

const getJSON = async () => {
  const datamodel = fs.readFileSync('../prisma/schema.prisma', 'utf-8');
  // console.log(datamodel)
  const dmmf = await getDMMF({
    datamodel,
  });
  fs.writeFileSync('./dmmf.json', JSON.stringify(dmmf, null, 2));
  // console.log(dmmf)
};

(async () => await getJSON())();

// Read DMMF JSON file
const dmmfJson = fs.readFileSync('./dmmf.json', 'utf-8');
const dmmf = JSON.parse(dmmfJson);

// Generate TypeScript types from DMMF
function generateTypes(dmmf) {
  let typescriptTypes = '';

  // Iterate over each model in the DMMF
  for (const model of dmmf.datamodel.models) {
    typescriptTypes += `interface ${model.name} {\n`;

    // Iterate over each field in the model
    for (const field of model.fields) {
      // For simplicity, we assume all fields are optional
      typescriptTypes += `  ${field.name}?: ${field.type};\n`;
    }

    typescriptTypes += `}\n\n`;
  }

  return typescriptTypes;
}

// Generate TypeScript types
const typescriptTypes = generateTypes(dmmf);

// Write TypeScript types to a file
fs.writeFileSync('./generic/generic.model.ts', typescriptTypes);