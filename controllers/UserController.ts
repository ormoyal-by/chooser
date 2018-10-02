// var require = require();
// var request = require('request');
import request from 'request';

// import  * as request from "request";

import {responseErrors} from './../server';
import {Request, Response, NextFunction} from "express";
const {idExist ,fetchRole,rolesAllowed,getQueryUrl} = require('./../handlers');
import  { User, IUser } from './../models/User' ;
import Role from './../models/Role' ;
import {Candidate} from './../models/Candidate' ;


const _ = require('lodash');
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;


export const create = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let body = _.pick(req.body, ['email','first_name','last_name','phone','ID_card','agreement','candidate_id','role_id']);

        const user = new User(body);

        user.role_id = await Role.findOne({name:"User"});

        if(!user.role_id) 
            throw {role_id:"notFoundObjectID"}

        const supportedCandidate = await idExist(body.candidate_id,Candidate);
        // let candidates = {
        //     candidate: supportedCandidate._id,
        //     status: 0
        // }
        // user.candidates = supportedCandidate._id;


        await user.save();

        // let bringsUser = new User(bringsUserId);
        // let attached = {
        //     user_id: user._id,
        //     link: false
        // }
        // updateUserCandidateAndAttached(bringsUser, supportedCandidate, user, false);
        

        updateCandidateUsers(supportedCandidate._id, user._id);
        const token = await user.generateToken();
        res.header('x-auth',token).send(user);


    } catch(err) {
        res.status(400).send(responseErrors(err));
    };
};


export const createByUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let body = _.pick(req.body, ['email','first_name','last_name','phone','ID_card','candidate_id']);

        const supportedCandidate = await idExist(body.candidate_id,Candidate);

        let user = await User.findOne({ID_card: body.ID_card});
        if(user){
            const userStatus = await User.findOne({_id: user._id, 'candidates.candidate_id':{$eq: supportedCandidate._id}});
            if(userStatus && userStatus.candidates){
                for(var i = 0; i < user.candidates.length; i++){
                    if(user.candidates[i].candidate_id.toHexString() == supportedCandidate._id.toHexString()){
                        if(user.candidates[i].status != 2){
                            return res.status(400).send({"userExist":"המשתמש כבר נמצא במערכת"});
                        }
                    }
                    console.log(user.candidates[i].candidate_id , supportedCandidate._id.toHexString(), user.candidates[i].candidate_id == supportedCandidate._id.toHexString());
                }
            }

            delete body.ID_card;
            delete body.candidate_id;
            
            user = await User.findByIdAndUpdate(user._id, body ,{new: true});

                console.log("bodyyyy ", body, " user ",user);

        }else{
            user = new User(body);
        }



        let bringsUser = await User.findById(req.user._id);

        user.role_id = await Role.findOne({name:"User"});
        if(!user.role_id) 
            throw {role_id:"notFoundObjectID"}

        user.candidates[0] = {
            candidate_id: supportedCandidate._id,
            attached: []
        };

        await user.save();
        // await addCandidate(user._id, supportedCandidate._id);
        
        updateUserCandidateAndAttached(bringsUser, supportedCandidate, user, false);
        updateCandidateUsers(supportedCandidate._id, user._id);

        let msg = `שלום ${user.first_name}, ${bringsUser.first_name} ${bringsUser.last_name} רשם אותך לתמוך ב${supportedCandidate.name}, נא כנס לאשר https://WinChoise.co.il/users/confirmSupport?id=${user._id}&candidate_id=${supportedCandidate._id}`;
        req.sendSms_msg = msg;
        sendSms(req,res,next);

    } catch(err) {
        res.status(400).send(responseErrors(err));
    };
};


export const createByLink = async (req: Request, res: Response) => {
    try{
        // role id of support
        let body = _.pick(req.body, ['email','first_name','last_name','phone','ID_card']);

        let supportedCandidate = await idExist(req.query.candidate_id,Candidate);

        // if user already in db
        let user = await User.findOne({ID_card: body.ID_card});
        if(user){
            // find user by ID_card and candidate_id
            const userStatus = await User.findOne({_id: user._id, 'candidates.candidate_id':{$eq: supportedCandidate._id}});
            // if user exist and already have this candidate
            if(userStatus){
                for(var i = 0; i < user.candidates.length; i++){
                    if(user.candidates[i].candidate_id.toHexString() == supportedCandidate._id.toHexString()){
                        if(user.candidates[i].status != 2){
                            return res.status(400).send({"userExist":"המשתמש כבר נמצא במערכת"});
                        }
                    }
                    console.log(user.candidates[i].candidate_id , supportedCandidate._id.toHexString(), user.candidates[i].candidate_id == supportedCandidate._id.toHexString());
                }
            }
            // user exist but dont have this candidate
            delete body.ID_card;
            delete body.candidate_id;
            
            user = await User.findByIdAndUpdate(user._id, body ,{new: true});

        }else{
            user = new User(body);
        }
        // check if the user that bring the new user, if exist
        let bringsUser = await idExist(req.query.id,User);

        user.role_id = await Role.findOne({name:"User"});
        if(!user.role_id) 
            throw {role_id:"notFoundObjectID"}

        // add to the user the first candidate? and what if he is already exist with other candidate?
        user.candidates[0] = {
            candidate_id: supportedCandidate._id
        };
    
        await user.save();

        updateUserCandidateAndAttached(bringsUser, supportedCandidate, user, true);
        updateCandidateUsers(supportedCandidate._id, user._id);
        
        const token = await user.generateToken();
        res.header('x-auth',token).send(user);

    } catch(err) {
        res.status(400).send(responseErrors(err));
    };
};

