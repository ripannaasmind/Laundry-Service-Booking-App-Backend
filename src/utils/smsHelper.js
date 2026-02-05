/**
 * SMS Helper for sending OTP via Twilio SMS
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Validate Twilio credentials
if (!accountSid || !authToken) {
  console.error('❌ Twilio credentials missing!');
  console.error('Account SID:', accountSid ? 'Set' : 'Missing');
  console.error('Auth Token:', authToken ? 'Set' : 'Missing');
}

const client = twilio(accountSid, authToken);

export const SendOtpSms = async (phone, otp) => {
  try {
    console.log('================================================');
    console.log('📱 Attempting to send SMS OTP');
    console.log('================================================');
    console.log('Account SID:', accountSid?.substring(0, 10) + '...');
    console.log('Phone From:', process.env.TWILIO_PHONE_NUMBER);
    console.log('Phone To (original):', phone);
    console.log('OTP:', otp);
    
    // Format phone number correctly for Bangladesh
    let formattedPhone = phone.trim();
    
    // If phone starts with +, use as is
    if (formattedPhone.startsWith('+')) {
      // Already has country code
    }
    // If starts with 880 (Bangladesh code without +)
    else if (formattedPhone.startsWith('880')) {
      formattedPhone = `+${formattedPhone}`;
    }
    // If starts with 0 (local Bangladesh number like 01887905213)
    else if (formattedPhone.startsWith('0')) {
      formattedPhone = `+88${formattedPhone}`; // Add +88 for Bangladesh
    }
    // If just the number without leading 0 (like 1887905213)
    else if (formattedPhone.length === 10) {
      formattedPhone = `+880${formattedPhone}`;
    }
    // Otherwise, assume it needs +88
    else {
      formattedPhone = `+88${formattedPhone}`;
    }
    
    console.log('Phone To (formatted):', formattedPhone);
    const messageBody = `${otp} is your verification code. For your security, do not share this code.`;
    
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('✅ SMS OTP sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('================================================');
    
    return { 
      success: true, 
      message: 'OTP sent successfully via SMS',
      sid: message.sid,
      status: message.status
    };
  } catch (error) {
    console.error('================================================');
    console.error('❌ SMS OTP sending failed!');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    // Provide helpful error messages
    if (error.code === 21612) {
      console.error('\n⚠️  TRIAL ACCOUNT LIMITATION:');
      console.error('You can only send messages to verified phone numbers.');
      console.error('Solution 1: Verify the destination number at:');
      console.error('https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.error('Solution 2: Upgrade your Twilio account');
    } else if (error.code === 20003) {
      console.error('\n⚠️  AUTHENTICATION ERROR:');
      console.error('Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    }
    
    console.error('More Info:', error.moreInfo);
    console.error('================================================');
    throw error;
  }
};

export const SendOtpWhatsApp = async (phone, otp) => {
  return await SendOtpSms(phone, otp);
};

export const SmsSend = async (phone, message) => {
  try {
    const otpMatch = message.match(/\d{6}/);
    const otp = otpMatch ? otpMatch[0] : '000000';
    return await SendOtpSms(phone, otp);
  } catch (error) {
    console.error('Message sending failed:', error.message);
    throw error;
  }
};
