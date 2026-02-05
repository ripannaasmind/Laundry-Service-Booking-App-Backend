import ProfileModel from "../models/ProfileModel.js";
import UserModel from "../models/UserModel.js";
// import { EmailSend } from "../utils/EmailHelper.js";
import { EncodeToken } from "../utils/TokenHelper.js";

export const UserOTPService = async(req)=>{
  try{
    let email =req.params.email;
    // let code =Math.floor(100000 + Math.random()*900000);
    let code = Math.floor(100000 + Math.random() * 900000).toString();

    
   let emailText = `Your Verification code ${code}`;
   let emailSubject = 'Email Verification';

   await EmailSend(email,emailText,emailSubject)

   await UserModel.updateOne(
    {email:email},
    // {$set:{otp:otp}},
    { $set: { otp: code.toString() } },
    {upsert:true}
   );

   return {status:'Success', message:"OTP has been send!"};

  }catch(e){
return {status:"false", data:e.toString()}
  }
}


export const VerifyOTPService = async(req)=>{
  try{
    let email =req.params.email;
    let otp =req.params.otp;

    let total = await UserModel.find({
      email:email,
      otp:otp,
    
    }).countDocuments();
console.log(total);
    if (total==1){
      let user_id = await UserModel.find({
      email:email,
      otp:otp,
    
    }).select("_id");

    

    let token = EncodeToken(email,user_id[0]["_id"].toString());
    await UserModel.updateOne({email:email},{$set:{otp:"0"}});
       return {status:'Success', message:"OTP Valid",token:token};
    }else{
       return {status:'failed', message:"Invalid Otp"};
    }
   
    



  }catch(e){
return {status:"false", data:e.toString()}
  }
}


export const SaveProfileService =async(req)=>{
  try{
  
     const user_id = req.headers["user_id"]; 
    const reqBody = req.body;
    reqBody.userID = user_id; 

    await ProfileModel.updateOne(
      { userID: user_id },
      { $set: reqBody },
      { upsert: true }
    );

    return {status:"Success",message:"Profile Save Successfully"}

  }catch(e){
return {status:"false", data:e.toString()}
  }
}

export const ReadProfileService =async(req)=>{
 try{

   const user_id = req.headers["user_id"]; 
   const result = await ProfileModel.find({userID:user_id});
   return {status:"Success",data:result}
  }catch(e){
return {status:"false", data:e.toString()}
  }
}