export const confirmSupport = async (req: Request, res: Response, next: NextFunction) => {
    try{

        if(!ObjectId.isValid(req.query.id))
            return res.status(400).send(responseErrors({id: "ObjectID"}));
        if(!ObjectId.isValid(req.query.candidate_id))
            return res.status(400).send({candidate_id: "ObjectID"});

        const foundUser = await User.findOne({_id:req.query.id, 'candidates.candidate_id':{$eq: req.query.candidate_id}});
            if(!foundUser)
                return res.status(400).send({"notFound":"נמצאה בעיה בקישור, נא בקש קישור נוסף"});

        if(!req.body.status && req.body.status !== 0)
            throw {status: "Number"};

        // when ID_card is not required
        // if(req.body.status === 1){
        //     if(!foundUser.ID_card && !req.body.ID_card){
        //         throw {ID_card:"required"}  
        //     }else{
        //         foundUser.ID_card = req.body.ID_card;
        //     }    
        // }

        updateStatus(req.query.candidate_id, req.query.id, req.body.status);

        res.status(200).send({message:"תודה על תשובתך"});

    }catch(e){
        return res.status(400).send(responseErrors(e));
    };
}

export enum Status {
    support = 1,
    waiting = 2,
    reject = 3
}

export const updateCandidateUsers = async (candidate_id, user_id) => {
    // check nested object if value is unique before add, https://stackoverflow.com/questions/15921700/mongoose-unique-values-in-nested-array-of-objects
    const updatedCandidate = await Candidate.findOneAndUpdate({_id: candidate_id}, {$addToSet: {users: user_id}});

    return updatedCandidate;
}


export const addCandidate = async (user_id, candidate_id) => {
    // var emptyCandidateObj = {
    //     candidate_id: candidate_id
    //     // attached: []
    // }
    const newCandidate = await User.findOneAndUpdate({_id: user_id, 'candidates.candidate_id':{$ne: candidate_id}}, {$push: {"candidates.$.candidate_id": candidate_id}}, { new: true });
    console.log('newCandidate ',newCandidate);
}

export const updateStatus = async (candidate_id, user_id, status) => {

    if(!(status in Status))
        throw {status:"userStatus"}

    const newStatus = await User.findOneAndUpdate({_id: user_id, 'candidates.candidate_id':{$eq: candidate_id}}, {$set: {'candidates.$.status': status}}, { new: true });
    console.log('newStatus ',newStatus);
}

export const updateUserCandidateAndAttached = async (bringUser, candidate, newUser, link: Boolean) => {

    var candidateObj = {
        candidate_id: candidate._id,
        attached: [{
            user_id: newUser._id,
            link: link
        }]
    }

    var attachedObj = {
        user_id: newUser._id,
        link: link
    }
    // create new candidate and add user to attached
    const updatedCandidate = await User.findOneAndUpdate({_id: bringUser._id, 'candidates.candidate_id':{$ne: candidate._id}}, {$push: {candidates: candidateObj}}, { new: true });
    // console.log('updatedCandidate1111 ',updatedCandidate)

    if(!updatedCandidate){
        // add user to attached if user not exist
        const updatedUser = await User.findOneAndUpdate({_id: bringUser._id, 'candidates.candidate_id':{$eq: candidate._id}}, {$push: {'candidates.$.attached': attachedObj}}, { new: true });
        // console.log('updatedUser ',updatedUser);
    }
}





export const becomeSupport = async (req: Request, res: Response, next: NextFunction) => {

    let body = _.pick(req.body, ['email','agreement','id','candidate_id','role_id']);
    if(!body.agreement || body.agreement != true)
        throw {agreement:"עליך לאשר את התקנון"}

    

}


// support in new candidate



export const getUsers = (req: Request, res: Response, next: NextFunction) => {
    // getQueryUrl(req,['id','role_id']).then(search => {
    if(req.query.id){
        const id = req.query.id;
        if(!ObjectId.isValid(id))
            return res.status(400).send({id: "ObjectID"});

        User.findById(id).then(user => {
            if(!user)
                return res.status(404).send(responseErrors({id:"notFoundObjectID"}));

            res.status(200).send(user);
        }).catch(err => {
            res.status(400).send(responseErrors(err));
        });
    }else{
        User.find({_id: req.user._id}).populate('candidates.attached.user_id').then(users => {
            res.status(200).send(users);
        }).catch(err => {
            return res.status(400).send(responseErrors(err));
        });
    }

});


