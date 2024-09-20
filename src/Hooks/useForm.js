import { useState, useEffect } from "react";
import { getCountryCode } from "../Helpers/validator";

// ******************************
const useForm = ({ initState, callback, validator }) => {
  const [state, setState] = useState(initState);
  const [errors, setErrors] = useState({});
  const [isSubmited, setIsSubmited] = useState(false);
  const [countryCode, setCountryCode] = useState("");

  useEffect(() => {
    setState(initState);
  }, [initState]);

  // ******************************
  // useEffect(() => {
  //   const isValidErrors = () =>
  //     Object.values(errors).filter(error => typeof error !== "undefined")
  //       .length > 0;
  //   if (isSubmited && !isValidErrors()) callback();
  // }, [errors]);

  // ******************************
  const handleChange = e => {
    const { name, value } = e.target;
    const newState = {
      ...state,
      [name]: value
    };
    setState(newState);

    if (name === "phone") {
      const country = getCountryCode(value);
      setCountryCode(() => country);
    }

    const faildFiels = validator(newState, name);
    // console.log(faildFiels);
    setErrors(() => ({
      ...errors,
      [name]: Object.values(faildFiels)[0]
    }));
  };

  // ******************************
  const handleBlur = e => {
    const { name: fieldName } = e.target;
    // console.log(fieldName);
  //   const faildFiels = validator(state, fieldName);
  //   setErrors(() => ({
  //     ...errors,
  //     [fieldName]: Object.values(faildFiels)[0]
  //   }));
  };

  // ******************************
  const handleSubmit = () => {
    // e.preventDefault();
    // const { name: fieldName } = e.target;
    const newErrors = {};
    Object.keys(state).forEach(key => {
      const faildFiels = validator(state, key);
      newErrors[key] = Object.values(faildFiels)[0];
    });
    console.log(newErrors);
    setErrors(newErrors);
  }

  const resetErrors = () => {
    const clearedErrors = Object.keys(errors).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
  
    setErrors(clearedErrors);
  };

  return {
    handleChange,
    handleSubmit,
    handleBlur,
    state,
    errors,
    setErrors,
    resetErrors,
    countryCode
  };
};

export default useForm;
