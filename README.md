
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
          validationGroup: ['first', 'second', 'third']//validation groups/
      },
      url_redirect: {
            // if discount code is empty(discount code is a field of current validation object) will validate current field
            if: {
                target: 'discount_code',
                value: ['']
            },
            notBlank: true,
            regExp: /(^$|(http(s?):\/\/)?[^.]+\..+)/,
            validationGroup: ['second', 'third']
        },
        age_from: {
            notBlank: true,
            moreThen: {
                target: 18,
                type: 'value',//can be value or field, if field will check field value
                //Callback for comparing of two values
                compareCallback: function (current, target) {
                    var age_from = +current;
                    target = +target;

                    if ((!age_from && age_from !== 0) || (!target && target !== 0)) {
                        return false;
                    }

                    return age_from >= target ? true : false;
                }
            },
            validationGroup: ['second', 'third']
        },
        //you can check child filed
        image: {
            source: {
                notBlank: true,
                validationGroup: ['second', 'third']
            },
            size: {
                maxImageSize: '500K',
                validationGroup: ['second', 'third']
            },
            type: {
                imageType: ['image/jpeg', 'image/jpg', 'image/png'],
                validationGroup: ['second', 'third']
            },
            width: {
                equal: 355,
                validationGroup: ['second', 'third']
            },
            height: {
                equal: 150,
                validationGroup: ['second', 'third']
            }
        },
        product_name: {
                // You can add more complex condition (IF product_type='static' AND need_header=1) Will check
                if: {
                    type: 'and',
                    fields: [
                        {
                            target: 'product_type',
                            value: ['static']
                        },
                        {
                            target: 'need_header',
                            value: ['1']
                        }
                    ]
                },
                notBlank: true,
                maxLength: 100,
                validationGroup: ['second', 'third']
            },
}
