
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
var ObjectId = require('mongoose').Types.ObjectId;
const Employee = require('../models/data');

const jwt = require('jsonwebtoken');


////=> localhost:8080/employees/login
router.post('/login',(req,res)=>{
    let fetchedUser;
    Employee.findOne({email:req.body.email}).then(result=>{
        if(!result){
            return res.status(401).json({
                message:'login failed wrong email entered',
                result:result
            });
        }
          fetchedUser = result;
         return bcrypt.compare(req.body.password,result.password);
    }).then(result =>{
         if(!result){
             return res.status(401).json({
                 message:'login failed wrong password entered',
                 result:false
             })
         }else{
             const payload = {email:fetchedUser.email}
            jwt.sign(payload,'secretkey',(err,token)=>{
                res.json({
                  token
                });
                if(err){
                  console.log(err)
                }
              });
        }
    })
    .catch(err => console.log(err));
    
})
function verifytoken(req,res,next){
    //auth header value
     const bearerHeader = req.headers['authorization']
     //check if bearer is undefined
     if( typeof bearerHeader !== 'undefined'){
       //split token
       const split = bearerHeader.split(' ')
       //assign to another
       const assign = split[1];
       //set token
       req.token = assign;
       //next
         next();
     }else{
       res.sendStatus(403);
     }
  
  }

//=> localhost:8080/employees/
router.get('/', verifytoken, (req , res) =>{
    jwt.verify(req.token,'secretkey',(err)=>{
        if(err){
         res.sendStatus(403)
        }else{
        //   res.json({
        //     message:'welcome',
        //     data
        //   })
        Employee.find((err,docs) =>{
            if(!err) {res.send(docs);}
          //  else {console.log('Error in retriving Employess: '+JSON.stringify(err,undefined,2));}
        });
        }
      }) 
    
});

//search with id
router.get('/:id',(req , res)=>{
    if(!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
    Employee.findById(req.params.id,(err,doc) => {
        if (!err) {res.send(doc);}
        else {console.log('Error in retreving employee: '+JSON.stringify(err,undefined,2));}
    });
});
//add employee
router.post('/',(req,res) =>{

    Employee.find({email:req.body.email}).then(resp =>{
        if(resp.length !=0){
            return res.json({
                data:[],
                success:false,
                msg:"Email already exists"
            })
        }
        else{
            var emp = new Employee({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
                joiningDate:req.body.joiningDate,
                country:req.body.country,
                phone:req.body.phone
            });
            emp.save((err,doc)=>{
                // if(!err) {res.send(doc);}
                // else {console.log('Error in Employee save: '+JSON.stringify(err,undefined,2));}
                if(err){
                    console.log(err);
                }else{
                    let payLoad = {subject:doc._id}
                    let token = jwt.sign(payLoad,'secretkey')
                    res.json({
                        data:[],
                        success:true,
                        token:token
                    })
                }
            });
        }
    })
});

//Edit employee
router.put('/:id',(req , res)=>{
    if(!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

    var emp = {
        name:req.body.name,
         email:req.body.email,
         joiningDate:req.body.joiningDate,
         country:req.body.country,
         phone:req.body.phone
    };
    Employee.findByIdAndUpdate(req.params.id,{$set:emp},{new:true},(err ,doc)=>{
        if(!err) {res.send(doc);}
        else {console.log('Error in Employee Update: '+JSON.stringify(err,undefined,2));}
    });
});


//Delete Employee
router.delete('/:id',(req,res)=>{
    if(!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
      
    Employee.findByIdAndRemove(req.params.id,(err,doc)=>{
        if(!err) {res.send(doc);}
        else {console.log('Error in Employee Delete: '+JSON.stringify(err,undefined,2));}
    })
});


module.exports = router;
