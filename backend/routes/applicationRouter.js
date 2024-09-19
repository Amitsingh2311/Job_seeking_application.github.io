import express from 'express';
import {employerGetAllApplication, jobseekerDeleteApplication, jobseekerGetAllApplication, postApplication} from "../controllers/applicationController.js";
import { isAuthorized} from "../middlewares/auth.js"

const router = express.Router();

router.get("/jobseeker/getall",isAuthorized, jobseekerGetAllApplication);
router.get("/employer/getall", isAuthorized, employerGetAllApplication);
router.delete("/delete/:id", isAuthorized, jobseekerDeleteApplication);
router.post("/post", isAuthorized, postApplication);
router.delete("/delete", isAuthorized, jobseekerDeleteApplication);

export default router;