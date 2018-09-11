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


export const createByUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let body = _.pick(req.body, ['email','first_name','last_name','phone','ID_card','agreement','candidate_id','role_id']);

        const user = new User(body);
        if(req.query.id){
            var bringsUserId = await idExist(req.query.id,User);
        }
        if(body.role_id){
            user.role_id = await idExist(body.role_id,Role);
        }
        if(body.candidate_id){
            var supportedCandidate = await idExist(body.candidate_id,Candidate);
            let candidates = {
                candidate: supportedCandidate._id,
                supported: false
            }
            user.candidates = candidates;
        }
        await user.save();

        let bringsUser = new User(bringsUserId);
        let attached = {
            user_id: user._id,
            link: true
        }
        bringsUser.attached[bringsUser.attached.length] = attached;
        await bringsUser.save();
        let msg = `שלום ${user.first_name}, ${bringsUser.first_name} ${bringsUser.last_name} רשם אותך לתמוך ב${supportedCandidate.name}, נא כנס לאשר (link,user,cand,bool)`;
        sendSms(req,res,next,msg);

    } catch(err) {
        res.status(400).send(responseErrors(err));
    };
};

export const createByUserLink = async (req: Request, res: Response) => {
    try{
        // role id of support
        let body = _.pick(req.body, ['email','first_name','last_name','phone','ID_card','agreement','candidate_id','role_id']);

        const user = new User(body);
        if(req.query.id){
            var bringsUserId = await idExist(req.query.id,User);
        }
        if(body.role_id){
            user.role_id = await idExist(body.role_id,Role);
        }
        await user.save();

        let bringsUser = new User(bringsUserId);
        let attached = {
            user_id: user._id,
            link: true
        }
        bringsUser.attached[bringsUser.attached.length] = attached;
        await bringsUser.save();

        const token = await user.generateToken();

        res.header('x-auth',token).send(user);

    } catch(err) {
        res.status(400).send(responseErrors(err));
    };
};

export const confirmSupport = async (req: Request, res: Response, next: NextFunction) => {
    

    try{

        const user = await User.findOne({phone:req.query.phone});
        if(!user) throw 'המספר לא קיים במערכת';

        const candidate = await idExist(req.body.candidate_id,Candidate);

        console.log(user.phone ,' ,', candidate._id);

    
        const foundUser = await User.findOne({phone:user.phone, 'candidates.candidate': candidate._id});
            if(!foundUser)
                throw {user:"notFoundObjectID"}

        if(!req.body.confirm || typeof req.body.confirm != 'boolean')
            throw {confirm: "Boolean"};
            
        let candidates = {
            candidate: candidate._id,
            supported: req.body.confirm
        }
        foundUser.candidates = candidates;
        await foundUser.save();

        if(req.body.confirm){
            await Candidate.update({_id: candidate._id}, {$addToSet: {users: user._id}});
        }

        res.status(200).send({message:"תודה על תשובתך"});

    }catch(e){
        return res.status(400).send(responseErrors(e));
    };


}


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

export const login = async (req: Request, res: Response) => {
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
            sendSms(req,res);
            req.smsMessage = 'ניסית כבר 3 פעמים, הודעה חדשה בדרך';
            // throw ' ניסית כבר 3 פעמים, הודעה חדשה בדרך' ;
        }
    } catch (err) {
        res.status(400).send(responseErrors(err));
    };
};

export const sendSms = async (req: Request,res: Response, next: NextFunction, msg) => {
    try{
        const user = await User.findOne({phone:req.body.phone});
        if(!user) throw 'המספר לא קיים במערכת';
        // await smsConfirm(user.phone);
        let random = Math.floor(1000 + Math.random() * 9000);

        if(!msg){
            let msg = `שלום ${user.first_name}, קוד האימות שלך הוא: ${random}`;
        }

        let params = {msg, recipient: user.phone, sms_sender: "WinChoise"};

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
                    resetUserCode(user);
                    user.code.auth_code = random;
                    await user.save();
                    res.status(200).send({message: req.smsMessage ? req.smsMessage : 'הודעת אימות בדרך'})
                }else{
                    throw "אירעה שגיאה בשליחת ההודעה";
                }
            }
        );
    } catch (err) {
        res.status(400).send(responseErrors(err));
    };
};

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

