const mongoose = require('mongoose');
var request = require('request');

const ObjectId = mongoose.Types.ObjectId;
const {responseErrors} = require('./server');

// const {Role} = require('./models/Role');
const {User} = require('./models/User');
// const {Project} = require('./models/Project');
// const {Order} = require('./models/Order');
// const _ = require('lodash');


const createAt = (ObjId) => {

}

// const setKeyValue = (body, instance) => {
//     // console.log('body ',body);
//     // console.log('instance ',instance);
//     for (var key in body) {
//         // console.log('instance[key] ',key,instance[key]);
//         instance[key] = body[key];
//     }
// }

// get id and collection, check if id exist in collection, return obj found or reject
const idExist = (id,collection) => {
    return new Promise((resolve, reject) => {
        if(!ObjectId.isValid(id))
            // reject(`invalid ${collection.collection.collectionName} id`);
            resolve();
        collection.findById(id).then(idObj => {
            if(!idObj){
                // responseErrors(err);
                reject(`unable to fetch id from ${collection.collection.collectionName}`);
            }
            resolve(idObj);
        }).catch(e => {
            reject(e);
        });
    });
};

// get myRole (name) from token, check to array of roles
// const rolesAllowed = (roleName,rolesCanAccess, message) => {
//     return new Promise((resolve, reject) => {
//         if(!Array.isArray(rolesCanAccess)) return Promise.reject('rolesCanAccess need to be array, rolesAllowed function');
//         for(var role in rolesCanAccess){
//             if(rolesCanAccess[role] === roleName){
//                 resolve();
//             }
//         }
//         reject(message || 'your not allowed for this function');
//     });
// };



// // get userID and roleName, return user if match , else reject
// const fetchRole = (id,roleName) => {
//     return new Promise((resolve, reject) => {
//         if(!ObjectId.isValid(id))
//             return res.status(400).send(`invalid user id ${id}`);
//         var myUser = null;
//         User.findById(id).populate('role_id').then(user => {
//             if(!user) reject('unable to fetch user_id');
//             myUser = user;
//             return UserRole.findById(user.role_id)
//         }).then(role => {
//             if(role.name === roleName){
//                 resolve(myUser);
//             }else{
//                 return Promise.reject(`user role need to be ${roleName}`);
//             }
//         }).catch(e => {
//             reject(e);
//         });
//     });
// };

// const validateProperties = (products,type) => {
//     if(!Array.isArray(products)) return Promise.reject('products need to be array, sinkArrived function');
//     for(var i = 0; i < products.length; i++){
//         var product = products[i].toObject();
//         for(var property in product){
//             if(property === 'sink' && (product[property].arrived !== true || product[property].type == '')){
//                 return Promise.reject(`can\'t change the order status without sink and type! to ${type} ${product._id}`);
//             }
//             if(type === ('kitchen' || 'shower') && (!product['lengths'] || !product['lengths'].width || !product['lengths'].height)){
//                 return Promise.reject(`can\'t change the order status without lengths to ${type} ${product._id}`);
//             }
//             if(type === 'kitchen' && (!product['stove_top'] || !product['stove_top'].width || !product['stove_top'].height)){
//                 return Promise.reject(`can\'t change the order status without stove_top to ${type} ${product._id}`);
//             }
//         }
//     }
//     return Promise.resolve();
// };


// const orderToProjectManager = async (id, projects) => {
//     try{
//         if(!ObjectId.isValid(id))
//             return res.status(400).send('invalid order id');

//         const order = await Order.findById(id).populate('status_id stairs kitchens showers windows customer_id');
//         if(!order) return Promise.reject('that order does not exist');

//         for(var i = 0; i < projects.length; i++){
//             // check if order is one of the orders from the projectMmanager
//             if(order.project_id && order.project_id.toHexString() == projects[i].toHexString()){
//                 return Promise.resolve(order);
//             }else if(i === projects.length - 1){
//                 return Promise.reject('that order is not yours');
//             }
//         }
//     }catch (e) {
//         return Promise.reject(e);
//     }
// }


