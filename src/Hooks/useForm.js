import { useState, useEffect } from "react";
import { getCountryCode } from "../Helpers/validator";

// ******************************
const useForm = ({ initState, callback, validator }) => {
  const [state, setState] = useState(initState);
  const [errors, setErrors] = useState({});
  const [isSubmited, setIsSubmited] = useState(false);
  const [countryCode, setCountryCode] = useState("");

  // ******************************
  useEffect(() => {
    const isValidErrors = () =>
      Object.values(errors).filter(error => typeof error !== "undefined")
        .length > 0;
    if (isSubmited && !isValidErrors()) callback();
  }, [errors]);

  // ******************************
  const handleChange = e => {
    const { name, value } = e.target;
    setState(() => ({
      ...state,
      [name]: value
    }));
    if (name === "phone") {
      const country = getCountryCode(value);
      setCountryCode(() => country);
    }
  };

  // ******************************
  const handleBlur = e => {
    const { name: fieldName } = e.target;
    const faildFiels = validator(state, fieldName);
    setErrors(() => ({
      ...errors,
      [fieldName]: Object.values(faildFiels)[0]
    }));
  };

  // ******************************
  const handleSubmit = e => {
    e.preventDefault();
    const { name: fieldName } = e.target;
    const faildFiels = validator(state, fieldName);
    setErrors(() => ({
      ...errors,
      [fieldName]: Object.values(faildFiels)[0]
    }));
    setIsSubmited(true);
  };

  return {
    handleChange,
    handleSubmit,
    handleBlur,
    state,
    errors,
    countryCode
  };
};

export default useForm;
