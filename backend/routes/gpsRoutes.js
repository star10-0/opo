import express from "express";

const router = express.Router();

router.get("/", async(req,res)=>{
 res.json({message:"GPS route working"});
});

export default router;