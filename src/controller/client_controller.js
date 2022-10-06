const express = require("express");
const {
  addDataObject,
  getDataObject,
  putDataObject,
  addData,
  putData,
  getData,
  getDataWithoutPass,
} = require("../model/client");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const saltRounds = 10;
// const salting = bcrypt.genSaltSync(10);
// const uuid = require("uuid");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(bodyParser.json());

let bCrypting = (Password) => {
  return bcrypt.hashSync(Password, bcrypt.genSaltSync(10));
};

let ValidObject = (obj) => {
  if (
    Object.keys(obj).length === 0 ||
    obj === undefined ||
    obj === "" ||
    obj === null
  ) {
    return false;
  } else {
    return true;
  }
};

//Adding Bcrypt to the password
app.post("/client", (req, res) => {
  if (ValidObject(req.body)) {
    if (
      req.body.FirstName === undefined ||
      req.body.Password === undefined ||
      req.body.LastName === undefined ||
      req.body.EmailID === undefined
    ) {
      res.status(400);
      res.send({ output: "Invalid request" });
    } else {
      if (Object.keys(req.body).length > 4) {
        console.log(Object.keys(req.body).length, " Keys Length");
        res.send(400);
        res.send({ output: InvalidRequest });
      } else {
        console.log(Object.keys(req.body).length, "KeysLength");
        getData({ EmailID: req.body.EmailID }).then((result) => {
          if (result.length === 0) {
            res.status(200);
            let insertObject = {
              firstName: req.body.FirstName,
              LastName: req.body.LastName,
              EmailID: req.body.EmailID,
              Password: bCrypting(req.body.Password),
            };
            getData(insertObject);
            res.send({ message: "User Created" });
          } else {
            console.log("User Found");
            res.status(400);
            res.send({ message: "User Already Exists" });
          }
        });
      }
    }
  } else {
    res.status(400);
    res.send({ output: "Invalid Request" });
  }
});

// bcrypt.hash(req.body.Password, saltRounds, function (err, hash) {
//   addData({
//     FirstName: req.body.FirstName,
//     LastName: req.body.LastName,
//     EmailID: req.body.EmailID,
//     Password: hash,
//   }).then((result)=>{

//   });
//   res.send({ output: "client created" });
//   if (err) throw err;
// });
// }

app.get("/client", (req, res) => {
  try {
    const EncodedUsrPass = req.headers.authorization.split(" ")[1];
    const DecodedUsrPass = Buffer.from(EncodedUsrPass, "base64").toString(
      "ascii"
    );
    const userNameDecoded = DecodedUsrPass.split(":")[0];
    const passwordDecoded = DecodedUsrPass.split(":")[1];
    if (userNameDecoded === "" || passwordDecoded === "") {
      res.status(400);
      res.send({ output: "Client Doesnot Exist" });
    } else {
      res.status(200);
      getData({ email: userNameDecoded }).then((result) => {
        if (result.length === 0) {
          res.send({ output: "client DoesNot Exist" });
          res.status(200);
        } else {
          console.log("Client Found");
          let cryptedPassFromDB = result[0].Password;
          bcrypt.compare(
            passwordDecoded,
            cryptedPassFromDB,
            function (Error, authenticated) {
              if (authenticated) {
                console.log("User Authenticated");
                getDataWithoutPass({ email: userNameDecoded }).then(
                  (result) => {
                    res.status(200);
                    res.send(result);
                  }
                );
              } else {
                res.send({ message: "Enter correct password" });
                console.log("Enter correct password");
                res.status(200);
              }
            }
          );
        }
      });
    }
  } catch (Error) {
    res.status(400);
    res.send({ output: "Invalid Request" });
  }
});

app.put("/client", (req, res) => {
  try {
    const EncodedUsrPass = req.headers.authorization.split(" ")[1];
    const DecodedUsrPass = Buffer.from(EncodedUsrPass, "base64").toString(
      "ascii"
    );
    const userNameDecoded = DecodedUsrPass.split(":")[0];
    const passwordDecoded = DecodedUsrPass.split(":")[1];
    if (objectIsValid(req.body)) {
      res.status(200);
      getData({ EmailID: userNameDecoded }).then((result) => {
        // checking for clients
        if (result.length === 0) {
          res.send({ output: "client DoesNot Exist" });
          res.status(404);
        } else {
          console.log("Client Found");
          let firstNameFromDB = result[0].FirstName;
          let lastNameFromDB = result[0].LastName;
          let cryptedPassFromDB = result[0].Password;
          bcrypt.compare(
            passwordDecoded,
            cryptedPassFromDB,
            function (Error, authenticated) {
              if (authenticated) {
                console.log("Client Authenticated");
                let firstNameField =
                  !req.body.FirstName === undefined
                    ? firstNameFromDB
                    : req.body.FirstName;
                let LastNameField =
                  !req.body.LastName === undefined
                    ? lastNameFromDB
                    : req.body.LastName;
                let passwordField =
                  !req.body.password === undefined
                    ? cryptedPassFromDB
                    : bCrypting(req.body.Password);
                let updateObject = {
                  Email: userNameDecoded,
                  Password: bCrypting(passwordDecoded),
                  FirstNameChanged: req.body.FirstName,
                  LastNameChanged: req.body.LastName,
                  PasswordChanged: bCrypting(req.body.PasswordChanged),
                };
                putData(updateObject).then((result) => {
                  console.log(result);
                  res.send({ Output: "Client Updated" });
                });
              } else {
                res.status(200);
                res.send({ Output: "Enter correct password" });
              }
            }
          );
        }
      });
    } else {
      res.status(400);
      res.send({ Output: "Invalid Request" });
    }
  } catch (Error) {
    res.status(400);
    res.send({ Output: "Invalid Request" });
  }
});

//Error handling in json
app.use((Error, req, res, next) => {
  if (Error instanceof SyntaxError && Error.status === 400 && "body" in Error) {
    let formatError = {
      status: Error.statusCode,
      message: Error.message,
    };
    return res.status(Error.statusCode).json(formatError); // Bad request
  }
  next();
});

app.listen(3080, () => {
  console.log(`Server listening on the port:::::: 3080`);
});
