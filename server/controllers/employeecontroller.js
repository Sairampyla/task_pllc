

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const nodemailer = require('nodemailer');
const _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;
const Employee = require('../models/data');

const jwt = require('jsonwebtoken');


// Multer File upload settings
const DIR = './public/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, fileName)
    }
  });

  var upload = multer({
    storage: storage,
    // limits: {
    //   fileSize: 1024 * 1024 * 5
    // },
    fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    }
  });
  
  

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
             console.log(req.body.password,"hash password")
            jwt.sign(payload,'secretkey',(err,token)=>{
                res.json({
                  token,
                  fetchedUser
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
router.post('/', upload.array('avatar', 6),(req,res) =>{

    const reqFiles = []
 //   const url = req.protocol + '://' + req.get('host')
    for (var i = 0; i < req.files.length; i++) {
      reqFiles.push(req.files[i].filename)
    }

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
                phone:req.body.phone,
                avatar:reqFiles
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

//re-set pwd link

router.put('/forgot-passwordlink',(req,res)=>{

  Employee.findOne({email:req.body.email}).then(result=>{
    if(!result){
        return res.status(400).json({
            message:'user with this mail not exists',
            result:result
        });
    }

    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: 'sairampyla96@gmail.com',
        pass: '880125@Sai'
      }
    });
    
    let payLoad = {_id:result._id}
    let token = jwt.sign(payLoad,'secretkey',{expiresIn:'50m'})
    var mailOptions = {
        from: 'sairampyla96gmail.com',
        to: req.body.email,
        subject: 'Password Reset',
        // text: 'That was easy!',
        html:`   
          <h2>Please click on the below link to reset your password </h2>
          <p>"http://localhost:4100/resetPassword/${token}"</p> 
        `
    };
     return Employee.updateOne({email:result.email},{resetLink:token}).then(result =>{
       if(!result){
         return res.status(400).json({
           message:err.message
         })
       }else{
            transporter.sendMail(mailOptions).then(result =>{
              if(!result){
                return res.status(400)({
                  message:err.message
                })
              }
              return res.status(200).json({message:"Email has been sent successfully"});
              
            })
          }
     })
  })
})

//Reset-password
router.put('/changePassword',(req,res)=>{
  const {resetLink,newPass} = req.body;
  if(resetLink){
  jwt.verify(resetLink,"secretkey",(error,decodedData)=>{
    if(error){
      return res.status(401).json({
        message:"In correct token or it is expired"
      })
    }
     
    Employee.findOne({resetLink},(err,user) =>{
      if(err || !user){
        return res.status(400).json({
          message:"user with this token does not exists"
        })
      }
      
    //   try {
    //     const salt = await bcrypt.genSalt(10)
    //     const hasedPassword = await bcrypt.hash(newPass,salt)
    //   newPass == hasedPassword
    //     console.log(newPass,"hashing done....");
        
        
    // } catch (error) {
    //   console.log(error,"errrr")
    // }
      
  
      // bcrypt.genSalt(10, function (err,salt)  {
      //   bcrypt.hash(newPass, salt , function (err, answer){
      //      if(err) throw (err);
   
      //      newPass == answer;
         
      //      console.log(newPass,"hashed password")
      
      //   });
      // });   
     
      const obj ={
        password:newPass,
        resetLink:''
      }
      
      user = _.extend(user,obj);

      user.save((err,result) => {
        if(err){
          return res.status(401).json({
            message:"reset password error"
          })
        }else{
          return res.status(200).json({
            message:"Password has been changed successfully ..pls login with new one"
          })
        }
      })

    })
  })

  }else{
    return res.status(401).json({
      message:'user with this email does not exists'
    })
  }

})

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





