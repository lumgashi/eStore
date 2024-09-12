import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStringOrNumber', async: false })
export class CustomValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value === 'string') {
      return true;
    } else if (typeof value === 'number') {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    // Return a custom error message if validation fails
    return `${args.property} is invalid`;
  }
}
