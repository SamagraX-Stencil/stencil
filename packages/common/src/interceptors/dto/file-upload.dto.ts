import { Multer } from "multer";

export type MulterInstance = Multer;

export type InterceptResponseDTO = {
    observable : { [fieldName: string]: Express.Multer.File }; 
  } 