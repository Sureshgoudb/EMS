import React, { useEffect, useState } from "react";
import axios from "axios";
const ImageComponent = (props) => {
  const [image, setImage] = useState(null);

  const retrieveImage = async (url) => {
    let imgurl = "";
    try{
    const res =  await axios.get(url, {responseType: 'blob'})
    .then((response) => {
      const blob = URL.createObjectURL(response.data);
      setImage(blob);
    })
  }
  catch(err)
  {}
  return imgurl;
  };

  useEffect(() => {
    try{
    console.log("useEffect"+ props.control);
    if(props.control.url !== undefined)
    {
      retrieveImage(props.control.url);
    }
  }
  catch(err)
  {}
   }, []);
  return (
    <>
       <div>
            {image && (
                <img src={image} alt="Blob Image" />
            )}
        </div>

    </>)
}
export default ImageComponent;