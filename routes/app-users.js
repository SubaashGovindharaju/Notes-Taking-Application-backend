import express from "express";
import { AppUserModel } from "../db-utils/module.js";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { mailOptions, transporter } from "./mail.js";
const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const payload = req.body;
    const appUser = await AppUserModel.findOne(
      { email: payload.email },
      { id: 1, Firstname: 1, Lastname: 1, email: 1, _id: 0 }
    );
    console.log(payload.email);
    if (appUser) {
      res.status(409).send({ msg: "user already exits" });
      return;
    }
    bcrypt.hash(payload.password, 10, async function (err, hash) {
      if (err) {
        res.status(500).send({ msg: "Error in registring" });
        return;
      }
      const authuser = new AppUserModel({
        ...payload,
        password: hash,
        id: v4(),
        isVerified: false,
      });
      await authuser.save();
    });
    res.send({ msg: "user register successfully " });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Error in creating" });
  }
});

authRouter.post("/test", async (req, res) => {
  try {
    const payload = req.body;
    const authuser = new AppUserModel({ ...payload });
    await authuser.save();
    res.send({ msg: "user register successfully " });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Error in creating" });
  }
});

authRouter.post("/regmail", async function (req, res) {
  try {
    const resetKey = crypto.randomBytes(32).toString("hex");
    const payload = req.body;
    const appUser = await AppUserModel.findOne(
      { email: payload.email },
      { name: 1, email: 1, _id: 0 }
    );
    const cloudUser = await AppUserModel.updateOne(
      { email: payload.email },
      { $set: { ResetKey: resetKey } }
    );
    if (appUser) {
      const responceObj = appUser.toObject();
      const link = `${process.env.FRONTEND_twostep}/?reset=${resetKey}`;
      console.log(link);
      await transporter.sendMail({
        ...mailOptions,
        to: payload.email,
        text: `Click this link to activate the account ${link} `,
      });
      res.send({ responceObj, msg: "user updated " });
    } else {
      res.status(404).send({ msg: "user not found" });
    }
  } catch (err) {
    console.log(err);
  }
});

authRouter.post("/login", async function (req, res) {
  try {
    const payload = req.body;
    const appUser = await AppUserModel.findOne(
      { email: payload.email },
      { id: 1, name: 1, email: 1, password: 1, isVerified: 1, _id: 0 }
    );

    console.log(appUser.isVerified);
    const verify = appUser.isVerified;
    const hash = appUser.password;
    const userpassword = payload.password;
    if (verify === "true" && appUser !== "null") {
      const app = bcrypt.compare(userpassword, hash, (err, result) => {
        console.log(result);
        if (result) {
          const responceObj = appUser.toObject();
          delete responceObj.password;
          res.send(responceObj);
        } else {
          res.status(401).send({ msg: "invalid credentials" });
        }
      });
    } else {
      res.status(405).send({ msg: "Not activated" });
    }
  } catch (err) {
    console.log(err);
    res.status(404).send({ msg: "user not found" });
  }
});

authRouter.post("/password", async function (req, res) {
  try {
    const resetKey = crypto.randomBytes(32).toString("hex");
    const payload = req.body;
    const appUser = await AppUserModel.findOne(
      { email: payload.email },
      { name: 1, email: 1, _id: 0 }
    );
    const cloudUser = await AppUserModel.updateOne(
      { email: payload.email },
      { $set: { ResetKey: resetKey } }
    );
    if (appUser) {
      const responceObj = appUser.toObject();
      const link = `${process.env.FRONTEND_URL}/?reset=${resetKey}`;
      console.log(link);
      await transporter.sendMail({
        ...mailOptions,
        to: payload.email,
        text: `Click this link to verify the EmailId  ${link} `,
      });
      res.send({ responceObj, msg: "user updated " });
    } else {
      res.status(404).send({ msg: "user not found" });
    }
  } catch (err) {
    console.log(err);
  }
});

