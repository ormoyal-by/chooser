const {app, responseErrors} = require('./../server');
const {idExist ,fetchRole,rolesAllowed,getQueryUrl} = require('./../handlers');
const {User} = require('./../models/User');
// const {Project} = require('./../models/Project');
const {Role} = require('./../models/Role');


const _ = require('lodash');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


app.post('/users', async (req,res) => {

    try{
        let body = _.pick(req.body, ['email','first_name','last_name','password','phone','role_id']);
        const user = new User(body);
        if(body.role_id){
            user.role_id = await idExist(body.role_id,Role);
        }
        await user.save();
        const token = await user.generateToken();

        res.header('x-auth',token).send(user);

    } catch(err) {
        res.status(400).send(responseErrors(err));
    };
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

let login = app.post('/users/login', async (req,res) => {
    try{
        const token = await user.generateToken();
        res.status(200).header('x-auth',token).send(user)
    } catch (err) {
        res.status(400).send(responseErrors(err));
    };
});

app.post('/sendSms', async (req,res) => {
    try{
        const user = await User.findOne({phone:req.body.phone});
        if(!user) throw 'המספר לא קיים במערכת';
        // await smsConfirm(user.phone);
        let random = Math.floor(1000 + Math.random() * 9000);
        let msg = `שלום ${user.first_name}, קוד האימות שלך הוא: ${random}`

        var params = {msg, recipient: user.phone, sms_sender: "WinChoise"};
        request.post({
                url: "https://lead4you.co.il/api/mailing/sendSMSJson.php",
                method: "POST",
                json:true,
                body: params
            },function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if(!body.success){
                        throw "אירעה שגיאה בשליחת ההודעה";
                    }
                    res.status(200).send('ההודעה בדרך')
                }else{
                    throw "אירעה שגיאה בשליחת ההודעה";
                }
            }
        );
        // console.log('after smsConfirm');

        // const token = await user.generateToken();
        // console.log('user._id ',ObjectId(user._id).getTimestamp());
        // res.status(200).header('x-auth',token).send(user)
    } catch (err) {
        // console.log(err);
        res.status(400).send(responseErrors(err));
    };
});

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





