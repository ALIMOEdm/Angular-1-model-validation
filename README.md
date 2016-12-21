
Sample of using
//params - validation group, entity, validation_rules, object with errors
hasError = FormValidationService.validate('second', self.advert, self.validation, self.errors);
if (hasError) {
    return;
}

Samples of validation_rules object

self.validation = {
      advert_name: {
          notBlank: true,
          maxLength: 20,
          validationGroup: ['first', 'second', 'third']
      },
}
