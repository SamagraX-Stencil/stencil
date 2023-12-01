import * as addressSchema from './../address.json';
import * as educationSchema from './../education.json';

import { correctAddress, correctEducation } from './data';

import Ajv from 'ajv';

const createCopy = (obj) => JSON.parse(JSON.stringify(obj));

describe('JSON-Schema Address', () => {
  const ajv = new Ajv();
  ajv.addSchema(addressSchema, 'address');
  ajv.addSchema(educationSchema, 'education');
  const validate = ajv.compile(addressSchema);

  it('should parse address correctly', () => {
    const valid = validate(correctAddress);
    expect(valid).toBeTruthy();
  });

  it('should parse null/undefined address incorrectly', () => {
    expect(validate({})).toBeFalsy();
    expect(validate(undefined)).toBeFalsy();
  });

  it('should fail parsing address with missing fields', () => {
    const correctAddressCopy = createCopy(correctAddress);
    delete correctAddressCopy.city;
    const valid = validate(correctAddressCopy);
    expect(validate.errors[0].params).toHaveProperty('missingProperty');
    expect(validate.errors[0].params.missingProperty).toEqual('city');
    expect(valid).toBeFalsy();
  });
});

describe('JSON-Schema Education', () => {
  const ajv = new Ajv();
  ajv.addSchema(addressSchema, 'address');
  ajv.addSchema(educationSchema, 'education');
  const validate = ajv.compile(educationSchema);

  it('should parse Education correctly', () => {
    expect(validate(correctEducation)).toBeTruthy();
  });

  it('should parse null/undefined Education incorrectly', () => {
    expect(validate({})).toBeFalsy();
    expect(validate(undefined)).toBeFalsy();
  });

  it('should fail parsing Education with missing fields in address - city', () => {
    const correctEducationCopy = createCopy(correctEducation);
    delete correctEducationCopy.address.city;
    const valid = validate(correctEducationCopy);
    expect(validate.errors[0].params).toHaveProperty('missingProperty');
    expect(validate.errors[0].params.missingProperty).toEqual('city');
    expect(valid).toBeFalsy();
  });
});
