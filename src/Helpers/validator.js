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
      validateOnlyRequired(values.username, errors, "Username is Required");
      break;
    case "password":
      validatePassword(values.password, errors);
      break;
    case "phone":
      validatePhoneNumber(values.phone, errors);
      break;
    case "usertype":
      validateOnlyRequired(values.usertype, errors, "Please Select a Usertype");
      break;
    case "name":
      validateOnlyRequired(values.name, errors, "Name is Required");
      break;
    case "description":
      validateOnlyRequired(values.description, errors, "Description is Required");
      break;
    case "notificationname":
      validateOnlyRequired(values.notificationname, errors, "Notification Name is Required");
      break;
    case "message":
      validateOnlyRequired(values.message, errors, "Message is Required");
      break;
    case "customer":
      validateOnlyRequired(values.customer, errors, "Customer Name is Required");
      break;
    case "device":
      validateOnlyRequired(values.device, errors, "Please Select a Device");
      break;
    case "type":
      validateOnlyRequired(values.type, errors, "Please Select a Notification Type");
      break;
    case "expressionfield":
      validateOnlyRequired(values.expressionfield, errors, "Condition is Required");
      break;
    case "variable":
      validateOnlyRequired(values.variable, errors, "Please Select a Variable");
      break;
    case "label":
      validateOnlyRequired(values.label, errors, "Label is Required");
      break;
    case "labelData":
      validateOnlyRequired(values.labelData, errors, "Name is Required");
      break;
    case "style":
      validateOnlyRequired(values.style, errors, "Please Select a Chart Style");
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
  console.log(device);
  if (!device) {
    errors.device = "Please Select a Device";
    result = false;
  }
  else {
    errors.device = "";
  }
  return result;
}

function validateNotificationType(notificationtype, errors) {
  let result = true;
  if (!notificationtype) {
    errors.type = "Please select a notification type";
    result = false;
  }
  else {
    errors.type = "";
  }
  return result;
}

function validateExpressionField(expressionfield, errors) {
  let result = true;
  if (!expressionfield) {
    errors.expressionfield = "Condition is required";
    result = false;
  }
  else {
    errors.expressionfield = "";
  }
  return result;
}

function validateOnlyRequired(value, errors, msg) {
  let result = true;
  if (!value) {
    errors.value = msg;
    result = false;
  }
  else {
    errors.value = "";
  }
  return result;
}