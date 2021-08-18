import { ApiProperty } from '@nestjs/swagger';

export class UserResetPasswordeDTO {
  @ApiProperty({
    description: 'Username',
    example: '1806001',
  })
  username: string;

  @ApiProperty({
    description: 'New Password',
    example: '123124234532',
  })
  password: string;

}
