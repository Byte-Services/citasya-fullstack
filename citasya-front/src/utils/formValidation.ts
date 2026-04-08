export const hasAtSymbol = (value: string): boolean => value.includes('@');

export const sanitizeNumericValue = (value: string): string =>
  value.replace(/\D/g, '');

export const sanitizeDecimalValue = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');

  if (parts.length <= 1) return cleaned;

  return `${parts[0]}.${parts.slice(1).join('')}`;
};

export const formatPhoneWithCodeDash = (
  value: string,
  codeLength = 4,
  maxDigits = 11,
): string => {
  const digits = sanitizeNumericValue(value).slice(0, maxDigits);

  if (digits.length <= codeLength) return digits;

  return `${digits.slice(0, codeLength)}-${digits.slice(codeLength)}`;
};

export const validatePhoneDigits = (
  value: string,
  minDigits = 10,
  maxDigits = 11,
): true | string => {
  const digitCount = sanitizeNumericValue(value).length;

  if (digitCount < minDigits || digitCount > maxDigits) {
    return `El telefono debe tener entre ${minDigits} y ${maxDigits} digitos`;
  }

  return true;
};
