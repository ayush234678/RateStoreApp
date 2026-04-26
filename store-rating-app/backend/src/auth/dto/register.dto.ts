import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MaxLength(400, { message: 'Address must not exceed 400 characters' })
  address: string;

  @IsString()
  @Length(8, 16, { message: 'Password must be 8-16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  password: string;
}

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @Length(8, 16, { message: 'Password must be 8-16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  newPassword: string;
}
