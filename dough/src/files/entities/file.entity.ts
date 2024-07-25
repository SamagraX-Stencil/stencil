import { ApiProperty } from '@nestjs/swagger';

export class FileEntity {
  @ApiProperty({ example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae' })
  id: string;

  @ApiProperty({
    example: 'https://example.com/files/cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  path: string;
}