// app.get('/users', (req,res) => {
//     getQueryUrl(req,['id','role_id']).then(search => {
//         if(search._id){
//             User.findOne(search).populate('project_managers').then(user => {
//                 if(!user)
//                     return res.status(404).send('unable to find user');

//                 res.status(200).send(user);
//             }).catch(err => {
//                 res.status(400).send(responseErrors(err));
//             });
//         }else{
//             User.find(search).then(users => {
//                 res.status(200).send(users);
//             }).catch(err => {
//                 return res.status(400).send(responseErrors(err));
//             });
//         }
//     }).catch(err => {
//         return res.status(400).send(responseErrors(err));
//     })
// });

// app.patch('/users/:id', async (req,res) => {
//     var id = req.params.id;
//     if(!ObjectId.isValid(id))
//         return res.status(400).send('invalid user id');

//     let body = _.pick(req.body, ['email','first_name','last_name','phone','role_id']);

//     try{
//         // check if user try update himself, or update someone else
//         if(id != req.user._id){
//             await rolesAllowed(req.user.role_id.name,['admin','clerk','workManager']);
//             // admin || clerk || workManager can't update their status because earlier if statement
//             if(body.role_id){
//                 body.user_role_id = await idExist(body.role_id,UserRole);
//             }
//         }

//         const user = await User.findOneAndUpdate({_id:id},{$set:body},{new:true}).populate('role_id')

//         res.status(200).send(user);
//     } catch (err) {
//         res.status(400).send(responseErrors(err));
//     }
// });


// app.delete('/users/:id', (req,res) => {
//     const id = req.params.id;

//     if(!ObjectId.isValid(id))
//         return res.status(400).send('invalid user id');
//     // soft delete, return new (updated) results
//     User.findOneAndUpdate({_id:req.user._id},{$set:{deleted:true}},{new:true}).populate('role_id').then(user => {
//         if(!user)
//             return res.send('unable to find user');
//         res.status(200).send(user);
//     }).catch(err => {
//         res.status(400).send(responseErrors(err));
//     });
// })

export const resetUserCode = (user) => {
    user.code.auth_code = null;
    user.code.try = 0;    
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const user = await User.findOne({phone:req.body.phone});
        if(!user) throw 'המספר לא קיים במערכת';
        
        if(user.code.auth_code != null && user.code.auth_code == req.body.auth_code){
            const token = await user.generateToken();
            resetUserCode(user); 
            await user.save();
            res.status(200).header('x-auth',token).send(user);
        }else if(user.code.try < 3){
            user.code.try++;
            await user.save();
            res.status(200).send({message:'חל שגיאה באימות, ניסיון מספר ' + user.code.try});
        }else{
            resetUserCode(user);
            await user.save();
            sendSms(req,res,next);
            req.smsMessage = 'ניסית כבר 3 פעמים, הודעה חדשה בדרך';
            // throw ' ניסית כבר 3 פעמים, הודעה חדשה בדרך' ;
        }
    } catch (err) {
        res.status(400).send(responseErrors(err));
    };
};

export const sendSms = async (req: Request,res: Response, next: NextFunction) => {
    try{
        const user = await User.findOne({phone:req.body.phone});
        if(!user) throw 'המספר לא קיים במערכת';
        // await smsConfirm(user.phone);
        let random = Math.floor(1000 + Math.random() * 9000);

        if(!req.sendSms_msg){
            req.sendSms_msg = `שלום ${user.first_name}, קוד האימות שלך הוא: ${random}`;
        }

        let request = await smsRequest(req.sendSms_msg, user)
        if(request){
            resetUserCode(user);
            user.code.auth_code = random;
            await user.save();
            res.status(200).send({message: req.smsMessage ? req.smsMessage : 'הודעת אימות בדרך'})
        }

    } catch (err) {
        res.status(400).send(responseErrors(err));
    };
};

export const smsRequest = (msg: String, user, sms_sender = "WinChoise") => {
    return new Promise((resolve,reject) => {
        let params = {msg, recipient: user.phone, sms_sender};

        request.post({
            url: "https://lead4you.co.il/api/mailing/sendSMSJson.php",
            method: "POST",
            json:true,
            body: params
            }, async (error, response, body) => {
    
                if (!error && response.statusCode == 200) {
                    if(!body.success){
                        throw "אירעה שגיאה בשליחת ההודעה";
                    }
                    resolve(true);
                }else{
                    throw "אירעה שגיאה בשליחת ההודעה";
                }
            }
        );
    })
}

// app.post('/users/changePassword',  (req,res) => {

//     let body = _.pick(req.body, ['email','oldPassword','newPassword','confirmPassword']);
//     if(body.newPassword !== body.confirmPassword)
//         return res.status(400).send('your news Passwords doesn\'t match');

//     User.findByCredentials(body.email,body.oldPassword).then(user => {
//         // save the new password, then in "save" middleware, encrypt password
//         user.password = body.newPassword;
//         return user.save();
//     }).then(() => {
//         res.status(200).send('your password changed successfully');
//     }).catch(err => {
//         res.status(400).send(responseErrors(err));
//     });
// });




export {}

