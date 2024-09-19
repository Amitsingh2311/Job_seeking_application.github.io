import { catchAsyncError } from "../middlewares/cathAsyncError.js";
import { ErrorHandler } from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import cloudinary from "cloudinary";
import {Job} from '../models/jobSchema.js'

//EMPLOYER SEE OWN APPLICATION
export const employerGetAllApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }

    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

//JOB SEEKER GET OWN ALL APPLICATIONS
export const jobseekerGetAllApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employee is not allowed to access this resource.",
          400
        )
      );
    }

    const {_id} = req.user;
    const application = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      application,
    });
  }
);

//DELETE JOB SEEKER SIDE APPPLICATION
export const jobseekerDeleteApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employee is not allowed to access this resource.",
          400
        )
      );
    }

    const { id } = req.params;
    const applictaion = await Application.findById(id);
    if (!applictaion) {
      return next(new ErrorHandler("oops, application not found!", 404));
    }

    await applictaion.deleteOne();
    res.status(200).json({
      success: true,
      message: "application Deleted successfully!",
    });
  }
);

//POST A APPLICATION
export const postApplication = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employee is not allowed to access this resource.", 400)
    );
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    //if resume not given by applicant
    return next(new ErrorHandler("Resume File Required", 400));
  }

  const { resume } = req.files; //if resume given by applicant
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"]; //only format
  if (!allowedFormats.includes(resume.mimetype)) {
    // format type of resume
    return next(
      new ErrorHandler(
        "Invalid file type. please upload your resume in a PNG, JPG OR WEBP format",
        400
      )
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    //image stored in cloud.whenever we access that
    resume.tempFilePath
  );
// console.log(cloudinaryResponse);

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    // if cloudinary not response or some error in cloudinary
    console.error(
      "Cloudinary error: ",
      cloudinaryResponse.error || "Unknown cloudinary error"
    );
    return next(new ErrorHandler("failed to upload resume.", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = {
    //applicant id create and take from database user id
    user: req.user._id,
    role: "Job Seeker",
  };

  if (!jobId) {
    return next(new ErrorHandler("job not found!", 404));
  }

  const jobDetails = await Job.findById(jobId); //getdetails by the help of job id
  if (!jobDetails) {
    return next(new ErrorHandler("job not found!", 404));
  }

  const employerID = {
    //employer id create by the help of postedby in jobdetails
    user: jobDetails.postedBy,
    role: "Employer",
  };

  if (                      // if all details are not fill
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all field!", 400));
  }

  const application = await Application.create({             // finally we create or post a application
    name ,
    email ,
    coverLetter ,
    phone ,
    address ,
    applicantID ,
    employerID ,
    resume:{                  //it provide by cloudinary id and url
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
    }
  })

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});
