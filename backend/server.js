import app from "./app.js";
import cloudinary from "cloudinary";


cloudinary.v2.config({                                          //import info from config.env
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,                
    api_key: process.env.CLOUDINARY_CLIENT_API,                //api from website
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});


app.listen(process.env.PORT, ()=>{                                     //To import PORT no. from config
    console.log(`server running on port ${process.env.PORT}`)
})


app.use






