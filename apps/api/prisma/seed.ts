/**
 * Utilized to populate the database with initial course data for development and testing purposes.
 */

// prisma/seed.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.ts'
import { ApiTee, ApiCourse} from './SeedApiModels/GolfCourseApi.ts'
import fs from 'node:fs'
import path from 'node:path'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Add it to apps/api/.env or your shell environment before running prisma db seed.')
}

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })
const dir = path.join(__dirname, 'seed-data', 'courses')

async function upsertTee(courseId: string, gender: 'male' | 'female', tee: ApiTee) {
  const teeRecord = await prisma.tee.upsert({
    where: { courseId_teeName_gender: { courseId, teeName: tee.tee_name, gender } },
    update: {
      courseRating: tee.course_rating,
      slopeRating: tee.slope_rating,
      totalYards: tee.total_yards,
      totalMeters: tee.total_meters,
      parTotal: tee.par_total,
    },
    create: {
      courseId,
      teeName: tee.tee_name,
      gender,
      courseRating: tee.course_rating,
      slopeRating: tee.slope_rating,
      totalYards: tee.total_yards,
      totalMeters: tee.total_meters,
      parTotal: tee.par_total,
    },
  })

  // API doesn't send a hole number — derive it from array position
  for (const [index, hole] of tee.holes.entries()) {
    const number = index + 1
    await prisma.teeHole.upsert({
      where: { teeId_number: { teeId: teeRecord.id, number } },
      update: { par: hole.par, yardage: hole.yardage, strokeIndex: hole.handicap },
      create: { teeId: teeRecord.id, number, par: hole.par, yardage: hole.yardage, strokeIndex: hole.handicap },
    })
  }
}

async function main() {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const data: ApiCourse = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'))
    const courseData = data.course

    const course = await prisma.course.upsert({
      where: { externalId: courseData.id },
      update: {
        clubName: courseData.club_name,
        courseName: courseData.course_name,
        address: courseData.location?.address,
        city: courseData.location?.city,
        state: courseData.location?.state,
        country: courseData.location?.country,
      },
      create: {
        externalId: courseData.id,
        clubName: courseData.club_name,
        courseName: courseData.course_name,
        address: courseData.location?.address,
        city: courseData.location?.city,
        state: courseData.location?.state,
        country: courseData.location?.country,
      },
    })

    for (const tee of courseData.tees.male ?? []) await upsertTee(course.id, 'male', tee)
    for (const tee of courseData.tees.female ?? []) await upsertTee(course.id, 'female', tee)
  }

  console.log(`Seeded ${files.length} course file(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
