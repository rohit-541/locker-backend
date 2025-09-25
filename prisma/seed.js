// import { PrismaClient } from "@prisma/client";
// import { faker } from "@faker-js/faker";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Starting seeding...");

//   // 1. Create Users
//   const users = [];
//   for (let i = 0; i < 5; i++) {
//     const user = await prisma.user.create({
//       data: {
//         name: faker.person.fullName(),
//         mobile: faker.phone.number("##########"),
//         email: faker.internet.email(),
//         password: faker.internet.password(),
//       },
//     });
//     users.push(user);
//   }
//   console.log(`✅ Created ${users.length} users`);

//   // 2. Create Lockers
//   const lockers = [];
//   for (let i = 0; i < 20; i++) {
//     const assignToUser = Math.random() > 0.5 ? faker.helpers.arrayElement(users) : null;

//     const locker = await prisma.locker.create({
//       data: {
//         name: `Locker-${i + 1}`,
//         prices: faker.number.int({ min: 100, max: 1000 }),
//         content: faker.commerce.productDescription(),
//         status: faker.helpers.arrayElement(["NONE", "OPEN", "CLOSED"]),
//         isActive: faker.datatype.boolean(),
//         userId: assignToUser ? assignToUser.id : null,
//       },
//     });
//     lockers.push(locker);
//   }
//   console.log(`✅ Created ${lockers.length} lockers`);

  
// }

// main()
//   .catch((e) => {
//     console.error("❌ Error during seeding:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Create Lockers
  const lockers = [];
  for (let i = 0; i < 20; i++) {
    const locker = await prisma.locker.create({
      data: {
        name: `Locker-${i + 1}`,
        prices: faker.number.int({ min: 100, max: 1000 }), // keep random prices
        content: faker.commerce.productDescription(),
        status: "NONE",
        isActive: true,
        userId: null,
      },
    });
    lockers.push(locker);
  }
  console.log(`✅ Created ${lockers.length} lockers`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