authRouter.put("/validate", async function (req, res) {
  const payload = req.body;
  try {
    const cloudUser = await AppUserModel.updateOne(
      { ResetKey: payload.resetKey },
      { isVerified: payload.isVerified }
    );
    const appUser = await AppUserModel.findOne(
      { ResetKey: payload.resetKey },
      { isVerified: 1, ResetKey: 1, _id: 0 }
    );

    if (!appUser) {
      res.status(404).send({ msg: "key not found" });
      console.log("payload");
    } else {
      if (payload.resetKey === appUser.ResetKey && payload.code === "1") {
        console.log("true");
        res.send("true");
      } else if (payload.resetKey === appUser.ResetKey) {
        console.log("true");
        res.send("true");
      } else {
        console.log("false");
        res.send("false");
      }
    }
  } catch {
    res.status(404).send({ msg: "user not found 123" });
  }
});

authRouter.put("/reset", async function (req, res) {
  const payload = req.body;
  try {
    // hashing the password for storing in db
    bcrypt.hash(payload.password, 10, async function (err, hash) {
      if (err) {
        res.status(400).send({ msg: "Error in reseting" });
        return;
      }
      await AppUserModel.updateOne(
        { email: payload.email },
        { $set: { password: hash } }
      );
      res.send({ msg: "user updated " });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Error in updating" });
  }
});


authRouter.put('/addtask', async function (req, res) {
    const payload = req.body;
    console.log(payload)

    try {
        const task = await AppUserModel.updateOne({ email: payload.email },
            { '$set': { Title: payload.Title } });
        // console.log(url)
        if (!task) {
            res.status(404).send({ msg: 'task not found' });
        } else {
                  await AppUserModel.updateOne({ email: payload.email }, {
                 $push: {
                    Tasks: [{
                        Title: payload.Title,
                        Task: payload.Task,
                        createdAt: payload.createdAt,

                    }
                ]
                }
            });
            res.status(200).send({ msg: 'task created' });

            // const responceObj = await transporter.sendMail({ ...mailOptions, to: payload.email, text: link });
            //             console.log(responceObj);

            // res.send({ responceObj, msg: 'user updated ' });
            // res.send({  msg: 'user updated ' });

        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ msg: 'Error in updating' })
    }
});

authRouter.post("/task", async function (req, res) {
    const payload = req.body;
    console.log(payload)
    try {
        const appUser = await AppUserModel.findOne(
            { email: payload.email },
            { Tasks: 1,_id: 0 }
          );
          const responceObj = appUser.toObject();
          console.log(responceObj);

    //   const appUser = await WeightLoss.find();
    //   if (appUser) {
    //     res.send(appUser);
    //   } else {
        console.log(responceObj)
        res.send(responceObj);
    //   }
    } catch (err) {
      console.log(err);
    //   res.status(500).send({ msg: "Error occuerred while fetching users" });
    }
  });



  authRouter.get("/tasks/:id", async (req, res) => {
    const taskId = req.params.id;
  
    try {
      const appUser = await AppUserModel.findOne(
        { "Tasks._id": taskId },
        { "Tasks.$": 1 }
      );
  
      if (!appUser) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Extract the specific task data from the Tasks array
      const taskData = appUser.Tasks[0];
  
      // Respond with the specific task data
      res.json(taskData);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });


//update by id

  authRouter.put("/tasks/:id", async (req, res) => {
    const taskId = req.params.id;
  
    try {
      // Update the task by ID
      const updatedTask = await AppUserModel.findOneAndUpdate(
        { "Tasks._id": taskId },
        { $set: { "Tasks.$.Title": req.body.Title, "Tasks.$.Task": req.body.Task } },
        { new: true }
      );
  
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Respond with the updated task
      res.json(updatedTask.Tasks[0]);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  authRouter.delete("/tasks/:id", async (req, res) => {
    const taskId = req.params.id;
  
    try {
      // Find and update the document to remove the task from the Tasks array
      const updatedUser = await AppUserModel.findOneAndUpdate(
        { "Tasks._id": taskId },
        { $pull: { Tasks: { _id: taskId } } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Respond with a success message or updated user data
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
export default authRouter;
