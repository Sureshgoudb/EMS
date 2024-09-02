import React, { useEffect,useState } from "react";
import { TextField, Grid, Button } from "@mui/material";
import RightDrawerDialog from "../../common/RightDrawerDialog";
import axios from "axios";
const ImageDialog = ({  customerid, closeDialog, open, isChatDialog , handleChartObjChange,editData}) => {
  const [ImageProperties, setImageProperties] = useState({
    url:"",
    position : "[3,2,0,0]",
    controlType: "Image",
    bgcolor:"#ffffff",
    controlId:"",
    image:""
  });
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [bgcolor, setBgColor] = useState("");
  const handleImageUrlChange = (e) => {
    setImageProperties({ ...ImageProperties, url: e.target.value });
    setImageUrl(e.target.value);
  };

  const handlebgcolorChange = (e) => {
    setImageProperties({ ...ImageProperties, bgcolor: e.target.value });
    setBgColor(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const uploadImage = async (image) => {
    let url = apiKey +"image/upload";
    let photo = {
      image: {
        name: imageFile.name,
        type: imageFile.type,
        data: image,
      },
    }
    console.log(JSON.stringify(photo));
    await axios.post(url,photo)
    .then(async (response) => {
    let res = response.data.id;
    let url = "image/"+res;
    setImageUrl(url);
    setImageProperties({ ...ImageProperties, url: url });
    })
    .catch((error) => { });
  };

  const uploadImageFile = async () => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = reader.result.split(",")[1];
      uploadImage(image);
    };
    reader.readAsDataURL(imageFile);
  };

  const handleUpload = (e) => {
    let id = editData!=undefined ? editData.id : "";
    setImageProperties({ ...ImageProperties, controlId: id});
    const tetxObj = {
      controls: [
        {
          ...ImageProperties,
        }
      ]
    };
    console.log(tetxObj, "tetxObj");
    handleChartObjChange(tetxObj, "Image");
    closeDialog();
  };
  useEffect(() => {
    console.log("useEffect"+ editData);
    if(editData !== undefined)
    {
      setImageUrl(editData.url);
    }
   }, [editData]);
  return (
    <>
      <RightDrawerDialog
        open={open}
        onClose={closeDialog}
        isChatDialog={isChatDialog}
        title={"Image Url Details"}
      >
               <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="imageUrl"
              name="imageUrl"
              label="Image URL"
              type="text"
              fullWidth
              defaultValue={editData!=null ? editData.url : ""}
              value={imageUrl}
              onChange={handleImageUrlChange}
            />
          </Grid>

          <Grid item xs={9}>
          <TextField fullWidth
              accept="image/*"

              id="fileinput"
              name="fileinput"
              type="file"
              onChange={handleFileChange}
            />
            

          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              sx={{ background: "rgba(0, 0, 0, 0.6)" }}
              onClick={uploadImageFile}
            >
              Upload
            </Button>
          </Grid>
          <Grid item xs={6}>
                    <TextField
                      id="bgcolor"
                      name="bgcolor"
                      type="color"
                      label="Background"
                      defaultValue={editData!=null ? editData.bgcolor : "#ffffff"}
                      onChange={handlebgcolorChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              sx={{ background: "rgba(0, 0, 0, 0.6)" }}
              onClick={handleUpload}
            >
              Submit
            </Button>
          </Grid>

        </Grid>
        </form>
      </RightDrawerDialog>
    </>
  );
};

export default ImageDialog;
