const express = require("express");
const {
  addDataObject,
  getDataObject,
  putDataObject,
  addData,
  putData,
  getData
} = require("../model/client");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const saltRounds = 10;
const salting =bcrypt.genSaltSync(10);
// const uuid = require("uuid");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(bodyParser.json());

let bCrypting = (Password)=>{
  return bcrypt.hashSync(Password, salting);
}

let ValidObject = (obj) => {
  if (Object.keys(obj).length === 0 || obj === undefined || obj === ''|| obj === null ) {
    return false;
  } else {
    return true;
  }
};

//Adding Bcrypt to the password
app.post("/client", (req, res) => {
  if(ValidObject(req.body)){
    if (req.body.FirstName === undefined ||req.body.Password === undefined || req.body.LastName === undefined || req.body.EmailID === undefined ) {
      res.status(400);
      res.send({ output: "Invalid request" });
  }else{
    if(Object.keys(req.body).length > 4){
      console.log(Object.keys(req.body).length," Keys Length");
      res.send(400);
      res.send({output: InvalidRequest})
    }else{
      console.log(Object.keys(req.body).length,"KeysLength");

    }
  }
  bcrypt.hash(req.body.Password, saltRounds, function (err, hash) {
    addData({
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      EmailID: req.body.EmailID,
      Password: hash,
    }).then((result)=>{
      
    });
    res.send({ output: "client created" });
    if (err) throw err;
  });
});

app.get("/client", (req, res) => {
  const EncodedClientNamePassword = req.headers.authorization.split(" ")[1];
  const DecodedClientNamePassword = Buffer.from(
    EncodedClientNamePassword,
    "base64"
  ).toString("ascii");
  const userNameDecoded = DecodedClientNamePassword.split(":")[0];
  const passwordDecoded = DecodedClientNamePassword.split(":")[1];
  let retrievedData = null;
  bcrypt.compare(passwordDecoded, , function (err, result) {
    if (result === true) {
      res.send(result);
    }
  });

  getDataObject({
    EmailID: userNameDecoded,
    Password: passwordDecoded,
  }).then((result) => {
    if (result.length === 0) {
      res.send({ output: "client not found" });
      res.send(404);
    } else {
      res.send(result);
      res.status(200);
    }
  });
  res.send({ output: "get client data successfully" });
});

app.put("/client", (req, res) => {
  const EncodedNamePassword = req.headers.authorization.split(" ")[1];
  const DecodedNamePassword = Buffer.from(
    EncodedNamePassword,
    "base64"
  ).toString("ascii");
  const userNameDecoded = DecodedNamePassword.split(":")[0];
  const passwordDecoded = DecodedNamePassword.split(":")[1];
  let retrievedData = null;

  putDataObject({
    EmailID: userNameDecoded,
    Password: passwordDecoded,
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    Password: req.body.Password,
  }).then((result) => {
    console.log(result);
    res.send({ output: "client got updated" });
  });
});

//Error handling in json
app.use((Error, req, res, next) => {
  if (Error instanceof SyntaxError && Error.status === 400 && 'body' in Error) {
    let formatError = {
      status: Error.statusCode,
      message: Error.message
    }
    return res.status(Error.statusCode).json(formatError); // Bad request
  }
  next();
});

app.listen(3080, () => {
  console.log(`Server listening on the port:::::: 3080`);
});
