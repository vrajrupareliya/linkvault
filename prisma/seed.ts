import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a user with links

 
  await prisma.user.deleteMany();


  const alice = await prisma.user.create({
    data: {
      name:     "Alice Johnson",
      email:    "alice@gmail.com",
      isActive: true,
    },
  });


  console.log("Created user:", alice.name);

  const aliceSummerCampaign = await prisma.campaign.create({
    data: {
      name:   "Alice's Summer Campaign",
      userId: alice.id,
    },
  });

  console.log("Created campaign:", aliceSummerCampaign.name);

  const aliceLinks = await Promise.all([
    prisma.link.create({
      data: {
        slug:       "alice-github",
        url:        "https://github.com/alice",
        userId:     alice.id,
        campaignId: aliceSummerCampaign.id,
      },
    }),
    prisma.link.create({
      data: {
        slug:       "alice-portfolio",
        url:        "https://alice.dev",
        userId:     alice.id,
        campaignId: aliceSummerCampaign.id,
      },
    }),    
    ]);

    console.log("Created links for Alice:", aliceLinks.map(link => link.slug).join(", "));

  // Fetch all users with their links
  const allUsers = await prisma.user.findMany({
    include: {
      links: true,
      campaigns: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });