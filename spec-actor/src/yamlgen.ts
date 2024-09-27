import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

function getDependencyVersion(dependencyName: string): string {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const version = packageJson.dependencies?.[dependencyName];

  return version ? version.replace("^", "") : "version not found";
}

export function convertCommandToYAML(stencilCommand: string): string {
  const projectNameMatch = stencilCommand.match(/stencil new (\w+)/);
  const projectName = projectNameMatch ? projectNameMatch[1] : "UnknownProject";

  const packageManagerMatch = stencilCommand.match(/--package-manager (\w+)/);
  const packageManager = packageManagerMatch ? packageManagerMatch[1] : "npm";

  const tooling: string[] = [];
  const options = ["prisma","user-service", "monitoring", "temporal", "fileUpload"];
  options.forEach(option => {
    if (stencilCommand.includes(`--${option} yes`)) {
      tooling.push(option);
    }
  });
  
  const stencilVersion = getDependencyVersion("@samagra-x/stencil-cli");

  const yamlContent = `
stencil: ${stencilVersion}

info:
  properties:
    project-name: "${projectName}"
    package-manager: "${packageManager}"
    
tooling: [${tooling.join(", ")}]

endpoints:
  `;

  return yamlContent.trim();
}

export function writeYAMLToFile(yamlContent: string, fileName: string) {
  const filePath = path.join(process.cwd(), fileName);
  interface ParsedYaml {
    info?: {
      properties?: {
        'project-name'?: string;
        'package-manager'?: string;
      };
    };
  }

  try {
    let parsedYaml = yaml.load(yamlContent) as ParsedYaml;
  
    if (parsedYaml?.info?.properties?.['project-name'] === "") {
      parsedYaml.info.properties['project-name'] = 'Stencil-app';
    }
  
    if (parsedYaml?.info?.properties?.['package-manager'] === "") {
      parsedYaml.info.properties['package-manager'] = 'npm';
    }
  
    yamlContent = yaml.dump(parsedYaml);
  
  } catch (e) {
    console.error('Failed to parse YAML content:', e);
  }
  
  
  fs.writeFileSync(filePath, yamlContent, "utf-8");
  return yamlContent;
}
