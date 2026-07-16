import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class UpdateAiSettingsDto {
  @IsString()
  @IsOptional()
  geminiApiKey?: string;
}

export class UpdateWhatsAppSettingsDto {
  @IsString()
  @IsOptional()
  waPhoneNumberId?: string;

  @IsString()
  @IsOptional()
  waAccessToken?: string;

  @IsString()
  @IsOptional()
  waBusinessAccountId?: string;
}

export class UpdateEmailSettingsDto {
  @IsString()
  @IsOptional()
  @IsIn(['SMTP', 'RESEND', 'GMAIL_OAUTH'])
  emailProvider?: string;

  @IsString()
  @IsOptional()
  resendApiKey?: string;

  @IsString()
  @IsOptional()
  smtpHost?: string;

  @IsInt()
  @IsOptional()
  smtpPort?: number;

  @IsString()
  @IsOptional()
  smtpUser?: string;

  @IsString()
  @IsOptional()
  smtpPass?: string;

  @IsString()
  @IsOptional()
  gmailClientId?: string;

  @IsString()
  @IsOptional()
  gmailClientSecret?: string;

  @IsString()
  @IsOptional()
  gmailRefreshToken?: string;
}

export class TestWhatsAppDto {
  @IsString()
  testPhone: string; // phone to send test to e.g. "+919876543210"
}

export class TestEmailDto {
  @IsString()
  testEmail: string; // email to send test to
}
