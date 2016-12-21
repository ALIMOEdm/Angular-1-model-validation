app.service('FormValidationService', [function () {
    this.validate = function (validation_group, object, validator, errorr_object, original_ob, is_recursive) {
        var hasError = false;
        var original = object;//save original object
        if (is_recursive) {
            original = JSON.parse(JSON.stringify(original_ob));
        }
        var key_words = {
            if: 1
        };

        for (var key in object) {
            if (!validator[key]) {
                continue;
            }
            if (object !== null && typeof object[key] === 'object' && !Array.isArray(object[key]) && !key_words[key]) {
                // If here object which has several fields for verify, verify every field
                var res = this.validate(validation_group, object[key], validator[key], errorr_object[key], original, 1);
                if (res) {
                    hasError = true;
                }
            }
            if (key in validator) {
                if (!validator[key]) {
                    continue;
                }
                //check if our validation group is active
                if (validation_group && validator[key].validationGroup && validator[key].validationGroup.length) {
                    var has_group = false;
                    for (var i = 0; i < validator[key].validationGroup.length; i++) {
                        if (validator[key].validationGroup[i] === validation_group) {
                            has_group = true;
                        }
                    }
                    if (!has_group) {
                        continue;
                    }
                }
                var isIf = false;
                // If we found -if- key word
                if (validator[key]['if']) {
                    isIf = true;
                    // Try to find related field
                    var if_obj = validator[key]['if'];
                    if (if_obj.target) {
                        var target_value = getRelatedField(if_obj, key, 'if', original);
                        // Clear all errors on this field if value in related field and in IF condition are identical
                        if (!inArray(if_obj['value'], target_value))  {
                            for (var key_validation in validator[key]) {
                                setErrorInErrorObject(errorr_object, key, 'hasError', false);
                                setErrorInErrorObject(errorr_object, key, key_validation, false);
                            }
                            continue;
                        }
                    } else {
                        if (!complexCondition(if_obj, validator, errorr_object, original)){
                            for (var key_validation in validator[key]) {
                                setErrorInErrorObject(errorr_object, key, 'hasError', false);
                                setErrorInErrorObject(errorr_object, key, key_validation, false);
                            }
                            continue
                        }
                    }


                }

                var hasErrorLocal = false;

                // Check validation rules
                for (var key_validation in validator[key]) {
                    try{

                        if (object[key] == undefined) {
                            object[key] = '';
                        }

                        switch (key_validation) {
                            // If value must be not blank
                            case 'notBlank':
                                if (!object[key]) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            // If value must be less than
                            case 'maxLength':
                                if (object[key].length > validator[key][key_validation]) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            case 'minLength':
                                if (object[key].length < validator[key][key_validation]) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            // If value is array, and must contains at least one element
                            case 'minCount':
                                if (object[key].length < validator[key][key_validation]) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            case 'equal':
                                if (object[key] !== validator[key][key_validation]) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            case 'regExp':
                                if ((validator[key][key_validation] instanceof RegExp) === false) {
                                    throw new Error('Expected RegExp');
                                }

                                if (!validator[key][key_validation].test(object[key])) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            case 'moreThen':
                                var _target_value = validator[key][key_validation]['target'];
                                if (validator[key][key_validation]['type'] === 'field') {
                                    _target_value = getRelatedField(validator[key][key_validation], key, key_validation, original);
                                }
                                if (!validator[key][key_validation]['compareCallback'](object[key], _target_value)) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            case 'lessThen':
                                var _target_value = validator[key][key_validation]['target'];
                                if (validator[key][key_validation]['type'] === 'field') {
                                    _target_value = getRelatedField(validator[key][key_validation], key, key_validation, original);
                                }
                                if (!validator[key][key_validation]['compareCallback'](object[key], _target_value)) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                                /*
                                 For images
                                 Format here is:
                                 validator = {
                                    image: {
                                        source: {
                                             notBlank: true,
                                             validationGroup: ['second']
                                        },
                                        size: {
                                             maxImageSize: '2M',
                                             validationGroup: ['second']
                                        },
                                         type: {
                                             imageType: ['image/jpeg', 'image/png'],
                                             validationGroup: ['second']
                                         }

                                    }
                                 }
                                 and in related object

                                 ob = {
                                    image: {
                                        source: '',
                                        size: '',
                                        type: ''
                                    }
                                 }
                                 Errors object has same structure
                                 */
                            case 'maxImageSize':
                                var need_val = validator[key][key_validation];
                                var divider = 1;
                                if (/M/.test(need_val)) {
                                    divider = 1000000;
                                }
                                if (/K/.test(need_val)) {
                                    divider = 1000;
                                }

                                var matches = need_val.match(/^\d+/);
                                var permitted_value = 0;
                                if (matches.length) {
                                    permitted_value = matches[0];
                                }

                                if ((object[key] / divider) > permitted_value) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                            case 'imageType':
                                var isError = true;
                                var validation_conditions = validator[key][key_validation];
                                for (var j = 0; j < validation_conditions.length; j++) {
                                    if (validation_conditions[j] == object[key]) {
                                        isError = false;
                                    }
                                }
                                if (isError) {
                                    hasError = true;
                                    hasErrorLocal = true;
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, true);
                                } else {
                                    setErrorInErrorObject(errorr_object, key, 'hasError', hasErrorLocal);
                                    setErrorInErrorObject(errorr_object, key, key_validation, false);
                                }
                                break;
                        }
                    }catch(e){
                        console.error(e);
                        console.log(key);
                        console.log(object);
                        console.log(object[key]);
                    }
                }
            }
        }

        return hasError;
    };

    function setErrorInErrorObject(errorr_object, key1, key2, value)
    {
        if (!errorr_object[key1]) {
            return;
        }
        errorr_object[key1][key2] = value;
    }

    function getRelatedField(if_obj, key, key_word, original)
    {
        var splitted = if_obj['target'].split('.');
        var orig_clone = JSON.parse(JSON.stringify(original));
        for (var i = 0; i < splitted.length; i++) {
            orig_clone = orig_clone[splitted[i]];
        }
        var target_value = orig_clone;

        return target_value;
    }

    /**
     * Check if element in array
     *
     * @param array
     * @param el
     * @returns {boolean}
     */
    function inArray(array, val)
    {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === val) {
                return true;
            }
        }
        return false;
    }

    /**
     * Validation for complex condition
     * How you can use it
     *
     * If your condition just simple if
     * if: {
                    type: 'and',
                    fields: [
                        {
                            target: 'product_type',
                            value: ['static']
                        },
                        {
                            target: 'need_header',
                            value: ['1']
                        },
                    ],
                },

     or if your condition more complex
     if: {
                    type: 'or',
                    fields: [
                        {
                            type: 'and',
                            fields: [
                                {
                                    target: 'product_type',
                                    value: ['static']
                                },
                                {
                                    target: 'need_header',
                                    value: ['1']
                                },
                            ],
                        },
                        {
                            target: 'need_button',
                            value: ['1']
                        }
                    ]
                },
     *
     * @param if_obj
     * @param validator
     * @param errorr_object
     * @param original
     * @returns {boolean}
     */
    function complexCondition(if_obj, validator, errorr_object, original)
    {
        var _results = [];
        for (var j = 0; j < if_obj.fields.length; j++) {
            if (if_obj.fields[j].target) {
                var target_value = getRelatedField(if_obj.fields[j], key, 'if', original);
                // если в массиве возможных значений есть текущее значение
                // таргета - то тру - надо валидировать
                // console.log('complexCondition', target_value, if_obj.fields[j]['value']);
                if (inArray(if_obj.fields[j]['value'], target_value))  {
                    _results.push(true);
                } else {
                    _results.push(false);
                }
            } else {
                _results.push(complexCondition(if_obj.fields[j], validator, errorr_object, original));
            }
        }

        // console.log('complexCondition', _results);

        if (if_obj.type.toLowerCase() == 'and') {
            for (var i = 0; i < _results.length; i++) {
                if (!_results[i]) {
                    return false;
                }
            }
            return true;
        }
        if (if_obj.type.toLowerCase() == 'or') {
            for (var i = 0; i < _results.length; i++) {
                if (_results[i]) {
                    return true;
                }
            }
            return false;
        }
    }

}]);
