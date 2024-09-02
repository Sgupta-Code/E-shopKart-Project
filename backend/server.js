const app = require("./app");
const connectDatabase = require("./db/Database.js");
const cloudinary = require("cloudinary");

//handling uncaught exceptions
process.on("uncaughtException", (e)=>{
    console.log(`Error: ${e.messsage}`);
    console.log(`shutting down the server for handling uncaught exceptions`);
})

//config
if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config({
        path: "config/.env"
    })
}

//connect db
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

//create server
const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})

//unhandled promise rejection
process.on("unhandleRejection",(err)=>{
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`Shutting down the  server for unhandle promie rejection`);

    server.close(()=>{
        process.exit(1);
    });
})