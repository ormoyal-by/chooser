const responseErrors = (err) => {
    const responses = require('./responses');
    let errors = err.errors;
    let errList = [];
    let errObj = {};

    if(errors){
        Object.keys(errors).forEach(property => {
            errObj = {};
            let errKind = errors[property].kind;
            errObj[property] = responses[errKind];

            if(errKind === 'maxlength' || errKind === 'minlength')
                errObj[property] = responses[errKind] + errors[property].properties[errKind];

            errList.push(errObj)
        });
    }else if(err.code === 11000){
        let propery = err.errmsg.split('index:')[1].split('_1 dup key')[0].trim();
        errObj[propery] = "כבר נמצא בשימוש"
        errList.push(errObj)
    }else{
        errObj['unexpectedError'] = err
        errList.push(errObj);
    }
    return errList;
};

module.exports = {responseErrors}