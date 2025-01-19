// src/seeders/seedTaskStatus.js
const { TaskStatus } = require("../../models");

async function seedTaskStatus() {
  const statuses = ["Pending", "In Progress", "Completed"];

  try {
    for (const status of statuses) {
      await TaskStatus.findOrCreate({
        where: { statusName: status },
        defaults: { statusName: status },
      });
    }
    console.log("TaskStatus table has been seeded.");
  } catch (error) {
    console.error("Error seeding TaskStatus:", error);
  }
}

module.exports = seedTaskStatus;
