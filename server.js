const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const db = require("./config/database");
const APIError = require("./helpers/APIError");
const httpStatus = require("http-status");
const path = require("path");
const port = process.env.PORT || 8001;

const app = express();
app.set("views", path.join(__dirname));
app.use(bodyParser.urlencoded({ limit: "15gb", extended: true }));
app.use(bodyParser.json({ limit: "15gb" }));

db.connection().then((database) => {
  module.exports = database;

  app.use("/user", require("./routes/user.routes"));
  app.use("/projects", require("./routes/project.routes"));
  app.use("/upload", require("./routes/fileUpload.routes"));
  app.use("/taskLists", require("./routes/taskList.routes"));

  
  
  app.listen(port, () => {
    console.log(`The project app is up on port ${port}`);
  });
});
