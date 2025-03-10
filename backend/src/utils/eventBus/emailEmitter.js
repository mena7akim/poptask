const { EventEmitter } = require("events");
const sendEmail = require("../email/sendEmail");

class EmailEmitter extends EventEmitter {
  constructor() {
    super();
  }
}

const emailEmitter = new EmailEmitter();

emailEmitter.on("sendEmail", sendEmail);

module.exports = emailEmitter;
