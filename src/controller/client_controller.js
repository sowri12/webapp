const express = require("express");
const {
  addDataObject,
  getDataObject,
  putDataObject,
  addData,
  putData,
  getData,
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

const { User } = require("../../models");
const { where } = require("sequelize");

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

// //Adding Bcrypt to the password
// app.post("/client", (req, res) => {
//   getData({ EmailID: req.body.EmailID }).then((result) => {
//     if (result.length === 0) {
//       res.status(200);
//       let insertObject = {
//         FirstName: req.body.FirstName,
//         LastName: req.body.LastName,
//         EmailID: req.body.EmailID,
//         Password: bCrypting(req.body.Password),
//       };
//       console.log(insertObject);
//       addData(insertObject);
//       res.send({ message: "User Created Test" });
//     } else {
//       res.status(400);
//       res.send({ message: "User Already Exists" });
//     }
//   });
// });

// Post Method Using Sequelize

app.post("/v1/account", async (req, res) => {
  try {
    const NewClient = await User.create({
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      EmailId: req.body.EmailID,
      Password: bCrypting(req.body.Password),
    });
    NewClient.Password = undefined;
    return res.status(201).send(NewClient);
  } catch (Error) {
    return res.status(400).send(Error);
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

// app.get("/client", (req, res) => {
//   const authHead = Buffer.from(
//     req.headers.authorization.split(" ")[1],
//     "base64"
//   ).toString("ascii");
//   const user = authHead.split(":")[0];
//   const pw = authHead.split(":")[1];
//   res.status(200);
//   getData({ email: user }).then((result) => {
//     console.log("Client Found");
//     console.log(result, "RESULT");
//     let pass = result[0].Password;
//     bcrypt.compare(bCrypting(pw), pass, function (Error, valid) {
//       getData({ email: user }).then((result) => {
//         res.status(200);
//         res.send({
//           id: result[0].id,
//           FirstName: result[0].FirstName,
//           LastName: result[0].LastName,
//           EmailId: result[0].EmailId,
//         });
//       });
//     });
//   });
// });

// Get method using sequelize
app.get("/v1/account/:id", (req, res) => {
  try {
    const ClientID = req.params.id;
    const EncodedUserPass = req.headers.authorization.split(" ")[1];
    const DecodedUserPass = Buffer.from(EncodedUserPass, "base64").toString(
      "ascii"
    );
    const DecodedUser = DecodedUserPass.split(":")[0];
    const DecodedPass = DecodedUserPass.split(":")[1];
    User.findOne({ where: { EmailId: DecodedUser, id: ClientID } }).then(
      (result) => {
        if (result === null) {
          res.status(200);
          res.send({ Output: "Client Not Found" });
        } else {
          bcrypt.compare(
            DecodedPass,
            result.dataValues.Password,
            function (err, authenticated) {
              if (authenticated) {
                result.dataValues.Password = undefined;
                res.status(200).send(result);
              } else {
                res.status(200);
                res.send({ Output: "Wrong Password" });
              }
            }
          );
        }
      }
    );
  } catch (err) {
    return res.status(400).send("Client Not Found");
  }
});

// app.put("/client", (req, res) => {
//   const authHead = Buffer.from(
//     req.headers.authorization.split(" ")[1],
//     "base64"
//   ).toString("ascii");
//   const user = authHead.split(":")[0];
//   const pass = authHead.split(":")[1];
//   res.status(200);
//   getData({ EmailId: user }).then((result) => {
//     // checking for Emails
//     let fn = result[0].FirstName;
//     let ln = result[0].LastName;
//     let pw = result[0].Password;
//     bcrypt.compare(bCrypting(pass), pw, function (Error, valid) {
//       if (valid) {
//         console.log("Client Authenticated");
//         let updateObject = {
//           Email: user,
//           FirstNameChanged: fn,
//           LastNameChanged: ln,
//           PasswordChanged: bCrypting(req.body.PasswordChanged),
//         };
//         putData(updateObject).then((result) => {
//           console.log(result);
//           res.send({ Output: "Client Updated" });
//         });
//       } else {
//         res.status(200);
//         // res.send({ Output: "Enter correct password" });
//         res.send([bCrypting(pass), pw]);
//       }
//     });
//   });
// });

// Put method using sequelize
app.put("/v1/account/:id", (req, res) => {
  try {
    const ClientID = req.params.id;
    const EncodedUserPass = req.headers.authorization.split(" ")[1];
    const DecodedUserPass = Buffer.from(EncodedUserPass, "base64").toString(
      "ascii"
    );
    const DecodedUser = DecodedUserPass.split(":")[0];
    const DecodedPass = DecodedUserPass.split(":")[1];
    User.findOne({ where: { EmailId: DecodedUser, id: ClientID } }).then(
      (result) => {
        if (result === null) {
          res.status(200);
          res.send({ Output: "Client Not Found" });
        } else {
          bcrypt.compare(
            DecodedPass,
            result.dataValues.Password,
            function async(err, authenticated) {
              if (authenticated) {
                User.update(req.body, { where: { id: ClientID } }).then(
                  (result) => {
                    User.findOne({
                      where: { EmailId: DecodedUser, id: ClientID },
                    }).then((UpdatedResult) => {
                      console.log(UpdatedResult);
                      UpdatedResult.dataValues.Password = undefined;
                      res.status(200).send(UpdatedResult);
                    });
                  }
                );
              } else {
                res.status(200);
                res.send({ Output: "Wrong password" });
              }
            }
          );
        }
      }
    );
  } catch (err) {
    return res.status(400).send("Client Not Found");
  }
});

// //Error handling in json
// app.use((Error, req, res, next) => {
//   if (Error instanceof SyntaxError && Error.status === 400 && "body" in Error) {
//     let formatError = {
//       status: Error.statusCode,
//       message: Error.message,
//     };
//     return res.status(Error.statusCode).json(formatError); // Bad request
//   }
//   next();
// });

User.sequelize.sync().then((req) => {
  app.listen(3080, () => {
    console.log(`Server listening on the port:::::: 3080`);
  });
});
