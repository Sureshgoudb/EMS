import { parsePhoneNumber } from "react-phone-number-input";
import { get } from "lodash";

// ******************************
export const validator = (values, fieldName) => {
  let errors = {};
  switch (fieldName) {
    case "email":
      validateEmail(values.email, errors);
      break;
      case "username":
        validateName(values.username, errors);
        break;
    case "password":
      validatePassword(values.password, errors);
      break;
    case "phone":
      validatePhoneNumber(values.phone, errors);
      break;
    case "usertype":
      validateUserType(values.usertype, errors);
      break;
    case "name":
      validateName(values.name, errors);
      break;
    case "description":
      validateDescription(values.description, errors);
      break;
    case "notificationname":
      validateNotificationName(values.notificationname, errors);
      break;
    case "message":
      validateMessage(values.message, errors);
      break;
    case "customer":
      validateCustomer(values.customer, errors);
      break;
    case "device":
      validateDevice(values.device, errors);
      break;
    default:
  }
  return errors;
};

// ******************************
export function getCountryCode(phoneNumber) {
  return get(parsePhoneNumber(phoneNumber), "country");
}

// ******************************
function validatePhoneNumber(phone, errors) {
  let result = true;
  const phoneObject = parsePhoneNumber(phone);
  if (!phoneObject) {
    errors.phone = "Invalid Phonenumber(+1 xxx xxx XXXX)";
    result = false;
  }
  else
    errors.phone = "";
  return result;
}
// ************** Name ****************
function validateName(name, errors) {
  let result = true;
  if (!name) {
    errors.name = "Name is Required";
    result = false;
  }
  else {
    errors.name = "";
  }
  
  return result;
}
// ******************************
function validateEmail(email, errors) {
  let result = true;
  
  if (!email) {
    errors.email = "Email is Required";
    result = false;
  } else {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    result = re.test(String(email).toLowerCase());
    if (!result) errors.email = "Invalid Email address";
    else errors.email = "";
  }
  return result;
}
// ******************************
function validatePassword(pass, errors) {
  let result = true;

  if (!pass) {
    errors.password = "Password is Required";
    result = false;
  } else {
    var lower = /(?=.*[a-z])/;
    result = lower.test(pass);

    if (!result) {
      errors.password = "Password must contain at least one lower case letter.";
      result = false;
    } else if (pass.length < 8) {
      errors.password = "Your password has less than 8 characters.";
      result = false;
    }
  }
  return result;
}

function validateDescription(description, errors) {
  let result = true;
  if (!description) {
    errors.description = "Description is Required";
    result = false;
  }
  else {
    errors.description = "";
  }
  return result;
}

function validateNotificationName(notificationName, errors) {
  let result = true;
  if (!notificationName) {
    errors.name = "Notification Name is Required";
    result = false;
  }
  else {
    errors.name = "";
  }
  return result;
}

function validateMessage(message, errors) {
  let result = true;
  if (!message) {
    errors.message = "Message is Required";
    result = false;
  }
  else {
    errors.message = "";
  }
  return result;
}

function validateCustomer(customer, errors) {
  let result = true;
  if (!customer) {
    errors.customer = "Customer Name is Required";
    result = false;
  }
  else {
    errors.customer = "";
  }
  return result;
}

function validateUserType(usertype, errors) {
  let result = true;
  if (!usertype) {
    errors.usertype = "Please select a user type";
    result = false;
  }
  else {
    errors.usertype = "";
  }
  return result;
}

function validateDevice(device, errors) {
  let result = true;
  if (!device) {
    errors.device = "Device is Required";
    result = false;
  }
  else {
    errors.device = "";
  }
  return result;
}