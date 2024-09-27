# Spec generator
This is a custom CLI tool that generates and executes stencil commands based on user prompt, creates YAML configuration files, and runs the generated stencil spec.

Table of Contents
- Installation
- Linking the @samagra-x/stencil-cli Package
- Running the CLI
- Examples

### Installation
1. Clone this repository to your local machine.

    `git clone <repository-url> cd <repository-folder>`

2. Install the required dependencies using your package manager (e.g., npm or pnpm).

    `npm install`

Usage
The CLI generates project initialization commands for the `stencil` framework based on user prompts, then writes the configuration into a `spec.yaml` file, and finally runs the `stencil spec` command.

The tool supports the following options:

#### Tooling: 
- prisma
- user-service 
- monitoring 
- temporal 
- fileUpload 

#### Package Manager
- npm
- pnpm
- yarn
- bun

#### Docker Services
- Tooling Setup
  - logging
  - monitoring
  - temporal
- Adhoc Setup
  - postgres
  - hasura
  - fusionauth
  - minio

### Linking the @samagra-x/stencil-cli Package

Before using the CLI, you need to link the `@samagra-x/stencil-cli` package to your global node_modules to ensure the tool can call the stencil command.

1. Navigate to the @samagra-x/stencil-cli package folder. https://github.com/SamagraX-Stencil/stencil-cli/pull/31

        cd path/to/@samagra-x/stencil-cli

2. Run the following command to link the package globally.

        npm link

This will allow the `stencil` command to be used globally in your terminal.

3. Navigate back to the root of this project.

        cd path/to/this-project

### Running the CLI

To run the CLI, first build the project:

    npm run build

Then, execute the CLI with a user prompt:

   specgpt "<your-prompt-here>"

### For example:

    specgpt "Set up a project named AllInOneService with Prisma, user service, monitoring, temporal and file upload setup along with logging, monitoring, postgres,hasura, fusionauth and minio as docker service with npm as the package installer"

### Spec File Structure
```
stencil: 0.0.1

info:
  properties:
    project-name: "AllInOneService"
    package-manager: "npm" 
    
tooling: [prisma,user-service,temporal,fileUpload,monitoring]

docker: [monitoring,postgres,hasura,logging,fusionauth,minio]

endpoints:
```

This will:

Generate a corresponding stencil spec file with the relevant project configuration.

Run the stencil spec command using the generated spec.yaml.

### Demo
https://github.com/user-attachments/assets/c2257f98-60ad-4531-9c55-71129c8d525b

