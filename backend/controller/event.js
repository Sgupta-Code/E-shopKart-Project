const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const Event = require("../model/event");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const {upload} = require("../multer");
const fs = require("fs");

// create event function
router.post("/create-event", upload.array("images"), catchAsyncErrors(async(req, res, next) => {
    try {
        const shopId = req.body.shopId;
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return next(new ErrorHandler("Shop Id is invalid!", 400));
          } else {
            const files = req.files;
            const imageUrls = files.map((file)=> `${file.filename}`);
            const eventData = req.body;
            eventData.images = imageUrls;
            eventData.shop = shop;

            const event = await Event.create(eventData);

            res.status(201).json({
                success:true,
                event,
            });
          };

    } catch (error) {
        return next(new ErrorHandler(error,400));
    }
}))

// get all events
router.get("/get-all-events", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

  // get all events of a shop
router.get(
    "/get-all-events/:id",
    catchAsyncErrors(async (req, res, next) => {
      try {
        const events = await Event.find({ shopId: req.params.id });
  
        res.status(201).json({
          success: true,
          events,
        });
      } catch (error) {
        return next(new ErrorHandler(error, 400));
      }
    })
  );

   // delete event of a shop
router.delete(
    "/delete-shop-event/:id",
    isSeller, 
    catchAsyncErrors(async(req,res,next) =>{
        try {
            const eventId = req.params.id;
            const eventData = await Event.findById(eventId);
            
            eventData.images.forEach((imageUrls) => {
              const filename = imageUrls;
              const filePath = `uploads/${filename}`;

              fs.unlink(filePath,(err)=>{
                if(err) {
                  consol.log(err);
                }
              })
            })

            const event = await Event.findByIdAndDelete(eventId);
            if(!event){
                return next(new ErrorHandler("Event is not found with this id",404))
            }

            res.status(201).json({
                success: true,
                message: "Event Deleted successfully!"
            })
        } catch (error) {
            return next(new ErrorHandler(error, 400));
        }
    }));
    
    // all events --- for admin
router.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
