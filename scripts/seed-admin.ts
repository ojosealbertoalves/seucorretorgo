import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('Admin@2024', 12)

  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@seucorretorgo.com.br' },
    update: {},
    create: {
      email: 'admin@seucorretorgo.com.br',
      password: hash,
      nome: 'Administrador',
    },
  })

  console.log('Admin criado com sucesso:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
