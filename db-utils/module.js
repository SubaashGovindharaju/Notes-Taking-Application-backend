import mongoose from "mongoose";

const appUserSchema = new mongoose.Schema({
  id: {
    type: "string",
    require: true,
  },
  Firstname: {
    type: "string",
    require: true,
  },
  Lastname: {
    type: "string",
    require: true,
  },

  email: {
    type: "string",
    require: true,
  },
  password: {
    type: "string",
    require: true,
  },
  isVerified: {
    type: "string",
    require: true,
  },
  ResetKey: {
    type: "string",
    require: true,
  },
  Tasks: [
    {
      Title: "string",
      Task: "string",
      createdAt: "string",
    },
  ],
});

export const AppUserModel = mongoose.model("app-users ", appUserSchema);
