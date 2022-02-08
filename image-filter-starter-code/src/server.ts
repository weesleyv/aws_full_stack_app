import express from "express";
import bodyParser from "body-parser";

import {
  filterImageFromURL,
  deleteLocalFiles,
  generateJwt,
  requireAuth,
  registeredUser
} from "./util/util";


import { nextTick } from "process";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get(
    `/filteredimage`,
    requireAuth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        if (req.query.image_url) {
          const absolutePath: string = await filterImageFromURL(
            req.query.image_url as string
          );

          const paths: string[] = [];
          paths.push(absolutePath);
          res.status(200).sendFile(absolutePath, (error) => {
            if (error) {
              console.log(error);
            } else {
              deleteLocalFiles(paths);
            }
          });
        } else {
          next();
        }
      } catch (error) {
        res
          .status(400)
          .send({ message: "something went wrong, check image url!" });
      }
    }
  );
  //! END @TODO1
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
      return res
        .status(400)
        .send({ auth: false, message: "email and password required" });
    }

    if (
      email !== registeredUser.email ||
      password !== registeredUser.password
    ) {
      return res.status(401).send({ auth: false, message: "Unauthorized" });
    }

    const jwt = generateJwt(registeredUser);
    res.status(200).send({ auth: true, token: jwt, user: registeredUser });
    console.log(req.headers.authorization);
  });


  //! END @TODO1


  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
