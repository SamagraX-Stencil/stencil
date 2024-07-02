import { IsNumber, IsString, Max, Min } from "class-validator";
import { MultipartFile } from '../../interfaces/file-upload.interface';

export class UploadFileDTO {
    @IsNumber()
    @Min(100)
    @Max(599)
    statusCode?: number;

    @IsString()
    message: string;
    
    file?: { url: string } | undefined;
}
