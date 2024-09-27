#! /usr/bin/env node

import { Command } from "commander";
import { getLLMResponse, runStencilSpec } from "../src/index.js";
import { writeYAMLToFile } from "../src/yamlgen.js";
import * as ora from 'ora';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as path from 'path';

const prompt = inquirer.createPromptModule();

const program = new Command();

program
  .version('0.1.0')
  .description('CLI to generate stencil YAML configuration and run stencil spec from a prompt')
  .argument('<prompt>', 'User prompt for project generation or spec.yaml')
  .action(async (initialPrompt: string) => {

    let continueFlow = true;
    let promptInput = initialPrompt;

    while (continueFlow) {
      const result = await getLLMResponse({ inputs: promptInput });
      
      const specFilePath = path.join(process.cwd(), "spec.yaml");
      const updatedSpecFile = writeYAMLToFile(result.response, "spec.yaml");

      console.info("\nGenerated Spec File:");
      console.info(updatedSpecFile);  
      console.info(`Specification file written to ${specFilePath}`);

      const confirmQuestion: any = {
        type: 'confirm',
        name: 'looksGood',
        message: 'Does the spec file look good?',
        default: true,
      };

      const answers = await prompt([confirmQuestion]);

      if (answers.looksGood) {
        runStencilSpec();  
        continueFlow = false; 
      } else {
        const regenerateQuestion: any = {
          type: 'confirm',
          name: 'regenerate',
          message: 'Do you want to regenerate the spec by giving a new prompt?',
          default: true,
        };

        const regenerateAnswer: any = await prompt([regenerateQuestion]);

        if (regenerateAnswer.regenerate) {
          const newPromptQuestion: any = {
            type: 'input',
            name: 'newPrompt',
            message: 'Please provide a new prompt:',
          };

          const newPromptAnswer: any = await prompt([newPromptQuestion]);

          promptInput = newPromptAnswer.newPrompt; 
        } else {
          console.info(`\nYou can manually edit the spec file at: ${specFilePath}`);
          console.info('Once edited, you can run the command:');
          console.info(`stencil spec spec.yaml`);
          continueFlow = false;
        }
      }
    }
  });

program.parse(process.argv);
