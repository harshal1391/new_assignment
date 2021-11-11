const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const db = require("./config/database");
const expressValidation = require("express-validation");
const APIError = require("./helpers/APIError");
const httpStatus = require("http-status");
const path = require("path");
const cors = require("cors");
const port = process.env.PORT || 8001;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
app.set("views", path.join(__dirname));
app.use(bodyParser.urlencoded({ limit: "15gb", extended: true }));
app.use(bodyParser.json({ limit: "15gb" }));
app.use(cors());

db.connection().then((database) => {
  module.exports = database;

  app.get("/", (req, res) => {
    res.send("Project Management API running on Heroku...!!!");
  });

  app.use("/user", require("./routes/user.routes"));
  app.use("/projects", require("./routes/project.routes"));
  app.use("/upload", require("./routes/fileUpload.routes"));
  app.use("/taskLists", require("./routes/taskList.routes"));
  app.use("/technology", require("./routes/technology.routes"));
  app.use("/auth", require("./routes/auth.routes"));
  app.use("/vaccancyChart", require("./routes/vaccancyChart.routes"));
  app.use("/upcomingCandidate", require("./routes/upcomingCandidate.routes"));


  app.use((err, req, res, next) => {
    if (err instanceof expressValidation.ValidationError) {
      // validation error contains errors which is an array of error each containing message[]
      const unifiedErrorMessage = err.errors
        .map((Error) => Error.messages.join(". "))
        .join(" and ");
      const error = new APIError(unifiedErrorMessage, err.status, true);
      return next(error);
    } else if (!(err instanceof APIError)) {
      const apiError = new APIError(
        err.message,
        err.status,
        err.name === "UnauthorizedError" ? true : err.isPublic
      );
      return next(apiError);
    }
    return next(err);
  });
  app.use((req, res, next) => {
    const err = new APIError("API Not Found", httpStatus.NOT_FOUND, true);
    return next(err);
  });

  app.use((err, req, res, next) => {
    res.status(err.status).json({
      error: {
        message: err.isPublic ? err.message : httpStatus[err.status],
      },
    });
  });

  app.listen(port, () => {
    console.log(`The project app is up on port ${port}`);
  });
});