// const orderToSuperProjectManager = async (id, projectManagers) => {
//     try{
//         if(!ObjectId.isValid(id))
//             return res.status(400).send('invalid order id');

//         const order = await Order.findById(id).populate('status_id stairs kitchens showers windows customer_id project_id');
//         if(!order) return Promise.reject('that order does not exist');

//         for(var n = 0; n < projectManagers.length; n++){
//             var projects = await Project.find({user_id:projectManagers[n]})
//             // console.log('projects of his managers', projects)
//             for(var i = 0; i < projects.length; i++){
//                 // add ._id if populate project_id
//                 if(order.project_id && order.project_id._id.toHexString() == projects[i]._id.toHexString()){
//                     return Promise.resolve(order);
//                 }else if(i === projects.length - 1){
//                     return Promise.reject('that order is not yours');
//                 }
//             }
//         }
//     }catch (e) {
//         return Promise.reject();
//     }
// }

// param is query that available in the request like [id,role] , return response
// const paramsRequest = (collection,req,params,populate) => {
//     return new Promise(((resolve, reject) => {
//         const query = req.query;
//         const queryParams = Object.keys(query);
//         var searchObj = {};
//
//         if(!Array.isArray(params)) reject('params need to be array');
//         if(queryParams.length > params.length) reject('to many params in URL');
//
//         for(var i = 0; i < queryParams.length; i++){
//
//             for(var n = 0; n < params.length; n++){
//
//                 switch (queryParams[i]){
//                     case params[n]:
//                         if(params[n] === 'id'){
//                             searchObj['_id'] = query[queryParams[i]]
//                         }
//                         else if(params[n] === 'role'){
//                             searchObj['role_id'] = query[queryParams[i]]
//                         }else{
//                             searchObj[params[n]] = query[queryParams[i]]
//                         }
//                         break;
//                 }
//             }
//         }
//         console.log('serarchhh ',searchObj)
//         collection.find(searchObj).populate(populate).then(found => {
//             if(found.length === 0){
//                 reject(`unable to find document by URL param`);
//             }
//             resolve(found);
//         }).catch(err => {
//             reject(err);
//         });
//     }))
// }



// const getQueryUrl = (req,allowedParams) => {
//     return new Promise(((resolve, reject) => {
//         const query = req.query;
//         const queryKeysArr = Object.keys(query);
//         var searchObj = {};

//         // console.log('allowedParams ', allowedParams)
//         // console.log('query ',query)
//         // console.log('queryKeysArr', queryKeysArr)

//         if(!Array.isArray(allowedParams)) reject('allowedParams need to be array');
//         if(queryKeysArr.length > allowedParams.length) reject('to many params in URL');

//         for(var i = 0; i < queryKeysArr.length; i++){

//             if(!ObjectId.isValid(query[queryKeysArr[i]])){
//                 if(queryKeysArr[i] == 'closed'){
//                     searchObj['closed'] = query.active;
//                 }else {
//                     let err = {errors:{}};
//                     err.errors[queryKeysArr[i]] = {kind:"ObjectID"};
//                     reject(err);
//                 }
//             }

//             for(var n = 0; n < allowedParams.length; n++){

//                 switch (queryKeysArr[i]){
//                     case allowedParams[n]:
//                         if(allowedParams[n] === 'id'){
//                             searchObj['_id'] = query[queryKeysArr[i]]
//                         }else{
//                             searchObj[allowedParams[n]] = query[queryKeysArr[i]]
//                         }
//                         break;
//                     default:
//                         if(n === allowedParams.length - 1 && _.isEmpty(searchObj)){
//                             reject(`your param must be from - ${allowedParams}`)
//                         }
//                     break
//                 }
//             }
//         }
//         searchObj['deleted'] = false
//         resolve(searchObj);
//     }));
// };

// const getFilesName = (files) => {
//     var pictures = [];
//     for(var file in files){
//         pictures.push(files[file].filename);
//     }
//     return pictures;
// }



// module.exports = {setKeyValue,fetchRole,validateProperties,
//     idExist,getQueryUrl,orderToProjectManager,orderToSuperProjectManager,rolesAllowed,getFilesName,responseErrors};

module.exports = {idExist};