import fs from "fs";
import Jimp = require("jimp");
import { Response, Request, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const photo = await Jimp.read(inputURL);
      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname + outpath, (img) => {
          resolve(__dirname + outpath);
        });
    } catch (error) {
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "No authorization headers." });
  }

  // const token_bearer = req.headers.authorization
  // console.log(token_bearer)

  // if (token_bearer.length !== 2) {
  //   return res.status(401).send({ message: "Malformed token" });
  // }

  const token = req.headers.authorization;

  return jwt.verify(token, "jwtSecret", (err, decoded) => {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate." });
    }
    return next();
  });
}

export function generateJwt(user:user): string {
  return jwt.sign(user, "jwtSecret");
}

interface user {
  email:string,
  password:string
}

export const registeredUser:user = {
  email: "email",
  password: "password",
};
