// backend/src/config/db.js
//
// Prisma 7 changed how PrismaClient is constructed - it now requires
// an explicit database "adapter" instead of managing the Postgres
// connection internally like older versions did. This is why we
// import PrismaPg and pass it into the PrismaClient constructor.

const { PrismaClient } = require("@prisma/client");
const { PrismaPg }     = require("@prisma/adapter-pg");

// TEMPORARY DEBUG LOGGING - remove once the connection issue is fixed.
// Only prints the first 30 characters, never the full secret.
console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 30));
console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;