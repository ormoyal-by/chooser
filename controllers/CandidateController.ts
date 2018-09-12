
import request from 'request';


import {responseErrors} from './../server';
import {Request, Response, NextFunction} from "express";
const {idExist ,fetchRole,rolesAllowed,getQueryUrl} = require('./../handlers');
import  { Candidate } from './../models/Candidate' ;
import Role from './../models/Role' ;
import {User} from './../models/User' ;

const _ = require('lodash');
import mongoose from 'mongoose';
import { ObjectId } from 'bson';


export const create = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let body = _.pick(req.body, ['name','about_us','logo','background','color_1','color_2','workers']);
        // body.users = _.map(req.body.users, _.partialRight(_.pick, ['user', 'status']));

        console.log(body);
        // to check if there is attach_me then update the attached to the bring user

        const candidate = new Candidate(body);
        
        // here we can add list of people without objectid to the same candidate
        // if(body.users){
        //     var users: ObjectId[] = [];
        //     body.users.forEach(async (user: ObjectId) => {
        //         console.log('sdfadasdsa',user)
        //         users.push(await idExist(user,User)._id, User);
        //     });
        //     console.log(1);
        //     candidate.users = users;
        // }

        // if(body.workers){
        //     candidate.workers = await idExist(body.role_id,Role);
        // }
        // console.log(2);
        await candidate.save();

        res.send(candidate);

    } catch(err) {
        console.log(err);
        res.status(400).send(responseErrors(err));
    };
};
